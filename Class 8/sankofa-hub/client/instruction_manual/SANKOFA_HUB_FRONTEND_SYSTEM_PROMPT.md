# Sankofa Hub — Frontend Client System Prompt
**Version:** 1.0  
**Project:** Sankofa Hub  
**Stack:** Vite + React + TypeScript + Tailwind CSS + shadcn/ui + Aceternity UI  
**IDE Target:** Cursor / Windsurf (formerly Antigravity)  
**Prompt Type:** Full-project generation directive

---

## 0. IDE Recommendation

Use **Cursor** for this project. It has superior multi-file context awareness, inline diff editing, and better TypeScript refactoring than Windsurf at this scale. Open the `client/` folder as the root workspace in Cursor, then use Composer (Ctrl+I) with this entire prompt to generate the project.

---

## 1. Project Overview & Goal

You are building the **Sankofa Hub** frontend — a culturally rich, professionally designed web application for a Ghanaian/pan-African knowledge platform covering **Culture**, **Tourism**, and **Language**. The name "Sankofa" (from the Akan proverb meaning "go back and fetch it") informs the design philosophy: rooted in heritage, forward in technology.

The frontend connects to a **FastAPI backend** (already built) running at `http://localhost:8000`. The backend exposes:
- `POST /chat` — main chatbot endpoint
- `GET /session/{user_id}` — retrieve session
- `DELETE /session/{user_id}` — clear session
- `GET /health` — health check
- `GET /` — status

The app is a **content-rich website** with an **embedded multi-bot chat system** (4 bots: General, Tourism, Culture, Language) that floats at the bottom-left of every page. The bots auto-open on first visit. Users can browse the site independently, use the bots independently, or do both simultaneously.

**This is NOT a MERN stack project.** The backend (Python/FastAPI) is already complete and separate. The frontend only needs to be a Vite React client that calls the FastAPI API. No Node.js backend, no MongoDB, no Express needed.

---

## 2. Aesthetic Direction

### Design Philosophy
**"Adinkra Digital"** — The interface fuses traditional Ghanaian Adinkra symbolism with premium modern digital design. Think: the warmth and depth of kente textile geometry expressed through clean Swiss-grid layouts, with bold editorial typography and purposeful negative space.

### Color System
```css
/* Light Theme */
--color-bg-primary: #FAFAF7          /* warm off-white, like aged parchment */
--color-bg-secondary: #F0EDE6        /* warm light surface */
--color-bg-card: #FFFFFF
--color-text-primary: #1A1409        /* deep warm black */
--color-text-secondary: #5C5242      /* warm brown-grey */
--color-accent-gold: #C8922A         /* Kente gold */
--color-accent-forest: #1A6B4A       /* deep forest green */
--color-accent-terracotta: #C05A2C   /* terracotta/clay */
--color-border: #DDD8CE

/* Dark Theme */
--color-bg-primary: #0F0D0A          /* deep warm black */
--color-bg-secondary: #1C1914        /* dark warm surface */
--color-bg-card: #231F19             /* card surface */
--color-text-primary: #F5F0E8        /* warm off-white */
--color-text-secondary: #A89880      /* warm muted */
--color-accent-gold: #E5A93C         /* brighter gold for dark */
--color-accent-forest: #2D9A6B       /* lighter forest on dark */
--color-accent-terracotta: #D97040   /* warmer terracotta on dark */
--color-border: #352E25
```

### Typography
- **Display / Hero font:** `Playfair Display` (serif, elegant authority) — for H1, H2, hero headings
- **UI / Body font:** `DM Sans` (clean, modern, African-tech feel) — for body, labels, UI elements
- **Mono / Code:** `JetBrains Mono` — for any technical text
- Import all from Google Fonts in `index.html`

### Motion Principles
- Page load: staggered fade-up on hero (150ms delay increments)
- Bot panel: slide-up from bottom-left with spring easing
- Section transitions: scroll-triggered fade-in with Intersection Observer
- Theme switch: smooth 300ms color transition on `html` element
- Bot switching: slide transition between bot panels
- Hover states on cards: subtle lift (translateY -4px) + shadow deepening

### Layout
- Max content width: `1280px`, centered with `mx-auto px-6`
- Grid: 12-column CSS grid system
- Bot panel: fixed `380px` wide, positioned `bottom-6 left-6`
- Mobile: bot panel full-width bottom sheet

---

## 3. Tech Stack & Setup

