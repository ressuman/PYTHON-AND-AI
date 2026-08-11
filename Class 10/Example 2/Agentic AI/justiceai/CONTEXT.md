# JUSTICEAI — PROJECT CONTEXT
## READ THIS ENTIRE FILE BEFORE WRITING ANY CODE

This file tells you everything about the project.
If you skip reading this, you will hallucinate and write wrong code.

---

## WHAT THIS PROJECT IS

App name: JusticeAI
Mission: Close the global justice gap by giving everyone free access to
         expert legal document analysis and AI code review.

This is a real production application. Not a tutorial. Not a demo.
Every line of code must be production-quality, secure, and correct.

---

## THE TWO TOOLS

### Tool 1 — Legal Document Analyzer
- User uploads PDF or DOCX (contracts, leases, NDAs, loan agreements, employment contracts)
- AI analyzes the document and returns:
  - Document type
  - Overall risk level: LOW / MEDIUM / HIGH / CRITICAL
  - Executive summary (3-5 bullet points)
  - Every risky clause explained in plain English
  - What to negotiate, refuse, or accept
- User can ask follow-up questions in a persistent AI chat
- All conversations saved to database

### Tool 2 — AI Code Reviewer
- User pastes code or describes their code problem
- AI reviews for: security vulnerabilities, bugs, performance, code quality
- Returns structured review with quality score, issues ranked by severity,
  fixes with code examples, and a refactored version
- Persistent chat — user can ask follow-up questions

---

## COMPLETE TECH STACK

```
Next.js 15         — App Router ONLY. No pages/ directory. Ever.
TypeScript 5       — Strict mode. Zero `any` types. Use `unknown` if unsure.
React 19           — Server components by default. "use client" only when needed.
Tailwind CSS v4    — Dark theme first. CSS variables for all colors.
shadcn/ui          — Pre-installed components. Never edit files in src/components/ui/
Drizzle ORM 0.30   — Type-safe SQL. Never write raw SQL string interpolation.
Neon PostgreSQL    — @neondatabase/serverless HTTP driver. NEVER pg.Pool.
Upstash Redis      — @upstash/redis for caching and rate limiting.
jose 5             — JWT library. NEVER jsonwebtoken (breaks Edge runtime).
bcryptjs 2.4       — Password hashing. NEVER bcrypt (native C++ breaks Vercel).
zod 3              — Input validation on EVERY API route.
OpenAI SDK 4       — Used to call OpenRouter (same API, different baseURL).
uploadthing 6      — File uploads. PDF + DOCX. 16MB max.
lucide-react       — Icons only. No other icon libraries.
react-markdown     — Render AI markdown responses safely.
react-syntax-highlighter — Code blocks with oneDark theme.
```

---

## AUTHENTICATION SYSTEM

Custom-built. No NextAuth. No Clerk. No Passport.

### Tokens
- Access token: JWT signed with JWT_ACCESS_SECRET, expires in 15 minutes
- Refresh token: JWT signed with JWT_REFRESH_SECRET, expires in 7 days (30 if rememberMe)
- Both tokens stored in httpOnly cookies ONLY — never localStorage, never React state

### Cookie Names
- lexcode_access — access token
- lexcode_refresh — refresh token
- google_oauth_state — temporary (10 min, SameSite=Lax for Google redirect)

### Cookie Settings (non-negotiable)
- HttpOnly: true (always)
- Secure: true in production only (process.env.NODE_ENV === "production")
- SameSite: "strict" for auth cookies, "lax" for google_oauth_state ONLY
- Path: "/"

### JWT Library
- ALWAYS use `jose` — it works in Next.js Edge Middleware
- NEVER use `jsonwebtoken` — it uses Node.js crypto which breaks in Edge

### Password Library
- ALWAYS use `bcryptjs` — pure JavaScript, works on Vercel
- NEVER use `bcrypt` — requires native C++ bindings, breaks on serverless

### Google OAuth
- Uses plain fetch calls to Google APIs
- NO arctic library, NO passport, NO OAuth libraries
- State stored in cookie, verified on callback to prevent CSRF

