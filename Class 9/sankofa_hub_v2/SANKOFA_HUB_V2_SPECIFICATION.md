# SANKOFA HUB V2 — COMPLETE REBUILD SPECIFICATION

> **Version:** 2.0.0
> **Generated:** 2026-07-02
> **Purpose:** Full rebuild specification for Sankofa Hub with RAG, Authentication,
>              Admin Dashboard, Persistent Chat History, and Full-page AI Chat UI.
> **Builds on:** V1 codebase audit (all V1 design decisions preserved unless explicitly changed)
> **Key additions over V1:**
>   1. RAG pipeline (ChromaDB + embeddings) for Language & Tourism bots
>   2. PostgreSQL database for persistence (auth, history, audit)
>   3. JWT Authentication (register/login/protected routes)
>   4. Admin Dashboard
>   5. Full-page AI Chat (Claude/ChatGPT-style with sidebar history)
>   6. Auto-redirect from widget to full page
>   7. Persistent conversation history (never deleted — new chat only)

---

## CRITICAL ARCHITECTURE CLARIFICATION (Read Before Building Anything)

```
THREE LAYERS THAT WORK TOGETHER — NOT REPLACEMENTS OF EACH OTHER:

┌─────────────────────────────────────────────────────────────────────┐
│  Layer 1: System Prompt (SKILL.md) — Controls HOW each bot BEHAVES  │
│  • Persona, tone, domain, routing rules, sign-off style             │
│  • Present in EVERY conversation, unchanged from V1                 │
├─────────────────────────────────────────────────────────────────────┤
│  Layer 2: RAG Pipeline — Controls WHAT each bot KNOWS               │
│  • Fresh document retrieval per query from ChromaDB                 │
│  • NEW in V2 — adds Language & Tourism knowledge bases              │
│  • Does NOT replace the system prompt. Works WITH it.               │
├─────────────────────────────────────────────────────────────────────┤
│  Layer 3: Database — Controls PERSISTENCE                           │
│  • Users, conversations, messages, audit logs                       │
│  • NEW in V2 — replaces in-memory session dict                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 1. PROJECT OVERVIEW

Sankofa Hub V2 is a multi-agent AI chat system about Ghana and West Africa (Culture,
Tourism, Language) with:
- **4 specialist AI bots** orchestrated by a router (unchanged from V1)
- **RAG augmentation** for Language and Tourism bots (new)
- **Full authentication** (register, login, JWT sessions)
- **Persistent history** (PostgreSQL, never deleted, per-user per-conversation)
- **Two chat surfaces**: floating widget (V1) + full-page AI chat (new, Claude/ChatGPT-style)
- **Admin dashboard** for monitoring and management

---

## 2. TECH STACK (changes from V1 highlighted with ★)

### Backend (Python)
| Component | Technology | Note |
|---|---|---|
| Runtime | Python >=3.11 | Unchanged |
| Web framework | FastAPI >=0.115.0 | Unchanged |
| ASGI server | Uvicorn >=0.32.0 | Unchanged |
| HTTP client | httpx >=0.27.0 | Unchanged |
| Env management | python-dotenv >=1.0.0 | Unchanged |
| ★ ORM | SQLAlchemy >=2.0.0 (async) | New |
| ★ Database driver | asyncpg >=0.29.0 (PostgreSQL) | New |
| ★ DB migrations | Alembic >=1.13.0 | New |
| ★ Auth | python-jose[cryptography] + passlib[bcrypt] | New (JWT) |
| ★ Vector DB | chromadb >=0.5.0 | New (RAG) |
| ★ Embeddings | sentence-transformers >=3.0.0 | New |
| ★ Admin protection | fastapi-limiter (rate limiting) | New |

### Frontend (React/TypeScript)
| Component | Technology | Note |
|---|---|---|
| Build tool | Vite ^6.3.5 | Unchanged |
| UI framework | React ^19.1.0 | Unchanged |
| Language | TypeScript ~5.8.3 | Unchanged |
| Styling | Tailwind CSS ^4.1.8 | Unchanged |
| UI components | shadcn/ui (New York style) | Unchanged |
| Animations | Framer Motion ^12.16.0 | Unchanged |
| State management | Zustand ^5.0.5 | Unchanged |
| Server state | TanStack React Query ^5.80.6 | Unchanged |
| HTTP client | Axios ^1.9.0 | Unchanged |
| Routing | React Router DOM ^7.16.0 | Unchanged |
| ★ Form handling | react-hook-form + zod | Expanded (auth forms) |
| ★ Auth storage | js-cookie or localStorage (JWT) | New |

### Database
- **PostgreSQL** (primary — replaces in-memory dict entirely)
- **ChromaDB** (vector store — separate, runs locally alongside Postgres)
- SQLite acceptable for development/testing (swap connection string only)

---

## 3. FULL FILE/FOLDER STRUCTURE V2

```
sankofa-hub-v2/
│
├── main.py                         # FastAPI entry point (expanded)
├── pyproject.toml                  # Updated deps
├── alembic.ini                     # DB migration config
├── alembic/                        # Migration versions
│   └── versions/
│       └── 001_initial_schema.py
├── .env                            # API keys, DB URL, JWT secret
├── .env.example
│
├── bots/                           # Unchanged from V1
│   ├── __init__.py
│   ├── bot_loader.py
│   ├── router.py
│   ├── conversation.py             # Now wraps DB, not in-memory dict
│   └── llm.py
│
├── rag/                            # NEW — RAG pipeline
│   ├── __init__.py
│   ├── ingestion.py                # Clean → chunk → embed → store
│   ├── retrieval.py                # Query pipeline: embed → search → rerank
│   ├── chunker.py                  # Chunking strategies per content type
│   └── vector_store.py             # ChromaDB abstraction
│
├── knowledge_base/                 # NEW — source documents for RAG
│   ├── tourism/
│   │   ├── ghana_tourist_sites.md
│   │   ├── visa_and_entry.md
│   │   ├── accommodation_guide.md
│   │   ├── transport_in_ghana.md
│   │   ├── food_and_cuisine.md
│   │   ├── eco_tourism.md
│   │   └── travel_safety.md
│   └── language/
│       ├── twi_basics.md
│       ├── ga_language_guide.md
│       ├── hausa_overview.md
│       ├── ghanaian_english.md
│       ├── language_policy_ghana.md
│       ├── endangered_languages.md
│       └── translation_notes.md
│
├── auth/                           # NEW — Authentication
│   ├── __init__.py
│   ├── models.py                   # SQLAlchemy User model
│   ├── schemas.py                  # Pydantic models for auth
│   ├── service.py                  # register, login, verify, hash
│   └── dependencies.py             # get_current_user, require_admin
│
├── db/                             # NEW — Database layer
│   ├── __init__.py
│   ├── base.py                     # SQLAlchemy Base, engine, session
│   ├── models.py                   # All ORM models
│   └── crud.py                     # Create/read/update/delete operations
│
├── admin/                          # NEW — Admin routes
│   ├── __init__.py
│   └── routes.py                   # Admin-protected endpoints
│
├── skills/                         # Unchanged from V1
│   ├── general-nana-kwame_bot/SKILL.md
│   ├── tourism-maame-yaa_bot/SKILL.md
│   ├── culture-osei-tutu_bot/SKILL.md
│   └── language-obaa-sarpongmaa_bot/SKILL.md
│
└── client/                         # Frontend (Vite + React + TypeScript)
    └── src/
        ├── api/
        │   ├── client.ts           # Axios (now with auth header injection)
        │   ├── chatbot.ts          # Chat API calls
        │   ├── auth.ts             # ★ NEW — login, register, logout
        │   ├── history.ts          # ★ NEW — conversations, messages
        │   └── admin.ts            # ★ NEW — admin API calls
        │
        ├── stores/
        │   ├── chatStore.ts        # Extended: conversationId tracking
        │   └── authStore.ts        # ★ NEW — user, token, isAuthenticated
        │
        ├── hooks/
        │   ├── useChat.ts          # Extended: saves to DB, handles conversationId
        │   ├── useAuth.ts          # ★ NEW — login, register, logout
        │   ├── useHistory.ts       # ★ NEW — fetch conversations list
        │   └── useConversation.ts  # ★ NEW — fetch single conversation messages
        │
        ├── components/
        │   ├── chat/               # All unchanged PLUS:
        │   │   └── ChatWidget.tsx  # Extended: auto-redirect logic
        │   ├── layout/
        │   │   └── Navbar.tsx      # Extended: AI link + auth buttons
        │   └── auth/               # ★ NEW
        │       ├── LoginForm.tsx
        │       ├── RegisterForm.tsx
        │       └── ProtectedRoute.tsx
        │
        └── pages/
            ├── HomePage.tsx        # Unchanged
            ├── AboutPage.tsx       # Unchanged
            ├── SectorsPage.tsx     # Unchanged
            ├── FeaturesPage.tsx    # Unchanged
            ├── ContactPage.tsx     # Unchanged
            ├── AuthPage.tsx        # ★ NEW — Login/Register tabbed page
            ├── AiChatPage.tsx      # ★ NEW — Full-page Claude/ChatGPT-style chat
            └── AdminPage.tsx       # ★ NEW — Admin dashboard