### Initialize the project
```bash
# Run inside the /client folder
npm create vite@latest . -- --template react-ts
npm install
```

### Dependencies to install
```bash
# Core UI
npm install tailwindcss @tailwindcss/vite
npm install @radix-ui/react-dialog @radix-ui/react-tooltip @radix-ui/react-dropdown-menu
npm install @radix-ui/react-scroll-area @radix-ui/react-separator @radix-ui/react-tabs
npm install class-variance-authority clsx tailwind-merge lucide-react

# shadcn/ui (initialize then add components)
npx shadcn@latest init
npx shadcn@latest add button card badge tooltip dialog tabs scroll-area separator sheet

# Aceternity UI dependencies
npm install framer-motion

# State & Data
npm install @tanstack/react-query axios
npm install zustand

# Theme
npm install next-themes

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Utilities
npm install date-fns uuid
npm install @types/uuid --save-dev

# Dev
npm install -D @types/node
```

### Tailwind Configuration (`tailwind.config.ts`)
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#C8922A',
          dark: '#E5A93C',
          50: '#FDF8EE',
          100: '#FAF0D7',
        },
        forest: {
          DEFAULT: '#1A6B4A',
          dark: '#2D9A6B',
        },
        terracotta: {
          DEFAULT: '#C05A2C',
          dark: '#D97040',
        },
        sankofa: {
          parchment: '#FAFAF7',
          warm: '#F0EDE6',
          deep: '#0F0D0A',
          card: '#231F19',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'pulse-dot': 'pulseDot 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        pulseDot: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.4)', opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}

export default config
```

---

## 4. Folder & File Structure

Generate EXACTLY this structure inside `client/src/`:

```
client/
├── .env
├── .env.example
├── .gitignore
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── package.json
├── components.json              ← shadcn config
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css                ← global styles + CSS vars + theme vars
    │
    ├── api/
    │   ├── client.ts            ← axios instance with base URL + interceptors
    │   ├── chatbot.ts           ← all chatbot API calls
    │   └── types.ts             ← shared API TypeScript types
    │
    ├── components/
    │   ├── ui/                  ← shadcn generated components (auto-generated)
    │   │
    │   ├── layout/
    │   │   ├── Navbar.tsx       ← sticky top nav, logo, links, theme toggle
    │   │   ├── Footer.tsx       ← rich footer with links, socials, tagline
    │   │   └── PageWrapper.tsx  ← page layout wrapper with scroll detection
    │   │
    │   ├── chat/
    │   │   ├── ChatWidget.tsx   ← main floating chat container (bottom-left)
    │   │   ├── ChatPanel.tsx    ← the open chat panel with messages
    │   │   ├── ChatBubble.tsx   ← FAB button when chat is closed
    │   │   ├── ChatMessage.tsx  ← individual message bubble (user/bot)
    │   │   ├── ChatInput.tsx    ← message input + send button
    │   │   ├── BotSelector.tsx  ← tabs to switch between the 4 bots
    │   │   ├── BotAvatar.tsx    ← bot avatar with name and status dot
    │   │   ├── RedirectBanner.tsx ← animated banner when bot switches
    │   │   ├── TypingIndicator.tsx ← animated typing dots
    │   │   └── ChatHeader.tsx   ← panel header with bot name, minimize btn
    │   │
    │   ├── sections/
    │   │   ├── HeroSection.tsx  ← full-viewport hero
    │   │   ├── AboutSection.tsx ← about Sankofa Hub
    │   │   ├── SectorsSection.tsx ← Culture, Tourism, Language cards
    │   │   ├── FeaturesSection.tsx ← key platform features
    │   │   ├── StatsSection.tsx ← animated statistics/numbers
    │   │   ├── TestimonialsSection.tsx ← quotes/testimonials
    │   │   └── CTASection.tsx   ← call-to-action section
    │   │
    │   └── common/
    │       ├── ThemeToggle.tsx  ← sun/moon icon toggle
    │       ├── SectionHeading.tsx ← reusable styled section title
    │       ├── AdinkraPattern.tsx ← SVG decorative Adinkra symbol component
    │       ├── AnimatedCounter.tsx ← scroll-triggered number count-up
    │       └── ScrollProgress.tsx ← reading progress bar at top of page
    │
    ├── hooks/
    │   ├── useChat.ts           ← main chat state + API calls hook
    │   ├── useTheme.ts          ← theme management hook
    │   ├── useScrollAnimation.ts ← intersection observer for scroll reveals
    │   ├── useLocalStorage.ts   ← typed localStorage hook
    │   └── useSessionId.ts      ← generate/persist user session ID
    │
    ├── stores/
    │   └── chatStore.ts         ← Zustand store for chat state
    │
    ├── pages/
    │   └── Home.tsx             ← main home page assembling all sections
    │
    ├── lib/
    │   ├── utils.ts             ← cn() utility + helpers
    │   ├── constants.ts         ← bot configs, site content, nav links
    │   └── animations.ts        ← framer-motion variants
    │
    └── types/
        └── index.ts             ← global TypeScript types
