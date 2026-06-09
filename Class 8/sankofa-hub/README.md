# Sankofa Hub

A multi-agent AI chat system focused on Ghana and West Africa across three specialist domains: **Culture**, **Tourism**, and **Language**. Powered by four specialist LLM bots that operate as a single unified conversational interface.

> **Sankofa** (Akan: *"go back and fetch it"*) — the wisdom of learning from the past to build the future.

## Architecture Overview

```
User types a question
        │
        ▼
  ┌─────────────────────────────────────┐
  │       Single Chat Window (UI)       │
  │  No tabs · No routing indicators    │
  └────────────┬────────────────────────┘
               │ POST /chat { message, user_id }
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
  └──────────┘      │   └──────────────┘
                    ▼
           ┌──────────────┐
           │  Osei Tutu   │
           │  Culture     │
           └──────────────┘
```

**Key principle:** Every message enters through Nana Kwame first. He analyses the question, determines the domain, and silently routes to the appropriate specialist. The user sees one chat window and one intelligent assistant. No tabs, no routing indicators, no "connecting you to..." messages.

---

## Project Structure

```
sankofa-hub/
├── main.py                        # FastAPI app — single /chat endpoint
├── pyproject.toml                 # Python deps (fastapi, httpx, uvicorn)
├── .env                           # OPENROUTER_API_KEY
│
├── bots/
│   ├── router.py                  # Route parsing, bot resolution, display names
│   ├── conversation.py            # Session management, history formatting
│   ├── llm.py                     # OpenRouter LLM abstraction
│   └── bot_loader.py              # Bot configs, skill file loading, model map
│
├── skills/                        # Bot system prompts (loaded at startup)
│   ├── general-nana-kwame_bot/SKILL.md
│   ├── tourism-maame-yaa_bot/SKILL.md
│   ├── culture-osei-tutu_bot/SKILL.md
│   └── language-obaa-sarpongmaa_bot/SKILL.md
│
└── client/                        # React + Vite + shadcn/ui frontend
    ├── package.json
    ├── vite.config.ts
    ├── src/
    │   ├── App.tsx                # Router + layout + chat widget
    │   ├── types/index.ts         # Shared TypeScript types
    │   ├── stores/chatStore.ts    # Zustand state (messages, loadingState)
    │   ├── hooks/
    │   │   ├── useChat.ts         # Core chat hook — send, loading states
    │   │   ├── useSessionId.ts    # Session ID from localStorage
    │   │   └── useHealthCheck.ts  # Backend health polling
    │   ├── api/
    │   │   ├── client.ts          # Axios instance
    │   │   ├── chatbot.ts         # API functions
    │   │   └── types.ts           # Re-exported types
    │   ├── components/
    │   │   ├── chat/
    │   │   │   ├── ChatPanel.tsx      # Main chat window
    │   │   │   ├── ChatHeader.tsx      # Fixed header
    │   │   │   ├── ChatMessage.tsx     # Message bubble (user + bot)
    │   │   │   ├── ChatInput.tsx       # Text input + send
    │   │   │   ├── ChatWidget.tsx      # Widget wrapper (bubble/panel)
    │   │   │   ├── ChatBubble.tsx      # FAB button (closed state)
    │   │   │   ├── BotAvatar.tsx       # Per-bot avatar component
    │   │   │   ├── ThinkingIndicator.tsx  # "Thinking..." loading
    │   │   │   └── TypingIndicator.tsx    # "[Bot] is typing..." loading
    │   │   └── ...
    │   ├── pages/
    │   │   ├── HomePage.tsx
    │   │   ├── AboutPage.tsx
    │   │   ├── SectorsPage.tsx
    │   │   ├── FeaturesPage.tsx
    │   │   └── ContactPage.tsx
    │   └── lib/
    │       ├── constants.ts        # Bot configs, site content
    │       └── utils.ts            # cn(), formatTime(), sanitizeInput()
    └── ...
```

---

## The Four Bots