```

---

## 4. DATABASE SCHEMA

### 4.1 SQLAlchemy Models (`db/models.py`)

```python
from sqlalchemy import (
    Column, String, Text, Integer, Boolean, DateTime,
    ForeignKey, Enum as SAEnum, func
)
from sqlalchemy.orm import relationship
from db.base import Base
import enum

class UserRole(str, enum.Enum):
    user  = "user"
    admin = "admin"

class User(Base):
    __tablename__ = "users"
    id           = Column(String(36), primary_key=True)   # UUID
    email        = Column(String(255), unique=True, nullable=False, index=True)
    name         = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role         = Column(SAEnum(UserRole), default=UserRole.user, nullable=False)
    is_active    = Column(Boolean, default=True)
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())
    conversations = relationship("Conversation", back_populates="user",
                                 cascade="all, delete-orphan")

class Conversation(Base):
    __tablename__ = "conversations"
    id           = Column(String(36), primary_key=True)   # UUID
    user_id      = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title        = Column(String(255), nullable=True)      # Auto-generated from first message
    created_at   = Column(DateTime(timezone=True), server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), onupdate=func.now())
    user         = relationship("User", back_populates="conversations")
    messages     = relationship("Message", back_populates="conversation",
                                order_by="Message.created_at",
                                cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    id              = Column(String(36), primary_key=True)  # UUID
    conversation_id = Column(String(36), ForeignKey("conversations.id"),
                             nullable=False, index=True)
    role            = Column(String(20), nullable=False)     # "user" | "assistant"
    content         = Column(Text, nullable=False)
    bot_id          = Column(String(100), nullable=True)     # specialist bot ID
    bot_name        = Column(String(50), nullable=True)      # "Maame Yaa" etc.
    route_taken     = Column(String(50), nullable=True)      # "tourism" etc.
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    conversation    = relationship("Conversation", back_populates="messages")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id         = Column(String(36), primary_key=True)
    user_id    = Column(String(36), ForeignKey("users.id"), nullable=True)
    action     = Column(String(100), nullable=False)
    detail     = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

### 4.2 Alembic Migration (`alembic/versions/001_initial_schema.py`)

Generate with: `alembic revision --autogenerate -m "initial_schema"` after models are defined,
then run: `alembic upgrade head`

---

## 5. AUTHENTICATION SYSTEM

### 5.1 Auth Schemas (`auth/schemas.py`)

```python
from pydantic import BaseModel, EmailStr

class RegisterRequest(BaseModel):
    email: EmailStr
    name: str
    password: str       # min 8 chars validated in service

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic

class UserPublic(BaseModel):
    id: str
    email: str
    name: str
    role: str
    created_at: datetime
```

### 5.2 Auth Service (`auth/service.py`)

```python
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("JWT_SECRET_KEY")   # Must be in .env
ALGORITHM  = "HS256"
EXPIRE_MIN = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))  # 7 days default

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(user_id: str, role: str) -> str:
    expires = datetime.utcnow() + timedelta(minutes=EXPIRE_MIN)
    return jwt.encode(
        {"sub": user_id, "role": role, "exp": expires},
        SECRET_KEY, algorithm=ALGORITHM
    )

def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
```

### 5.3 Auth Dependencies (`auth/dependencies.py`)

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth.service import decode_token
from db.crud import get_user_by_id

bearer = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: AsyncSession = Depends(get_db)
):
    try:
        payload = decode_token(credentials.credentials)
        user = await get_user_by_id(db, payload["sub"])
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="User not found or inactive")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

