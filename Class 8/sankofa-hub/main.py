import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from bots.bot_loader import get_bot, ROUTER_BOT_ID, SPECIALIST_BOT_IDS, Message as BotMessage
from bots.conversation import active_sessions, get_or_create_session, history_to_llm_format
from bots.llm import configure, chat_with_bot
from bots.router import parse_route, get_display_name

load_dotenv()

configure(
    api_key=os.getenv("OPENROUTER_API_KEY", ""),
    base_url=os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    get_bot(ROUTER_BOT_ID)
    for sid in SPECIALIST_BOT_IDS.values():
        get_bot(sid)
    yield


app = FastAPI(title="Sankofa Hub", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str
    user_id: str = "default"


class ChatResponse(BaseModel):
    reply: str
    bot_name: str
    bot_id: str
    route_taken: str


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
async def chat_endpoint(req: ChatRequest):
    if not req.message.strip():
        raise HTTPException(status_code=422, detail="Message cannot be empty.")

    session = get_or_create_session(req.user_id)
    llm_history = history_to_llm_format(session.history)

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
            specialist_reply = await chat_with_bot(
                target_bot,
                req.message,
                llm_history,
            )
            _, final_reply, _ = parse_route(specialist_reply)
            answering_bot_id = target_bot
        except Exception:
            final_reply = (
                f"I'm sorry, I encountered an error while processing your request. "
                f"Please try again in a moment."
            )

    session.history.append(BotMessage(role="user", content=req.message, bot_id="user"))
    session.history.append(BotMessage(role="assistant", content=final_reply, bot_id=answering_bot_id))

    return ChatResponse(
        reply=final_reply,
        bot_name=get_display_name(answering_bot_id),
        bot_id=answering_bot_id,
        route_taken=route_key,
    )


@app.get("/session/{user_id}")
def get_session(user_id: str):
    if user_id not in active_sessions:
        return {"user_id": user_id, "history": [], "bot_id": ROUTER_BOT_ID}
    s = active_sessions[user_id]
    return {
        "user_id": s.user_id,
        "history": [(m.role, m.content, m.bot_id) for m in s.history],
        "bot_id": s.current_bot,
    }


@app.delete("/session/{user_id}")
def clear_session_endpoint(user_id: str):
    if user_id in active_sessions:
        del active_sessions[user_id]
    return {"message": "session cleared"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
