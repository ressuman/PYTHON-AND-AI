# Sankofa Hub — Frontend Client

Culturally rich web application for the Sankofa Hub knowledge platform (Culture, Tourism, Language) with an embedded multi-bot chat system.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4 + shadcn/ui
- Framer Motion (Aceternity-style animations)
- Zustand (chat state)
- TanStack Query + Axios (API)
- shadcn/ui ThemeProvider + ModeToggle (light / dark / system)

## Prerequisites

- Node.js 18+
- FastAPI backend running at `http://localhost:8000`

## Setup

```bash
cd client
npm install
cp .env.example .env   # if .env is missing
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | FastAPI backend URL | `http://localhost:8000` |
| `VITE_APP_NAME` | Application name | `Sankofa Hub` |
| `VITE_APP_VERSION` | Version string | `1.0.0` |

## Backend Connection

Ensure the FastAPI server is running:

```bash
# From sankofa-hub root
uv run uvicorn main:app --reload --port 8000
```

Test health: [http://localhost:8000/health](http://localhost:8000/health)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (port 5173) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Folder Structure

```
src/
├── api/           # Axios client + chatbot endpoints
├── components/
│   ├── ui/        # shadcn components
│   ├── layout/    # Navbar, Footer, PageWrapper
│   ├── chat/      # Floating chat widget
│   ├── sections/  # Landing page sections
│   └── common/    # Theme, Adinkra, utilities
├── hooks/         # useChat, useHealthCheck, etc.
├── stores/        # Zustand chat store
├── pages/         # Home page
├── lib/           # constants, animations, utils
└── types/         # TypeScript types
```

## Chat Bots

| Bot | Domain |
|-----|--------|
| Nana Kwame | General (routing) |
| Maame Yaa | Tourism |
| Osei Tutu | Culture |
| Obaa Sarpongmaa | Language |

The chat panel auto-opens 2 seconds after first visit. Use sector cards or navbar CTA to open chat on a specific bot.

## Design

**Adinkra Digital** — warm parchment tones, kente gold accents, Playfair Display + DM Sans typography, light/dark themes.