async def require_admin(user = Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
```

### 5.4 Auth API Endpoints

```
POST /auth/register       → { access_token, user }
POST /auth/login          → { access_token, user }
GET  /auth/me             → UserPublic  (requires Bearer token)
POST /auth/logout         → { message }  (client-side token removal)
```

---

## 6. RAG PIPELINE (NEW)

### 6.1 Architecture

```
INGESTION (run once, re-run when knowledge base changes):
  knowledge_base/**/*.md
    → Read & clean text
    → Chunk (300–500 tokens, 10% overlap, on paragraph boundaries)
    → Add contextual prefix per chunk (source + section name)
    → Embed (sentence-transformers: all-MiniLM-L6-v2 default, or OpenAI)
    → Store in ChromaDB (collection: "tourism_kb" | "language_kb")
    → Save metadata: source, section, chunk_id, domain

QUERY (runs per specialist bot call):
  User question
    → Embed question (same model as ingestion)
    → Search collection for this domain (top_k=10)
    → Apply score threshold (≥0.45 for RAG; ChromaDB uses distance, convert)
    → Take top 3–5 by relevance
    → Format as context block with source citations
    → Inject into specialist bot's prompt BEFORE calling LLM
```

### 6.2 Vector Store Abstraction (`rag/vector_store.py`)

```python
import chromadb
from chromadb.config import Settings
import os

CHROMA_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")

class VectorStore:
    def __init__(self):
        self.client = chromadb.PersistentClient(
            path=CHROMA_PATH,
            settings=Settings(anonymized_telemetry=False)
        )

    def get_or_create_collection(self, name: str):
        return self.client.get_or_create_collection(
            name=name,
            metadata={"hnsw:space": "cosine"}
        )

    def add_chunks(self, collection_name: str, chunks: list[dict]) -> None:
        col = self.get_or_create_collection(collection_name)
        col.add(
            ids=[c["chunk_id"] for c in chunks],
            documents=[c["text"] for c in chunks],
            embeddings=[c["embedding"] for c in chunks],
            metadatas=[c["metadata"] for c in chunks],
        )

    def query(self, collection_name: str, embedding: list[float],
              top_k: int = 10) -> list[dict]:
        col = self.get_or_create_collection(collection_name)
        results = col.query(
            query_embeddings=[embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"]
        )
        output = []
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0]
        ):
            # ChromaDB cosine distance: 0=identical, 2=opposite. Convert to 0–1 score.
            score = 1 - (dist / 2)
            output.append({"text": doc, "metadata": meta, "score": score})
        return output