```

---

## 5. Environment Files

### `.env`
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Sankofa Hub
VITE_APP_VERSION=1.0.0
```

### `.env.example`
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_APP_NAME=Sankofa Hub
VITE_APP_VERSION=1.0.0
```

### `.gitignore`
```
node_modules/
dist/
.env
.env.local
.env.production
*.log
.DS_Store
.vite/
coverage/
```

---

## 6. API Layer — Full Specification

### `src/api/types.ts`
```typescript
export interface ChatRequest {
  message: string
  user_id: string
  current_bot?: string
}

export interface ChatResponse {
  reply: string
  route_to: 'tourism' | 'culture' | 'language' | 'general' | 'decline'
  bot_name: string
  current_bot: string
}

export interface SessionResponse {
  user_id: string
  history: Array<{ role: string; content: string }>
  current_bot: string
}

export interface HealthResponse {
  status: string
  bots: string[]
}

export type BotId = 'general' | 'tourism' | 'culture' | 'language'

export interface BotConfig {
  id: BotId
  skillId: string
  name: string
  fullName: string
  description: string
  color: string
  darkColor: string
  bgColor: string
  darkBgColor: string
  icon: string
  emoji: string
  greeting: string
  placeholder: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  botId: BotId
  botName: string
  timestamp: Date
  isRedirect?: boolean
  redirectFrom?: BotId
  redirectTo?: BotId
}
```

### `src/api/client.ts`
```typescript
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — log in dev
apiClient.interceptors.request.use((config) => {
  if (import.meta.env.DEV) {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`)
  }
  return config
})

// Response interceptor — normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || 'An error occurred'
    console.error('[API Error]', message)
    return Promise.reject(new Error(message))
  }
)
```

### `src/api/chatbot.ts`
```typescript
import { apiClient } from './client'
import type { ChatRequest, ChatResponse, SessionResponse, HealthResponse } from './types'

export const chatApi = {
  sendMessage: async (payload: ChatRequest): Promise<ChatResponse> => {
    const { data } = await apiClient.post<ChatResponse>('/chat', payload)
    return data
  },

  getSession: async (userId: string): Promise<SessionResponse> => {
    const { data } = await apiClient.get<SessionResponse>(`/session/${userId}`)
    return data
  },

  clearSession: async (userId: string): Promise<void> => {
    await apiClient.delete(`/session/${userId}`)
  },

  checkHealth: async (): Promise<HealthResponse> => {
    const { data } = await apiClient.get<HealthResponse>('/health')
    return data
  },
}
```

---

## 7. Constants & Bot Configuration

### `src/lib/constants.ts`
```typescript
import type { BotConfig } from '../types'

export const BOT_CONFIGS: Record<string, BotConfig> = {
  general: {
    id: 'general',
    skillId: 'general-nana-kwame_bot',
    name: 'Nana Kwame',
    fullName: 'Nana Kwame — General Assistant',
    description: 'Your entry guide across all three domains',
    color: '#C8922A',
    darkColor: '#E5A93C',
    bgColor: '#FDF8EE',
    darkBgColor: '#2A2318',
    icon: '🌍',
    emoji: '👑',
    greeting: "Akwaaba! I'm Nana Kwame, your general guide to Sankofa Hub. Ask me anything about Culture, Tourism, or Language — or let me connect you to the right specialist.",
    placeholder: 'Ask about culture, tourism, or language...',
  },
  tourism: {
    id: 'tourism',
    skillId: 'tourism-maame-yaa_bot',
    name: 'Maame Yaa',
    fullName: 'Maame Yaa — Tourism Specialist',
    description: 'Expert in travel, destinations & hospitality',
    color: '#1A6B4A',
    darkColor: '#2D9A6B',
    bgColor: '#F0FAF5',
    darkBgColor: '#0F2318',
    icon: '✈️',
    emoji: '🗺️',
    greeting: "Hello! I'm Maame Yaa, your tourism specialist. I can help you discover destinations, plan trips, understand hospitality, and explore the world of travel — especially across Africa.",
    placeholder: 'Ask about destinations, travel tips, visas...',
  },
  culture: {
    id: 'culture',
    skillId: 'culture-osei-tutu_bot',
    name: 'Osei Tutu',
    fullName: 'Osei Tutu — Culture Specialist',
    description: 'Expert in arts, heritage & traditions',
    color: '#C05A2C',
    darkColor: '#D97040',
    bgColor: '#FDF3EE',
    darkBgColor: '#2A1510',
    icon: '🎭',
    emoji: '🏛️',
    greeting: "Greetings! I'm Osei Tutu, your culture specialist. From Adinkra symbols to world heritage sites, performing arts to cultural policy — I'm here to help you explore the richness of human culture.",
    placeholder: 'Ask about arts, heritage, traditions, festivals...',
  },
  language: {
    id: 'language',
    skillId: 'language-obaa-sarpongmaa_bot',
    name: 'Obaa Sarpongmaa',
    fullName: 'Obaa Sarpongmaa — Language Specialist',
    description: 'Expert in linguistics, translation & policy',
    color: '#6B4A9A',
    darkColor: '#9B7AC8',
    bgColor: '#F5F0FF',
    darkBgColor: '#1A1228',
    icon: '🗣️',
    emoji: '📚',
    greeting: "Hello! I'm Obaa Sarpongmaa, your language specialist. Whether you need help with translation, want to learn about African languages, explore linguistics, or understand language policy — I'm your guide.",
    placeholder: 'Ask about languages, translation, linguistics...',
  },
}

export const BOT_ORDER: string[] = ['general', 'tourism', 'culture', 'language']

export const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Sectors', href: '#sectors' },
  { label: 'Features', href: '#features' },
  { label: 'Contact', href: '#contact' },
]

export const SITE_STATS = [
  { value: 3, suffix: '', label: 'Specialist Domains', prefix: '' },
  { value: 4, suffix: '', label: 'AI Assistants', prefix: '' },
  { value: 54, suffix: '+', label: 'African Countries Covered', prefix: '' },
  { value: 2000, suffix: '+', label: 'Languages Tracked', prefix: '' },
]

export const SECTORS = [
  {
    id: 'culture',
    title: 'Culture',
    subtitle: 'Arts, Heritage & Creative Life',
    description: 'Explore the full spectrum of human cultural expression — from Adinkra symbolism and Kente traditions to world heritage sites, performing arts, and cultural policy across Africa and beyond.',
    icon: '🎭',
    color: '#C05A2C',
    items: ['Visual Arts', 'Heritage Sites', 'Performing Arts', 'Festivals', 'Cultural Policy', 'Traditional Crafts'],
  },
  {
    id: 'tourism',
    title: 'Tourism',
    subtitle: 'Travel, Destinations & Hospitality',
    description: 'Discover Africa and the world through expert tourism guidance — from eco-tourism in Ghana\'s forests to cultural heritage trails, culinary adventures, and sustainable travel practices.',
    icon: '✈️',
    color: '#1A6B4A',
    items: ['Eco Tourism', 'Cultural Tourism', 'Adventure Travel', 'Culinary Tourism', 'Medical Tourism', 'Tourism Policy'],
  },
  {
    id: 'language',
    title: 'Language',
    subtitle: 'Linguistics, Translation & Policy',
    description: 'Navigate the extraordinary diversity of human language — from Akan proverbs and Twi translation to endangered language preservation, NLP technology, and multilingual education.',
    icon: '🗣️',
    color: '#6B4A9A',
    items: ['Translation', 'Linguistics', 'Language Preservation', 'Sign Language', 'Language Technology', 'Sociolinguistics'],
  },
]

export const FEATURES = [
  {
    icon: '🤖',
    title: 'Intelligent Routing',
    description: 'Ask any question and be seamlessly connected to the right specialist. No wrong door — just smarter conversations.',
  },
  {
    icon: '🔄',
    title: 'Bidirectional Handoff',
    description: 'Switch between specialists mid-conversation without losing context. Your history follows you everywhere.',
  },
  {
    icon: '🌍',
    title: 'Africa-First Knowledge',
    description: 'Built with deep attention to African cultures, languages, and tourism contexts — not as an afterthought.',
  },
  {
    icon: '⚡',
    title: 'Powered by Advanced AI',
    description: 'Multiple AI models with intelligent fallback ensure you always get a thoughtful, reliable response.',
  },
  {
    icon: '🔒',
    title: 'Session Memory',
    description: 'Your conversation context is maintained throughout your session, making each exchange richer than the last.',
  },
  {
    icon: '📱',
    title: 'Fully Responsive',
    description: 'A seamless experience whether you\'re on desktop, tablet, or mobile — the bots are always with you.',
  },
]
```

---

## 8. Zustand Chat Store

### `src/stores/chatStore.ts`
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Message, BotId } from '../types'

interface ChatStore {
  // State
  isOpen: boolean
  activeBot: BotId
  messages: Message[]
  isLoading: boolean
  isRedirecting: boolean
  redirectInfo: { from: BotId; to: BotId; reason: string } | null
  hasOpenedBefore: boolean
  isMinimized: boolean

  // Actions
  openChat: () => void
  closeChat: () => void
  minimizeChat: () => void
  maximizeChat: () => void
  setActiveBot: (botId: BotId) => void
  addMessage: (message: Message) => void
  setLoading: (loading: boolean) => void
  setRedirecting: (info: { from: BotId; to: BotId; reason: string } | null) => void
  clearMessages: () => void
  setHasOpenedBefore: (value: boolean) => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      isOpen: false,
      activeBot: 'general',
      messages: [],
      isLoading: false,
      isRedirecting: false,
      redirectInfo: null,
      hasOpenedBefore: false,
      isMinimized: false,

      openChat: () => set({ isOpen: true, isMinimized: false, hasOpenedBefore: true }),
      closeChat: () => set({ isOpen: false }),
      minimizeChat: () => set({ isMinimized: true }),
      maximizeChat: () => set({ isMinimized: false }),
      setActiveBot: (botId) => set({ activeBot: botId }),
      addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
      setLoading: (loading) => set({ isLoading: loading }),
      setRedirecting: (info) => set({ isRedirecting: !!info, redirectInfo: info }),
      clearMessages: () => set({ messages: [], activeBot: 'general' }),
      setHasOpenedBefore: (value) => set({ hasOpenedBefore: value }),
    }),
    {
      name: 'sankofa-chat',
      partialize: (state) => ({
        hasOpenedBefore: state.hasOpenedBefore,
        activeBot: state.activeBot,
      }),
    }
  )
)
```

---

## 9. Core Hooks

### `src/hooks/useSessionId.ts`
```typescript
import { useMemo } from 'react'
import { v4 as uuidv4 } from 'uuid'

