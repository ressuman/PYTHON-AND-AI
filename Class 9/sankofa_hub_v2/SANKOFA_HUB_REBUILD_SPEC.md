# SANKOFA HUB — COMPLETE REBUILD SPECIFICATION

> **Generated:** 2026-07-02  
> **Method:** Full codebase audit (code is source of truth; docs reconciled against code)  
> **Purpose:** Enable any AI coding tool to rebuild an exact duplicate in a new folder

---

## 1. PROJECT OVERVIEW

Sankofa Hub is a multi-agent AI chat system focused on Ghana and West Africa across three specialist domains: **Culture**, **Tourism**, and **Language**. It consists of:

- A **Python/FastAPI backend** that orchestrates 4 LLM-powered chatbots via OpenRouter
- A **React + Vite + TypeScript frontend** with a content-rich marketing website and a floating chat widget

**"Sankofa"** (Akan: *"go back and fetch it"*) — the philosophy of learning from the past to build the future.

**Key architectural principle:** Every message enters through a single router bot (Nana Kwame) who analyses it and silently routes to the appropriate specialist. The user sees one chat window, one conversation — no tabs, no routing indicators, no handoff messages. The routing is entirely invisible backend logic.

---

## 2. TECH STACK SUMMARY

### Backend (Python)
| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Python | >=3.11 (uses 3.14 locally) |
| Web framework | FastAPI | >=0.115.0 |
| ASGI server | Uvicorn | >=0.32.0 |
| HTTP client | httpx | >=0.27.0 |
| Env management | python-dotenv | >=1.0.0 |
| Package manager | uv (recommended) | Latest |
| Linter | Ruff | >=0.7.0 |
| Type checker | mypy | >=1.10.0 |
| LLM provider | OpenRouter | External API |

### Frontend (React/TypeScript)
| Component | Technology | Version |
|-----------|-----------|---------|
| Build tool | Vite | ^6.3.5 |
| UI framework | React | ^19.1.0 |
| Language | TypeScript | ~5.8.3 |
| Styling | Tailwind CSS | ^4.1.8 |
| UI components | shadcn/ui (Radix-based, New York style) | — |
| Animations | Framer Motion | ^12.16.0 |
| State management | Zustand | ^5.0.5 |
| Server state | TanStack React Query | ^5.80.6 |
| HTTP client | Axios | ^1.9.0 |
| Routing | React Router DOM | ^7.16.0 |
| Icons | Lucide React | ^0.513.0 |
| Date formatting | date-fns | ^4.1.0 |
| UUID generation | uuid | ^11.1.0 |
| Form handling | react-hook-form + zod | ^7.57.0 / ^3.25.51 |
| CSS utility | clsx + tailwind-merge | ^2.1.1 / ^3.3.0 |
| CVA | class-variance-authority | ^0.7.1 |

### Hosting / Deploy
- No Dockerfile, vercel.json, render.yaml, or deployment config found
- Assumed manual deployment (FastAPI on a VPS or PaaS; Vite build served separately)
- **Unknown:** Actual deployment target

### Database
- **None.** Sessions are stored in-memory (`active_sessions: dict[str, Session]`) on the server. No database, no persistence across server restarts.

---

## 3. FULL FILE/FOLDER STRUCTURE (annotated)