vector_store = VectorStore()  # Singleton
```

### 6.3 Embedding Function (`rag/retrieval.py`)

```python
from sentence_transformers import SentenceTransformer
import os

EMBED_MODEL_NAME = os.getenv("EMBED_MODEL", "all-MiniLM-L6-v2")
SCORE_FLOOR      = float(os.getenv("RAG_SCORE_FLOOR", "0.45"))
TOP_K_RETRIEVE   = int(os.getenv("RAG_TOP_K", "5"))

_model = None

def get_embedding_model():
    global _model
    if _model is None:
        _model = SentenceTransformer(EMBED_MODEL_NAME)
    return _model

def embed(text: str) -> list[float]:
    model = get_embedding_model()
    return model.encode(text, normalize_embeddings=True).tolist()

def retrieve_context(query: str, domain: str) -> str:
    """
    Called by the bot handler BEFORE the specialist LLM call.
    domain: "tourism" | "language"
    Returns a formatted context block or empty string.
    """
    from rag.vector_store import vector_store

    collection_name = f"{domain}_kb"
    query_embedding = embed(query)
    results = vector_store.query(collection_name, query_embedding, top_k=TOP_K_RETRIEVE)

    # Filter by score threshold
    relevant = [r for r in results if r["score"] >= SCORE_FLOOR]
    if not relevant:
        return ""

    lines = ["=== KNOWLEDGE BASE CONTEXT ==="]
    for i, r in enumerate(relevant[:3], 1):  # Cap at 3 for prompt size
        src = r["metadata"].get("source", "Unknown source")
        sec = r["metadata"].get("section", "")
        lines.append(f"\n[Source {i}: {src}{' — ' + sec if sec else ''}]")
        lines.append(r["text"])
    lines.append("\n=== END KNOWLEDGE BASE CONTEXT ===")
    lines.append("Answer the user's question using the above context where relevant.")
    lines.append("If the context does not contain the answer, use your general knowledge")
    lines.append("but note that the information is not from the official knowledge base.")
    return "\n".join(lines)
```

### 6.4 Ingestion Script (`rag/ingestion.py`)

```python
"""
Run this script once to build the knowledge base indexes.
Re-run whenever knowledge_base/ files are updated.

Usage: python -m rag.ingestion
"""

import os
import re
from pathlib import Path
from rag.retrieval import embed
from rag.vector_store import vector_store

KNOWLEDGE_BASE_PATH = Path("knowledge_base")
CHUNK_SIZE   = 400   # tokens (approximate by word count)
CHUNK_OVERLAP = 40

def clean_text(text: str) -> str:
    text = re.sub(r'#{1,6}\s*', '', text)           # Remove markdown headings markers (keep text)
    text = re.sub(r'\n{3,}', '\n\n', text)          # Collapse excess blank lines
    text = re.sub(r'[ \t]{2,}', ' ', text)          # Collapse extra spaces
    return text.strip()

def chunk_text(text: str, source: str, section: str,
               chunk_size: int = CHUNK_SIZE,
               overlap: int = CHUNK_OVERLAP) -> list[dict]:
    paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
    chunks, current, word_count = [], [], 0

    for para in paragraphs:
        words = len(para.split())
        if word_count + words > chunk_size and current:
            chunk_body = '\n\n'.join(current)
            # Contextual prefix — critical for unambiguous retrieval
            context_prefix = f"[From: {source} | Section: {section}]\n"
            chunks.append({
                "text": context_prefix + chunk_body,
                "source": source,
                "section": section,
            })
            # Overlap: keep last paragraph
            current = current[-1:] if current else []
            word_count = len(current[0].split()) if current else 0
        current.append(para)
        word_count += words

    if current:
        chunk_body = '\n\n'.join(current)
        context_prefix = f"[From: {source} | Section: {section}]\n"
        chunks.append({
            "text": context_prefix + chunk_body,
            "source": source,
            "section": section,
        })
    return chunks