### reCAPTCHA
- Version 3 (invisible, scores 0.0-1.0)
- Verified server-side before any DB operation
- If RECAPTCHA_SECRET_KEY is empty or "fill_in_later" → skip verification (dev mode)
- Reject if score < 0.5

---

## DATABASE

### Connection
```typescript
// CORRECT — Neon HTTP driver
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })

// WRONG — Never do this with Neon serverless
import { Pool } from "pg"
```

### DATABASE_URL Format
```
// CORRECT — no query parameters
postgresql://user:password@host.neon.tech/dbname

// WRONG — do not add ?sslmode=require or any params
postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

### Tables (5 total)
1. users — id, email, name, password_hash, role, google_id, avatar_url, is_active, created_at, updated_at
2. refresh_tokens — id, user_id, token_hash, expires_at, is_revoked, created_at
3. sessions — id, user_id, tool_type, title, document_url, document_name, document_type, risk_level, language, content_snapshot, is_archived, message_count, created_at, updated_at
4. messages — id, session_id, user_id, role, content, metadata, created_at
5. documents — id, session_id, user_id, file_name, file_url, file_key, file_size, mime_type, extracted_text, page_count, created_at

### Enums
- tool_type: "legal" | "code"
- message_role: "user" | "assistant" | "system"
- risk_level: "low" | "medium" | "high" | "critical"
- user_role: "lawyer" | "engineer" | "general" | "admin" | "both"

---

## REDIS (UPSTASH)

### What It Is Used For
1. Rate limiting API routes — prevent abuse of free AI quota
2. Caching session data — reduce DB reads for frequently accessed sessions
3. Storing temporary OAuth state as backup to cookies

### Connection
```typescript
import { Redis } from "@upstash/redis"
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})
```

### Rate Limiting Rules
- Chat routes (/api/chat/*): max 10 requests per minute per user
- Auth routes (/api/auth/login, /api/auth/signup): max 5 requests per minute per IP
- Upload routes: max 20 uploads per hour per user

### Cache TTL
- Session metadata: 5 minutes
- User profile: 10 minutes
- Message history: 2 minutes (short — messages are added frequently)

---

## AI SYSTEM (OPENROUTER)

### Client Setup
```typescript
import OpenAI from "openai"
const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL,
    "X-Title": "JusticeAI",
  },
})
```

### Free Model Fallback Chain (in order)
1. meta-llama/llama-4-maverick:free — Primary, 1M context, best for long documents
2. nvidia/llama-3.1-nemotron-ultra-253b:free — Fallback 1
3. qwen/qwen3-coder:free — Fallback 2, excellent for code
4. openai/gpt-oss-20b:free — Fallback 3
5. openrouter/free — Auto-router, always available

### Streaming Format (Server-Sent Events)
Each chunk sent to client:
```
data: {"content": "chunk of text"}\n\n
```
Done signal:
```
data: [DONE]\n\n
```
Error:
```
data: {"error": "message"}\n\n
```

### Rate Limit Handling
- 429 response: wait 2000ms, try next model
- 502/503 response: try next model immediately
- All models fail: send error SSE frame

---

## DESIGN SYSTEM

### Colors (CSS Variables)
```css
--background: #0A0A0F
--surface: #111118
--surface-2: #1a1a2e
--border: #1E1E2E
--primary: #6366F1      (indigo — main brand color)
--primary-hover: #4F46E5
--legal-accent: #8B5CF6  (purple — legal tool)
--code-accent: #10B981   (emerald — code tool)
--text-primary: #F8F8FF
--text-muted: #9CA3AF
--danger: #EF4444
--success: #10B981
```

### Fonts
- Inter — UI text (imported from next/font/google, variable: --font-sans)
- JetBrains Mono — code blocks and code editor (variable: --font-mono)

### Layout
- Navbar: fixed top, 60px height
- Sidebar: fixed left, 280px width (desktop), Sheet drawer (mobile)
- Main content: padding-top 60px, margin-left 280px (desktop)

---

## FOLDER STRUCTURE (Complete)

```
src/
├── app/
│   ├── layout.tsx                    ← Root layout, fonts, TooltipProvider
│   ├── page.tsx                      ← Landing page (server component)
│   ├── globals.css                   ← Tailwind + CSS variables
│   ├── icon.tsx                      ← Dynamic favicon (ImageResponse)
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx                ← Protected: checks session, renders Navbar
│   │   ├── page.tsx                  ← Dashboard home
│   │   ├── legal/
│   │   │   ├── page.tsx
│   │   │   └── [sessionId]/page.tsx
│   │   ├── code/
│   │   │   ├── page.tsx
│   │   │   └── [sessionId]/page.tsx
│   │   └── admin/
│   │       └── page.tsx
│   └── api/
│       ├── auth/
│       │   ├── signup/route.ts
│       │   ├── login/route.ts
│       │   ├── logout/route.ts
│       │   ├── refresh/route.ts
│       │   ├── me/route.ts
│       │   ├── google/route.ts
│       │   └── google/callback/route.ts
│       ├── uploadthing/
│       │   ├── core.ts
│       │   └── route.ts
│       ├── chat/
│       │   ├── legal/route.ts
│       │   └── code/route.ts
│       ├── sessions/
│       │   ├── route.ts
│       │   ├── [sessionId]/route.ts
│       │   └── [sessionId]/content/route.ts
│       └── documents/route.ts
├── components/
│   ├── ui/                           ← shadcn ONLY — never edit these
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── GoogleButton.tsx
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   └── TypingIndicator.tsx
│   ├── legal/
│   │   ├── DocumentUploader.tsx
│   │   └── RiskBadge.tsx
│   ├── code/
│   │   ├── CodeEditor.tsx
│   │   ├── CodeBlock.tsx
│   │   └── LanguageSelector.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Sidebar.tsx
│   └── shared/
│       ├── LoadingSpinner.tsx
│       ├── EmptyState.tsx
│       └── ErrorBanner.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts
│   │   └── schema.ts
│   ├── auth/
│   │   ├── session.ts
│   │   ├── password.ts
│   │   ├── cookies.ts
│   │   ├── tokens.ts
│   │   ├── recaptcha.ts
│   │   └── google.ts
│   ├── ai/
│   │   ├── client.ts
│   │   ├── models.ts
│   │   ├── legal-prompts.ts
│   │   └── code-prompts.ts
│   ├── redis.ts                      ← Upstash Redis client
│   ├── rate-limit.ts                 ← Rate limiting helper
│   ├── uploadthing.ts
│   └── utils.ts
├── hooks/
│   ├── useChat.ts
│   ├── useSession.ts
│   └── useSessions.ts
├── types/
│   └── index.ts
└── middleware.ts
```

---

## ENVIRONMENT VARIABLES (All Required)

```env
DATABASE_URL=                         # Neon — no query params
JWT_ACCESS_SECRET=                    # 48 random bytes, base64
JWT_REFRESH_SECRET=                   # Different 48 random bytes, base64
OPENROUTER_API_KEY=                   # From openrouter.ai
UPLOADTHING_SECRET=                   # From uploadthing.com
UPLOADTHING_APP_ID=                   # From uploadthing.com
GOOGLE_CLIENT_ID=                     # From Google Cloud Console
GOOGLE_CLIENT_SECRET=                 # From Google Cloud Console
NEXT_PUBLIC_GOOGLE_CLIENT_ID=         # Same as GOOGLE_CLIENT_ID
RECAPTCHA_SECRET_KEY=                 # From Google reCAPTCHA admin
NEXT_PUBLIC_RECAPTCHA_SITE_KEY=       # From Google reCAPTCHA admin
UPSTASH_REDIS_REST_URL=               # From upstash.com
UPSTASH_REDIS_REST_TOKEN=             # From upstash.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## SECURITY REQUIREMENTS (Non-Negotiable)

1. Every API route calls getSession() before ANY other logic
2. Every request body is validated with Zod before touching the DB
3. Session ownership is verified on EVERY database read/write
4. passwordHash is NEVER returned in API responses
5. OPENROUTER_API_KEY is NEVER imported in any "use client" file
6. All cookies are HttpOnly (JavaScript cannot read them)
7. Rate limiting is applied on all chat and auth routes via Redis
8. User input is NEVER interpolated into SQL strings
9. File uploads are authenticated (UploadThing middleware checks session)
10. Admin routes check role === "admin" before any data is returned