| Bot | Name | Skill ID | Domain | Accent |
|-----|------|----------|--------|--------|
| **General** | Nana Kwame | `general-nana-kwame_bot` | Routing, cross-domain, off-topic declines | `#C8920A` Gold |
| **Tourism** | Maame Yaa | `tourism-maame-yaa_bot` | Travel logistics, visas, attractions, eco-tourism | `#2D6A4F` Green |
| **Culture** | Osei Tutu | `culture-osei-tutu_bot` | Heritage, symbols, festivals, colonial history, repatriation | `#8B1A1A` Red |
| **Language** | Obaa Sarpongmaa | `language-obaa-sarpongmaa_bot` | Translation, linguistics, tonal languages, sociolinguistics | `#2C2D6B` Indigo |

### Domain Boundaries

Each bot has a strict domain with nuanced border cases:

- **Intent and context** determine ownership, not keywords. *"What languages are spoken in Cape Verde and will English be enough for tourists?"* → **Maame Yaa** (the purpose is travel practicality, not linguistics)
- **Substance** determines ownership, not framing. *"What cultural customs should a tourist respect at a Ghanaian funeral?"* → **Osei Tutu** (the substance is cultural knowledge, despite the tourist framing)
- **Explicit framing** can override default ownership. *"What is the cultural and historical significance of the Sankofa symbol beyond its linguistic meaning?"* → **Osei Tutu** (user explicitly frames it as cultural)

---

## Backend Setup

### Prerequisites

- Python 3.11+
- `uv` package manager (recommended) or `pip`
- OpenRouter API key

### Installation

```bash
# Clone and enter the project
cd sankofa-hub

# Create .env file
echo "OPENROUTER_API_KEY=sk-or-v1-your-key-here" > .env

# Install dependencies
uv sync

# Start the server
uv run uvicorn main:app --reload --port 8000
```

The server starts at `http://localhost:8000`. Swagger UI is available at `http://localhost:8000/docs` for testing the `/chat` endpoint directly.

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENROUTER_API_KEY` | Yes | — | OpenRouter API key |
| `OPENROUTER_BASE_URL` | No | `https://openrouter.ai/api/v1` | OpenRouter base URL |

### API Endpoints

#### `POST /chat`

The single chat endpoint. Every message goes through Nana Kwame for routing.

**Request:**
```json
{
  "message": "What are the visa requirements for Ghana?",
  "user_id": "abc-123"
}
```

**Response:**
```json
{
  "reply": "The visa requirements for visiting Ghana depend on your nationality...",
  "bot_name": "Maame Yaa",
  "bot_id": "tourism-maame-yaa_bot",
  "route_taken": "tourism"
}
```

**Routing flow:**
1. Message enters → Nana Kwame analyses it
2. If `ROUTE: tourism/culture/language` → silently forward to that specialist
3. If `ROUTE: general` → Nana Kwame answers
4. If `ROUTE: decline` → Nana Kwame declines politely
5. Final answer returned with correct `bot_name` and `bot_id`

#### `GET /health`

```json
{ "status": "ok", "bots": ["culture-osei-tutu_bot", ...] }
```

#### `GET /session/{user_id}`

Returns conversation history for debugging.

#### `DELETE /session/{user_id}`

Clears a session.

### LLM Models

Each bot uses a specific model:

| Bot | Primary Model | Fallback |
|-----|--------------|----------|
| Nana Kwame | `anthropic/claude-3.5-haiku` | `anthropic/claude-3-haiku` |
| Maame Yaa | `anthropic/claude-3.5-sonnet` | `anthropic/claude-3-haiku` |
| Osei Tutu | `anthropic/claude-3.5-sonnet` | `anthropic/claude-3-haiku` |
| Obaa Sarpongmaa | `anthropic/claude-3.5-sonnet` | `anthropic/claude-3-haiku` |

Nana Kwame uses a fast model (Haiku) for quick routing decisions. Specialists use a deeper model (Sonnet) for rich, detailed answers.

### Bot System Prompts

Each bot's system prompt is defined in `skills/<skill_id>/SKILL.md`. These files contain:
- **Frontmatter** (`name`, `description`) — loaded by `bot_loader.py`
- **System prompt body** — sent to the LLM as the system message

To modify a bot's behaviour, edit its SKILL.md. The system prompt includes domain definitions, routing rules (for Nana Kwame), answer style guidelines, and accuracy instructions.