```
sankofa-hub/
│
├── main.py                         # FastAPI entry point — routes, CORS, lifespan
├── pyproject.toml                  # Python deps (fastapi, httpx, uvicorn, python-dotenv)
├── uv.lock                         # uv lockfile
├── .env                            # LIVE env vars (gitignored)
├── .env.example                    # Template env vars
├── .gitignore
├── .python-version                 # 3.14
├── README.md                       # Root readme — OUTDATED vs code (see §9)
│
├── bots/                           # Backend chatbot logic
│   ├── __init__.py                 # Empty
│   ├── bot_loader.py               # Bot registration, skill file loading, model config
│   ├── router.py                   # Route parsing, bot resolution, display names
│   ├── conversation.py             # Session dataclass, history management
│   └── llm.py                      # OpenRouter API abstraction (httpx)
│
├── skills/                         # ACTIVE system prompts (loaded at startup)
│   ├── general-nana-kwame_bot/
│   │   └── SKILL.md               # Nana Kwame's system prompt (router)
│   ├── tourism-maame-yaa_bot/
│   │   └── SKILL.md               # Maame Yaa's system prompt
│   ├── culture-osei-tutu_bot/
│   │   └── SKILL.md               # Osei Tutu's system prompt
│   └── language-obaa-sarpongmaa_bot/
│       └── SKILL.md               # Obaa Sarpongmaa's system prompt
│
├── Skills_md/                      # OLDER system prompts (NOT loaded by code) — see §9
│   ├── 01_general_bot_system_prompt.md
│   ├── 02_tourism_bot_system_prompt.md
│   ├── 03_culture_bot_system_prompt.md
│   ├── 04_language_bot_system_prompt.md
│   └── Culture/
│       └── SKILL.md
│   └── General/
│       └── SKILL.md
│   └── Language/
│       └── SKILL.md
│   └── Tourism/
│       └── SKILL.md
│
└── client/                         # Frontend (Vite + React + TypeScript)
    ├── .env                        # VITE_API_BASE_URL=http://localhost:8000
    ├── .env.example                # Template
    ├── package.json
    ├── package-lock.json
    ├── components.json             # shadcn/ui config
    ├── eslint.config.js
    ├── index.html                  # Root HTML — Google Fonts, viewport, meta
    ├── vite.config.ts              # Vite config with @tailwindcss/vite plugin
    ├── tailwind.config.ts          # Tailwind theme — colors, fonts, keyframes
    ├── tsconfig.json               # References tsconfig.app.json + tsconfig.node.json
    ├── tsconfig.app.json           # App TS config with @/* path alias
    ├── tsconfig.node.json          # Node TS config
    ├── README.md                   # Client readme
    ├── public/
    │   └── sankofa.svg             # Favicon / logo SVG
    ├── instruction_manual/
    │   └── SANKOFA_HUB_FRONTEND_SYSTEM_PROMPT.md  # OUTDATED frontend gen prompt — see §9
    │
    └── src/
        ├── main.tsx                # Entry: renders <App> inside <ErrorBoundary>
        ├── App.tsx                 # Root: BrowserRouter + QueryClient + ThemeProvider + layout
        ├── index.css               # Tailwind layers, CSS vars (light + dark), scrollbar, selection
        ├── vite-env.d.ts           # Vite env type declarations
        │
        ├── api/
        │   ├── client.ts           # Axios instance (30s timeout, request/response interceptors)
        │   ├── chatbot.ts          # chatApi object: sendMessage, getSession, clearSession, checkHealth
        │   └── types.ts            # Re-exports all types from @/types
        │
        ├── types/
        │   └── index.ts            # BotId, LoadingState, BotConfig, Message, ChatRequest, ChatResponse, etc.
        │
        ├── lib/
        │   ├── constants.ts        # BOT_CONFIGS, NAV_LINKS, SITE_STATS, SECTORS, FEATURES, etc.
        │   ├── utils.ts            # cn(), formatTime(), truncate(), sanitizeInput()
        │   └── animations.ts       # framer-motion variants (fadeUp, staggerContainer, slideUp, chatPanelVariants)
        │
        ├── stores/
        │   └── chatStore.ts        # Zustand store (persisted): isOpen, messages, loadingState, hasOpenedBefore, isMinimized
        │
        ├── hooks/
        │   ├── useChat.ts          # Core chat hook — sendMessage, resetChat, debounce, loading states
        │   ├── useSessionId.ts     # UUID session ID from localStorage
        │   ├── useHealthCheck.ts   # Backend health polling (every 60s)
        │   ├── useLocalStorage.ts  # Generic typed localStorage hook
        │   └── useScrollAnimation.ts  # IntersectionObserver-based scroll reveal
        │
        ├── components/
        │   ├── theme-provider.tsx   # Custom ThemeProvider (light/dark/system) with context
        │   ├── mode-toggle.tsx      # Sun/Moon dropdown toggle (DropdownMenu)
        │   │
        │   ├── ui/                  # shadcn/ui generated components
        │   │   ├── button.tsx
        │   │   ├── card.tsx
        │   │   ├── badge.tsx
        │   │   ├── scroll-area.tsx
        │   │   ├── tabs.tsx
        │   │   ├── dropdown-menu.tsx
        │   │   ├── separator.tsx
        │   │   ├── tooltip.tsx
        │   │   └── sheet.tsx
        │   │
        │   ├── layout/
        │   │   ├── Navbar.tsx       # Sticky header, logo, nav links, theme toggle, "Talk to Bots" CTA
        │   │   ├── Footer.tsx       # Rich footer: links, socials, contact, theme toggle, copyright
        │   │   └── PageWrapper.tsx  # Max-w-7xl centered container section wrapper
        │   │
        │   ├── chat/
        │   │   ├── ChatWidget.tsx   # Fixed bottom-right container, auto-opens after 2s on first visit
        │   │   ├── ChatPanel.tsx    # Chat panel (w-[380px] h-[560px] / full-screen mobile), message list, indicators, input
        │   │   ├── ChatBubble.tsx   # FAB button when chat closed, unread count badge, hover expansion
        │   │   ├── ChatHeader.tsx   # "Sankofa Hub" header, reset/minimize/close buttons
        │   │   ├── ChatMessage.tsx  # Message bubble (user=gold right / bot=card left with colored border), bold markdown
        │   │   ├── ChatInput.tsx    # Textarea + send button, Enter to send, Shift+Enter newline, safe-area-inset-bottom
        │   │   ├── BotAvatar.tsx    # Circular colored avatar with initials, optional status dot
        │   │   ├── ThinkingIndicator.tsx  # Three bouncing dots + "Thinking..."
        │   │   └── TypingIndicator.tsx    # BotAvatar + colored dots + "[Name] is typing..."
        │   │
        │   ├── sections/
        │   │   ├── HeroSection.tsx    # Full-viewport hero — (NOT USED in current App.tsx)
        │   │   ├── AboutSection.tsx   # About section — (NOT USED in current App.tsx)
        │   │   ├── SectorsSection.tsx # Sector cards — (NOT USED in current App.tsx)
        │   │   ├── FeaturesSection.tsx # Features grid — (NOT USED in current App.tsx)
        │   │   ├── StatsSection.tsx  # Animated stats bar — (NOT USED in current App.tsx)
        │   │   ├── TestimonialsSection.tsx # Testimonial cards — (NOT USED in current App.tsx)
        │   │   └── CTASection.tsx    # Call-to-action section — (NOT USED in current App.tsx)
        │   │
        │   └── common/
        │       ├── AdinkraPattern.tsx   # SVG Adinkra symbols (sankofa, gye-nyame, adinkrahene, dwennimmen)
        │       ├── SankofaLogo      # Exported from AdinkraPattern.tsx — SVG bird logo
        │       ├── AnimatedCounter.tsx  # Scroll-triggered number count-up with easing
        │       ├── ChatSkeleton.tsx  # Skeleton loader for chat
        │       ├── ErrorBoundary.tsx  # React class error boundary with reload button
        │       ├── ScrollProgress.tsx  # Top-of-page reading progress bar (gold, 0.5px)
        │       └── SectionHeading.tsx  # Reusable h2 + subtitle + gold underline divider
        │
        └── pages/
            ├── HomePage.tsx          # Assembles Hero + Stats + Ghana highlights + Sectors preview + Features + Global reach
            ├── AboutPage.tsx         # Sankofa philosophy, Ghana roots, mission/values, timeline, CTA
            ├── SectorsPage.tsx       # Tabs (Culture/Tourism/Language) with detail, bot links
            ├── FeaturesPage.tsx      # Feature cards grid, tech stack, how-it-works steps, CTA
            └── ContactPage.tsx       # Contact info, form, FAQ accordion
```

---

## 4. DESIGN SYSTEM & UI SPEC

### 4.1 Design Philosophy
**"Adinkra Digital"** — Traditional Ghanaian Adinkra symbolism fused with premium modern digital design. Warmth of kente textile geometry expressed through clean Swiss-grid layouts, bold editorial typography, purposeful negative space.

### 4.2 Colors