const SESSION_KEY = 'sankofa_session_id'

export function useSessionId(): string {
  return useMemo(() => {
    let sessionId = localStorage.getItem(SESSION_KEY)
    if (!sessionId) {
      sessionId = uuidv4()
      localStorage.setItem(SESSION_KEY, sessionId)
    }
    return sessionId
  }, [])
}
```

### `src/hooks/useChat.ts`
```typescript
import { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { chatApi } from '../api/chatbot'
import { useChatStore } from '../stores/chatStore'
import { BOT_CONFIGS } from '../lib/constants'
import type { BotId, Message } from '../types'
import { useSessionId } from './useSessionId'

export function useChat() {
  const sessionId = useSessionId()
  const {
    activeBot, messages, isLoading, isRedirecting, redirectInfo,
    setActiveBot, addMessage, setLoading, setRedirecting, clearMessages,
  } = useChatStore()

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const currentBotConfig = BOT_CONFIGS[activeBot]

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      botId: activeBot,
      botName: 'You',
      timestamp: new Date(),
    }
    addMessage(userMessage)
    setLoading(true)

    try {
      const response = await chatApi.sendMessage({
        message: content,
        user_id: sessionId,
        current_bot: currentBotConfig.skillId,
      })

      // Detect redirect
      const routeTo = response.route_to as BotId
      const isRedirect = routeTo !== activeBot && routeTo !== 'general' && routeTo !== 'decline'

      if (isRedirect) {
        setRedirecting({
          from: activeBot,
          to: routeTo,
          reason: `Your question was detected as a ${routeTo} topic`,
        })
        setTimeout(() => {
          setActiveBot(routeTo)
          setRedirecting(null)
        }, 2500)
      }

      // Add bot message
      const botMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.reply,
        botId: routeTo === 'decline' ? activeBot : (routeTo || activeBot),
        botName: response.bot_name || currentBotConfig.name,
        timestamp: new Date(),
        isRedirect: isRedirect,
        redirectFrom: isRedirect ? activeBot : undefined,
        redirectTo: isRedirect ? routeTo : undefined,
      }
      addMessage(botMessage)

    } catch (error) {
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please check that the Sankofa Hub server is running and try again.",
        botId: activeBot,
        botName: currentBotConfig.name,
        timestamp: new Date(),
      }
      addMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [activeBot, isLoading, sessionId, addMessage, setLoading, setActiveBot, setRedirecting])

  const switchBot = useCallback((botId: BotId) => {
    setActiveBot(botId)
  }, [setActiveBot])

  const resetChat = useCallback(async () => {
    try {
      await chatApi.clearSession(sessionId)
    } catch (e) {
      // Silent fail
    }
    clearMessages()
  }, [sessionId, clearMessages])

  return {
    messages, activeBot, isLoading, isRedirecting, redirectInfo,
    sendMessage, switchBot, resetChat,
  }
}
```

---

## 10. Component Specifications

### `src/components/chat/ChatWidget.tsx`
The outermost wrapper. Fixed positioned bottom-left. Manages open/closed state. When closed shows `ChatBubble`. When open shows `ChatPanel`. Uses `AnimatePresence` from framer-motion for smooth transitions. Auto-opens after 2 seconds on first visit using `hasOpenedBefore` from store.

### `src/components/chat/ChatPanel.tsx`
The full open panel. Contains:
- `ChatHeader` at top (bot name, minimize, close buttons)
- `BotSelector` tabs below header
- `RedirectBanner` (conditionally shown during redirect)
- `ScrollArea` from shadcn with all `ChatMessage` components
- `TypingIndicator` when loading
- `ChatInput` fixed at bottom

Panel dimensions: `w-[380px] h-[560px]` on desktop. Full screen on mobile (`w-full h-full fixed inset-0`).

### `src/components/chat/BotSelector.tsx`
Horizontal tab strip with 4 bots. Each tab shows: bot emoji icon + bot first name. Active tab highlighted with bot's accent color. Clicking a tab calls `switchBot(botId)`. Uses smooth underline animation.

### `src/components/chat/ChatMessage.tsx`
- User messages: right-aligned, gold/accent background
- Bot messages: left-aligned, card background with subtle border
- Shows `BotAvatar` inline with bot messages
- Markdown-like formatting: bold text (`**text**`), line breaks preserved
- Timestamp shown on hover
- If `isRedirect`, render a small inline route notice above the message

### `src/components/chat/RedirectBanner.tsx`
Slide-in banner (from top of chat panel) with colored left border matching destination bot. Shows: arrow icon + "Switching to [Bot Name]" + reason. Auto-dismisses. Uses framer-motion.

### `src/components/chat/ChatBubble.tsx`
Floating action button. Shows bot emoji (current active bot). Has animated pulse ring in bot's accent color. Shows unread count badge if messages exist while closed. On hover, expands to show "Chat with Sankofa Hub".

### `src/components/layout/Navbar.tsx`
- Sticky top, backdrop-blur on scroll
- Left: Sankofa logo (SVG Sankofa bird) + "Sankofa Hub" wordmark
- Center: nav links (hidden on mobile, hamburger menu)
- Right: `ThemeToggle` + optional CTA button
- Mobile: slides down drawer with nav links

### `src/components/sections/HeroSection.tsx`
- Full viewport height (`min-h-screen`)
- Background: subtle Adinkra pattern SVG (very low opacity) + gradient
- Large display heading using Playfair Display: "Retrieve Knowledge. Navigate Culture."
- Subheading in DM Sans
- Two CTAs: "Explore Platform" + "Talk to Our Bots" (opens chat)
- Animated scroll indicator at bottom
- Floating decorative `AdinkraPattern` SVG elements

### `src/components/sections/SectorsSection.tsx`
- Three large cards: Culture, Tourism, Language
- Each card: large icon, title, subtitle, description, tag list, colored bottom border
- Hover: lift animation + reveal "Ask [bot name] →" CTA that opens chat on that bot
- Staggered entrance animation

### `src/components/common/AdinkraPattern.tsx`
SVG component rendering Adinkra symbols (Sankofa bird, Gye Nyame, Adinkrahene, etc.) as decorative elements. Accepts `symbol`, `size`, `opacity`, `color` props. Used throughout page as decorative accents.

### `src/components/common/ScrollProgress.tsx`
Thin colored bar (gold) fixed at very top of viewport. Width driven by `window.scrollY / document.body.scrollHeight`.

---

## 11. Page Structure

### `src/pages/Home.tsx`
```tsx
import { HeroSection } from '../components/sections/HeroSection'
import { AboutSection } from '../components/sections/AboutSection'
import { SectorsSection } from '../components/sections/SectorsSection'
import { FeaturesSection } from '../components/sections/FeaturesSection'
import { StatsSection } from '../components/sections/StatsSection'
import { TestimonialsSection } from '../components/sections/TestimonialsSection'
import { CTASection } from '../components/sections/CTASection'

