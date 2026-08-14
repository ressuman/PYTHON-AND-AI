import os
from contextlib import asynccontextmanager
from uuid import uuid4

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from admin.routes import router as admin_router
from auth.dependencies import get_current_user
from auth.schemas import AuthResponse, LoginRequest, RegisterRequest, UserPublic
from auth.service import create_access_token, hash_password, verify_password
from bots.bot_loader import (
    ROUTER_BOT_ID,
    SPECIALIST_BOT_IDS,
    Message as BotMessage,
    get_bot,
)
from bots.conversation import history_to_llm_format
from bots.llm import chat_with_bot, configure
from bots.router import get_display_name, parse_route
from db.base import get_db, init_db
from db.crud import (
    create_audit_log,
    create_conversation,
    create_user,
    get_conversation,
    get_conversation_messages,
    get_user_by_email,
    get_user_by_id,
    get_user_conversations,
    save_message,
)
from db.models import User, UserRole
from rag.retrieval import retrieve_context

load_dotenv()

configure(
    api_key=os.getenv("OPENROUTER_API_KEY", ""),
    base_url=os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    get_bot(ROUTER_BOT_ID)
    for sid in SPECIALIST_BOT_IDS.values():
        get_bot(sid)
    yield


app = FastAPI(title="Sankofa Hub", version="2.0.0", lifespan=lifespan)

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://localhost:3000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# NEW — paste this in place of the block above
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
]

frontend_url = os.getenv("FRONTEND_URL", "")
if frontend_url:
    origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router)


class ChatRequest(BaseModel):
    message: str
    user_id: str = "default"
    conversation_id: str | None = None


class ChatResponse(BaseModel):
    reply: str
    bot_name: str
    bot_id: str
    route_taken: str
    conversation_id: str | None = None


class ConversationSummary(BaseModel):
    id: str
    title: str | None
    created_at: str
    updated_at: str
    message_count: int


@app.get("/")
def root():
    return {"message": "Sankofa Hub is running. POST to /chat with {message, user_id}"}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "bots": list(SPECIALIST_BOT_IDS.values()) + [ROUTER_BOT_ID],
    }