#### Light Theme
```
--background:           hsl(40, 33%, 98%)   #FAFAF7  (warm off-white, like aged parchment)
--foreground:           hsl(30, 33%, 7%)    #1A1409  (deep warm black)
--card:                 hsl(0, 0%, 100%)    #FFFFFF
--card-foreground:      hsl(30, 33%, 7%)    #1A1409
--primary:              hsl(38, 65%, 47%)   #C8922A  (Kente gold)
--primary-foreground:   hsl(0, 0%, 100%)    #FFFFFF
--secondary:            hsl(40, 20%, 92%)   #F0EDE6  (warm light surface)
--secondary-foreground: hsl(30, 20%, 30%)   #5C5242  (warm brown-grey)
--muted:                hsl(40, 15%, 90%)   #F0EDE6
--muted-foreground:     hsl(30, 15%, 40%)   #5C5242
--accent:               hsl(40, 20%, 92%)   #F0EDE6
--accent-foreground:    hsl(30, 33%, 7%)
--border:               hsl(35, 15%, 83%)   #DDD8CE
--input:                hsl(35, 15%, 83%)
--ring:                 hsl(38, 65%, 47%)   #C8922A
--radius:               0.75rem

Named colors (Tailwind theme):
  --color-gold:         #C8922A
  --color-gold-dark:    #E5A93C
  --color-forest:       #1A6B4A
  --color-forest-dark:  #2D9A6B
  --color-terracotta:   #C05A2C
  --color-terracotta-dark: #D97040
  --color-sankofa-parchment: #FAFAF7
  --color-sankofa-warm: #F0EDE6
  --color-sankofa-deep: #0F0D0A
  --color-sankofa-card: #231F19
```

#### Dark Theme
```
--background:           hsl(30, 20%, 5%)    #0F0D0A  (deep warm black)
--foreground:           hsl(40, 30%, 94%)   #F5F0E8  (warm off-white)
--card:                 hsl(30, 15%, 12%)   #231F19
--card-foreground:      hsl(40, 30%, 94%)   #F5F0E8
--primary:              hsl(38, 70%, 55%)   #E5A93C  (brighter gold)
--primary-foreground:   hsl(30, 20%, 5%)    #0F0D0A
--secondary:            hsl(30, 12%, 18%)   #1C1914
--secondary-foreground: hsl(40, 20%, 80%)   #A89880
--muted:                hsl(30, 12%, 18%)
--muted-foreground:     hsl(35, 15%, 55%)
--accent:               hsl(30, 12%, 18%)
--accent-foreground:    hsl(40, 30%, 94%)
--border:               hsl(30, 12%, 22%)   #352E25
--input:                hsl(30, 12%, 22%)
--ring:                 hsl(38, 70%, 55%)   #E5A93C

Dark named colors:
  --color-gold:         #E5A93C
  --color-forest:       #2D9A6B
  --color-terracotta:   #D97040
```

#### Bot accent colors
| Bot | Light Color | Dark Color | Light BG | Dark BG |
|-----|------------|------------|----------|---------|
| Nana Kwame (general) | `#C8920A` | `#E5A93C` | `#FDF8EE` | `#2A2318` |
| Maame Yaa (tourism) | `#2D6A4F` | `#2D9A6B` | `#F0FAF5` | `#0F2318` |
| Osei Tutu (culture) | `#8B1A1A` | `#D97040` | `#FDF3EE` | `#2A1510` |
| Obaa Sarpongmaa (language) | `#2C2D6B` | `#9B7AC8` | `#F5F0FF` | `#1A1228` |

### 4.3 Typography
| Usage | Font | Weight | Fallback |
|-------|------|--------|----------|
| Headings (h1, h2, h3) | `"Playfair Display"` | 400, 600, 700 | serif |
| Body / UI | `"DM Sans"` | 300, 400, 500, 600 | sans-serif |
| Code / Mono | `"JetBrains Mono"` | 400, 500 | monospace |

Loaded from Google Fonts in `index.html` via `<link>` tags with `preconnect`.