export function Home() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <SectorsSection />
      <StatsSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </main>
  )
}
```

### `src/App.tsx`
```tsx
import { ThemeProvider } from 'next-themes'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { ChatWidget } from './components/chat/ChatWidget'
import { ScrollProgress } from './components/common/ScrollProgress'
import { Home } from './pages/Home'

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <div className="min-h-screen bg-sankofa-parchment dark:bg-sankofa-deep font-body text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
          <ScrollProgress />
          <Navbar />
          <Home />
          <Footer />
          <ChatWidget />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
```

---

## 12. Global Styles

### `src/index.css`
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --color-bg-primary: #FAFAF7;
    --color-bg-secondary: #F0EDE6;
    --color-text-primary: #1A1409;
    --color-text-secondary: #5C5242;
    --color-accent-gold: #C8922A;
    --color-accent-forest: #1A6B4A;
    --color-accent-terracotta: #C05A2C;
    --color-border: #DDD8CE;
    --radius: 0.75rem;
  }

  .dark {
    --color-bg-primary: #0F0D0A;
    --color-bg-secondary: #1C1914;
    --color-text-primary: #F5F0E8;
    --color-text-secondary: #A89880;
    --color-accent-gold: #E5A93C;
    --color-accent-forest: #2D9A6B;
    --color-accent-terracotta: #D97040;
    --color-border: #352E25;
  }

  * {
    @apply border-border;
    box-sizing: border-box;
  }

  html {
    scroll-behavior: smooth;
  }

  body {
    @apply antialiased;
    font-family: 'DM Sans', sans-serif;
    background-color: var(--color-bg-primary);
    color: var(--color-text-primary);
  }

  h1, h2, h3 {
    font-family: 'Playfair Display', serif;
  }

  ::selection {
    background-color: var(--color-accent-gold);
    color: white;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: var(--color-bg-secondary); }
  ::-webkit-scrollbar-thumb {
    background: var(--color-accent-gold);
    border-radius: 3px;
  }
}

@layer utilities {
  .animate-fade-up {
    animation: fadeUp 0.5s ease-out forwards;
    opacity: 0;
  }

  .adinkra-bg {
    background-image: url("data:image/svg+xml,..."); /* Adinkra SVG pattern */
    background-repeat: repeat;
    background-size: 120px 120px;
  }
}
```