def ingest_domain(domain: str) -> int:
    """Ingest all markdown files in knowledge_base/{domain}/"""
    domain_path = KNOWLEDGE_BASE_PATH / domain
    if not domain_path.exists():
        print(f"  Path not found: {domain_path}")
        return 0

    collection_name = f"{domain}_kb"
    # Clear existing collection and rebuild (safe for dev; use delta updates in prod)
    try:
        vector_store.client.delete_collection(collection_name)
        print(f"  Cleared existing collection: {collection_name}")
    except Exception:
        pass

    all_chunks = []
    for md_file in sorted(domain_path.glob("*.md")):
        raw = md_file.read_text(encoding="utf-8")
        # Extract section headings as section context
        sections = re.split(r'\n(?=## )', raw)
        source_name = md_file.stem.replace("_", " ").title()
        for section_text in sections:
            section_title = re.match(r'##\s*(.+)', section_text)
            section = section_title.group(1).strip() if section_title else "General"
            cleaned = clean_text(section_text)
            if len(cleaned.split()) < 20:   # Skip tiny fragments
                continue
            chunks = chunk_text(cleaned, source=source_name, section=section)
            for i, chunk in enumerate(chunks):
                chunk_id = f"{domain}_{md_file.stem}_{i:04d}"
                embedding = embed(chunk["text"])
                all_chunks.append({
                    "chunk_id": chunk_id,
                    "text": chunk["text"],
                    "embedding": embedding,
                    "metadata": {
                        "chunk_id": chunk_id,
                        "source":   chunk["source"],
                        "section":  chunk["section"],
                        "domain":   domain,
                        "file":     md_file.name,
                    }
                })
        print(f"  Processed: {md_file.name}")

    if all_chunks:
        vector_store.add_chunks(collection_name, all_chunks)
        print(f"  Indexed {len(all_chunks)} chunks into '{collection_name}'")
    return len(all_chunks)

if __name__ == "__main__":
    print("=== Sankofa Hub RAG Ingestion Pipeline ===")
    for domain in ["tourism", "language"]:
        print(f"\nIngesting domain: {domain.upper()}")
        count = ingest_domain(domain)
        print(f"  Total chunks: {count}")
    print("\nIngestion complete. ChromaDB is ready.")
```

### 6.5 Wiring RAG into the Bot Handler (`main.py` change)

In the existing routing flow (§7.6 of V1), BEFORE calling a specialist LLM, retrieve
RAG context and prepend it to the specialist's user prompt:

```python
# In the specialist routing branch:
if route in {"tourism", "language"} and was_routed:
    # NEW: retrieve relevant context from knowledge base
    rag_context = retrieve_context(query=original_message, domain=route)

    # Build specialist prompt: RAG context (if any) + original user message
    specialist_user_message = (
        f"{rag_context}\n\nUser question: {original_message}"
        if rag_context
        else original_message
    )

    # Call specialist with augmented message
    specialist_response = await call_llm(
        bot_id=specialist_bot_id,
        history=session_history,
        user_message=specialist_user_message
    )
```

**Culture bot has NO RAG** (no knowledge base for culture — it relies on the model's
training data + system prompt, which is appropriate for a cultural scholar persona).

**Nana Kwame has NO RAG** — he routes fast; adding RAG latency to every message is wrong.

---

## 7. NEW API ENDPOINTS (V2 additions)

All existing V1 endpoints remain unchanged. New endpoints:

### Auth endpoints
```
POST /auth/register        Body: { email, name, password }
POST /auth/login           Body: { email, password }
GET  /auth/me              Header: Authorization: Bearer <token>
```

### History endpoints (requires auth)
```
GET  /history/conversations
     → [{ id, title, created_at, updated_at, message_count }]

GET  /history/conversations/{id}
     → { id, title, created_at, messages: [{ id, role, content, bot_id,
         bot_name, created_at }] }

POST /history/conversations
     → { id, title, created_at }   (creates a new empty conversation)

GET  /history/conversations/{id}/messages
     → [Message]
```

### Updated chat endpoint
```
POST /chat
  Body: { message, user_id, conversation_id? }
  — If conversation_id provided AND user is authenticated:
      save to that conversation in DB
  — If no conversation_id: create new conversation, return it in response
  Response: { reply, bot_name, bot_id, route_taken, conversation_id }
```

### Admin endpoints (requires admin role)
```
GET  /admin/stats
     → { total_users, total_conversations, total_messages, messages_today,
         messages_by_bot: { nana_kwame: N, maame_yaa: N, ... } }