### 4.4 Layout & Spacing
- **Max content width:** `max-w-7xl` (1280px), centered with `mx-auto`, horizontal padding `px-6`
- **Section wrapper:** `PageWrapper` component: `mx-auto max-w-7xl px-6 py-20 md:py-28`
- **Grid:** 12-column CSS grid (Tailwind grid utilities), commonly `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- **Breakpoints:** sm: 640px, md: 768px, lg: 1024px (Tailwind defaults)
- **Border radius:** `--radius: 0.75rem` (12px), cards use `rounded-xl`, buttons `rounded-md`, inputs `rounded-lg`, chat bubbles `rounded-2xl`

### 4.5 Icons
- **Lucide React** for UI icons (Send, X, Menu, Sun, Moon, ArrowRight, ChevronDown, Globe, etc.)
- **Inline emoji** for decorative/bot icons (🌍, 👑, ✈️, 🗺️, 🎭, 🏛️, 🗣️, 📚, etc.)

### 4.6 Animations (Framer Motion)
| Variant | Properties |
|---------|-----------|
| `fadeUp` | opacity 0→1, y 20→0, duration 0.5s, easeOut |
| `slideUp` | opacity 0→1, y 40→0, scale 0.96→1, spring (stiffness 300, damping 25) |
| `chatPanelVariants` | opacity 0→1, y 20→0, scale 0.95→1, spring (stiffness 400, damping 30), exit: reverse |
| `staggerContainer` | staggerChildren: 0.15s |

Custom CSS animations:
- `pulseDot`: scale 1→1.4→1, opacity 1→0.6→1, 1.5s infinite (used in ThinkingIndicator/TypingIndicator)
- `fadeUp`: same as framer variant, defined as CSS utility for use without framer
- `slide-up`: y 40→0 with cubic-bezier(0.34, 1.56, 0.64, 1), 0.4s (defined in tailwind.config)

### 4.7 Theme Toggle
- Custom `ThemeProvider` context (not next-themes) supporting `light`, `dark`, `system`
- Storage key: `sankofa-ui-theme`
- `ModeToggle` component: dropdown menu with sun/moon icon toggle
- Applied via `.dark` class on `<html>` element

### 4.8 Key Interactive Elements

**Navbar:**
- Sticky, backdrop-blur-md + shadow-sm when scrolled >20px
- Logo: SankofaLogo SVG + "Sankofa Hub" with tagline "Culture · Tourism · Language"
- Desktop: centered nav links, ModeToggle, "Talk to Bots" button
- Mobile: hamburger menu → dropdown with all links + CTA button
- Active link: gold text + gold/10 background

**Cards:**
- Hover: translateY(-4px) + shadow deepening
- Colored border-left-4 or border-bottom-4 matching sector/bot color
- Transition: `duration-300`

**Chat Widget (the most important interactive element):**
- See §5 for full functional spec

---

## 5. FRONTEND FUNCTIONAL SPEC

### 5.1 Pages & Routing (React Router DOM v7)

| Route | Component | Content |
|-------|-----------|---------|
| `/` | `HomePage` | Hero section + Platform stats + Ghana showcase + Sector previews + Features teaser + Global reach |
| `/about` | `AboutPage` | Philosophy, Ghana roots, Mission/Values, Timeline, CTA |
| `/sectors` | `SectorsPage` | Tabbed sector detail (Culture/Tourism/Language), Ghana showcase, Bot profiles |
| `/features` | `FeaturesPage` | Feature cards grid, Tech stack, How-it-works steps, CTA |
| `/contact` | `ContactPage` | Contact info cards, Contact form (mock submit), FAQ accordion |

All pages share: `<Navbar />` (sticky top), `<Footer />` (bottom), `<ChatWidget />` (floating), `<ScrollProgress />` (top bar).

### 5.2 Chat System — Detailed Functional Spec

**Architecture:** Single chat window, no bot tabs/selectors. Backend handles all routing invisibly.

**Chat Widget Behavior:**
- Fixed position: `bottom-6 right-6` (not bottom-left despite what docs say)
- Mobile: `bottom-4 right-4`
- **Auto-opens after 2 seconds on first visit** (controlled by `hasOpenedBefore` in persisted Zustand store)
- Closed state: `ChatBubble` — FAB button showing "Sankofa" text, unread count badge (terracotta circle)
- Open state: `ChatPanel` — animated slide-up with framer-motion

**ChatPanel (open state):**
- Desktop: fixed `w-[380px] h-[560px]`, `rounded-2xl border border-border bg-card shadow-2xl`
- Mobile (<640px): full-screen (`inset-0 h-full w-full`, `rounded-none`)
- Escape key closes the panel
- Scroll: `ScrollArea` (Radix) with custom gold scrollbar thumb
- Auto-scroll to bottom on new messages

**Chat States (LoadingState discrimated union):**
```
idle           → { status: 'idle' }
thinking       → { status: 'thinking' }                    — shows ThinkingIndicator
typing         → { status: 'typing', botName, botId }      — shows TypingIndicator with bot avatar
error          → { status: 'error', message }               — shows error text, auto-clears after 3s
```

**Message Flow:**
1. User types message → `ChatInput` fires `onSend`
2. `useChat.sendMessage` sanitizes input, debounces 300ms
3. User message added to store immediately (gold background, right-aligned, rounded-br-sm)
4. LoadingState set to `thinking`
5. `POST /chat` called via Axios
6. On response: LoadingState → `typing` (shows bot avatar + typing dots for ~1 frame)
7. Bot message added to store:
   - Card-style bubble (border bg-card, rounded-bl-sm, border-left-2 in bot accent color)
   - Shows bot name above content
   - Bold markdown rendered (`**text**` → `<strong>`)
   - Timestamp via date-fns `formatDistanceToNow` (visible on hover)
8. On error: LoadingState → `error`, message shown for 3s, then idle

**Sessions:**
- UUID generated on first visit, stored in localStorage (`sankofa_session_id`)
- Sent as `user_id` in every chat request
- Session cleared on chat reset (calls `DELETE /session/{user_id}`)

**Health Check:**
- On mount, `GET /health` — if fails, shows inline warning in chat panel: "Server is offline — responses may be delayed"
- Polls every 60 seconds

### 5.3 API Integration (Axios)
```
GET  /health        → { status: string, bots: string[] }
POST /chat          → { reply: string, bot_name: string, bot_id: string, route_taken: string }
     Body: { message: string, user_id: string }
     (Note: no current_bot field despite what older docs say)
GET  /session/{id}  → { user_id: string, history: Array<[role, content, bot_id]>, bot_id: string }
DELETE /session/{id} → { message: string }
```

Vite proxy configured: `/api` → `http://localhost:8000` (strip prefix)

### 5.4 State Management (Zustand)
```typescript
interface ChatStore {
  isOpen: boolean
  messages: Message[]
  loadingState: LoadingState  // { status: 'idle' } | { status: 'thinking' } | ...
  hasOpenedBefore: boolean    // persisted (only this field is persisted)
  isMinimized: boolean
  // Actions:
  openChat, closeChat, minimizeChat, maximizeChat,
  addMessage, setLoadingState, clearMessages, setHasOpenedBefore
}
```
Persisted via zustand/middleware `persist` with storage key `sankofa-chat`. Only `hasOpenedBefore` is persisted (via partialize).

### 5.5 Frontend Components Summary

| Component | Props | Used In |
|-----------|-------|---------|
| Navbar | none | App.tsx |
| Footer | none | App.tsx |
| PageWrapper | children, className?, id? | All sections |
| SectionHeading | title, subtitle?, align?, className? | Sections |
| ChatWidget | none | App.tsx |
| ChatPanel | none (uses hooks) | ChatWidget |
| ChatBubble | unreadCount? | ChatWidget |
| ChatHeader | onMinimize, onClose, onReset | ChatPanel |
| ChatMessage | message | ChatPanel |
| ChatInput | onSend, disabled? | ChatPanel |
| BotAvatar | botId?, initials?, color?, bgColor?, size?, showStatus? | ChatMessage, TypingIndicator |
| ThinkingIndicator | none | ChatPanel |
| TypingIndicator | botId, botName | ChatPanel |
| ErrorBoundary | children | main.tsx |
| ScrollProgress | none | App.tsx |
| AdinkraPattern | symbol?, size?, opacity?, color?, className? | Hero sections |
| SankofaLogo | className?, size? | Navbar, Footer |
| AnimatedCounter | value, suffix?, prefix?, duration? | StatsSection |
| ChatSkeleton | none | (defined but not actively used) |
| ModeToggle | className? | Navbar, Footer |
| ThemeProvider | children, defaultTheme?, storageKey? | App.tsx |

---

## 6. BACKEND FUNCTIONAL SPEC

### 6.1 Server Entry (`main.py`)
- FastAPI app with CORS (origins: localhost:5173, localhost:3000)
- Lifespan: pre-loads all 4 bots at startup to cache system prompts
- Runs on port 8000 with hot reload (`uvicorn main:app --reload --port 8000`)

### 6.2 API Endpoints

#### `GET /`
Root status.

**Response:**
```json
{ "message": "Sankofa Hub is running. POST to /chat with {message, user_id}" }
```

