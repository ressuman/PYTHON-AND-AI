# Sankofa Hub V2

A multi-agent AI chat system focused on Ghana and West Africa across three specialist domains: **Culture**, **Tourism**, and **Language**. Powered by four specialist LLM bots with RAG-enhanced responses, persistent conversations, JWT authentication, and a full admin dashboard.

> **Sankofa** (Akan: *"go back and fetch it"*) — the wisdom of learning from the past to build the future.

---

## What's New in V2

- **PostgreSQL Database** — Neon cloud hosting (or SQLite for dev) with SQLAlchemy async + Alembic migrations
- **JWT Authentication** — Register, login, protected routes, role-based access (user/admin)
- **RAG Pipeline** — ChromaDB vector store + SentenceTransformer embeddings for tourism & language knowledge
- **Persistent Conversations** — Chat history saved to database, resumable conversations
- **Admin Dashboard** — Full CRUD user management (search, edit, delete, promote/demote), stats, audit logs
- **Full-Page AI Chat** — Dedicated chat page with sidebar history, conversation switching
- **Bot-Specific Styling** — Each bot has distinct colors, avatars, and message bubble styling
- **Guest Question Limit** — 6 free questions for unauthenticated users, with sign-in nudge
- **Rich RAG Responses** — Tourism & Language bots include quizzes and mermaid diagrams
- **Production Frontend** — React 19 + TypeScript + shadcn/ui + Zustand + TanStack Query

---

## Architecture

```
User types a question
        │
        ▼
  ┌─────────────────────────────────────┐
  │       Single Chat Window (UI)       │
  └────────────┬────────────────────────┘
               │ POST /chat { message, user_id, conversation_id? }
               ▼
  ┌─────────────────────────────────────┐
  │     Nana Kwame (General / Router)   │
  │  Analyses EVERY message first       │
  │  Decides ownership (invisible)      │
  └──────┬──────────┬──────────┬────────┘
         │          │          │
   ROUTE: tourism   │    ROUTE: language
         │    ROUTE: culture    │
         ▼          │          ▼
  ┌──────────┐      │   ┌──────────────┐
  │ Maame Yaa│      │   │Obaa Sarpongmaa│
  │ Tourism  │      │   │  Language     │
  │ + RAG    │      │   │  + RAG       │
  └──────────┘      │   └──────────────┘
                    ▼
           ┌──────────────┐
           │  Osei Tutu   │
           │  Culture     │
           └──────────────┘
```

**RAG Flow (Tourism & Language only):**
1. Nana Kwame routes to specialist
2. System queries ChromaDB with user's question
3. Top 3 relevant knowledge base chunks injected as context
4. Specialist answers with grounded knowledge

---

## Project Structure

```
sankofa_hub_v2/
├── main.py                     # FastAPI app — auth, chat, history endpoints
├── pyproject.toml              # Python deps
├── alembic.ini                 # Alembic config
├── .env                        # Environment variables (not committed)
├── .env.example                # Template
│
├── db/                         # Database layer
│   ├── base.py                 # Engine, session, init_db()
│   ├── models.py               # User, Conversation, Message, AuditLog
│   └── crud.py                 # All CRUD operations
│
├── auth/                       # Authentication
│   ├── schemas.py              # Pydantic models (Register, Login, AuthResponse)
│   ├── service.py              # bcrypt + JWT (python-jose)
│   └── dependencies.py         # get_current_user, require_admin
│
├── bots/                       # Bot system (UNCHANGED from V1)
│   ├── bot_loader.py           # Skill loading, bot registry
│   ├── llm.py                  # OpenRouter LLM abstraction
│   ├── router.py               # ROUTE: parsing, bot resolution
│   └── conversation.py         # Session management, history formatting
│
├── rag/                        # RAG pipeline
│   ├── vector_store.py         # ChromaDB wrapper (cosine similarity)
│   ├── chunker.py              # Text chunking (300 words, 50 overlap)
│   ├── retrieval.py            # SentenceTransformer embeddings + query
│   └── ingestion.py            # Ingests knowledge_base/ → ChromaDB
│
├── admin/                      # Admin dashboard API
│   └── routes.py               # Stats, user CRUD, conversations, audit logs
│
├── skills/                     # Bot system prompts (UNCHANGED from V1)
│   ├── general-nana-kwame_bot/SKILL.md
│   ├── tourism-maame-yaa_bot/SKILL.md
│   ├── culture-osei-tutu_bot/SKILL.md
│   └── language-obaa-sarpongmaa_bot/SKILL.md
│
├── knowledge_base/             # RAG source documents
│   ├── tourism/                # 6 markdown files (accommodation, food, sites, etc.)
│   └── language/               # 7 markdown files (endangered langs, Twi, Ga, etc.)
│
├── alembic/                    # Database migrations
│   ├── env.py
│   └── versions/
│       └── 001_initial_schema.py
│
├── chroma_db/                  # ChromaDB persistent storage (auto-created)
│
├── RECREATION_PROMPT.md        # Complete project recreation guide
├── CHAT_TESTING_GUIDE.md       # Bot testing questionnaire & expected answers
│
└── client/                     # React frontend
    ├── package.json
    ├── vite.config.ts
    └── src/
        ├── App.tsx             # Routes: /, /about, /auth, /ai, /admin
        ├── api/
        │   ├── client.ts       # Axios with auth header injection
        │   ├── chatbot.ts      # /chat, /health, /session APIs
        │   ├── history.ts      # /history/* APIs
        │   └── admin.ts        # /admin/* APIs with full CRUD
        ├── stores/
        │   ├── authStore.ts    # Zustand persist (user, token)
        │   └── chatStore.ts    # Messages, loading state, conversation ID
        ├── hooks/
        │   ├── useChat.ts      # Send message, conversation tracking
        │   ├── useAuth.ts      # Login, register, logout
        │   ├── useHistory.ts   # Conversation list
        │   └── useConversation.ts # Single conversation with messages
        ├── pages/
        │   ├── HomePage.tsx, AboutPage.tsx, SectorsPage.tsx, ...
        │   ├── AuthPage.tsx    # Login/Register tabs
        │   ├── AiChatPage.tsx  # Full-page chat with sidebar
        │   └── AdminPage.tsx   # Dashboard with user management
        └── components/
            ├── chat/           # ChatWidget, ChatPanel, ChatInput, etc.
            ├── auth/           # ProtectedRoute, LoginForm, RegisterForm
            └── layout/         # Navbar, Footer
```