GET  /admin/users?page=1&limit=20
     → [UserPublic + stats per user]

GET  /admin/conversations?page=1&limit=20
     → [ConversationSummary]

PATCH /admin/users/{id}         → toggle active/inactive, promote to admin
GET   /admin/audit-logs?page=1  → [AuditLog]
```

---

## 8. UPDATED BOT SYSTEM PROMPTS (Language & Tourism — RAG-aware)

The SKILL.md files for Tourism and Language bots must be updated to know about
RAG context. Add a section at the END of each specialist bot's SKILL.md:

### Addition to `skills/tourism-maame-yaa_bot/SKILL.md`

```markdown
## RETRIEVED KNOWLEDGE BASE CONTEXT

When a "=== KNOWLEDGE BASE CONTEXT ===" section appears in the user message,
it contains verified, curated information from the Sankofa Hub Tourism Knowledge Base.

RULES FOR USING THIS CONTEXT:
- Prioritise information from the knowledge base over your general training data
  for specific facts (prices, hours, visa fees, official contacts).
- When you use knowledge base information, you may say:
  "According to our latest records..." or "Our knowledge base indicates..."
- If the knowledge base context is relevant but incomplete, use it alongside
  your general knowledge and note the distinction.
- If the knowledge base context is empty or not provided, answer from
  your general knowledge as before.
- NEVER fabricate or invent content as if it came from the knowledge base.
```

### Addition to `skills/language-obaa-sarpongmaa_bot/SKILL.md`

```markdown
## RETRIEVED KNOWLEDGE BASE CONTEXT

When a "=== KNOWLEDGE BASE CONTEXT ===" section appears in the user message,
it contains verified linguistic reference material from the Sankofa Hub
Language Knowledge Base (grammar guides, translation notes, sociolinguistic data).

RULES FOR USING THIS CONTEXT:
- Prioritise knowledge base content for specific translations, grammar rules,
  and documented usage patterns.
- When you use knowledge base material, note it as verified reference content.
- For translation requests specifically: if the knowledge base has a translation
  or vocabulary note, use it. If not, provide your best translation with
  appropriate confidence caveats as before.
- NEVER present invented translations as if they came from the knowledge base.
```

---

## 9. NEW FRONTEND PAGES (V2)

### 9.1 Updated Routing (`App.tsx`)

```tsx
// New routes added to BrowserRouter
<Routes>
  <Route path="/"         element={<HomePage />} />
  <Route path="/about"    element={<AboutPage />} />
  <Route path="/sectors"  element={<SectorsPage />} />
  <Route path="/features" element={<FeaturesPage />} />
  <Route path="/contact"  element={<ContactPage />} />
  {/* NEW ROUTES */}
  <Route path="/auth"     element={<AuthPage />} />
  <Route path="/ai"       element={<ProtectedRoute><AiChatPage /></ProtectedRoute>} />
  <Route path="/ai/:conversationId" element={<ProtectedRoute><AiChatPage /></ProtectedRoute>} />
  <Route path="/admin"    element={<ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>} />
</Routes>
```

### 9.2 Updated Navbar

Add to nav links:
- **"AI Chat"** → `/ai` — only visible when logged in — gold CTA style
- **Login / Register** → `/auth` — visible when logged out
- **User avatar + dropdown** (Account, Admin if admin, Logout) — visible when logged in

### 9.3 `AuthPage.tsx` — Login / Register

**Layout:** Full-page centered card with Sankofa logo at top.
Two tabs: "Sign In" and "Create Account".
Same warm Adinkra-digital design language.

**Sign In form:**
- Email field (react-hook-form + zod)
- Password field (show/hide toggle)
- "Sign In" button (primary gold)
- Error message display
- Link to "Create Account" tab

**Create Account form:**
- Full name field
- Email field
- Password field (min 8 chars)
- Confirm password field
- "Create Account" button
- Success → auto-redirect to `/ai`

**On successful login:**
- Store JWT in localStorage: `sankofa_token`
- Store user object in authStore (Zustand)
- Redirect to `/ai`

### 9.4 `AiChatPage.tsx` — Full-Page Chat (Claude/ChatGPT-Style)

This is the most important new component. Design inspiration: Claude.ai sidebar + main
chat area. NOT a popup/widget.

**Layout (full-page, no navbar):**

```
┌──────────────────────────────────────────────────────────────────────┐
│ ┌────────────────┐ ┌────────────────────────────────────────────────┐│
│ │   SIDEBAR      │ │              MAIN CHAT AREA                   ││
│ │   (w-72)       │ │                                                ││
│ │                │ │  ┌──────────────────────────────────────────┐  ││
│ │  [Sankofa Logo]│ │  │           Chat Header                    │  ││
│ │  [+ New Chat]  │ │  │  "Sankofa Hub"  [Bot avatar indicator]   │  ││
│ │                │ │  └──────────────────────────────────────────┘  ││
│ │  TODAY         │ │                                                ││
│ │  · Chat title  │ │  ┌──────────────────────────────────────────┐  ││
│ │  · Chat title  │ │  │          Message List (scrollable)       │  ││
│ │                │ │  │                                          │  ││
│ │  YESTERDAY     │ │  │  [user message bubble - right]           │  ││
│ │  · Chat title  │ │  │  [bot response bubble - left]            │  ││
│ │                │ │  │  [user message bubble - right]           │  ││
│ │  LAST 7 DAYS   │ │  │  [bot response bubble - left]            │  ││
│ │  · Chat title  │ │  │                                          │  ││
│ │  · Chat title  │ │  └──────────────────────────────────────────┘  ││
│ │                │ │                                                ││
│ │  [User badge]  │ │  ┌──────────────────────────────────────────┐  ││
│ │  [Log out]     │ │  │          Input Area                      │  ││
│ │                │ │  │  [Textarea] [Send button]                │  ││
│ └────────────────┘ │  └──────────────────────────────────────────┘  ││
│                    └────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

