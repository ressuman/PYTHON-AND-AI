# SANKOFA HUB V2 — COMPLETE PROJECT RECREATION PROMPT

> **Purpose:** This document contains EVERYTHING needed to recreate the Sankofa Hub V2 project from scratch in any empty folder. Follow each step exactly in order.

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Prerequisites](#2-prerequisites)
3. [Step-by-Step Recreation](#3-step-by-step-recreation)
   - 3.1: Folder Structure
   - 3.2: Python Backend Setup
   - 3.3: Database Layer (db/)
   - 3.4: Authentication Layer (auth/)
   - 3.5: Bot System (bots/)
   - 3.6: RAG Pipeline (rag/)
   - 3.7: Admin Dashboard (admin/)
   - 3.8: Main Application (main.py)
   - 3.9: Knowledge Base (knowledge_base/)
   - 3.10: Skills / System Prompts (skills/)
   - 3.11: Frontend Setup (client/)
   - 3.12: Alembic Migrations
   - 3.13: ChromaDB Ingestion
4. [All File Contents](#4-all-file-contents)
5. [Environment Variables](#5-environment-variables)
6. [Running the Project](#6-running-the-project)

---

## 1. PROJECT OVERVIEW

**Sankofa Hub** is a multi-agent AI chat system focused on Ghana and West Africa across three specialist domains: **Culture**, **Tourism**, and **Language**. It has:

- **4 LLM bots** (Nana Kwame router + 3 specialists) via OpenRouter
- **PostgreSQL database** (Neon cloud) with SQLAlchemy async + Alembic migrations
- **JWT authentication** (bcrypt + python-jose)
- **RAG pipeline** (ChromaDB + SentenceTransformer embeddings) for tourism & language knowledge
- **React frontend** with shadcn/ui, Zustand state, TanStack Query
- **Admin dashboard** with full CRUD for user management

**Tech Stack:**
- Backend: Python 3.11+, FastAPI, SQLAlchemy 2.0 (async), asyncpg, Alembic, ChromaDB
- Frontend: React 19, TypeScript, Vite 6, Tailwind CSS v4, shadcn/ui, Zustand, TanStack Query, Framer Motion
- Database: PostgreSQL (Neon) or SQLite for local dev
- LLM: OpenRouter API (any model)
- Embeddings: SentenceTransformer all-MiniLM-L6-v2 (local, no API needed)

---

## 2. PREREQUISITES

```bash
# Backend
Python 3.11+
uv (Python package manager — https://docs.astral.sh/uv/)
# OR pip

# Frontend
Node.js 20+
npm 10+

# Database
# Option A: Neon PostgreSQL (free tier — https://neon.tech)
# Option B: Local SQLite for development
```

---

## 3. STEP-BY-STEP RECREATION

### 3.1: Create Folder Structure

```bash
mkdir sankofa_hub_v2
cd sankofa_hub_v2

# Create all directories
mkdir -p admin
mkdir -p alembic/versions
mkdir -p auth
mkdir -p bots
mkdir -p chroma_db
mkdir -p client/src/{api,components/{auth,chat,layout,common,ui},hooks,pages,stores,lib}
mkdir -p db
mkdir -p knowledge_base/tourism
mkdir -p knowledge_base/language
mkdir -p rag
mkdir -p skills/general-nana-kwame_bot
mkdir -p skills/tourism-maame-yaa_bot
mkdir -p skills/culture-osei-tutu_bot
mkdir -p skills/language-obaa-sarpongmaa_bot
```

### 3.2: Python Backend Setup

```bash
# Initialize with uv
uv init
uv add python-dotenv

# Install all dependencies
uv add fastapi uvicorn httpx python-jose[cryptography] bcrypt sqlalchemy asyncpg alembic chromadb sentence-transformers email-validator aiosqlite

# Dev dependencies
uv add --dev ruff mypy
```

### 3.3–3.12: All File Contents

See Section 4 below for EVERY file's complete contents.

### 3.13: After creating all files

```bash
# Run Alembic migration
uv run alembic revision --autogenerate -m "initial_schema"
uv run alembic upgrade head

# Ingest RAG knowledge base
uv run python -m rag.ingestion
```

---

## 4. ALL FILE CONTENTS

### FILE: `.env.example`

```
# LLM
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free

# MODEL OVERRIDES (optional — fallback to OPENROUTER_MODEL)
GENERAL_BOT_MODEL=nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free
GENERAL_BOT_FALLBACK=poolside/laguna-xs.2:free
TOURISM_BOT_MODEL=google/gemma-4-31b-it:free
TOURISM_BOT_FALLBACK=google/gemma-4-26b-a4b-it:free
CULTURE_BOT_MODEL=poolside/laguna-m.1:free
CULTURE_BOT_FALLBACK=arcee-ai/trinity-large-thinking:free
LANGUAGE_BOT_MODEL=arcee-ai/trinity-large-thinking:free
LANGUAGE_BOT_FALLBACK=google/gemma-4-26b-a4b-it:free

# DATABASE
# PostgreSQL: DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname
# SQLite dev: DATABASE_URL=sqlite+aiosqlite:///./sankofa_dev.db
DATABASE_URL=sqlite+aiosqlite:///./sankofa_dev.db

# AUTH
JWT_SECRET_KEY=change-this-to-a-long-random-string
JWT_EXPIRE_MINUTES=10080

# RAG
CHROMA_DB_PATH=./chroma_db
EMBED_MODEL=all-MiniLM-L6-v2
RAG_SCORE_FLOOR=0.45
RAG_TOP_K=5

# ADMIN - first user with this email gets auto-promoted
ADMIN_EMAIL=admin@sankofahub.com
```

### FILE: `.gitignore`

```
__pycache__/
.venv/
chroma_db/
*.pyc
.env
.mypy_cache/
.ruff_cache/
dist/
node_modules/
client/dist/
*.db
```

### FILE: `pyproject.toml`

```toml
[project]
name = "sankofa-hub"
version = "2.0.0"
description = "Multi-bot AI chat system for Ghana and West Africa"
requires-python = ">=3.11"
dependencies = [
    "httpx>=0.27.0",
    "fastapi>=0.115.0",
    "uvicorn>=0.32.0",
    "python-dotenv>=1.0.0",
    "sqlalchemy>=2.0.51",
    "asyncpg>=0.31.0",
    "alembic>=1.18.5",
    "python-jose[cryptography]>=3.5.0",
    "bcrypt>=5.0.0",
    "chromadb>=1.5.9",
    "sentence-transformers>=5.6.0",
    "aiosqlite>=0.22.1",
    "email-validator>=2.3.0",
]

[dependency-groups]
dev = [
    "ruff>=0.7.0",
    "mypy>=1.10.0",
]

[tool.ruff]
line-length = 88
target-version = "py311"

[tool.mypy]
python_version = "3.11"
warn_return_any = true
warn_unused_ignores = true
```

### FILE: `alembic.ini`

```ini
[alembic]
script_location = alembic
prepend_sys_path = .

# Use DATABASE_URL from .env at runtime
sqlalchemy.url = sqlite+aiosqlite:///./sankofa_dev.db

[loggers]
keys = root,sqlalchemy,alembic

[handlers]
keys = console

[formatters]
keys = generic

[logger_root]
level = WARN
handlers = console

[logger_sqlalchemy]
level = WARN
handlers =
qualname = sqlalchemy.engine

[logger_alembic]
level = INFO
handlers =
qualname = alembic

[handler_console]
class = StreamHandler
args = (sys.stderr,)
level = NOTSET
formatter = generic

[formatter_generic]
format = %(levelname)-5.5s [%(name)s] %(message)s
datefmt = %H:%M:%S
```

### FILE: `alembic/env.py`

```python
import asyncio
import os
from logging.config import fileConfig

from alembic import context
from dotenv import load_dotenv
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import async_engine_from_config

load_dotenv()

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite+aiosqlite:///./sankofa_dev.db",
)
config.set_main_option("sqlalchemy.url", DATABASE_URL)

from db.base import Base
from db.models import User, UserRole, Conversation, Message, AuditLog

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations():
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

### FILE: `db/__init__.py`

```python
```

### FILE: `db/base.py`

```python
import os
import ssl

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.pool import NullPool

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite+aiosqlite:///./sankofa_dev.db",
)

engine_kwargs = {
    "echo": False,
    "poolclass": NullPool,
}
if DATABASE_URL.startswith("postgresql"):
    ctx = ssl.create_default_context()
    engine_kwargs["connect_args"] = {"ssl": ctx}

engine = create_async_engine(DATABASE_URL, **engine_kwargs)
async_session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session_factory() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("[DB] Tables created successfully.")
    except Exception as e:
        print(f"[DB] WARNING: Could not connect to database: {e}")
        print("[DB] Server will start but database features will be unavailable.")
```

### FILE: `db/models.py`

```python
import enum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from db.base import Base


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.user, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    conversations = relationship(
        "Conversation", back_populates="user", cascade="all, delete-orphan"
    )


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String(36), primary_key=True)
    user_id = Column(
        String(36), ForeignKey("users.id"), nullable=False, index=True
    )
    title = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user = relationship("User", back_populates="conversations")
    messages = relationship(
        "Message",
        back_populates="conversation",
        order_by="Message.created_at",
        cascade="all, delete-orphan",
    )


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True)
    conversation_id = Column(
        String(36), ForeignKey("conversations.id"), nullable=False, index=True
    )
    role = Column(String(20), nullable=False)
    content = Column(Text, nullable=False)
    bot_id = Column(String(100), nullable=True)
    bot_name = Column(String(50), nullable=True)
    route_taken = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    conversation = relationship("Conversation", back_populates="messages")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    detail = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
```

### FILE: `db/crud.py`

```python
from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import AuditLog, Conversation, Message, User, UserRole


async def get_user_by_id(db: AsyncSession, user_id: str) -> User | None:
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession, email: str, name: str, password_hash: str
) -> User:
    user = User(
        id=str(uuid4()),
        email=email,
        name=name,
        password_hash=password_hash,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def create_conversation(
    db: AsyncSession, user_id: str, title: str | None = None
) -> Conversation:
    conv = Conversation(
        id=str(uuid4()),
        user_id=user_id,
        title=title,
    )
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    return conv


async def get_conversation(
    db: AsyncSession, conversation_id: str
) -> Conversation | None:
    result = await db.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    return result.scalar_one_or_none()


async def get_user_conversations(
    db: AsyncSession, user_id: str
) -> list[Conversation]:
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.updated_at.desc())
    )
    return list(result.scalars().all())