---

## The Four Bots

| Bot | Name | Domain | RAG |
|-----|------|--------|-----|
| **General** | Nana Kwame | Routing, cross-domain, greetings, declines | No |
| **Tourism** | Maame Yaa | Travel, visas, attractions, accommodation, food | **Yes** — tourism_kb collection |
| **Culture** | Osei Tutu | Heritage, symbols, festivals, history, repatriation | No |
| **Language** | Obaa Sarpongmaa | Translation, linguistics, tonal languages, endangerment | **Yes** — language_kb collection |

### RAG Knowledge Base

| Domain | Files | Chunks | Embedding Model | Collection |
|--------|-------|--------|----------------|------------|
| Tourism | 6 markdown files | 40 chunks | all-MiniLM-L6-v2 | `tourism_kb` |
| Language | 7 markdown files | 42 chunks | all-MiniLM-L6-v2 | `language_kb` |

Chunks are 300 words with 50-word overlap. Retrieved via cosine similarity with a score floor of 0.45.

---

## Setup

### Backend

```bash
cd sankofa_hub_v2

# Create .env from template
cp .env.example .env
# Edit .env with your OPENROUTER_API_KEY and DATABASE_URL

# Install dependencies
uv sync

# For PostgreSQL: run migration
uv run alembic upgrade head

# Ingest RAG knowledge base
uv run python -m rag.ingestion

# Start server
uv run uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd client
npm install
npm run dev
```

- Frontend: http://localhost:5173
- API docs: http://localhost:8000/docs

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Bot status |
| POST | `/chat` | No | Send message (RAG-enhanced) |
| POST | `/auth/register` | No | Register user |
| POST | `/auth/login` | No | Login → JWT |
| GET | `/auth/me` | Yes | Current user profile |
| GET | `/history/conversations` | Yes | User's conversations |
| GET | `/history/conversations/{id}` | Yes | Conversation + messages |
| POST | `/history/conversations` | Yes | New conversation |
| GET | `/admin/stats` | Admin | Dashboard stats |
| GET | `/admin/users` | Admin | User list (search, paginate) |
| PUT | `/admin/users/{id}` | Admin | Update user |
| DELETE | `/admin/users/{id}` | Admin | Delete user |
| PATCH | `/admin/users/{id}` | Admin | Toggle active / Promote / Demote |
| GET | `/admin/audit-logs` | Admin | Audit trail |

---

## Testing

See `CHAT_TESTING_GUIDE.md` for a complete testing questionnaire with:
- 34 test questions across all 4 bots
- Expected routing and answering bot for each
- RAG vs non-RAG comparison examples
- Limitations and edge cases
- Step-by-step UI testing instructions

---

## Development

```bash
# Backend
uv run uvicorn main:app --reload --port 8000
uv run ruff check bots/ main.py
uv run mypy bots/ main.py

# Frontend
cd client && npm run dev
npm run build
npm run lint
```

---

## License

MIT