**Sidebar features:**
- `+New Chat` button at top — creates new conversation, clears main area
- Conversation history grouped by date: Today / Yesterday / Last 7 Days / Older
- Each conversation entry shows auto-generated title (first user message, truncated to 40 chars)
- Clicking a conversation loads it in the main area
- Active conversation highlighted with gold left border
- Mobile: sidebar is a slide-in drawer (hamburger toggle)

**Main chat area:**
- Same message bubble styles as V1 widget (user=gold right, bot=card left)
- Same bot avatar + name above each bot response
- Same loading states (ThinkingIndicator, TypingIndicator)
- Virtually scrollable — very long conversations scroll naturally (no height cap)
- Auto-scroll to bottom on new messages
- Shows "Start a new conversation or select one from the sidebar" when no conv selected

**Conversation titles:**
- Auto-generated on the BACKEND when first message arrives
- Take first user message, truncate to 60 chars, strip special chars
- Stored in `conversations.title` column

**Mobile behavior:**
- Sidebar collapses to a hamburger drawer
- Main chat takes full screen
- Bottom input area uses safe-area-inset-bottom padding

### 9.5 `AdminPage.tsx` — Admin Dashboard

Accessible only to users with `role: "admin"`. Shows `/admin` route.

**Sections:**
1. **Stats overview** — 4 metric cards: Total Users, Total Conversations, Messages Today,
   Most Active Bot
2. **Messages by bot** — Horizontal bar chart (CSS, no library needed) showing message
   distribution across the 4 bots
3. **Recent conversations** — paginated table: user email, conversation title, message
   count, last active
4. **User management** — paginated table: name, email, role, status, join date,
   toggle active/inactive button, promote-to-admin button
5. **Audit log** — paginated list of system events (logins, admin actions, errors)

### 9.6 Auto-Redirect from Widget to Full Page

**Trigger condition:** Widget chat accumulates more than 6 messages (3 exchanges).

```tsx
// In ChatWidget.tsx / ChatPanel.tsx:

const MESSAGE_REDIRECT_THRESHOLD = 6;  // configurable

useEffect(() => {
    if (isAuthenticated && messages.length >= MESSAGE_REDIRECT_THRESHOLD) {
        // Save conversation ID from most recent chat response
        const convId = chatStore.currentConversationId;
        navigate(`/ai/${convId ?? ""}`);  // preserves history
        closeChat();  // closes the widget
    }
}, [messages.length]);
```

**History preservation:** Since messages are now persisted to the database (via the
updated `/chat` endpoint that returns `conversation_id`), navigating to `/ai/{id}`
loads the same conversation from the database — the widget messages appear in the
full-page view seamlessly.

**If user is NOT authenticated:** Do not redirect. Show a soft nudge instead:
"This conversation is getting long. [Sign in] to unlock the full chat experience
with history and unlimited messaging."

---

## 10. UPDATED ENVIRONMENT VARIABLES

### Backend `.env`

```env
# LLM (unchanged)
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Database (NEW)
DATABASE_URL=postgresql+asyncpg://sankofa:password@localhost:5432/sankofa_hub
# For SQLite dev: DATABASE_URL=sqlite+aiosqlite:///./sankofa_dev.db

# Auth (NEW)
JWT_SECRET_KEY=your-very-long-random-secret-key-here
JWT_EXPIRE_MINUTES=10080

# RAG (NEW)
CHROMA_DB_PATH=./chroma_db
EMBED_MODEL=all-MiniLM-L6-v2
RAG_SCORE_FLOOR=0.45
RAG_TOP_K=5

# Admin (NEW)
ADMIN_EMAIL=admin@sankofahub.com   # First user with this email auto-promoted to admin
```