---

## 13. vite.config.ts

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
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
```

---

## 14. Senior Developer Additions

The following must be included — these are things a senior developer always adds:

### A. Error Boundary (`src/components/common/ErrorBoundary.tsx`)
React class component error boundary wrapping the app. Shows a clean fallback UI with a "Reload page" button. Never let the whole app crash on an unhandled error.

### B. Loading Skeleton (`src/components/common/ChatSkeleton.tsx`)
Skeleton loader for when the chat panel is first initializing or checking backend health.

### C. Backend Health Check (`src/hooks/useHealthCheck.ts`)
On app mount, ping `GET /health`. If the backend is down, show a non-intrusive toast or inline notice in the chat panel ("Server is offline — responses may be delayed"). Do NOT block the UI.

### D. Rate Limit Guard in `useChat.ts`
Debounce the send button: disable for 800ms after each send. Prevent empty or whitespace-only messages.

### E. Keyboard Shortcuts
- `Enter` to send message
- `Shift+Enter` for new line in input
- `Escape` to close/minimize chat panel

### F. Auto-scroll in Chat
`ScrollArea` ref auto-scrolls to bottom on each new message using `scrollIntoView({ behavior: 'smooth' })`.

### G. Message Timestamps
Formatted with `date-fns` `formatDistanceToNow` (e.g., "just now", "2 min ago"). Shown subtly below each message.

### H. Accessibility
- All interactive elements have `aria-label`
- Focus management when chat opens (auto-focus input)
- Keyboard navigable bot tabs
- Proper `role` attributes on chat messages (`role="log"` on message list)
- Reduced motion: `@media (prefers-reduced-motion)` disables animations

### I. README.md at client root
Document: how to install, how to run, how to connect to backend, env vars, folder structure.

### J. `src/lib/utils.ts`
```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function truncate(str: string, maxLength: number): string {
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str
}
```

### K. `tsconfig.json` path aliases
Configure `@/*` to resolve to `./src/*` for clean imports throughout.

### L. Framer Motion Variants (`src/lib/animations.ts`)
```typescript
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
}

export const slideUp = {
  hidden: { opacity: 0, y: 40, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 25 } },
}

export const chatPanelVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
  exit: { opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } },
}
```

---

## 15. Responsive Design Rules

| Breakpoint | Chat Panel | Navbar | Sections |
|---|---|---|---|
| `< 640px` (mobile) | Full-screen overlay, bottom sheet | Hamburger menu | Single column |
| `640–1024px` (tablet) | `w-[340px] h-[500px]`, fixed bottom-left | Condensed links | 2-column grid |
| `> 1024px` (desktop) | `w-[380px] h-[560px]`, fixed bottom-left | Full nav | 3-column grid |

Mobile chat: when open, takes full viewport with a top bar showing bot name and close button. No bottom input obscured by mobile keyboard — use `viewport-fit=cover` in `index.html` meta and `env(safe-area-inset-bottom)` padding.

---

## 16. Security Checklist

- All API keys in `.env` only — never hardcoded
- `.env` in `.gitignore`
- `axios` timeout set (30s) to prevent hanging requests
- Input sanitization: trim and strip any `<script>` tags from user input before sending
- No `dangerouslySetInnerHTML` unless content is explicitly sanitized
- CORS already configured on the FastAPI backend (allow `localhost:5173`)
- Session ID stored in `localStorage` (not cookies) — no CSRF risk
- No sensitive data logged to console in production builds

---

## 17. Final Generation Instructions for Cursor

When generating this project in Cursor Composer:

1. Open the `client/` folder as workspace root
2. Paste this entire prompt into Cursor Composer (Ctrl+I or Cmd+I)
3. Tell Cursor: **"Generate the complete Sankofa Hub frontend based on this system prompt. Create every file in the folder structure. Do not skip any file. Generate complete, production-ready code for each component."**
4. After generation, run:
   ```bash
   npm install
   npx shadcn@latest init
   npx shadcn@latest add button card badge tooltip dialog tabs scroll-area separator sheet
   npm run dev
   ```
5. Ensure the FastAPI backend is running at `http://localhost:8000` before testing chat
6. Test the `/health` endpoint first: visit `http://localhost:8000/health` in browser
7. Open `http://localhost:5173` — the chat panel should auto-open after 2 seconds on first visit

---

## 18. Content for Website Sections

### Hero
- **Headline:** "Retrieve Knowledge. Navigate Culture."
- **Subheadline:** "Sankofa Hub is your intelligent gateway to African and global knowledge across Culture, Tourism, and Language — powered by four specialist AI assistants."
- **CTA 1:** "Explore the Platform"
- **CTA 2:** "Talk to Our Bots"

### About
- Sankofa: the Akan principle of drawing from the past to build the future
- A platform that honours cultural knowledge while embracing intelligent technology
- Three domains, four assistants, one unified experience

### Testimonials (placeholder content)
Generate 3 testimonials from fictional personas: a travel researcher, a cultural scholar, and a linguistics student — all praising the accuracy and cultural sensitivity of the bots.

### Footer
- Logo + tagline: "Knowledge rooted in heritage."
- Links: Home, About, Sectors, Features
- Social links (placeholder icons): Twitter/X, LinkedIn, GitHub
- Copyright: "© 2025 Sankofa Hub. Built with cultural intelligence."
- Theme toggle in footer as well

---

*This system prompt is the single source of truth for the Sankofa Hub frontend. All components, hooks, stores, and pages must conform to the specifications above. Do not deviate from the folder structure, naming conventions, or API integration patterns defined here.*

---
**Prompt Version:** 1.0 | **Domain:** Culture · Tourism · Language | **Stack:** Vite + React + TypeScript + Tailwind + shadcn + Aceternity
