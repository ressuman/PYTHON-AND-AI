# Book Keeping

Agentic bookkeeping assistant — AI-powered income tracking, expense management, and receipt parsing.

Track what you earn and what you spend, upload receipts for automatic parsing, chat with an AI agent to log transactions naturally, and generate printable summary reports.

## Requirements

- **Node.js** >= 24.0.0 (enforced via `package.json` `engines` and `.npmrc` `engine-strict`)
- **npm** >= 10.0.0

Use `nvm` to switch: `nvm use` (reads `.nvmrc`).

## Setup

```bash
nvm use
npm install
cp .env.example .env   # edit with your credentials
npx prisma migrate dev  # apply schema to your database
npx prisma db seed      # optional: seed with sample categories
npm run dev
```

## Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Neon or any Postgres provider) |
| `APP_API_KEY` | Single-user API key. Leave unset for dev access. |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI features (free at openrouter.ai/keys) |
| `OPENROUTER_MODEL` | Model override (default: `openai/gpt-4o-mini`) |
| `OPENROUTER_BASE_URL` | Base URL override (default: `https://openrouter.ai/api/v1`) |
| `AGENT_TIMEOUT_MS` | Agent timeout in ms (default: 30000) |

See `.env.example` for placeholders.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run Next.js lint |
| `npm run typecheck` | TypeScript type check (no emit) |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:generate` | Regenerate Prisma client |

## Architecture

```
├── agent/              # Agent runtime config and wiring
├── app/
│   ├── api/            # Next.js Route Handlers (backend)
│   │   ├── income/     # CRUD for income
│   │   ├── expenses/   # CRUD for expenses
│   │   ├── categories/ # CRUD for categories
│   │   ├── receipts/   # Upload & list receipts
│   │   ├── sessions/   # Session management
│   │   ├── chat/       # Conversational AI endpoint
│   │   └── health/     # System health check
│   ├── components/     # UI components (shadcn/ui + Recharts)
│   ├── income/         # Income page
│   ├── expenses/       # Expense pages
│   ├── categories/     # Category management
│   ├── receipts/       # Receipt upload & detail
│   ├── reports/        # Summary reports with date filtering
│   ├── chat/           # Conversational AI interface
│   └── lib/            # Utilities (db, auth, validation, rate-limit, agent)
├── prisma/             # Schema and migrations
├── skills/             # Agent skill definitions
│   └── bookkeeping/    # Bookkeeping skill (SKILL.md)
├── memory/             # Agent memory fixtures (dev only)
└── sessions/           # Session fixtures (dev only)
```

### Key Decisions

- **Next.js App Router only** — no standalone Express server. API routes via Route Handlers.
- **Prisma** over Drizzle — schema-first approach suits financial data; mature migrations; Neon support.
- **OpenRouter AI** (not OpenAI) — free tier models via OpenRouter API. OpenAI SDK used with custom base URL.
- **Single-user** — gated by `APP_API_KEY`. Multi-user can be layered on later.
- **Postgres memory** — agent state in `AgentMemory` and `Session` tables, not flat JSON files.
- **Recharts** for dashboard visualizations (income vs expense bar chart, category donut chart).

## Security

- All credentials via environment variables only.
- `.env` is gitignored; `.env.example` committed with placeholders.
- Input validation via Zod at every API boundary.
- File uploads: MIME type allowlist, size limits, server-side re-validation.
- Rate limiting on all DB-touching routes (in-memory, per IP).
- Structured error responses — no stack traces or internals leaked.

## Agent / Skill System

The `pi-coding-agent` runtime is configured in `agent/config.ts`. Skills live under `skills/` and are loaded by name. The `bookkeeping` skill provides income management, expense management, receipt handling, report generation, and anomaly detection capabilities.

The actual AI runtime uses the `openai` SDK pointed at OpenRouter's API. The agent module lives in `app/lib/agent/index.ts` with two main functions:
- `parseReceipt(ocrText)` — Extracts structured data from receipt OCR text
- `processConversation(message, history, categories)` — Handles natural language income/expense entry

## Pages

| Route | Description |
|---|---|
| `/` | Dashboard — 5 stat cards, income vs expense chart, category breakdown, recent expenses |
| `/income` | Income list and add form |
| `/expenses` | Expense list and management |
| `/categories` | Category management |
| `/receipts` | Receipt upload and list |
| `/receipts/[id]` | Receipt detail with print support |
| `/reports` | Summary reports with date range filter and print |
| `/chat` | Conversational AI (Ledger) for natural language entry |
| `/settings` | System configuration and health status |