async def save_message(
    db: AsyncSession,
    conversation_id: str,
    role: str,
    content: str,
    bot_id: str | None = None,
    bot_name: str | None = None,
    route_taken: str | None = None,
) -> Message:
    msg = Message(
        id=str(uuid4()),
        conversation_id=conversation_id,
        role=role,
        content=content,
        bot_id=bot_id,
        bot_name=bot_name,
        route_taken=route_taken,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


async def get_conversation_messages(
    db: AsyncSession, conversation_id: str
) -> list[Message]:
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    return list(result.scalars().all())


async def get_conversation_count(db: AsyncSession) -> int:
    result = await db.execute(select(func.count(Conversation.id)))
    return result.scalar() or 0


async def get_message_count(db: AsyncSession) -> int:
    result = await db.execute(select(func.count(Message.id)))
    return result.scalar() or 0


async def get_messages_today(db: AsyncSession) -> int:
    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    result = await db.execute(
        select(func.count(Message.id)).where(Message.created_at >= today_start)
    )
    return result.scalar() or 0


async def get_messages_by_bot(db: AsyncSession) -> dict[str, int]:
    result = await db.execute(
        select(Message.bot_name, func.count(Message.id)).group_by(
            Message.bot_name
        )
    )
    return {row[0]: row[1] for row in result.all()}


async def get_all_users_paginated(
    db: AsyncSession, page: int = 1, limit: int = 20
) -> list[User]:
    offset = (page - 1) * limit
    result = await db.execute(
        select(User).order_by(User.created_at.desc()).offset(offset).limit(limit)
    )
    return list(result.scalars().all())


async def get_all_conversations_paginated(
    db: AsyncSession, page: int = 1, limit: int = 20
) -> list[Conversation]:
    offset = (page - 1) * limit
    result = await db.execute(
        select(Conversation)
        .order_by(Conversation.updated_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(result.scalars().all())


async def update_user_role(
    db: AsyncSession, user_id: str, role: UserRole
) -> User | None:
    user = await get_user_by_id(db, user_id)
    if user:
        user.role = role
        await db.commit()
        await db.refresh(user)
    return user


async def toggle_user_active(
    db: AsyncSession, user_id: str
) -> User | None:
    user = await get_user_by_id(db, user_id)
    if user:
        user.is_active = not user.is_active
        await db.commit()
        await db.refresh(user)
    return user


async def update_user_profile(
    db: AsyncSession, user_id: str, name: str | None = None, email: str | None = None
) -> User | None:
    user = await get_user_by_id(db, user_id)
    if user:
        if name is not None:
            user.name = name
        if email is not None:
            user.email = email
        await db.commit()
        await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user_id: str) -> bool:
    user = await get_user_by_id(db, user_id)
    if user:
        await db.delete(user)
        await db.commit()
        return True
    return False


async def get_user_count(db: AsyncSession) -> int:
    result = await db.execute(select(func.count(User.id)))
    return result.scalar() or 0


async def search_users(db: AsyncSession, query: str, page: int = 1, limit: int = 20) -> list[User]:
    offset = (page - 1) * limit
    search = f"%{query}%"
    result = await db.execute(
        select(User)
        .where(User.name.ilike(search) | User.email.ilike(search))
        .order_by(User.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(result.scalars().all())


async def search_users_count(db: AsyncSession, query: str) -> int:
    search = f"%{query}%"
    result = await db.execute(
        select(func.count(User.id)).where(User.name.ilike(search) | User.email.ilike(search))
    )
    return result.scalar() or 0


async def create_audit_log(
    db: AsyncSession,
    action: str,
    user_id: str | None = None,
    detail: str | None = None,
    ip_address: str | None = None,
) -> AuditLog:
    log = AuditLog(
        id=str(uuid4()),
        user_id=user_id,
        action=action,
        detail=detail,
        ip_address=ip_address,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return log


async def get_audit_logs_paginated(
    db: AsyncSession, page: int = 1, limit: int = 20
) -> list[AuditLog]:
    offset = (page - 1) * limit
    result = await db.execute(
        select(AuditLog)
        .order_by(AuditLog.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(result.scalars().all())
```

### FILE: `auth/__init__.py`

```python
```

### FILE: `auth/schemas.py`

```python
from datetime import datetime

from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    email: EmailStr
    name: str
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: str
    email: str
    name: str
    role: str
    created_at: datetime


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
```

### FILE: `auth/service.py`

```python
import os
from datetime import datetime, timedelta

import bcrypt
from jose import jwt

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me-in-production")
ALGORITHM = "HS256"
EXPIRE_MIN = int(os.getenv("JWT_EXPIRE_MINUTES", "10080"))


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(
        plain.encode("utf-8"), hashed.encode("utf-8")
    )


def create_access_token(user_id: str, role: str) -> str:
    expires = datetime.utcnow() + timedelta(minutes=EXPIRE_MIN)
    return jwt.encode(
        {"sub": user_id, "role": role, "exp": expires},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


def decode_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
```

### FILE: `auth/dependencies.py`

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from auth.service import decode_token
from db.base import get_db
from db.crud import get_user_by_id

bearer = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer),
    db: AsyncSession = Depends(get_db),
):
    try:
        payload = decode_token(credentials.credentials)
        user = await get_user_by_id(db, payload["sub"])
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
            )
        return user
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


async def require_admin(user=Depends(get_current_user)):
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user
```

### FILE: `bots/__init__.py`

```python
```

### FILE: `bots/bot_loader.py`

```python
from pathlib import Path
import re
from dataclasses import dataclass
from typing import Optional


@dataclass
class BotConfig:
    skill_id: str
    name: str
    description: str
    skill_path: Optional[Path] = None
    system_prompt: str = ""
    model: str = ""
    fallback_model: str = ""


@dataclass
class Message:
    role: str
    content: str
    bot_id: str = ""


BOT_REGISTRY: dict[str, BotConfig] = {}
_PROJECT_ROOT = Path(__file__).parent.parent
LOCAL_SKILL_DIR = _PROJECT_ROOT / "skills"
GLOBAL_SKILL_DIR = Path.home() / ".config" / "opencode" / "skills"

BOT_MODEL_CONFIG: dict[str, tuple[str, str]] = {
    "general-nana-kwame_bot": ("anthropic/claude-3.5-haiku", "anthropic/claude-3-haiku"),
    "tourism-maame-yaa_bot": ("anthropic/claude-3.5-sonnet", "anthropic/claude-3-haiku"),
    "culture-osei-tutu_bot": ("anthropic/claude-3.5-sonnet", "anthropic/claude-3-haiku"),
    "language-obaa-sarpongmaa_bot": ("anthropic/claude-3.5-sonnet", "anthropic/claude-3-haiku"),
}


def _find_skill_file(skill_id: str) -> Path:
    local = LOCAL_SKILL_DIR / skill_id / "SKILL.md"
    if local.exists():
        return local
    global_f = GLOBAL_SKILL_DIR / skill_id / "SKILL.md"
    if global_f.exists():
        return global_f
    raise FileNotFoundError(f"Skill not found: checked {local} and {global_f}")


def _load_skill(skill_id: str) -> str:
    skill_file = _find_skill_file(skill_id)
    return skill_file.read_text(encoding="utf-8")


def register_bot(skill_id: str) -> BotConfig:
    if skill_id in BOT_REGISTRY:
        return BOT_REGISTRY[skill_id]
    skill_content = _load_skill(skill_id)
    skill_file = _find_skill_file(skill_id)
    frontmatter_match = re.match(r"^---\n(.*?)\n---\n", skill_content, re.DOTALL)
    if not frontmatter_match:
        raise ValueError(f"Invalid SKILL.md format for {skill_id}: missing frontmatter")
    meta: dict[str, str] = {}
    for line in frontmatter_match.group(1).splitlines():
        if ":" in line:
            key, _, value = line.partition(":")
            meta[key.strip()] = value.strip()
    skill_body = skill_content[frontmatter_match.end():].strip()
    model, fallback = BOT_MODEL_CONFIG.get(skill_id, ("", ""))
    config = BotConfig(
        skill_id=skill_id,
        name=meta.get("name", skill_id),
        description=meta.get("description", ""),
        skill_path=skill_file,
        system_prompt=skill_body,
        model=model,
        fallback_model=fallback,
    )
    BOT_REGISTRY[skill_id] = config
    return config


def get_bot(skill_id: str) -> BotConfig:
    if skill_id not in BOT_REGISTRY:
        return register_bot(skill_id)
    return BOT_REGISTRY[skill_id]


def get_all_bots() -> list[BotConfig]:
    return list(BOT_REGISTRY.values())


ROUTER_BOT_ID = "general-nana-kwame_bot"
SPECIALIST_BOT_IDS = {
    "culture": "culture-osei-tutu_bot",
    "language": "language-obaa-sarpongmaa_bot",
    "tourism": "tourism-maame-yaa_bot",
}

ALL_ROUTES = {"general": ROUTER_BOT_ID, **SPECIALIST_BOT_IDS}
SKILL_ID_TO_ROUTE: dict[str, str] = {v: k for k, v in ALL_ROUTES.items()}

BOT_DISPLAY_NAMES: dict[str, str] = {
    "general-nana-kwame_bot": "Nana Kwame",
    "tourism-maame-yaa_bot": "Maame Yaa",
    "culture-osei-tutu_bot": "Osei Tutu",
    "language-obaa-sarpongmaa_bot": "Obaa Sarpongmaa",
}

for _bot_id in [ROUTER_BOT_ID] + list(SPECIALIST_BOT_IDS.values()):
    register_bot(_bot_id)
```

### FILE: `bots/llm.py`

```python
import httpx
from typing import Optional

from bots.bot_loader import BOT_REGISTRY, BotConfig


OPENROUTER_API_KEY: Optional[str] = None
OPENROUTER_BASE_URL: Optional[str] = None


def configure(api_key: str, base_url: str, default_model: str = "") -> None:
    global OPENROUTER_API_KEY, OPENROUTER_BASE_URL
    OPENROUTER_API_KEY = api_key
    OPENROUTER_BASE_URL = base_url


async def _chatcompletion(messages: list[dict], models: list[str]) -> str:
    if not OPENROUTER_API_KEY or not OPENROUTER_BASE_URL:
        raise RuntimeError("OpenRouter not configured.")
    last_error: Exception | None = None
    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    for model in models:
        if not model:
            continue
        payload = {"model": model, "messages": messages}
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{OPENROUTER_BASE_URL}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                return str(data["choices"][0]["message"]["content"])
        except httpx.TimeoutException:
            last_error = RuntimeError(f"Timeout on {model}")
        except httpx.HTTPStatusError as e:
            last_error = RuntimeError(f"HTTP {e.response.status_code} on {model}: {e.response.text[:200]}")
        except httpx.RequestError as e:
            last_error = RuntimeError(f"Request failed on {model}: {e}")
    raise RuntimeError(f"All models failed. Last error: {last_error}")


def _build_messages(config: BotConfig, history: list[dict]) -> list[dict]:
    messages = [{"role": "system", "content": config.system_prompt}]
    for msg in history:
        messages.append({"role": msg["role"], "content": msg["content"]})
    return messages


def _get_models(bot_config: BotConfig) -> list[str]:
    models: list[str] = []
    if bot_config.model:
        models.append(bot_config.model)
    if bot_config.fallback_model:
        models.append(bot_config.fallback_model)
    return models


async def chat_with_bot(
    bot_id: str,
    user_message: str,
    history: list[dict],
) -> str:
    config = BOT_REGISTRY[bot_id]
    models = _get_models(config)
    messages = _build_messages(config, history)
    messages.append({"role": "user", "content": user_message})
    return await _chatcompletion(messages, models)
```

### FILE: `bots/router.py`

```python
import re

from bots.bot_loader import ROUTER_BOT_ID, SPECIALIST_BOT_IDS, get_bot, BotConfig, BOT_DISPLAY_NAMES


VALID_ROUTES = {"tourism", "culture", "language", "general", "decline"}


def parse_route(text: str) -> tuple[str, str, bool]:
    match = re.search(r"^ROUTE:\s*(\w+)\s*$", text, re.MULTILINE)
    if match:
        route = match.group(1).strip().lower()
        if route not in VALID_ROUTES:
            route = "general"
        cleaned = re.sub(r"^ROUTE:\s*\w+\s*$\n?", "", text, flags=re.MULTILINE).strip()
        return route, cleaned, True
    return "general", text, False


def resolve_bot(route: str) -> tuple[str, BotConfig]:
    if route == "decline":
        return ROUTER_BOT_ID, get_bot(ROUTER_BOT_ID)
    if route in SPECIALIST_BOT_IDS:
        return SPECIALIST_BOT_IDS[route], get_bot(SPECIALIST_BOT_IDS[route])
    return ROUTER_BOT_ID, get_bot(ROUTER_BOT_ID)


def get_display_name(skill_id: str) -> str:
    return BOT_DISPLAY_NAMES.get(skill_id, "Sankofa Hub")
```

### FILE: `bots/conversation.py`

```python
from dataclasses import dataclass, field

from bots.bot_loader import ROUTER_BOT_ID, Message


@dataclass
class Session:
    user_id: str
    history: list[Message] = field(default_factory=list)
    current_bot: str = ROUTER_BOT_ID


active_sessions: dict[str, Session] = {}


def get_or_create_session(user_id: str) -> Session:
    if user_id not in active_sessions:
        active_sessions[user_id] = Session(user_id=user_id)
    return active_sessions[user_id]


def history_to_llm_format(history: list[Message]) -> list[dict]:
    return [{"role": m.role, "content": m.content} for m in history]


def clear_history(user_id: str) -> None:
    if user_id in active_sessions:
        del active_sessions[user_id]
```

### FILE: `rag/__init__.py`

```python
```

### FILE: `rag/vector_store.py`

```python
import os

import chromadb
from chromadb.config import Settings

CHROMA_PATH = os.getenv("CHROMA_DB_PATH", "./chroma_db")


class VectorStore:
    def __init__(self):
        self.client = chromadb.PersistentClient(
            path=CHROMA_PATH,
            settings=Settings(anonymized_telemetry=False),
        )

    def get_or_create_collection(self, name: str):
        return self.client.get_or_create_collection(
            name=name,
            metadata={"hnsw:space": "cosine"},
        )

    def add_chunks(self, collection_name: str, chunks: list[dict]) -> None:
        col = self.get_or_create_collection(collection_name)
        col.add(
            ids=[c["chunk_id"] for c in chunks],
            documents=[c["text"] for c in chunks],
            embeddings=[c["embedding"] for c in chunks],
            metadatas=[c["metadata"] for c in chunks],
        )

    def query(
        self,
        collection_name: str,
        embedding: list[float],
        top_k: int = 10,
    ) -> list[dict]:
        col = self.get_or_create_collection(collection_name)
        results = col.query(
            query_embeddings=[embedding],
            n_results=top_k,
            include=["documents", "metadatas", "distances"],
        )
        output = []
        for doc, meta, dist in zip(
            results["documents"][0],
            results["metadatas"][0],
            results["distances"][0],
        ):
            score = 1 - (dist / 2)
            output.append({"text": doc, "metadata": meta, "score": score})
        return output


vector_store = VectorStore()
```

### FILE: `rag/chunker.py`

```python
import re


def clean_text(text: str) -> str:
    text = re.sub(r"#{1,6}\s*", "", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def chunk_text(
    text: str,
    source: str,
    section: str,
    chunk_size: int = 300,
    overlap: int = 50,
) -> list[dict]:
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    chunks, current, word_count = [], [], 0

    for para in paragraphs:
        words = len(para.split())
        if word_count + words > chunk_size and current:
            chunk_body = "\n\n".join(current)
            context_prefix = f"[From: {source} | Section: {section}]\n"
            chunks.append({
                "text": context_prefix + chunk_body,
                "source": source,
                "section": section,
            })
            if overlap > 0 and current:
                overlap_text = " ".join(current[-1].split()[-overlap:])
                current = [overlap_text]
                word_count = len(overlap_text.split())
            else:
                current = []
                word_count = 0
        current.append(para)
        word_count += words

    if current:
        chunk_body = "\n\n".join(current)
        context_prefix = f"[From: {source} | Section: {section}]\n"
        chunks.append({
            "text": context_prefix + chunk_body,
            "source": source,
            "section": section,
        })
    return chunks
```

### FILE: `rag/retrieval.py`

```python
import os

from sentence_transformers import SentenceTransformer

from rag.vector_store import vector_store

EMBED_MODEL_NAME = os.getenv("EMBED_MODEL", "all-MiniLM-L6-v2")
SCORE_FLOOR = float(os.getenv("RAG_SCORE_FLOOR", "0.45"))
TOP_K_RETRIEVE = int(os.getenv("RAG_TOP_K", "5"))

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
    if domain not in {"tourism", "language"}:
        return ""
    collection_name = f"{domain}_kb"
    query_embedding = embed(query)
    results = vector_store.query(
        collection_name, query_embedding, top_k=TOP_K_RETRIEVE
    )
    relevant = [r for r in results if r["score"] >= SCORE_FLOOR]
    if not relevant:
        return ""
    lines = ["=== KNOWLEDGE BASE CONTEXT ==="]
    for i, r in enumerate(relevant[:3], 1):
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

### FILE: `rag/ingestion.py`

```python
import re
from pathlib import Path

from rag.chunker import chunk_text, clean_text
from rag.retrieval import embed
from rag.vector_store import vector_store

KNOWLEDGE_BASE_PATH = Path(__file__).parent.parent / "knowledge_base"


def ingest_domain(domain: str) -> int:
    domain_path = KNOWLEDGE_BASE_PATH / domain
    if not domain_path.exists():
        print(f"  Path not found: {domain_path}")
        return 0
    collection_name = f"{domain}_kb"
    try:
        vector_store.client.delete_collection(collection_name)
        print(f"  Cleared existing collection: {collection_name}")
    except Exception:
        pass

    all_chunks = []
    global_index = 0
    for md_file in sorted(domain_path.glob("*.md")):
        raw = md_file.read_text(encoding="utf-8")
        sections = re.split(r"\n(?=## )", raw)
        source_name = md_file.stem.replace("_", " ").title()
        for section_text in sections:
            section_title = re.match(r"##\s*(.+)", section_text)
            section = section_title.group(1).strip() if section_title else "General"
            cleaned = clean_text(section_text)
            if len(cleaned.split()) < 20:
                continue
            chunks = chunk_text(cleaned, source=source_name, section=section)
            for chunk in chunks:
                chunk_id = f"{domain}_{md_file.stem}_{global_index:04d}"
                global_index += 1
                embedding = embed(chunk["text"])
                all_chunks.append({
                    "chunk_id": chunk_id,
                    "text": chunk["text"],
                    "embedding": embedding,
                    "metadata": {
                        "chunk_id": chunk_id,
                        "source": chunk["source"],
                        "section": chunk["section"],
                        "domain": domain,
                        "file": md_file.name,
                    },
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

### FILE: `admin/__init__.py`

```python
```

### FILE: `admin/routes.py`

```python
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

from auth.dependencies import require_admin
from db.base import get_db
from db.crud import (
    create_audit_log,
    delete_user,
    get_all_conversations_paginated,
    get_conversation_count,
    get_message_count,
    get_messages_by_bot,
    get_messages_today,
    get_user_count,
    search_users,
    search_users_count,
    toggle_user_active,
    update_user_profile,
    update_user_role,
    get_all_users_paginated,
    get_audit_logs_paginated,
)
from db.models import User, UserRole

router = APIRouter(prefix="/admin", tags=["Admin"])


class UpdateUserRequest(BaseModel):
    name: str | None = None
    email: EmailStr | None = None


@router.get("/stats")
async def admin_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    return {
        "total_users": await get_user_count(db),
        "total_conversations": await get_conversation_count(db),
        "total_messages": await get_message_count(db),
        "messages_today": await get_messages_today(db),
        "messages_by_bot": await get_messages_by_bot(db),
    }


@router.get("/users")
async def admin_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query("", max_length=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if search.strip():
        users = await search_users(db, search, page=page, limit=limit)
        total = await search_users_count(db, search)
    else:
        users = await get_all_users_paginated(db, page=page, limit=limit)
        total = await get_user_count(db)
    return {
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "name": u.name,
                "role": u.role.value,
                "is_active": u.is_active,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "pages": max(1, (total + limit - 1) // limit),
    }


@router.get("/users/{user_id}")
async def admin_get_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "role": user.role.value,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


@router.put("/users/{user_id}")
async def admin_update_user(
    user_id: str,
    body: UpdateUserRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    user = await update_user_profile(db, user_id, name=body.name, email=body.email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await create_audit_log(
        db, action="admin_update_user", user_id=current_user.id,
        detail=f"Updated user {user_id}: {body.model_dump(exclude_none=True)}",
    )
    return {
        "id": user.id, "email": user.email, "name": user.name,
        "role": user.role.value, "is_active": user.is_active,
    }


@router.delete("/users/{user_id}")
async def admin_delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await delete_user(db, user_id)
    await create_audit_log(
        db, action="admin_delete_user", user_id=current_user.id,
        detail=f"Deleted user {user_id} ({user.email})",
    )
    return {"message": "User deleted", "user_id": user_id}


@router.patch("/users/{user_id}")
async def admin_patch_user(
    user_id: str,
    action: str = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if user_id == current_user.id and action in ("toggle-active", "demote-user"):
        raise HTTPException(status_code=400, detail=f"Cannot {action} your own account")
    if action == "toggle-active":
        user = await toggle_user_active(db, user_id)
    elif action == "promote-admin":
        user = await update_user_role(db, user_id, UserRole.admin)
    elif action == "demote-user":
        user = await update_user_role(db, user_id, UserRole.user)
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    await create_audit_log(
        db, action=f"admin_{action}", user_id=current_user.id,
        detail=f"User {user_id} — {action}",
    )
    return {"message": f"User {action} succeeded", "user_id": user_id}


@router.get("/conversations")
async def admin_conversations(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    convs = await get_all_conversations_paginated(db, page=page, limit=limit)
    result = []
    for c in convs:
        user = await db.get(User, c.user_id)
        result.append({
            "id": c.id,
            "user_email": user.email if user else "unknown",
            "title": c.title,
            "created_at": c.created_at.isoformat() if c.created_at else None,
            "updated_at": c.updated_at.isoformat() if c.updated_at else None,
        })
    return result


@router.get("/audit-logs")
async def admin_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    logs = await get_audit_logs_paginated(db, page=page, limit=limit)
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "detail": log.detail,
            "ip_address": log.ip_address,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in logs
    ]
```

### FILE: `main.py`

```python
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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
            db, user_id=user_id if user_obj else str(uuid4()),
        )
        conversation_id = conversation.id
    history = await get_conversation_messages(db, conversation_id)
    llm_history = history_to_llm_format(
        [BotMessage(role=m.role, content=m.content, bot_id=m.bot_id or "") for m in history]
    )
    reply = await chat_with_bot(ROUTER_BOT_ID, req.message, llm_history)
    route_key, clean_reply, was_routed = parse_route(reply)
    answering_bot_id = ROUTER_BOT_ID
    final_reply = clean_reply
    if was_routed and route_key in SPECIALIST_BOT_IDS and route_key != "general":
        target_bot = SPECIALIST_BOT_IDS[route_key]
        try:
            if route_key in {"tourism", "language"} and was_routed:
                rag_context = retrieve_context(query=req.message, domain=route_key)
                specialist_user_message = (
                    f"{rag_context}\n\nUser question: {req.message}"
                    if rag_context
                    else req.message
                )
            else:
                specialist_user_message = req.message
            specialist_reply = await chat_with_bot(
                target_bot, specialist_user_message, llm_history,
            )
            _, final_reply, _ = parse_route(specialist_reply)
            answering_bot_id = target_bot
        except Exception:
            final_reply = "I'm sorry, I encountered an error while processing your request. Please try again in a moment."
    answering_bot_name = get_display_name(answering_bot_id)
    await save_message(db, conversation_id=conversation_id, role="user", content=req.message)
    await save_message(
        db, conversation_id=conversation_id, role="assistant", content=final_reply,
        bot_id=answering_bot_id, bot_name=answering_bot_name, route_taken=route_key,
    )
    if conversation.title is None:
        title = req.message[:60].strip()
        if title:
            conversation.title = title
            await db.commit()
    await create_audit_log(db, action="chat_message", user_id=user_id, detail=f"Route: {route_key}")
    return ChatResponse(
        reply=final_reply, bot_name=answering_bot_name, bot_id=answering_bot_id,
        route_taken=route_key, conversation_id=conversation_id,
    )


@app.post("/auth/register", response_model=AuthResponse)
async def auth_register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await get_user_by_email(db, req.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    if len(req.password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")
    admin_email = os.getenv("ADMIN_EMAIL", "")
    role = UserRole.admin if req.email == admin_email else UserRole.user
    password_hash = hash_password(req.password)
    user = await create_user(db, req.email, req.name, password_hash)
    user.role = role
    await db.commit()
    token = create_access_token(user.id, user.role.value)
    await create_audit_log(db, action="register", user_id=user.id, detail="User registered")
    return AuthResponse(
        access_token=token,
        user=UserPublic(id=user.id, email=user.email, name=user.name, role=user.role.value, created_at=user.created_at),
    )


@app.post("/auth/login", response_model=AuthResponse)
async def auth_login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, req.email)
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    token = create_access_token(user.id, user.role.value)
    await create_audit_log(db, action="login", user_id=user.id, detail="User logged in")
    return AuthResponse(
        access_token=token,
        user=UserPublic(id=user.id, email=user.email, name=user.name, role=user.role.value, created_at=user.created_at),
    )


@app.get("/auth/me", response_model=UserPublic)
async def auth_me(current_user: User = Depends(get_current_user)):
    return UserPublic(
        id=current_user.id, email=current_user.email, name=current_user.name,
        role=current_user.role.value, created_at=current_user.created_at,
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
            id=c.id, title=c.title,
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
                "id": m.id, "role": m.role, "content": m.content,
                "bot_id": m.bot_id, "bot_name": m.bot_name,
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
    return {"id": conv.id, "title": conv.title, "created_at": conv.created_at.isoformat() if conv.created_at else None}


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
            "id": m.id, "role": m.role, "content": m.content,
            "bot_id": m.bot_id, "bot_name": m.bot_name,
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
```

---

## 5. SKILL FILES (System Prompts)

### FILE: `skills/general-nana-kwame_bot/SKILL.md`

```markdown
---
name: Nana Kwame
description: General Assistant & Intelligent Router
---

You are Nana Kwame, the central intelligence of the Sankofa Hub — a platform dedicated to Ghana and West Africa across three specialist domains: Tourism, Culture, and Language.

Your primary role is to analyse every incoming question and determine where it belongs.

## YOUR ROUTING RESPONSIBILITY

You are the entry point for ALL questions. Your job is to:
1. Analyse the question
2. Determine its primary domain
3. Either answer it yourself or signal routing to a specialist

You MUST end EVERY response with one of these routing signals on its own line:
ROUTE: tourism
ROUTE: culture
ROUTE: language
ROUTE: general
ROUTE: decline

## ROUTING RULES

### ROUTE: tourism
Use when the question is PRIMARILY about: visa requirements, travel logistics, tourist attractions, accommodation, transportation, eco-tourism, food tourism, travel safety, travel itineraries, where to go in Ghana/West Africa. Even if the question mentions language or culture, if the PURPOSE is travel practicality, route to tourism.

### ROUTE: culture
Use when the question is PRIMARILY about: Ghanaian/West African cultural practices, traditional symbols (Kente, Adinkra, Sankofa), festivals, rites of passage, colonial history, artefact repatriation, traditional governance, contested history, cultural values and heritage — with no travel logistics framing.

### ROUTE: language
Use when the question is PRIMARILY about: translation requests, linguistic structure, tonal languages, language endangerment, sociolinguistics, code-switching, pidgin, creole, Ghanaian Sign Language, African language technology.

### ROUTE: general
Use when:
- The question is genuinely cross-domain (equally spans tourism + culture + language) with no single specialist owning it
- A follow-up question continues a topic you answered in a previous turn
- The question is a greeting or about the system itself

### ROUTE: decline
Use when the question has NOTHING to do with tourism, culture, or language in the Ghana/West Africa context. Examples: medical advice, financial advice, sports scores, coding questions, diet plans, weather forecasts unrelated to travel. When declining, be warm and specific. Tell the user what you CAN help with. Never be dismissive. Always sign off as Nana Kwame.

## YOUR ANSWER STYLE (when ROUTE: general)
- You are warm, knowledgeable, and proud of Ghanaian heritage
- You speak with authority but remain accessible
- You acknowledge complexity in cross-domain questions
- You always sign off: — Nana Kwame

## CRITICAL
Never answer a question that clearly belongs to a specialist. Never reveal that you are routing. Never say "I am transferring you" or "Let me connect you." Simply end with the ROUTE: directive on its own line. The routing signal is for the system, not for the user.
```

### FILE: `skills/tourism-maame-yaa_bot/SKILL.md`

```markdown
---
name: Maame Yaa
description: Tourism Specialist
---

You are Maame Yaa, the Tourism Specialist of the Sankofa Hub — a warm, deeply knowledgeable guide to travel in Ghana and West Africa.

## YOUR DOMAIN
You answer questions about: visa requirements, tourist attractions, accommodation, transportation, eco-tourism, culinary tourism, food tourism, travel safety, sustainable travel, travel itineraries, travel seasons, travel logistics, cultural etiquette FOR TOURISTS (i.e. how to behave respectfully as a visitor).

## IMPORTANT DOMAIN NUANCE
A question like "What languages are spoken in Cape Verde and will English be enough for tourists?" is YOUR question. The tourist framing makes it travel practicality. Answer it fully.

A question about booking tours, opening hours, ticket prices, or "how do I visit X" is always yours — you handle logistics.

## WHAT YOU DO NOT ANSWER
You do not answer questions about pure linguistics, pure cultural heritage without a travel context, or questions completely outside the Ghana/West Africa travel domain.

## YOUR ANSWER STYLE
- You are enthusiastic, warm, and detailed
- You provide practical, actionable information
- You note when information may change (visa requirements, prices) and recommend official sources for verification
- You celebrate Ghana and West Africa as destinations
- You are honest about challenges (e.g. safety, infrastructure) without being alarmist
- You always sign off: — Maame Yaa

## ACCURACY
When uncertain, say so clearly. Do not fabricate visa fees, hotel prices, or attraction hours. Say "as of my last information" and recommend verification from official sources like the Ghana Tourism Authority.
```

### FILE: `skills/culture-osei-tutu_bot/SKILL.md`

```markdown
---
name: Osei Tutu
description: Culture Specialist
---

You are Osei Tutu, the Culture Specialist of the Sankofa Hub — a scholar and storyteller with deep knowledge of Ghanaian and West African cultural heritage.

## YOUR DOMAIN
You answer questions about: Ghanaian and West African cultural practices, traditional symbols (Kente cloth, Adinkra symbols, Sankofa), festivals (Homowo, Odwira, etc.), traditional initiation rites, colonial history, decolonial discourse, African artefact repatriation debates, traditional governance (e.g. chieftaincy systems), cultural values, UNESCO World Heritage designations, contested historical narratives.

## IMPORTANT DOMAIN NUANCE
"What cultural customs should a tourist respect at a Ghanaian funeral?" is YOUR question. The tourist framing does not transfer it to Tourism — the substance is cultural knowledge. Answer it fully.

## DECOLONIAL AWARENESS
You approach sensitive historical topics — colonialism, artefact theft, contested history — with nuance, accuracy, and multiple perspectives. You do not deliver one-sided narratives. You acknowledge complexity. You represent African voices and scholarship with pride.

## WHAT YOU DO NOT ANSWER
You do not answer travel logistics questions (opening hours, booking tours, visa info) or pure linguistics questions unrelated to cultural context.

## YOUR ANSWER STYLE
- You are scholarly, thoughtful, and proud
- You use proper names for cultural items, festivals, and traditions
- You cite the significance behind things — not just what they are but why they matter
- You handle sensitive topics with care and respect
- For controversial questions you present multiple scholarly perspectives without personal political bias
- You always sign off: — Osei Tutu
```

### FILE: `skills/language-obaa-sarpongmaa_bot/SKILL.md`

```markdown
---
name: Obaa Sarpongmaa
description: Language Specialist
---

You are Obaa Sarpongmaa, the Language Specialist of the Sankofa Hub — a linguist with deep expertise in African languages, particularly Ghanaian languages.

## YOUR DOMAIN
You answer questions about: translation requests (Twi, Ga, Hausa, French/English in West African context), linguistic structure and grammar of African languages, tonal language mechanics, language endangerment and preservation efforts, sociolinguistics, code-switching between English and Ghanaian languages, pidgin and creole languages, Ghanaian Sign Language (GhSL), AI and NLP limitations for African languages, language diversity policy.

## TRANSLATION QUALITY
When translating, provide:
- The translation itself
- Register notes (formal vs informal vs ceremonial)
- Any important cultural context embedded in the phrasing
- Phonetic guidance if the language uses tonal distinctions

## HONESTY ABOUT LIMITATIONS
Be honest about AI limitations in African language translation. Do not fabricate translations you are uncertain about. When uncertain, provide the best available translation with a note about confidence level and recommend human expert verification for formal use.

## WHAT YOU DO NOT ANSWER
You do not answer questions about travel logistics, cultural heritage without a linguistic framing, or questions completely outside language and linguistics.

## YOUR ANSWER STYLE
- You are precise, technically rigorous but accessible
- You celebrate African linguistic diversity — never treat African languages as inferior to European languages
- You push back gently but firmly against prescriptivist assumptions
- You acknowledge when something is contested in linguistics scholarship
- You always sign off: — Obaa Sarpongmaa
```

---

## 6. KNOWLEDGE BASE FILES

The knowledge base consists of markdown files in `knowledge_base/tourism/` and `knowledge_base/language/`. Each file contains detailed factual information used by the RAG pipeline to provide contextually grounded answers.

### Tourism Knowledge Base (6 files)

Create these files under `knowledge_base/tourism/`:

1. **`accommodation_guide.md`** — Hotels, guesthouses, budget options across Accra, Cape Coast, Kumasi, Northern Ghana, Volta Region. Price ranges, booking advice.
2. **`food_and_cuisine.md`** — Jollof rice, waakye, fufu, banku, kenkey, kelewele, street food, chop bars, restaurant scene, food safety tips.
3. **`ghana_tourist_sites.md`** — Cape Coast Castle, Kakum National Park, Mole National Park, Labadi Beach, Elmina Castle, Wli Waterfalls, Aburi Botanical Gardens. Entry fees, hours, descriptions.
4. **`transport_in_ghana.md`** — Airport, domestic flights, STC/VIP buses, tro-tros, taxis, Bolt/Uber, car rental, traffic, road safety.
5. **`travel_safety.md`** — General safety, petty theft, road safety, malaria, yellow fever, water, medical facilities, emergency contacts, common scams.
6. **`visa_and_entry.md`** — Visa requirements, ECOWAS, e-visa process, yellow fever certificate, immigration, length of stay.

### Language Knowledge Base (7 files)

Create these files under `knowledge_base/language/`:

1. **`endangered_languages.md`** — UNESCO endangerment scale, notable endangered Ghanaian languages (Nkonya, Siwu, Animere, etc.), causes, preservation efforts.
2. **`ga_language_guide.md`** — Overview, sound system, essential greetings, useful phrases, Ga in Accra today, Homowo festival, preservation efforts.
3. **`ghanaian_english.md`** — Features, vocabulary (go slow, chop bar, trotro, etc.), code-switching, legitimacy as a variety.
4. **`hausa_overview.md`** — Hausa in Ghana, its role as a lingua franca, features.
5. **`language_policy_ghana.md`** — Official language policy, mother tongue education, multilingual education.
6. **`translation_notes.md`** — Translation challenges, tonal languages, cultural context in translation.
7. **`twi_basics.md`** — Twi overview, dialects (Asante, Akuapem, Fante), greetings, basic phrases, tonal system.

**Note:** Each knowledge base file should contain 500–2000 words of detailed factual content. The RAG system chunks them into ~300-word segments with 50-word overlap for retrieval.

---

## 7. FRONTEND FILES

### FILE: `client/package.json`

```json
{
  "name": "sankofa-hub-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.0.1",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-scroll-area": "^1.2.9",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-tabs": "^1.1.12",
    "@radix-ui/react-tooltip": "^1.2.7",
    "@tanstack/react-query": "^5.80.6",
    "axios": "^1.9.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "framer-motion": "^12.16.0",
    "lucide-react": "^0.513.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-hook-form": "^7.57.0",
    "react-router-dom": "^7.16.0",
    "tailwind-merge": "^3.3.0",
    "uuid": "^11.1.0",
    "zod": "^3.25.51",
    "zustand": "^5.0.5"
  },
  "devDependencies": {
    "@eslint/js": "^9.25.0",
    "@tailwindcss/vite": "^4.1.8",
    "@types/node": "^22.15.29",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "@types/uuid": "^10.0.0",
    "@vitejs/plugin-react": "^4.4.1",
    "eslint": "^9.25.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.19",
    "globals": "^16.0.0",
    "tailwindcss": "^4.1.8",
    "typescript": "~5.8.3",
    "typescript-eslint": "^8.30.1",
    "vite": "^6.3.5"
  }
}
```

### FILE: `client/.env`

```
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Sankofa Hub
VITE_APP_VERSION=2.0.0
VITE_CHAT_REDIRECT_THRESHOLD=6
```

### FILE: `client/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
```

### FILE: `client/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

---

## 8. ENVIRONMENT VARIABLES

### Backend `.env`

```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free

GENERAL_BOT_MODEL=nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free
GENERAL_BOT_FALLBACK=poolside/laguna-xs.2:free
TOURISM_BOT_MODEL=google/gemma-4-31b-it:free
TOURISM_BOT_FALLBACK=google/gemma-4-26b-a4b-it:free
CULTURE_BOT_MODEL=poolside/laguna-m.1:free
CULTURE_BOT_FALLBACK=arcee-ai/trinity-large-thinking:free
LANGUAGE_BOT_MODEL=arcee-ai/trinity-large-thinking:free
LANGUAGE_BOT_FALLBACK=google/gemma-4-26b-a4b-it:free

DATABASE_URL=sqlite+aiosqlite:///./sankofa_dev.db

JWT_SECRET_KEY=generate-a-random-64-char-string-here
JWT_EXPIRE_MINUTES=10080

CHROMA_DB_PATH=./chroma_db
EMBED_MODEL=all-MiniLM-L6-v2
RAG_SCORE_FLOOR=0.45
RAG_TOP_K=5

ADMIN_EMAIL=admin@sankofahub.com
```

### Frontend `client/.env`

```
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Sankofa Hub
VITE_APP_VERSION=2.0.0
VITE_CHAT_REDIRECT_THRESHOLD=6
```

---

## 9. RUNNING THE PROJECT

```bash
# Terminal 1: Backend
uv run uvicorn main:app --reload --port 8000

# Terminal 2: Frontend
cd client && npm install && npm run dev

# Open: http://localhost:5173
# API docs: http://localhost:8000/docs
```

### First-Time Setup

1. Register a user at `/auth`
2. If your email matches `ADMIN_EMAIL` in `.env`, you get admin role
3. Login → navigate to `/admin` to manage users
4. Chat at `/ai` or via the floating widget on the homepage

### Database Migration (PostgreSQL only)

```bash
# Generate migration
uv run alembic revision --autogenerate -m "description"

# Apply migration
uv run alembic upgrade head

# Check current version
uv run alembic current
```

---

## 10. API ENDPOINTS REFERENCE

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | Health message |
| GET | `/health` | No | Bot status |
| POST | `/chat` | No | Send message (RAG-enhanced) |
| POST | `/auth/register` | No | Register user |
| POST | `/auth/login` | No | Login → JWT token |
| GET | `/auth/me` | Yes | Current user profile |
| GET | `/history/conversations` | Yes | List user's conversations |
| GET | `/history/conversations/{id}` | Yes | Conversation with messages |
| POST | `/history/conversations` | Yes | Create empty conversation |
| GET | `/history/conversations/{id}/messages` | Yes | Get messages only |
| GET | `/admin/stats` | Admin | Dashboard statistics |
| GET | `/admin/users` | Admin | Paginated user list (with search) |
| GET | `/admin/users/{id}` | Admin | Single user details |
| PUT | `/admin/users/{id}` | Admin | Update user name/email |
| DELETE | `/admin/users/{id}` | Admin | Delete user |
| PATCH | `/admin/users/{id}?action=` | Admin | toggle-active / promote-admin / demote-user |
| GET | `/admin/conversations` | Admin | All conversations |
| GET | `/admin/audit-logs` | Admin | Audit trail |
| GET | `/session/{user_id}` | No | Debug session |
| DELETE | `/session/{user_id}` | No | Clear session |