---

## Frontend Setup

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
cd client
npm install
npm run dev
```

The dev server starts at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

Output goes to `client/dist/`.

### Key Dependencies

| Library | Purpose |
|---------|---------|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite 6 | Build tool |
| shadcn/ui | UI components (radix-based) |
| Tailwind CSS v4 | Styling |
| Zustand | State management |
| TanStack React Query | Server state |
| Framer Motion | Animations |
| React Router DOM | Page routing |
| Axios | HTTP client |
| date-fns | Date formatting |

### Chat State Machine

The chat UI progresses through four states:

```
idle → thinking → typing{botName, botId} → idle
                    ↓
                  error → idle (after 3s)
```

- **idle**: Chat is ready for input
- **thinking**: Message sent, waiting for backend response
- **typing**: Response received, showing bot avatar + "is typing..." animation
- **error**: Something went wrong, showing error message for 3 seconds

---

## Conversation Flow (End-to-End)

### Example: User asks "What are the visa requirements for Ghana?"

```
User sends: "What are the visa requirements for Ghana?"
        │
        ▼
Frontend: POST /chat { message, user_id }
        │
        ▼
Backend: Nana Kwame's LLM receives:
  System: (Nana Kwame's system prompt)
  History: [...]
  User: "What are the visa requirements for Ghana?"
        │
        ▼
Nana Kwame responds:
  "Based on the specific nature of your question about travel documentation,
   this is best handled by our Tourism specialist.
   ROUTE: tourism"
        │
        ▼
Backend router.py parses: route="tourism", explicit=true
        │
        ▼
Backend forwards ORIGINAL message to Maame Yaa:
  System: (Maame Yaa's system prompt)
  History: [...]
  User: "What are the visa requirements for Ghana?"
        │
        ▼
Maame Yaa responds:
  "The visa requirements for visiting Ghana depend on your nationality...
   Visa on arrival is available for citizens of ECOWAS countries...
   ROUTE: tourism"
        │
        ▼
Backend strips ROUTE line, appends to session history:
  { role: "user", content: "What are the visa requirements...", bot_id: "user" },
  { role: "assistant", content: "The visa requirements...", bot_id: "tourism-maame-yaa_bot" }
        │
        ▼
Backend returns:
  { reply: "The visa requirements...", bot_name: "Maame Yaa",
    bot_id: "tourism-maame-yaa_bot", route_taken: "tourism" }
        │
        ▼
Frontend shows:
  "Thinking..." → "Maame Yaa is typing..." → "Maame Yaa: The visa requirements..."
```

The user never sees Nana Kwame's routing analysis, never sees a `ROUTE:` directive, never has to switch tabs, and never repeats their question.

---

## Test Matrix

The following 34 test cases define expected behaviour. Run them via Swagger UI at `http://localhost:8000/docs` before testing the frontend.

### Nana Kwame Tests (7)

| # | Input | Expected Answering Bot |
|---|-------|----------------------|
| 1 | "How does language shape cultural identity in tourism destinations?" | Nana Kwame (cross-domain) |
| 2 | "What are the visa requirements to visit Ghana?" | Maame Yaa |
| 3 | "Tell me about the significance of Adinkra symbols in Ghanaian culture." | Osei Tutu |
| 4 | "What is the difference between Asante Twi and Akuapem Twi?" | Obaa Sarpongmaa |
| 5 | "What is the best diet for losing weight fast?" | Nana Kwame (decline) |
| 6 | "Who won the Champions League last night?" | Nana Kwame (decline) |
| 7 | "Hello, what can you help me with?" | Nana Kwame |

### Maame Yaa Tests (8)

| # | Input | Expected Answering Bot |
|---|-------|----------------------|
| 1 | "What are the top 5 tourist attractions in Ghana I should not miss?" | Maame Yaa |
| 2 | "Do Nigerians need a visa to enter Ghana, and how long does the process take?" | Maame Yaa |
| 3 | "What is eco-tourism and how is it being practised in West Africa?" | Maame Yaa |
| 4 | "What languages are spoken in Cape Verde, and will English be enough for tourists?" | Maame Yaa |
| 5 | "I want to learn how to translate documents from French to English professionally." | Obaa Sarpongmaa |
| 6 | "What is the history and cultural meaning of the Homowo festival?" | Osei Tutu |
| 7 | "Can you help me write a Python script to scrape hotel prices?" | Nana Kwame (decline) |
| 8 | "What is food tourism and what Ghanaian dishes should a first-time visitor try?" | Maame Yaa |

### Osei Tutu Tests (9)

| # | Input | Expected Answering Bot |
|---|-------|----------------------|
| 1 | "What is the cultural significance of Kente cloth in Akan society?" | Osei Tutu |
| 2 | "What criteria does UNESCO use to designate a World Heritage Site?" | Osei Tutu |
| 3 | "What are some traditional initiation rites practised in Ghana?" | Osei Tutu |
| 4 | "Why are there ongoing debates about returning African artefacts from European museums?" | Osei Tutu |
| 5 | "What cultural customs should a foreign tourist respect at a Ghanaian funeral?" | Osei Tutu |
| 6 | "How do I book a guided tour of Elmina Castle? What are the hours and prices?" | Maame Yaa |
| 7 | "How do the grammatical structures of Twi and Ga compare linguistically?" | Obaa Sarpongmaa |
| 8 | "What are the best stocks to invest in right now?" | Nana Kwame (decline) |
| 9 | "Was colonialism beneficial to African cultural development?" | Osei Tutu |

### Obaa Sarpongmaa Tests (10)

| # | Input | Expected Answering Bot |
|---|-------|----------------------|
| 1 | "Please translate this phrase into Twi: 'Welcome to our cultural festival...'" | Obaa Sarpongmaa |
| 2 | "What makes Akan a tonal language, and how does tone change meaning in Twi?" | Obaa Sarpongmaa |
| 3 | "How many Ghanaian languages are considered endangered?" | Obaa Sarpongmaa |
| 4 | "Why do most AI translation tools perform poorly on African languages?" | Obaa Sarpongmaa |
| 5 | "Is Pidgin English a 'real' language or just broken English?" | Obaa Sarpongmaa |
| 6 | "Is Ghanaian Sign Language (GhSL) a fully developed language?" | Obaa Sarpongmaa |
| 7 | "I'm planning a trip to Accra next month. What are the best affordable hotels near the airport?" | Maame Yaa |
| 8 | "What is the cultural and historical significance of the Sankofa symbol beyond its linguistic meaning?" | Osei Tutu |
| 9 | "Can you recommend a good workout routine for building muscle?" | Nana Kwame (decline) |
| 10 | "How does code-switching between English and Twi reflect social identity in urban Ghana?" | Obaa Sarpongmaa |

---

## Development

### Backend

```bash
# Run with hot reload
uv run uvicorn main:app --reload --port 8000

# Type check
uv run mypy bots/ main.py

# Lint
uv run ruff check bots/ main.py
```

### Frontend

```bash
# Run dev server
npm run dev

# Type check + build
npm run build

# Lint
npm run lint
```

### Architecture Decisions

- **Why no tabs?** Production multi-agent systems (Intercom, AWS Bedrock Agents) use a single chat window with invisible backend routing. The user sees one assistant, not four chatbots. This is the industry standard pattern.
- **Why Nana Kwame first?** Every message needs domain classification before it can be answered. Rather than having the frontend guess which bot to call, the router bot (Nana Kwame) handles classification as the single entry point. This keeps routing logic in the backend where it belongs.
- **Why `was_explicitly_routed` flag?** A bot response that defaults to `"general"` (no `ROUTE:` directive present) must NOT trigger forwarding. Only an explicitly written `ROUTE: tourism/culture/language` should forward. This prevents false routing when a bot simply doesn't include a routing directive.
- **Why strip the routing exchange from history?** The routing message ("This belongs to X...") is infrastructure noise. Only the specialist's actual answer should appear in conversation history for follow-up context.
- **Why per-bot models?** Nana Kwame needs fast, cheap inference (Haiku) because every message passes through him. Specialists need deeper, more expensive inference (Sonnet) because they generate the final answer the user sees.

---

## License

MIT