@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    req: ChatRequest,
    db: AsyncSession = Depends(get_db),
):
    if not req.message.strip():
        raise HTTPException(status_code=422, detail="Message cannot be empty.")

    conversation_id = req.conversation_id
    user_id = req.user_id

    conversation = None
    if conversation_id:
        conversation = await get_conversation(db, conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")

    user_obj = None
    if user_id and user_id != "default":
        user_obj = await get_user_by_id(db, user_id)

    if not conversation:
        conversation = await create_conversation(
            db,
            user_id=user_id if user_obj else str(uuid4()),
        )
        conversation_id = conversation.id

    history = await get_conversation_messages(db, conversation_id)
    llm_history = history_to_llm_format(
        [BotMessage(role=m.role, content=m.content, bot_id=m.bot_id or "") for m in history]
    )

    reply = await chat_with_bot(
        ROUTER_BOT_ID,
        req.message,
        llm_history,
    )

    route_key, clean_reply, was_routed = parse_route(reply)
    answering_bot_id = ROUTER_BOT_ID
    final_reply = clean_reply

    if was_routed and route_key in SPECIALIST_BOT_IDS and route_key != "general":
        target_bot = SPECIALIST_BOT_IDS[route_key]
        try:
            if route_key in {"tourism", "language"} and was_routed:
                rag_context = retrieve_context(
                    query=req.message, domain=route_key
                )
                specialist_user_message = (
                    f"{rag_context}\n\nUser question: {req.message}"
                    if rag_context
                    else req.message
                )
            else:
                specialist_user_message = req.message

            specialist_reply = await chat_with_bot(
                target_bot,
                specialist_user_message,
                llm_history,
            )
            _, final_reply, _ = parse_route(specialist_reply)
            answering_bot_id = target_bot
        except Exception:
            final_reply = (
                "I'm sorry, I encountered an error while processing your request. "
                "Please try again in a moment."
            )

    answering_bot_name = get_display_name(answering_bot_id)

    await save_message(
        db,
        conversation_id=conversation_id,
        role="user",
        content=req.message,
    )
    await save_message(
        db,
        conversation_id=conversation_id,
        role="assistant",
        content=final_reply,
        bot_id=answering_bot_id,
        bot_name=answering_bot_name,
        route_taken=route_key,
    )

    if conversation.title is None:
        title = req.message[:60].strip()
        if title:
            conversation.title = title
            await db.commit()

    await create_audit_log(
        db, action="chat_message", user_id=user_id, detail=f"Route: {route_key}"
    )

    return ChatResponse(
        reply=final_reply,
        bot_name=answering_bot_name,
        bot_id=answering_bot_id,
        route_taken=route_key,
        conversation_id=conversation_id,
    )


@app.post("/auth/register", response_model=AuthResponse)
async def auth_register(
    req: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    existing = await get_user_by_email(db, req.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    if len(req.password) < 8:
        raise HTTPException(
            status_code=422, detail="Password must be at least 8 characters"
        )

    admin_email = os.getenv("ADMIN_EMAIL", "")
    role = UserRole.admin if req.email == admin_email else UserRole.user
    password_hash = hash_password(req.password)
    user = await create_user(db, req.email, req.name, password_hash)
    user.role = role
    await db.commit()

    token = create_access_token(user.id, user.role.value)
    await create_audit_log(
        db, action="register", user_id=user.id, detail="User registered"
    )
    return AuthResponse(
        access_token=token,
        user=UserPublic(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role.value,
            created_at=user.created_at,
        ),
    )


@app.post("/auth/login", response_model=AuthResponse)
async def auth_login(
    req: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    user = await get_user_by_email(db, req.email)
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token = create_access_token(user.id, user.role.value)
    await create_audit_log(
        db, action="login", user_id=user.id, detail="User logged in"
    )
    return AuthResponse(
        access_token=token,
        user=UserPublic(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role.value,
            created_at=user.created_at,
        ),
    )


@app.get("/auth/me", response_model=UserPublic)
async def auth_me(current_user: User = Depends(get_current_user)):
    return UserPublic(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        role=current_user.role.value,
        created_at=current_user.created_at,
    )


@app.get("/history/conversations")
async def list_conversations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    convs = await get_user_conversations(db, current_user.id)
    result = []
    for c in convs:
        messages = await get_conversation_messages(db, c.id)
        result.append(ConversationSummary(
            id=c.id,
            title=c.title,
            created_at=c.created_at.isoformat() if c.created_at else "",
            updated_at=c.updated_at.isoformat() if c.updated_at else "",
            message_count=len(messages),
        ))
    return result


@app.get("/history/conversations/{conversation_id}")
async def get_conversation_detail(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conv = await get_conversation(db, conversation_id)
    if not conv or conv.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    messages = await get_conversation_messages(db, conversation_id)
    return {
        "id": conv.id,
        "title": conv.title,
        "created_at": conv.created_at.isoformat() if conv.created_at else None,
        "messages": [
            {
                "id": m.id,
                "role": m.role,
                "content": m.content,
                "bot_id": m.bot_id,
                "bot_name": m.bot_name,
                "created_at": m.created_at.isoformat() if m.created_at else None,
            }
            for m in messages
        ],
    }


@app.post("/history/conversations")
async def create_new_conversation(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conv = await create_conversation(db, current_user.id)
    return {
        "id": conv.id,
        "title": conv.title,
        "created_at": conv.created_at.isoformat() if conv.created_at else None,
    }


@app.get("/history/conversations/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    conv = await get_conversation(db, conversation_id)
    if not conv or conv.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Conversation not found")
    messages = await get_conversation_messages(db, conversation_id)
    return [
        {
            "id": m.id,
            "role": m.role,
            "content": m.content,
            "bot_id": m.bot_id,
            "bot_name": m.bot_name,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        }
        for m in messages
    ]


@app.get("/session/{user_id}")
async def get_session(user_id: str):
    return {"user_id": user_id, "history": [], "bot_id": ROUTER_BOT_ID}


@app.delete("/session/{user_id}")
async def clear_session_endpoint(user_id: str):
    return {"message": "session cleared"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