### Frontend `client/.env`

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Sankofa Hub
VITE_APP_VERSION=2.0.0
VITE_CHAT_REDIRECT_THRESHOLD=6   # Messages before auto-redirect to /ai
```

---

## 11. UPDATED ZUSTAND STORES (Frontend)

### `stores/authStore.ts` (NEW)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: string;
    email: string;
    name: string;
    role: 'user' | 'admin';
}

interface AuthStore {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    setAuth: (user: User, token: string) => void;
    clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            setAuth: (user, token) => set({ user, token, isAuthenticated: true }),
            clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
        }),
        {
            name: 'sankofa-auth',
            // Persist everything — token is how sessions survive page refresh
        }
    )
);
```

### `stores/chatStore.ts` (UPDATED — add conversationId)

```typescript
// Add to existing ChatStore interface:
currentConversationId: string | null;
setConversationId: (id: string) => void;
clearConversationId: () => void;
```

---

## 12. SETUP & RUN INSTRUCTIONS (V2)

### Backend setup

```bash
# 1. Install deps
uv add fastapi uvicorn httpx python-dotenv sqlalchemy asyncpg alembic \
       python-jose passlib bcrypt chromadb sentence-transformers

# 2. Start PostgreSQL (or use SQLite for dev by changing DATABASE_URL)
# psql: CREATE DATABASE sankofa_hub; CREATE USER sankofa WITH PASSWORD 'password';

# 3. Configure .env (copy .env.example, fill in values)

# 4. Run database migrations
alembic upgrade head

# 5. Run RAG ingestion (builds ChromaDB knowledge base)
python -m rag.ingestion

# 6. Start server
uv run uvicorn main:app --reload --port 8000
```

### Frontend setup

```bash
cd client
npm install
npm run dev  # Runs on port 5173
```

### Verify everything works

```bash
# Backend health
curl http://localhost:8000/health

# Register a test user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","name":"Test User","password":"password123"}'

# Test RAG (check retrieval is working)
python -m rag.retrieval  # if you add a __main__ block for testing
```

---

## 13. DUMMY KNOWLEDGE BASE (see separate files)

The knowledge base documents live in `knowledge_base/tourism/` and `knowledge_base/language/`.
See `KNOWLEDGE_BASE_TOURISM.md` and `KNOWLEDGE_BASE_LANGUAGE.md` for all dummy content.

These are realistic, factually grounded documents that simulate what a real deployment
would contain. They are the source of truth for the RAG pipeline.

---

## 14. V1 → V2 MIGRATION NOTES

| V1 Behaviour | V2 Behaviour |
|---|---|
| Sessions in memory (`active_sessions` dict) | Sessions in PostgreSQL (`conversations` + `messages` tables) |
| Session cleared on server restart | History persists forever (new-chat-only clearing) |
| No auth — anyone can use any session | JWT auth — conversations belong to authenticated users |
| Chat only in widget (380×560px) | Chat in widget AND full `/ai` page |
| Widget messages lost on page refresh | Widget messages tied to conversation_id, reload from DB |
| No admin interface | `/admin` dashboard for admins |
| Tourism/Language bots: training data only | Tourism/Language bots: RAG + training data |
| Culture/Nana Kwame: training data only | Culture/Nana Kwame: unchanged (no RAG — appropriate) |
| Model config hardcoded in bot_loader.py | Model config still hardcoded (intentional — see V1 notes) |

---

## 15. DESIGN ADDITIONS (V2 only)

All V1 design tokens (colors, typography, spacing, animations) are UNCHANGED.
These additions use the same design system:

**Auth page:**
- Same warm Adinkra-digital aesthetic
- Card centered on full background with subtle AdinkraPattern behind it
- Tabs use the existing shadcn Tabs component (same as SectorsPage)

**AI Chat page:**
- Sidebar: `bg-card border-r border-border` — matches the card/border system
- Sidebar conversation items: hover `bg-muted`, active `border-l-2 border-primary`
- Mobile drawer: uses existing Sheet component from shadcn/ui (already installed)
- Same ChatMessage, BotAvatar, ThinkingIndicator, TypingIndicator from V1
- New chat button: primary gold button (same as "Talk to Bots" CTA)

**Admin page:**
- Tables: `bg-card border border-border rounded-xl` — card system
- Stat cards: same card + colored accent border pattern from the marketing pages
- Charts: CSS-only horizontal bars using the existing bot accent colors

---

*This document is the complete source of truth for Sankofa Hub V2.*
*V1 spec (the original document) remains valid for all sections NOT explicitly overridden here.*
*The code is always the source of truth over any documentation when they conflict.*