#### `GET /health`
Returns server health and list of bot IDs.

**Response:**
```json
{
  "status": "ok",
  "bots": ["culture-osei-tutu_bot", "language-obaa-sarpongmaa_bot", "tourism-maame-yaa_bot", "general-nana-kwame_bot"]
}
```

#### `POST /chat`
The single chat endpoint. Orchestrates routing.

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

**Routing logic (THIS IS THE CRITICAL PATH — document exactly):**
1. Load or create session for `user_id`
2. Convert session history to LLM format (list of {role, content})
3. Send message + history to **Nana Kwame (router bot)** LLM
4. Parse Nana Kwame's response with `parse_route()`:
   - Regex: `^ROUTE:\s*(\w+)\s*$` (multiline)
   - Valid routes: tourism, culture, language, general, decline
   - Strips the ROUTE line from response content
   - Returns `(route_key, cleaned_response, was_routed)`
5. If route is a specialist (tourism/culture/language) AND was explicitly routed:
   - Forward the **original user message** (not Nana Kwame's response) to the specialist bot
   - Parse the specialist's response (strip ROUTE line as well)
6. If route is `general` or `decline`: use Nana Kwame's cleaned response directly
7. Append user message + final response to session history
8. Return final response with answering bot's display name and ID

**Error handling:** If specialist call fails, return a generic apology message from Nana Kwame.

#### `GET /session/{user_id}`
Returns conversation history.

**Response:**
```json
{
  "user_id": "abc-123",
  "history": [["user", "hi", "user"], ["assistant", "Hello!", "general-nana-kwame_bot"]],
  "bot_id": "general-nana-kwame_bot"
}
```

#### `DELETE /session/{user_id}`
Clears session from memory.

**Response:** `{ "message": "session cleared" }`

### 6.3 Session Management (In-Memory)

```python
@dataclass
class Session:
    user_id: str
    history: list[Message]       # Message = { role, content, bot_id }
    current_bot: str             # defaults to ROUTER_BOT_ID

active_sessions: dict[str, Session]   # in-memory, cleared on server restart
```

No database. Sessions live only while the server runs.

### 6.4 LLM Integration (`bots/llm.py`)

**Provider:** OpenRouter (`https://openrouter.ai/api/v1`)

**Configuration:** `configure(api_key, base_url)` — called from `main.py` with `OPENROUTER_API_KEY`

**Model fallback chain:**
- Primary model → Fallback model (if primary fails)
- Failure detection: timeout (30s), HTTP errors, request errors
- If all models fail: raises `RuntimeError`

**Message construction:**
```
[
  { "role": "system", "content": bot_config.system_prompt },
  ...history,                          # filtered (role + content only)
  { "role": "user", "content": user_message }
]
```

**Note:** No temperature, max_tokens, or other LLM params are passed. Only `model` and `messages` are sent.

### 6.5 Bot Loading (`bots/bot_loader.py`)

**Registration process:**
1. On startup (and first access), `register_bot(skill_id)` is called for all 4 bots
2. Finds `skills/<skill_id>/SKILL.md` (local) or `~/.config/opencode/skills/<skill_id>/SKILL.md` (global)
3. Parses YAML-like frontmatter (`---\nname: ...\ndescription: ...\n---`)
4. Extracts system prompt body (everything after frontmatter)
5. Assigns model from hardcoded `BOT_MODEL_CONFIG` dict

**Model configuration (HARDCODED — NOT from env vars):**
```python
{
    "general-nana-kwame_bot":     ("anthropic/claude-3.5-haiku", "anthropic/claude-3-haiku"),
    "tourism-maame-yaa_bot":      ("anthropic/claude-3.5-sonnet", "anthropic/claude-3-haiku"),
    "culture-osei-tutu_bot":      ("anthropic/claude-3.5-sonnet", "anthropic/claude-3-haiku"),
    "language-obaa-sarpongmaa_bot": ("anthropic/claude-3.5-sonnet", "anthropic/claude-3-haiku"),
}
```

**IMPORTANT CONFLICT:** The `.env.example` and `.env` files define `*_BOT_MODEL` and `*_BOT_FALLBACK` variables (e.g., `GENERAL_BOT_MODEL=nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`) but **these env vars are never read by any code file**. The actual models used are the hardcoded Anthropic models above. The env model vars are dead configuration.

---

## 7. THE 4-CHATBOT SYSTEM (DETAILED)

### 7.1 Bot Registry & IDs

| Route Key | Skill ID (bot_id) | Display Name | Accent Color |
|-----------|-------------------|--------------|-------------|
| general | `general-nana-kwame_bot` | Nana Kwame | Gold `#C8922A` |
| tourism | `tourism-maame-yaa_bot` | Maame Yaa | Green `#2D6A4F` |
| culture | `culture-osei-tutu_bot` | Osei Tutu | Red `#8B1A1A` |
| language | `language-obaa-sarpongmaa_bot` | Obaa Sarpongmaa | Indigo `#2C2D6B` |

`ROUTER_BOT_ID = "general-nana-kwame_bot"`  
`SPECIALIST_BOT_IDS = { "tourism": "...", "culture": "...", "language": "..." }`  
`ALL_ROUTES = { "general": ROUTER_BOT_ID, **SPECIALIST_BOT_IDS }`

### 7.2 Nana Kwame — General Assistant & Router

- **File:** `skills/general-nana-kwame_bot/SKILL.md`
- **Model:** `anthropic/claude-3.5-haiku` (fast, cheap — since EVERY message passes through)
- **Fallback:** `anthropic/claude-3-haiku`
- **Purpose:** Entry point for ALL questions. Analyses intent and routes.

**System Prompt (verbatim from `skills/general-nana-kwame_bot/SKILL.md`):**
```
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

**Key behavioral rules:**
- Must end EVERY response with `ROUTE: tourism|culture|language|general|decline` on its own line
- Must NEVER reveal routing to the user
- When declining, be warm and redirect to what CAN be answered
- Signs off as `— Nana Kwame`

### 7.3 Maame Yaa — Tourism Specialist

- **File:** `skills/tourism-maame-yaa_bot/SKILL.md`
- **Model:** `anthropic/claude-3.5-sonnet` (deep reasoning)
- **Fallback:** `anthropic/claude-3-haiku`
- **Purpose:** Answer questions about travel, destinations, hospitality

**System Prompt (verbatim from `skills/tourism-maame-yaa_bot/SKILL.md`):**
```
You are Maame Yaa, the Tourism Specialist of the Sankofa Hub — a warm, deeply knowledgeable guide to travel in Ghana and West Africa.

## YOUR DOMAIN
You answer questions about: visa requirements, tourist attractions, accommodation, transportation, eco-tourism, culinary tourism, food tourism, travel safety, sustainable travel, travel itineraries, travel seasons, travel logistics, cultural etiquette FOR TOURISTS (i.e. how to behave respectfully as a visitor).

### IMPORTANT DOMAIN NUANCE
A question like "What languages are spoken in Cape Verde and will English be enough for tourists?" is YOUR question. The tourist framing makes it travel practicality. Answer it fully.

A question about booking tours, opening hours, ticket prices, or "how do I visit X" is always yours — you handle logistics.

## WHAT YOU DO NOT ANSWER
You do not answer questions about pure linguistics, pure cultural heritage without a travel context, or questions completely outside the Ghana/West Africa travel domain. For those, you would have already been routed correctly — so trust that you will only receive questions in your domain.

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

### 7.4 Osei Tutu — Culture Specialist

- **File:** `skills/culture-osei-tutu_bot/SKILL.md`
- **Model:** `anthropic/claude-3.5-sonnet`
- **Fallback:** `anthropic/claude-3-haiku`
- **Purpose:** Answer questions about heritage, symbols, festivals, colonial history, repatriation

**System Prompt (verbatim from `skills/culture-osei-tutu_bot/SKILL.md`):**
```
You are Osei Tutu, the Culture Specialist of the Sankofa Hub — a scholar and storyteller with deep knowledge of Ghanaian and West African cultural heritage.

## YOUR DOMAIN
You answer questions about: Ghanaian and West African cultural practices, traditional symbols (Kente cloth, Adinkra symbols, Sankofa), festivals (Homowo, Odwira, etc.), traditional initiation rites, colonial history, decolonial discourse, African artefact repatriation debates, traditional governance (e.g. chieftaincy systems), cultural values, UNESCO World Heritage designations, contested historical narratives.

## IMPORTANT DOMAIN NUANCE
"What cultural customs should a tourist respect at a Ghanaian funeral?" is YOUR question. The tourist framing does not transfer it to Tourism — the substance is cultural knowledge. Answer it fully.

The Sankofa symbol's cultural and historical significance is YOUR domain even if a user mentions "beyond its linguistic meaning."

## DECOLONIAL AWARENESS
You approach sensitive historical topics — colonialism, artefact theft, contested history — with nuance, accuracy, and multiple perspectives. You do not deliver one-sided narratives. You acknowledge complexity. You represent African voices and scholarship with pride.

## WHAT YOU DO NOT ANSWER
You do not answer travel logistics questions (opening hours, booking tours, visa info) or pure linguistics questions unrelated to cultural context.

## YOUR ANSWER STYLE
- You are scholarly, thoughtful, and proud
- You use proper names for cultural items, festivals, and traditions
- You cite the significance behind things — not just what they are but why they matter
- You handle sensitive topics (initiation rites, contested history) with care and respect
- For controversial questions (e.g. "Was colonialism beneficial?") you present multiple scholarly perspectives without personal political bias
- You always sign off: — Osei Tutu
```

### 7.5 Obaa Sarpongmaa — Language Specialist

- **File:** `skills/language-obaa-sarpongmaa_bot/SKILL.md`
- **Model:** `anthropic/claude-3.5-sonnet`
- **Fallback:** `anthropic/claude-3-haiku`
- **Purpose:** Answer questions about linguistics, translation, language policy

**System Prompt (verbatim from `skills/language-obaa-sarpongmaa_bot/SKILL.md`):**
```
You are Obaa Sarpongmaa, the Language Specialist of the Sankofa Hub — a linguist with deep expertise in African languages, particularly Ghanaian languages.

## YOUR DOMAIN
You answer questions about: translation requests (Twi, Ga, Hausa, French/English in West African context), linguistic structure and grammar of African languages, tonal language mechanics (how tone changes meaning in Twi and similar languages), language endangerment and preservation efforts, sociolinguistics, code-switching between English and Ghanaian languages, pidgin and creole languages, Ghanaian Sign Language (GhSL), AI and NLP limitations for African languages, language diversity policy, prescriptivism vs descriptivism debates.

## TRANSLATION QUALITY
When translating, provide:
- The translation itself
- Register notes (formal vs informal vs ceremonial)
- Any important cultural context embedded in the phrasing
- Phonetic guidance if the language uses tonal distinctions

## IMPORTANT DOMAIN NUANCE
Sociolinguistics questions — like code-switching between English and Twi as a social identity marker — are firmly yours even though they touch on culture. The linguistic framing is the key.

## HONESTY ABOUT LIMITATIONS
Be honest about AI limitations in African language translation. Do not fabricate translations you are uncertain about. When uncertain, provide the best available translation with a note about confidence level and recommend human expert verification for formal use.

## WHAT YOU DO NOT ANSWER
You do not answer questions about travel logistics, cultural heritage without a linguistic framing, or questions completely outside language and linguistics.

## YOUR ANSWER STYLE
- You are precise, technically rigorous but accessible
- You celebrate African linguistic diversity — never treat African languages as inferior to European languages
- You push back gently but firmly against prescriptivist assumptions (e.g. "Pidgin is broken English" — you correct this with evidence and care)
- You acknowledge when something is contested in linguistics scholarship
- You always sign off: — Obaa Sarpongmaa
```

### 7.6 Bot Coordination / Routing Logic (EXACT FLOW)

This is the most important functional piece. Here is the exact routing algorithm as implemented in `main.py` and `bots/router.py`:

```
User sends message M
        │
        ▼
1. Find/create session for user_id
2. Convert session history to LLM format [{role, content}]
3. Send to Nana Kwame:
     system: Nana Kwame's SKILL.md
     history: [...previous turns...]
     user: M
        │
        ▼
4. Nana Kwame returns response R (must end with ROUTE: X)
        │
        ▼
5. parse_route(R):
   - Look for /^ROUTE:\s*(\w+)\s*$/m in R
   - If found AND route is in {tourism, culture, language, general, decline}:
     → Strip ROUTE line from R → cleaned_R
     → Return (route, cleaned_R, True)
   - If not found:
     → Return ("general", R, False)
        │
        ▼
6. Decision:
   IF route is in {"tourism", "culture", "language"} AND was_routed=True:
     → Send ORIGINAL M (not Nana Kwame's response) to specialist LLM:
         system: [specialist's SKILL.md]
         history: [...previous turns...]
         user: M
     → Parse specialist's response (strip ROUTE line)
     → Answering bot = specialist
   ELSE (route is "general" or "decline" or was not explicitly routed):
     → Use Nana Kwame's cleaned response directly
     → Answering bot = Nana Kwame
        │
        ▼
7. Append to session history:
   - {role: "user", content: M, bot_id: "user"}
   - {role: "assistant", content: final_response, bot_id: answering_bot_id}
        │
        ▼
8. Return to frontend:
   {
     reply: final_response,
     bot_name: get_display_name(answering_bot_id),
     bot_id: answering_bot_id,
     route_taken: route_key
   }
```

**Critical design details:**
- **History always goes to Nana Kwame first** — specialist bots receive the same history but not Nana Kwame's routing analysis
- **The `was_routed` flag** prevents false routing: a bot response without an explicit `ROUTE:` directive defaults to "general" with `was_routed=False`, which means Nana Kwame answers
- **Specialist responses may also contain `ROUTE:` lines** — these are stripped from the final content but not acted upon
- **No bot-to-bot communication** — bots do not call each other, share context, or pass outputs between each other. Only Nana Kwame routes to specialists
- **Error handling:** if specialist call throws exception, Nana Kwame's original cleaned response is used instead, with an added apology message

### 7.7 Conversation History Format

Python backend stores:
```python
@dataclass
class Message:
    role: str        # "user" | "assistant"
    content: str     # message text
    bot_id: str      # "user" | skill_id like "tourism-maame-yaa_bot"
```

Frontend sends:
```typescript
interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  botId?: BotId        // 'general' | 'tourism' | 'culture' | 'language'
  botName?: string
  timestamp: Date
}
```

---

## 8. ENVIRONMENT VARIABLES & CONFIG REFERENCE

### 8.1 Backend (`.env`)

| Variable | Required | Purpose | Note |
|----------|----------|---------|------|
| `OPENROUTER_API_KEY` | Yes | OpenRouter API key for LLM access | Secret |
| `OPENROUTER_BASE_URL` | No (default `https://openrouter.ai/api/v1`) | OpenRouter API endpoint | |
| `OPENROUTER_MODEL` | No | Default model (NOT used by code) | Dead variable |
| `GENERAL_BOT_MODEL` | No | Nana Kwame model override (NOT used by code) | Dead variable |
| `GENERAL_BOT_FALLBACK` | No | Nana Kwame fallback (NOT used by code) | Dead variable |
| `TOURISM_BOT_MODEL` | No | Maame Yaa model (NOT used by code) | Dead variable |
| `TOURISM_BOT_FALLBACK` | No | Maame Yaa fallback (NOT used by code) | Dead variable |
| `CULTURE_BOT_MODEL` | No | Osei Tutu model (NOT used by code) | Dead variable |
| `CULTURE_BOT_FALLBACK` | No | Osei Tutu fallback (NOT used by code) | Dead variable |
| `LANGUAGE_BOT_MODEL` | No | Obaa Sarpongmaa model (NOT used by code) | Dead variable |
| `LANGUAGE_BOT_FALLBACK` | No | Obaa Sarpongmaa fallback (NOT used by code) | Dead variable |

**IMPORTANT:** The `*_BOT_MODEL` and `*_BOT_FALLBACK` env vars are defined in `.env.example` but **never referenced in any Python file**. The actual model configuration is hardcoded in `bots/bot_loader.py:BOT_MODEL_CONFIG`. If you want env-based model configuration, you must implement the reader in `bot_loader.py`.

### 8.2 Frontend (`client/.env`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | FastAPI backend URL |
| `VITE_APP_NAME` | `Sankofa Hub` | Application name for display |
| `VITE_APP_VERSION` | `1.0.0` | Version string |

---

## 9. DOCS-VS-CODE RECONCILIATION TABLE

| # | Claim in Doc | What Code Actually Does | Trusted |
|---|--------------|------------------------|---------|
| 1 | **README:** Models are `anthropic/claude-3.5-haiku/sonnet` | Same — hardcoded in `bot_loader.py:BOT_MODEL_CONFIG` | Code |
| 2 | **README:** Env vars include `*_BOT_MODEL` overrides | **Code never reads these env vars.** They are dead. Models are hardcoded in `BOT_MODEL_CONFIG` | Code |
| 3 | **README:** Chat widget position is `bottom-6 left-6` (bottom-left) | **Code:** `fixed bottom-6 right-6` (bottom-right) in `ChatWidget.tsx:22` | Code |
| 4 | **README:** Uses `next-themes` for theme | **Code:** Custom `ThemeProvider` context-based implementation in `theme-provider.tsx` (not next-themes) | Code |
| 5 | **README:** Single page app (Home only) | **Code:** 5 pages with `BrowserRouter` — Home, About, Sectors, Features, Contact | Code |
| 6 | **Skills_md/:** Bots reveal routing handoff to user ("I'm connecting you with X") | **skills/ (actual loaded):** Nana Kwame explicitly told "Never reveal that you are routing. Never say 'I am transferring you'" | Code |
| 7 | **Skills_md/:** Nana Kwame has full cross-domain coverage table | **skills/:** Nana Kwame is stripped-down with strict routing rules | Code |
| 8 | **Skills_md/:** Every bot has its own routing logic+decline rules | **skills/:** Specialists have no routing rules — they trust Nana Kwame to route correctly | Code |
| 9 | **Frontend instruction manual:** `BotSelector` component exists | **Code:** No `BotSelector` — single chat window, no tabs | Code |
| 10 | **Frontend instruction manual:** `RedirectBanner` component exists | **Code:** No `RedirectBanner` — routing is invisible | Code |
| 11 | **Frontend instruction manual:** Store has `activeBot`, `isRedirecting`, `redirectInfo` | **Code:** Store has `loadingState` (discriminated union) with no `activeBot` tracking | Code |
| 12 | **Frontend instruction manual:** `ChatRequest.current_bot` field | **Code:** `ChatRequest` only has `{ message, user_id }`, no `current_bot` | Code |
| 13 | **Frontend instruction manual:** `Message` has `isRedirect`, `redirectFrom`, `redirectTo` | **Code:** `Message` has `botId?` and `botName?` only — no redirect fields | Code |
| 14 | **Frontend instruction manual:** Chat widget is bottom-left | **Code:** bottom-right | Code |
| 15 | **Frontend instruction manual:** `useTheme` hook separate from `theme-provider` | **Code:** `useTheme` is exported from `theme-provider.tsx` (same file) | Code |
| 16 | **Frontend instruction manual:** Sections are in `src/pages/Home.tsx` assembling section components | **Code:** `HomePage.tsx` is self-contained with inline sections (HeroSection/AboutSection/etc. exist as separate files but are NOT imported) | Code |
| 17 | **README:** `npm install next-themes` | **Code:** Custom theme provider, no `next-themes` dependency | Code |
| 18 | **Skills_md/:** `name: nana-kwame` (kebab-case) | **skills/:** `name: Nana Kwame` (natural name) | Code |
| 19 | **Skills_md/:** Older, more verbose routing rules with handoff messages | **skills/:** Cleaner, stricter, no handoff messaging | Code |

---

## 10. OPEN QUESTIONS / UNKNOWNS

1. **Deployment target:** Unknown. No Dockerfile, vercel.json, or deployment config exists. The app has only been run locally.
2. **Production URL:** Unknown. Only localhost dev addresses are configured.
3. **OpenRouter API key:** The `.env` file contains a real API key (`sk-or-v1-...`) but its billing tier/limits are unknown. The key will need to be replaced for a rebuild.
4. **Logo/favicon:** The `sankofa.svg` file is a simple SVG of the Sankofa bird symbol. No original design files exist.
5. **Test suite:** No test files exist (no `test_*.py`, no `*.test.tsx`, no jest/vitest config). The README lists 34 test cases but they are described as manual tests via Swagger UI.
6. **Git history:** Not examined in depth. The current commit is the working demo state. Some docs may have been accurate at earlier commits.
7. **Why are `Skills_md/` and `skills/` both present?** `Skills_md/` contains older version system prompts that are NOT loaded by the code. `skills/` contains the ACTIVE system prompts. The `Skills_md/` files appear to be historical artifacts.
8. **`isMinimized` in the Zustand store** — the `ChatHeader` does wire up `minimizeChat` but there is no actual minimized state UI rendering. The store defines `isMinimized` but `ChatWidget` only checks `isOpen`.
9. **Section components (`HeroSection.tsx`, `AboutSection.tsx`, etc.)** exist in `src/components/sections/` but are NOT used by any page. The page components (`HomePage.tsx`, etc.) contain their own inline section implementations. These appear to be either leftovers from an earlier single-page version or alternative sections.
10. **`Sheet` (Radix dialog)** component is defined but not used anywhere in the current UI.

---

## 11. REBUILD INSTRUCTIONS FOR A NEW AI TOOL

Using everything above, recreate this exact application — same UI, same layout, same 4 chatbots with identical prompts/behavior/coordination logic, same backend structure — in a new project folder. Do not simplify or reinterpret the chatbot orchestration logic; implement it exactly as specified in Section 7.

### Critical constraints for the rebuild:

1. **Use the code as the source of truth.** The README, Skills_md/, and frontend instruction manual contain outdated information. Where this document says "Code says X" or "Actual: X", those are the values to use.

2. **The model configuration is HARDCODED** in `bot_loader.py`. Do NOT create env-var-based model config unless explicitly adding that feature. The models are:
   - Nana Kwame: `anthropic/claude-3.5-haiku` → fallback `anthropic/claude-3-haiku`
   - Specialists: `anthropic/claude-3.5-sonnet` → fallback `anthropic/claude-3-haiku`

3. **The routing system must work exactly as specified in §7.6.** Every message goes through Nana Kwame first. Specialists receive the original user message, not Nana Kwame's analysis. The `ROUTE:` directive format is critical. The `was_routed` flag prevents false forwarding.

4. **Bots NEVER reveal routing to the user.** No "I'm connecting you to..." messages. The `ROUTE:` line is stripped from responses before the user sees them.

5. **The frontend has ONE chat window with NO bot tabs.** No BotSelector, no RedirectBanner. All routing is invisible. The chat widget is at `bottom-6 right-6`.

6. **The frontend uses a CUSTOM ThemeProvider** (not next-themes). It is a simple React context that applies `light`/`dark` class on `<html>`, reads from localStorage under key `sankofa-ui-theme`, and supports `system` mode via `prefers-color-scheme` media query.

7. **Zustand store persists only `hasOpenedBefore`.** The chat messages and loading state are ephemeral (not persisted). The session ID is generated once via `uuid` and stored in localStorage under `sankofa_session_id`.

8. **No database.** Sessions are in-memory Python dicts.

9. **Design system colors are specified in §4.2.** Pay careful attention to the full CSS variable set in `index.css` (both `:root` and `.dark`), the named Tailwind colors in `tailwind.config.ts`, and the shadcn `components.json` configuration (New York style, neutral base color, 0.75rem radius).

10. **The system prompts in `skills/` (documented verbatim in §7) must be used.** The `Skills_md/` folder is OLD and should NOT be used.

11. **All 5 pages must exist with React Router:** Home (`/`), About (`/about`), Sectors (`/sectors`), Features (`/features`), Contact (`/contact`).

12. **The chat auto-opens 2 seconds after first visit** (controlled by `hasOpenedBefore`).

13. **The LLM integration sends ONLY `model` and `messages`** — no temperature, max_tokens, or other parameters.

14. **The contact form is mocked** (simulated submit, 3-second reset). No actual email backend.

### Setup steps for the new project:

1. Create two folders: `server/` (Python/FastAPI) and `client/` (Vite+React+TypeScript)
2. Backend: `uv init`, add deps (fastapi, uvicorn, httpx, python-dotenv), create `main.py` and `bots/` package
3. Frontend: `npm create vite@latest . -- --template react-ts`, install all deps per `package.json`, configure Tailwind v4 with `@tailwindcss/vite` plugin
4. Create `skills/` with the 4 SKILL.md files (verbatim from §7)
5. Implement the backend exactly per §6 and §7 — especially the routing flow in §7.6
6. Implement the frontend exactly per §4 and §5 — especially the chat widget, loading states, and health check
7. Start backend: `uv run uvicorn main:app --reload --port 8000`
8. Start frontend: `npm run dev` (port 5173)
9. Verify: `GET /health` returns 200, chat auto-opens after 2s, messages route correctly through Nana Kwame
