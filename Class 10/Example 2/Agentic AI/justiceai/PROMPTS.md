# JUSTICEAI — TASK PROMPTS FOR OPENCODE
## Copy and paste ONE section at a time. Never combine tasks.

---

## HOW TO USE THIS FILE

1. Start a new OpenCode session
2. First paste the MASTER CONTEXT PROMPT (below) — every session, always
3. Then paste TASK 1 prompt
4. Wait for OpenCode to finish and give you a report
5. Change your model if recommended
6. Type "continue" in OpenCode when you are ready
7. Then paste TASK 2 prompt
8. Repeat

---

## ═══════════════════════════════════════════════════════════════
## MASTER CONTEXT PROMPT
## Paste this FIRST in every new OpenCode session
## ═══════════════════════════════════════════════════════════════

```
You are a senior full-stack engineer building JusticeAI — a world-class platform
that closes the global justice gap by giving everyone free AI-powered legal document
analysis and code review. Built in Ghana. Designed for the world.

MANDATORY: Before writing ANY code, read these files in your project:
- README.md (what this app does and why)
- CONTEXT.md (full technical context, stack decisions, all patterns)
- RULES.md (rules you must never break)
- SKILL.md (code patterns and templates to follow)

These files are already in your project folder.
Read them now. Confirm you have read them before I give you a task.

After each task you complete:
1. STOP completely
2. Write a full report of every file created or modified
3. List any warnings or issues
4. Tell me which model to switch to for the next task
5. Ask for permission before continuing

Do not continue to the next task without explicit permission.
Acknowledge this and confirm you have read all 4 files.
```

---

## ═══════════════════════════════════════════════════════════════
## TASK 1 — Upstash Redis + Database Schema + Auth Foundation
## Recommended model: DeepSeek V3, Qwen 2.5 72B, or Llama 4 Maverick
## ═══════════════════════════════════════════════════════════════

```
TASK 1: Install Upstash Redis and build the database schema and complete
authentication system. Read RULES.md and SKILL.md before starting.

━━━ STEP 1A: Install Upstash Redis ━━━

Run this command in the terminal:
npm install @upstash/redis

━━━ STEP 1B: Create These Files ━━━

FILE 1: src/lib/redis.ts
Content:
import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

FILE 2: src/lib/rate-limit.ts
Create the rateLimiter function exactly as shown in SKILL.md Pattern 7.
Export: rateLimiter(identifier: string, options: { max: number; window: number })
Uses Redis sorted sets to track requests in a sliding window.
If Redis fails: fail open (return success: true) to not block users.

FILE 3: src/lib/db/schema.ts
Create ALL 5 tables with ALL 4 enums exactly as documented in CONTEXT.md.

Enums to create:
- tool_type: "legal" | "code"
- message_role: "user" | "assistant" | "system"
- risk_level: "low" | "medium" | "high" | "critical"
- user_role: "lawyer" | "engineer" | "general" | "admin" | "both"

Tables to create:
1. users: id(uuid pk), email(varchar 255 unique), name(varchar 100),
   password_hash(text), role(user_role enum default "both"),
   google_id(text nullable unique), avatar_url(text nullable),
   is_active(boolean default true), created_at, updated_at

2. refresh_tokens: id(uuid pk), user_id(uuid FK→users cascade),
   token_hash(text), expires_at(timestamp), is_revoked(boolean default false),
   created_at

3. sessions: id(uuid pk), user_id(uuid FK→users cascade),
   tool_type(tool_type enum), title(varchar 255 default "New Session"),
   document_url(text nullable), document_name(varchar 255 nullable),
   document_type(varchar 50 nullable), risk_level(risk_level nullable),
   language(varchar 50 nullable), content_snapshot(text nullable),
   is_archived(boolean default false), message_count(integer default 0),
   created_at, updated_at

4. messages: id(uuid pk), session_id(uuid FK→sessions cascade),
   user_id(uuid FK→users cascade), role(message_role enum),
   content(text), metadata(text nullable), created_at

5. documents: id(uuid pk), session_id(uuid FK→sessions cascade),
   user_id(uuid FK→users cascade), file_name(varchar 255),
   file_url(text), file_key(text), file_size(integer nullable),
   mime_type(varchar 100 nullable), extracted_text(text nullable),
   page_count(integer nullable), created_at

Export all $inferSelect types: User, Session, Message, Document, RefreshToken

FILE 4: src/lib/db/index.ts
Use neon() HTTP driver from @neondatabase/serverless.
Use drizzle() from drizzle-orm/neon-http.
Import all schema. Export db and DB type.
See SKILL.md Pattern 1 for exact code.

FILE 5: drizzle.config.ts (in project root, NOT in src/)
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
import { defineConfig } from "drizzle-kit"
export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
  verbose: true,
  strict: true,
})

FILE 6: src/lib/auth/password.ts
import bcrypt from "bcryptjs"  ← bcryptjs NOT bcrypt
const SALT_ROUNDS = 12
export async function hashPassword(password: string): Promise<string>
export async function comparePassword(plain: string, hash: string): Promise<boolean>

FILE 7: src/lib/auth/tokens.ts
Use ONLY jose library. See SKILL.md Pattern 2 for exact code.

Interfaces to export:
- AccessTokenPayload: { userId, email, name, role, tokenType: "access" }
- RefreshTokenPayload: { userId, tokenType: "refresh", rememberMe }

Functions to export:
- signAccessToken(payload: Omit<AccessTokenPayload, "tokenType">): Promise<string>
  Signs with JWT_ACCESS_SECRET, expires "15m"
- signRefreshToken(userId: string, rememberMe: boolean): Promise<string>
  Signs with JWT_REFRESH_SECRET, expires "7d" normally, "30d" if rememberMe
- verifyAccessToken(token: string): Promise<AccessTokenPayload | null>
  Returns null on any error (expired, invalid, tampered)
- verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null>
  Returns null on any error

FILE 8: src/lib/auth/cookies.ts
See SKILL.md Pattern 3 and 4 for exact implementation.
Cookie names: "lexcode_access" and "lexcode_refresh"
Functions to export:
- setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string, rememberMe: boolean): void
- clearAuthCookies(response: NextResponse): void
- getAccessToken(req: NextRequest): string | undefined
- getRefreshToken(req: NextRequest): string | undefined
Remember: Secure=true only in production, SameSite="strict" for both auth cookies.

FILE 9: src/lib/auth/session.ts
Functions to export:
- getSession(): Promise<AccessTokenPayload | null>
  Uses "await cookies()" from next/headers (must await in Next.js 15)
  Gets lexcode_access cookie, verifies with verifyAccessToken
- getSessionFromRequest(req: NextRequest): Promise<AccessTokenPayload | null>
  Gets token from req.cookies (for middleware use)

FILE 10: src/lib/auth/recaptcha.ts
export async function verifyRecaptcha(token: string): Promise<boolean>
See CONTEXT.md reCAPTCHA section for full logic.
Dev bypass: if secret key is empty or "fill_in_later" → return true
Server: POST to https://www.google.com/recaptcha/api/siteverify
Reject if score < 0.5. On any error: return false.

FILE 11: src/lib/auth/google.ts
Use plain fetch only. No arctic. No passport.
See CONTEXT.md Google OAuth section for all endpoints and logic.
Functions to export:
- generateGoogleAuthUrl(state: string): string
- exchangeCodeForTokens(code: string): Promise<{ access_token: string }>
- fetchGoogleUser(accessToken: string): Promise<GoogleUser>
- handleGoogleCallback(code: string): Promise<{ accessToken, refreshToken, user }>
  This function: gets tokens, fetches user, upserts in DB, creates refresh token in DB

FILE 12: src/types/index.ts
Export these interfaces:
- UserProfile: { id, name, email, role, avatarUrl?: string | null }
- ToolType = "legal" | "code"
- RiskLevel = "low" | "medium" | "high" | "critical"
- MessageRole = "user" | "assistant" | "system"
- ChatSession (all fields from sessions table)
- ChatMessage (all fields from messages table)
- ApiResponse<T = void>: { success: boolean; data?: T; error?: string; details?: unknown }

━━━ STEP 1C: API Auth Routes ━━━

FILE 13: src/app/api/auth/signup/route.ts
POST handler. Steps in exact order:
1. Parse body as JSON
2. Zod validate: { name min2/max100, email email format, password min8/max128,
   role enum("lawyer","engineer","general","both") default "both",
   recaptchaToken string, rememberMe boolean default false }
   → 400 if invalid with field errors
3. verifyRecaptcha(recaptchaToken) → 400 { error: "Security check failed." } if false
4. Query DB: does email exist? → 409 { error: "Email already registered." } if yes
5. hashPassword(password)
6. INSERT user, get back id/email/name/role
7. signAccessToken, signRefreshToken(userId, rememberMe)
8. Hash refresh token: await hashPassword(rawRefreshToken)
9. Calculate expiresAt: rememberMe ? 30 days : 7 days from now
10. INSERT into refresh_tokens: { userId, tokenHash, expiresAt, isRevoked: false }
11. Build NextResponse.json({ success: true, user: { id, name, email, role } }, status 201)
12. setAuthCookies(response, accessToken, rawRefreshToken, rememberMe)
13. Return response
Wrap all in try/catch → 500 on unexpected error

FILE 14: src/app/api/auth/login/route.ts
POST handler. Steps in exact order:
1. Zod validate: { email, password, rememberMe boolean default false, recaptchaToken string }
2. verifyRecaptcha → 400 if fails
3. SELECT user WHERE email = email AND is_active = true
4. If no user OR !(await comparePassword(password, user.passwordHash)):
   → 401 { error: "Invalid email or password." }
   SAME message for both cases (Rule 10)
5. signAccessToken + signRefreshToken(user.id, rememberMe)
6. Hash refresh token, INSERT into refresh_tokens
7. setAuthCookies, return { success: true, user: { id, name, email, role } }

FILE 15: src/app/api/auth/logout/route.ts
POST handler:
1. getSession() to get userId (nullable — logout should work even if session expired)
2. If session exists: UPDATE refresh_tokens SET is_revoked = true WHERE user_id = userId
3. Build response = NextResponse.json({ success: true })
4. clearAuthCookies(response)
5. Return response

FILE 16: src/app/api/auth/refresh/route.ts
GET handler (called silently to get new access token):
1. Get refresh token: req.cookies.get("lexcode_refresh")?.value
2. If none → 401
3. verifyRefreshToken(token) → if null → 401
4. SELECT refresh_tokens WHERE user_id = payload.userId AND is_revoked = false
   AND expires_at > now()
5. Loop through results, check: await comparePassword(rawToken, stored.tokenHash)
6. If no match → 401 { error: "Refresh token not recognized" }
7. Revoke old token, insert new one (token rotation for security)
8. SELECT user from DB for current name/email/role
9. signAccessToken({ userId, email, name, role })
10. Build response = NextResponse.json({ success: true })
11. Set ONLY the access token cookie (refresh stays same)
12. Return response

FILE 17: src/app/api/auth/me/route.ts
GET handler:
1. getSession() → 401 if none
2. SELECT id, email, name, role, avatar_url, created_at FROM users WHERE id = session.userId
3. Return { user } — NEVER return passwordHash

FILE 18: src/app/api/auth/google/route.ts
See SKILL.md Pattern 9 for exact implementation.
Remember: google_oauth_state cookie is SameSite="lax" NOT "strict"

FILE 19: src/app/api/auth/google/callback/route.ts
See SKILL.md Pattern 9 for verification logic.
Error redirects:
- error param → /auth/login?error=google_denied
- state mismatch → /auth/login?error=state_mismatch
- no code → /auth/login?error=invalid_request
- exception → /auth/login?error=google_auth_failed
On success: setAuthCookies, redirect to /dashboard

FILE 20: src/middleware.ts
Protected prefixes: ["/dashboard", "/api/chat", "/api/sessions", "/api/documents"]
Auth routes (redirect if logged in): ["/auth/login", "/auth/signup"]

Logic:
1. Get pathname
2. Try getSessionFromRequest(req)
3. If isProtected AND no session → redirect /auth/login?redirect=CURRENT_PATH
4. If isAuthRoute AND session → redirect /dashboard
5. If session → add x-user-id and x-user-email headers, NextResponse.next({ request: { headers } })
6. Otherwise → NextResponse.next()

Export config with matcher array for all protected paths.

━━━ STEP 1D: Environment Variables ━━━

Add these to .env.example (add to .env.local with real values):
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here

━━━ STEP 1E: After All Files Are Written ━━━

Run: npx drizzle-kit push

Then write your TASK 1 COMPLETE REPORT using the template in SKILL.md.
STOP. Wait for permission before Task 2.
```

---

## ═══════════════════════════════════════════════════════════════
## TASK 2 — AI Infrastructure + Upload + Chat API Routes
## Recommended model: DeepSeek Coder V2, Qwen2.5-Coder 32B, or Llama 4 Maverick
## ═══════════════════════════════════════════════════════════════

```
TASK 2: Build the AI infrastructure, file upload system, sessions API,
and streaming chat API routes.
Read RULES.md and SKILL.md before starting. Do not write any client components yet.

FILE 1: src/lib/ai/client.ts
OpenRouter client using OpenAI SDK.
See CONTEXT.md "AI System" section for exact config.
Export: openrouter (OpenAI instance with baseURL = "https://openrouter.ai/api/v1")

FILE 2: src/lib/ai/models.ts
Export FREE_MODELS object:
  primary: "meta-llama/llama-4-maverick:free"
  fallback1: "nvidia/llama-3.1-nemotron-ultra-253b:free"
  fallback2: "qwen/qwen3-coder:free"
  fallback3: "openai/gpt-oss-20b:free"
  autoRouter: "openrouter/free"

Export MODEL_FOR_TOOL:
  legal: FREE_MODELS.primary
  code: FREE_MODELS.fallback3

Export streamWithFallback function.
See SKILL.md Pattern 13 for the EXACT implementation.
This is critical — implement it exactly as shown. The fallback chain must work.

FILE 3: src/lib/ai/legal-prompts.ts
Export LEGAL_SYSTEM_PROMPT — the full legal AI system prompt.
This prompt must:
- Declare the AI as "JusticeAI Legal" expert analyst
- State the mission: closing the global justice gap
- List expertise areas: contract law, consumer protection, tenant rights,
  employment law, loan agreements, terms of service, GDPR/CCPA/HIPAA
- Define the AI's voice: on the user's side, direct, educational, actionable
- Specify EXACT first analysis format:
  ## 📋 Document Overview (Type, Parties, Risk Level)
  ## 📊 Executive Summary (3-5 bullets)
  ## 🚨 Issues That Need Your Attention (each with: what it says, why it matters, what to do)
  ## ✅ Clauses That Protect You
  ## 📝 Recommended Next Steps
  ⚠️ Disclaimer at end
- Rule: Always explain legal terms when first used

Export buildLegalMessages(documentText, history, userMessage, userRole):
Returns array of { role: "system"|"user"|"assistant", content: string }
System message = LEGAL_SYSTEM_PROMPT + document text (truncated to 80000 chars)
If userRole === "general": append plain English instruction to system prompt
Include last 20 history messages
Add current userMessage as final user message

FILE 4: src/lib/ai/code-prompts.ts
Export CODE_SYSTEM_PROMPT — the full code review AI system prompt.
This prompt must:
- Declare the AI as "JusticeAI Code" senior staff engineer
- List expertise: OWASP Top 10 security, performance, SOLID principles,
  language-specific best practices, architecture review
- Specify EXACT review format:
  ## 🔍 Code Review Summary (Language, Lines, Quality Score X/10, issue counts)
  ## 🚨 Critical Issues (Fix Before Shipping)
  ## ⚠️ Warnings (Should Fix Soon)
  ## 💡 Suggestions (Makes Code Better)
  ## ✅ What's Done Well (NEVER skip this section)
  ## 📝 Refactored Version
- Rule: Always reference exact line numbers
- Rule: Always show the fix with code, not just describe the problem

Export buildCodeMessages(code, language, history, userMessage, userRole):
Same pattern as buildLegalMessages.
System message = CODE_SYSTEM_PROMPT + code block (truncated to 60000 chars)
If userRole === "general": append "explain all technical terms" instruction

FILE 5: src/app/api/uploadthing/core.ts
See SKILL.md Pattern 12 for exact implementation.
Auth middleware: getSession() → throw UploadThingError("Unauthorized") if null
Accept: pdf (16MB max), blob (16MB max for .docx)
Return from onUploadComplete: { userId, fileUrl, fileKey, fileName, fileSize }

FILE 6: src/app/api/uploadthing/route.ts
Single file — createRouteHandler from uploadthing/next
Export { GET, POST }

FILE 7: src/lib/uploadthing.ts
Export UploadDropzone and UploadButton typed with OurFileRouter.
See SKILL.md Pattern 12 last section.

FILE 8: src/app/api/sessions/route.ts
GET handler:
1. getSession() → 401 if none
2. Get toolType from URL searchParams (optional)
3. SELECT sessions WHERE user_id = userId AND is_archived = false
   Optional: AND tool_type = toolType
   ORDER BY updated_at DESC, LIMIT 50
4. Return { sessions }

POST handler:
1. getSession() → 401 if none
2. Zod: { toolType: enum("legal","code"), title?: string max 255, language?: string }
3. INSERT session with userId
4. Return { session } status 201

FILE 9: src/app/api/sessions/[sessionId]/route.ts
GET handler:
1. getSession() → 401 if none
2. SELECT session WHERE id = sessionId AND user_id = userId (BOTH conditions — security)
3. If not found → 404
4. SELECT messages WHERE session_id = sessionId ORDER BY created_at ASC
5. Return { session, messages }

DELETE handler:
1. getSession() → 401
2. Verify session belongs to user → 404 if not
3. UPDATE sessions SET is_archived = true (soft delete — never hard delete)
4. Return { success: true }

PATCH handler:
1. getSession() → 401
2. Verify ownership
3. Zod: { title?: string max 255, riskLevel?: enum("low","medium","high","critical") }
4. UPDATE session with provided fields + updatedAt = new Date()
5. Return { session }

FILE 10: src/app/api/sessions/[sessionId]/content/route.ts
PATCH handler (updates the content snapshot — used after code paste or doc upload):
1. getSession() → 401
2. Verify ownership → 404
3. Zod: { contentSnapshot: string max 100000, language?: string }
4. UPDATE session: content_snapshot, language, updated_at
5. Return { success: true }

FILE 11: src/app/api/documents/route.ts
POST handler (called after UploadThing completes, to save doc metadata to DB):
1. getSession() → 401
2. Zod: { sessionId uuid, fileName string, fileUrl string,
   fileKey string, fileSize?: number, mimeType?: string }
3. Verify session belongs to user → 404 if not
4. INSERT into documents
5. UPDATE sessions: document_url = fileUrl, document_name = fileName,
   document_type = mimeType?.includes("pdf") ? "pdf" : "docx"
6. Return { document } status 201

FILE 12: src/app/api/chat/legal/route.ts
POST handler — FULL streaming implementation.
Read SKILL.md Pattern 5 for the exact SSE streaming code structure.
Rate limit: 10 messages per minute per user (see SKILL.md Pattern 7 usage)

Steps in exact order:
1. getSession() → 401 if none
2. Rate limit check: rateLimiter("chat:" + session.userId, { max: 10, window: 60 })
   → 429 if exceeded
3. Zod validate body: { sessionId: z.string().uuid(), message: z.string().min(1).max(10000) }
4. SELECT session WHERE id = sessionId AND user_id = userId AND tool_type = "legal"
   → 404 if not found (includes ownership check)
5. SELECT last 20 messages WHERE session_id = sessionId ORDER BY created_at ASC
6. SELECT user role: SELECT role FROM users WHERE id = userId
7. INSERT user message into messages table NOW (before streaming starts)
8. Build aiMessages using buildLegalMessages(
     session.contentSnapshot ?? "",
     history.map(m => ({ role: m.role, content: m.content })),
     userMessage,
     user.role
   )
9. Create ReadableStream with encoder = new TextEncoder()
   In start(controller):
     Call streamWithFallback with toolType: "legal"
     onChunk: append to fullResponse, enqueue SSE chunk
     onDone: 
       - INSERT assistant message into messages (fullResponse)
       - UPDATE session: message_count += 2, updated_at = now
       - If session.title === "New Session": update title to first 60 chars of userMessage
       - Enqueue "data: [DONE]\n\n"
       - controller.close()
     onError:
       - Enqueue error SSE frame
       - controller.close()
10. Return new Response(stream, { SSE headers from SKILL.md Pattern 5 })

FILE 13: src/app/api/chat/code/route.ts
Same structure as legal route but:
- Validate toolType === "code" (not "legal")
- Use buildCodeMessages(session.contentSnapshot ?? "", session.language ?? "plaintext", ...)
- Rate limit key: "chat:" + session.userId (same)
- Everything else identical

After creating all files, run:
npx next build --dry-run
(or just check for TypeScript errors: npx tsc --noEmit)

Write TASK 2 COMPLETE REPORT using the template in SKILL.md.
STOP. Ask permission before Task 3.
```

---

## ═══════════════════════════════════════════════════════════════
## TASK 3 — Chat Hooks + Chat UI Components
## Recommended model: DeepSeek V3, Llama 4 Maverick, or Qwen 2.5 72B
## ═══════════════════════════════════════════════════════════════

```
TASK 3: Build all React hooks and chat UI components.
All files in this task are "use client" components.
Read RULES.md Rule 17 about when to use "use client".

FILE 1: src/hooks/useChat.ts
"use client"
Full streaming chat hook. See SKILL.md Pattern 6 for the SSE reading logic.

State: messages (UIChatMessage[]), isLoading (boolean), error (string | null)
Ref: abortControllerRef (for stopping generation)

UIChatMessage interface:
{ id: string, role: "user" | "assistant", content: string, createdAt: Date }

Function sendMessage(content: string): Promise<void>
  1. Return early if content is empty or isLoading is true
  2. setError(null), setIsLoading(true)
  3. Add user message optimistically with crypto.randomUUID() id
  4. Add empty assistant placeholder with unique id
  5. Create new AbortController, store in ref
  6. fetch /api/chat/${toolType} — POST with sessionId and message
  7. Read response body as stream (see SKILL.md Pattern 6 for exact parsing)
  8. On each SSE frame:
     - parsed.content → append to assistant placeholder message
     - parsed.error → setError, remove placeholder
     - [DONE] → break
  9. Catch: if AbortError → return (user stopped), else setError, remove placeholder
  10. Finally: setIsLoading(false)

Function stopGeneration(): void
  abortControllerRef.current?.abort()
  setIsLoading(false)

Return: { messages, isLoading, error, sendMessage, stopGeneration, clearError, setMessages }

FILE 2: src/hooks/useSessions.ts
"use client"
Manages the list of chat sessions for the sidebar.

State: sessions (ChatSession[]), isLoading, error
Effect: fetch /api/sessions?toolType=${toolType} when toolType changes

Functions:
- createSession(toolType, title?, language?): POST /api/sessions, prepend to sessions, return new session
- deleteSession(id): DELETE /api/sessions/${id}, remove from sessions state
- refreshSessions(): re-fetch all sessions

Return: { sessions, isLoading, error, createSession, deleteSession, refreshSessions }

FILE 3: src/hooks/useSession.ts
"use client"
Auth session hook for client components.

State: user (UserProfile | null), isLoading (boolean)

Effect on mount:
  fetch /api/auth/me
  On success: setUser(data.user)
  On 401: setUser(null)
  Finally: setIsLoading(false)

Return: { user, isLoading, isAuthenticated: user !== null }

FILE 4: src/components/chat/TypingIndicator.tsx
"use client"
Three dots with staggered bounce animation.
Each dot: w-2 h-2 rounded-full bg-indigo-400
Animation: Tailwind animate-bounce
Delays: dot1=0ms, dot2=150ms (style={{ animationDelay: "150ms" }}), dot3=300ms
Layout: flex items-center gap-1
Wrap in a div with padding that matches assistant message style

FILE 5: src/components/chat/ChatMessage.tsx
"use client"
Renders a single chat message.

Props: message: UIChatMessage, isStreaming?: boolean

User message (role === "user"):
  - Align: flex justify-end
  - Bubble: bg-[#6366F1] text-white p-3 rounded-2xl rounded-tr-sm max-w-[80%]
  - Timestamp: text-xs text-gray-500 text-right mt-1

Assistant message (role === "assistant"):
  - Align: flex justify-start
  - Bubble: bg-[#1a1a2e] border border-[#1E1E2E] p-4 rounded-2xl rounded-tl-sm max-w-[85%]
  - If isStreaming AND content === "": render <TypingIndicator />
  - If content exists: render with ReactMarkdown

ReactMarkdown component overrides:
  h1: className="text-xl font-bold mt-4 mb-2 text-white"
  h2: className="text-lg font-semibold mt-3 mb-2 text-white"
  h3: className="text-base font-semibold mt-2 mb-1 text-indigo-300"
  p: className="mb-3 leading-relaxed text-gray-200"
  ul: className="list-disc pl-5 mb-3 space-y-1"
  ol: className="list-decimal pl-5 mb-3 space-y-1"
  li: className="text-gray-200"
  strong: className="font-semibold text-white"
  blockquote: className="border-l-4 border-indigo-500 pl-4 italic text-gray-400 my-2"
  code: if inline → <code className="bg-gray-800 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-sm">
       if block → <CodeBlock code={code} language={language} />

See SKILL.md Pattern 11 for the code component detection logic.

FILE 6: src/components/chat/ChatInput.tsx
"use client"
Text input area for sending messages.

Props:
  onSend: (message: string) => void
  onStop: () => void
  isLoading: boolean
  disabled?: boolean
  placeholder?: string

State: value (string)

Textarea:
  - Font: className includes "font-mono" (uses JetBrains Mono via CSS variable)
  - Background: bg-[#111118]
  - Border: border border-[#1E1E2E] focus:border-indigo-500 focus:outline-none
  - Padding: p-3
  - Rounded: rounded-xl
  - Width: w-full
  - Min rows: 2, max rows: 6
  - Auto-resize: use useRef + useEffect to adjust height based on scrollHeight
  - onKeyDown:
    if e.key === "Enter" AND !e.shiftKey: e.preventDefault(), onSend(value), setValue("")
    if e.key === "Enter" AND e.shiftKey: allow newline (default behavior)
  - maxLength: 10000

Below textarea: flex row with:
  Left: character counter
    Normal: text-xs text-gray-500 "{value.length}/10000"
    Warning (>9000): text-xs text-red-400 "{value.length}/10000"
  Right: button area
    If isLoading: <button onClick={onStop} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">⏹ Stop</button>
    If not loading: <button onClick={() => { onSend(value); setValue("") }} disabled={!value.trim() || value.length > 10000} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg text-sm">Send ↑</button>

FILE 7: src/components/chat/ChatWindow.tsx
"use client"
The main chat container — combines everything.

Props:
  sessionId: string
  toolType: "legal" | "code"
  initialMessages: UIChatMessage[]

Uses useChat({ sessionId, toolType, initialMessages })

Layout (flex column, full height of parent):
  Top section (flex-1 overflow-hidden):
    Use ScrollArea from shadcn/ui
    Inside: map messages → <ChatMessage> components
    Last assistant message when isLoading: isStreaming={true}
    After all messages: <div ref={bottomRef} /> (for auto-scroll)
    Error banner: if error → <ErrorBanner message={error} onDismiss={clearError} />
    
  Auto-scroll effect:
    useRef on bottomRef
    useEffect: when messages.length changes → bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  
  Empty state (if messages.length === 0 AND !isLoading):
    toolType === "legal": <EmptyState icon="⚖️" title="Start your legal analysis" description="Ask a question or upload a document to begin" />
    toolType === "code": <EmptyState icon="💻" title="Start your code review" description="Paste your code above or ask a question" />
  
  Bottom section (flex-shrink-0):
    <ChatInput onSend={sendMessage} onStop={stopGeneration} isLoading={isLoading} />

FILE 8: src/components/code/CodeBlock.tsx
"use client"
Syntax-highlighted code display with copy button.

Props: code: string, language?: string, filename?: string

State: copied (boolean)

Layout:
  Outer div: rounded-lg overflow-hidden border border-[#1E1E2E]
  Header bar: flex justify-between items-center px-4 py-2 bg-[#0D0D14]
    Left: language badge (small, indigo text, gray bg) or "code"
    Right: <button onClick={handleCopy}>
      If copied: "✓ Copied!" text-green-400
      If not: "Copy" text-gray-400 hover:text-white
    After copy: setTimeout 2000ms to reset copied state
  
  If filename: show above header in small muted text
  
  Code area: use Prism SyntaxHighlighter with oneDark theme
    import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
    import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
    Show line numbers. Language = language prop or "text".

FILE 9: src/components/legal/RiskBadge.tsx
Props: level: "low" | "medium" | "high" | "critical" | null | undefined
If null or undefined: return null (render nothing)

Styles by level:
  low: "bg-green-500/20 text-green-400 border border-green-500/30" with "🟢 LOW RISK"
  medium: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" with "🟡 MEDIUM RISK"
  high: "bg-orange-500/20 text-orange-400 border border-orange-500/30" with "🔴 HIGH RISK"
  critical: "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" with "🚨 CRITICAL"

Base classes: "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"

FILE 10: src/components/shared/LoadingSpinner.tsx
Props: size?: "sm" | "md" | "lg" (default "md")
sm: w-4 h-4, md: w-8 h-8, lg: w-12 h-12
div with: rounded-full border-4 border-indigo-600 border-t-transparent animate-spin

FILE 11: src/components/shared/EmptyState.tsx
Props: icon: string, title: string, description: string,
       action?: { label: string; onClick: () => void }
Centered layout, flex col, items-center, gap-4
icon: text-5xl
title: text-lg font-medium text-gray-300
description: text-sm text-gray-500 text-center max-w-sm
action (if provided): indigo button

FILE 12: src/components/shared/ErrorBanner.tsx
Props: message: string, onDismiss?: () => void
Red background: bg-red-500/10 border border-red-500/20
Flex row: warning icon + message text + optional X dismiss button
Rounded, padded, full width

After creating all files:
Run: npx tsc --noEmit
Report any TypeScript errors.

Write TASK 3 COMPLETE REPORT using the template in SKILL.md.
STOP. Ask permission before Task 4.
```

---

## ═══════════════════════════════════════════════════════════════
## TASK 4 — Layout, Pages, Auth Forms, Dashboard
## Recommended model: Llama 4 Maverick, DeepSeek V3, or Qwen 2.5 72B
## ═══════════════════════════════════════════════════════════════

```
TASK 4: Build the landing page, auth pages, dashboard, and all layout components.
This task has many UI files. Write each one completely. No partial files.

FILE 1: src/app/globals.css
Tailwind v4 with CSS variables. See CONTEXT.md "Design System" section for all color values.
Include:
- @import "tailwindcss"
- :root block with ALL CSS variables from CONTEXT.md
- body: background-color, color, font-family
- Custom thin scrollbar styles (webkit)
- .gradient-text utility class (background clip text, indigo to purple to emerald gradient)

FILE 2: src/app/layout.tsx
SERVER component (no "use client").
Import Inter and JetBrains_Mono from next/font/google.
Inter: variable "--font-sans", subsets ["latin"]
JetBrains_Mono: variable "--font-mono", subsets ["latin"]
Apply both variables to <html> element.
Add class="dark" to <html>.
Wrap children in TooltipProvider from "@/components/ui/tooltip".
Metadata: title template, description, icons.

FILE 3: src/app/icon.tsx
Dynamic favicon using Next.js ImageResponse.
Size: 32x32. Dark background #0A0A0F. "⚖️" emoji centered.
See the ImageResponse import: import { ImageResponse } from "next/og"
Export: size, contentType, default function

FILE 4: src/app/page.tsx
SERVER component. The public landing page.
Import Link from "next/link". No "use client" — no interactivity needed.

Build these 7 sections in order:

SECTION 1 - PUBLIC NAVBAR:
  Fixed top, full width, h-[60px], bg-[#111118] border-b border-[#1E1E2E]
  Left: "⚖️ JusticeAI" — text with gradient-text class, link to /
  Right: "Sign In" link → /auth/login, "Get Started Free" button → /auth/signup

SECTION 2 - HERO:
  Full viewport height (min-h-screen), flex center
  Very large heading (text-5xl or text-6xl):
    "Legal & Code Help,"
    New line: "For Everyone." (gradient-text)
  Subheading (text-xl text-gray-400 max-w-2xl text-center):
    "92% of people get no legal help when they need it most.
    JusticeAI gives everyone — in Ghana, the US, India, everywhere —
    instant AI-powered legal document analysis and code review. Free."
  Two CTA buttons:
    "⚖️ Analyze a Document" → /auth/signup (indigo, large)
    "💻 Review My Code" → /auth/signup (outline, large)
  Three badges below:
    "⚖️ Legal Analysis" | "💻 Code Review" | "🌍 Open to Everyone"

SECTION 3 - THE PROBLEM (most important section):
  Background: slightly lighter than page (#111118)
  Heading: "The Problem We're Solving"
  Subheading: "The justice gap is global. Not just American."
  Three stat cards side by side (grid cols 3 on desktop, 1 on mobile):
    Card 1: "92%" large number, "of people get no legal help for serious legal problems" — Source: Legal Services Corp
    Card 2: "53%" large number, "don't know if they could find or afford a lawyer when they need one"
    Card 3: "75%" large number, "of civil court cases have at least one party with no legal representation"
  Below: paragraph text:
    "In Ghana, Nigeria, India, and across the Global South, the problem is worse.
    Legal aid barely exists. A single lawyer consultation costs more than a week's wages.
    Millions sign documents they don't understand. We built JusticeAI to change that."

SECTION 4 - TWO TOOLS:
  Heading: "Two Tools. One Mission."
  Two cards side by side:
    Legal card (border-[#8B5CF6] border):
      "⚖️ Legal Document Analyzer"
      "Upload any contract, lease, NDA, loan, or employment agreement.
      Get instant risk analysis, clause-by-clause breakdown in plain English,
      and a persistent AI chat for follow-up questions."
      "For lawyers, tenants, freelancers, employees, and everyone."
      Button: "Try Legal Analyzer →" → /auth/signup
    Code card (border-[#10B981] border):
      "💻 AI Code Reviewer"
      "Paste any code for a security scan, bug detection, performance review,
      and expert explanations anyone can understand."
      "For developers, students, freelancers, and everyone."
      Button: "Try Code Reviewer →" → /auth/signup

SECTION 5 - HOW IT WORKS:
  Heading: "Up and running in 60 seconds"
  Three steps:
    1. "Create your free account" — 30 seconds. No credit card. Ever.
    2. "Upload or paste your content" — Drop a PDF or paste your code.
    3. "Get expert AI analysis" — Ask follow-up questions in plain English.

SECTION 6 - WHO IT'S FOR:
  Heading: "Built For Everyone"
  6-card grid (2 cols mobile, 3 cols desktop):
    👩‍⚖️ Lawyers — "Review contracts faster. Flag risks automatically."
    🏠 Tenants — "Understand your lease. Know your rights before signing."
    💼 Freelancers — "Protect your work. Review client contracts instantly."
    👨‍💻 Developers — "Security audits. Bug detection. Better code."
    🏢 Small Businesses — "Understand vendor agreements and partnership contracts."
    🎓 Students — "Decode loan documents. Get code reviews for assignments."

SECTION 7 - FOOTER:
  Left: "⚖️ JusticeAI" + "Justice for everyone."
  Center: Home, Sign Up, Sign In links
  Right: "© {new Date().getFullYear()} JusticeAI. Built in Ghana. Designed for the world."

FILE 5: src/components/auth/GoogleButton.tsx
"use client"
Props: mode: "signin" | "signup"
State: isLoading (boolean)
On click: setIsLoading(true), window.location.href = "/api/auth/google"
Google SVG logo (find the SVG with correct Google brand colors online or use a simple G)
Full width button, white bg, dark border, dark text
Text: mode === "signup" ? "Continue with Google" : "Sign in with Google"
Show LoadingSpinner when isLoading

FILE 6: src/components/auth/SignupForm.tsx
"use client" — full signup form.

State: name, email, password, confirmPassword, role ("both"), rememberMe, isLoading, error, showPassword, showConfirmPassword

Fields:
1. Full Name input (text)
2. Email input (email type)
3. Password input with show/hide toggle button (eye icon from lucide-react)
4. Confirm Password with show/hide toggle
5. Role picker — 4 clickable cards:
   ⚖️ Lawyer | 💻 Engineer | 🙋 General User | 🌍 Both (default selected)
   Selected card: indigo border and slightly lighter bg
6. Remember Me checkbox
7. Google divider + GoogleButton mode="signup"
8. Submit button: "Create Account" (indigo, full width, shows spinner when loading)

reCAPTCHA v3:
  Load script in useEffect (see SKILL.md Pattern 10)
  Get token on submit: getRecaptchaToken("signup")

Validation on submit:
  - All fields required
  - Password min 8 chars
  - Passwords must match
  - Show inline error if not

Submit: POST /api/auth/signup with all fields
On success: router.push("/dashboard")
On error: show error message in red alert

Divider between Google button and form:
  Line — "or continue with email" — Line

Footer text: "Already have an account?" + Link to /auth/login

FILE 7: src/components/auth/LoginForm.tsx
"use client"

Props: initialError?: string

If initialError: show in red alert at very top

Fields:
1. Email input
2. Password input with show/hide toggle
3. Remember Me checkbox
4. Google divider + GoogleButton mode="signin"
5. Submit button: "Sign In"

reCAPTCHA v3: same pattern, action: "login"
Submit: POST /api/auth/login
On success: router.push("/dashboard")

Footer: "Don't have an account?" + Link to /auth/signup

FILE 8: src/app/auth/signup/page.tsx
SERVER component. Split layout.

Desktop (md:flex):
  Left panel (hidden on mobile, md:flex md:w-1/2):
    Dark gradient background (indigo to purple)
    "⚖️ JusticeAI" large logo
    Tagline: "Justice for everyone."
    Three feature bullets with checkmarks:
      ✓ Legal analysis in seconds
      ✓ Code review for everyone
      ✓ Free, forever. No credit card.
  Right panel (w-full md:w-1/2):
    Centered vertically and horizontally
    "Create your account" heading
    <SignupForm />

FILE 9: src/app/auth/login/page.tsx
SERVER component.

Read searchParams.error and map to messages:
  google_denied → "Google sign-in was cancelled."
  state_mismatch → "Security verification failed. Please try again."
  google_auth_failed → "Google sign-in failed. Please try again or use email."
  invalid_request → "Invalid sign-in request. Please try again."

Same split layout as signup.
Left panel different text: "Welcome back."
Pass mapped error message as initialError to LoginForm.

FILE 10: src/components/layout/Navbar.tsx
"use client"
Props: user: { name: string; email: string; role: string; avatarUrl?: string | null }

Fixed top, z-50, full width, h-[60px]
Background: bg-[#111118] border-b border-[#1E1E2E]

Left: Link to /dashboard
  "⚖️ JusticeAI" with gradient-text class

Right: DropdownMenu from shadcn/ui
  Trigger: Avatar component (show first letter of name if no avatarUrl)
  Dropdown content:
    Non-clickable header: user.name (font-medium) + user.email (text-sm text-gray-500)
    Separator
    Item: Dashboard → router.push("/dashboard")
    Item: ⚖️ Legal Analyzer → router.push("/dashboard/legal")
    Item: 💻 Code Reviewer → router.push("/dashboard/code")
    Separator
    Item: Sign Out → async: POST /api/auth/logout, then router.push("/")

FILE 11: src/components/layout/Sidebar.tsx
"use client"
Props: toolType: "legal" | "code", currentSessionId?: string

Width: w-[280px], h-full (fills parent), bg-[#111118]
Border right: border-r border-[#1E1E2E]
Overflow: overflow-y-auto

Top:
  Tool title: toolType === "legal" ? "⚖️ Legal Sessions" : "💻 Code Sessions"
  "New Session" button → calls createSession(toolType), then router.push to new session URL

Session list from useSessions(toolType):
  Loading: 3 skeleton items
  Empty: "No sessions yet. Start a new one." in gray text
  Each item:
    onClick → router.push(`/dashboard/${toolType}/${session.id}`)
    Active (session.id === currentSessionId): indigo left border + slightly lighter bg
    Title: truncate at 35 chars + "..." if longer
    Below title: small gray text showing date + message count badge
    Hover: slightly lighter background

FILE 12: src/app/dashboard/layout.tsx
SERVER component (no "use client").
1. getSession() → if null redirect("/auth/login")
2. SELECT id, name, email, role, avatar_url FROM users WHERE id = session.userId
3. Layout:
   <div className="flex flex-col h-screen overflow-hidden">
     <Navbar user={user} />
     <div className="flex flex-1 overflow-hidden pt-[60px]">
       {children}
     </div>
   </div>

FILE 13: src/app/dashboard/page.tsx
SERVER component.
1. getSession() → if null redirect
2. SELECT user from DB
3. Display:
   Main area (flex-1, p-8):
     Greeting: "Welcome back, {user.name}" (text-3xl font-bold)
     Role badge below greeting
     "Choose a Tool" section heading
     Two large cards (grid 2 cols):
       LEGAL CARD: purple border, ⚖️, "Legal Document Analyzer",
         description, "Start Analysis →" button → /dashboard/legal
       CODE CARD: emerald border, 💻, "AI Code Reviewer",
         description, "Review Code →" button → /dashboard/code
     "Recent Sessions" heading
     Fetch last 5 sessions from DB (server component can use db directly)
     List them with type badge, title, date, link to session

FILE 14: src/app/dashboard/legal/page.tsx
"use client"
State: isCreatingSession (boolean)

On mount: check if there are existing sessions (useSessions("legal"))

Left side: <Sidebar toolType="legal" />
Right side (flex-1, overflow-y-auto):
  Heading: "⚖️ Legal Document Analyzer"
  Subheading: "Upload a contract, lease, or any legal document for instant AI analysis."
  
  Upload area: <DocumentUploader>
    On upload complete:
    1. createSession("legal", fileName)
    2. POST /api/documents with file info and new sessionId
    3. Auto-navigate: router.push(`/dashboard/legal/${newSession.id}`)
  
  Divider: "or"
  
  Question input: "Have a legal question? Ask directly"
  Text input + "Ask" button
  On submit:
    1. createSession("legal", "Legal Question")
    2. router.push to new session (chat will handle the first message)

FILE 15: src/app/dashboard/legal/[sessionId]/page.tsx
SERVER component.
1. getSession() → redirect if none
2. Fetch GET /api/sessions/${sessionId} (use fetch with correct base URL)
3. If session.toolType !== "legal" → redirect "/dashboard"
4. Convert messages to UIChatMessage format (dates from strings to Date objects)
5. Layout:
   Flex row full height
   Left: <Sidebar toolType="legal" currentSessionId={sessionId} />
   Main (flex-1, flex col, overflow-hidden):
     Top bar (if document exists):
       File icon, document name, <RiskBadge level={session.riskLevel} />, link to document
     If no document: compact upload area at top
     <ChatWindow sessionId initialMessages toolType="legal" />

FILE 16: src/app/dashboard/code/page.tsx
"use client"
State: code (string), language ("javascript"), isSubmitting (boolean)

Left: <Sidebar toolType="code" />
Right (flex-1):
  Heading: "💻 AI Code Reviewer"
  Subheading: "Paste your code for expert security and quality review."
  <LanguageSelector value={language} onChange={setLanguage} />
  <CodeEditor value={code} onChange={setCode} language={language} />
  "Review My Code →" button:
    Disabled if code is empty
    On click:
    1. setIsSubmitting(true)
    2. createSession("code", "Code Review", language)
    3. PATCH /api/sessions/${newSession.id}/content with { contentSnapshot: code, language }
    4. router.push(`/dashboard/code/${newSession.id}`)

FILE 17: src/app/dashboard/code/[sessionId]/page.tsx
SERVER component.
1. getSession() → redirect if none
2. Fetch session + messages
3. If toolType !== "code" → redirect "/dashboard"
4. Layout:
   Left: <Sidebar toolType="code" currentSessionId={sessionId} />
   Main:
     Top bar: language badge, truncated code preview (first 80 chars),
       "New Review" button → /dashboard/code
     <ChatWindow sessionId initialMessages toolType="code" />

FILE 18: src/app/dashboard/admin/page.tsx
SERVER component.
1. getSession() → if role !== "admin" → redirect("/dashboard")
2. Query DB for stats (server component uses db directly):
   - COUNT users
   - COUNT sessions
   - COUNT messages
   - COUNT documents
3. SELECT all users: id, name, email, role, is_active, created_at
4. Display:
   "Admin Panel" heading
   4 stat cards: Users, Sessions, Messages, Documents
   Users table: all columns shown above

FILE 19: src/components/legal/DocumentUploader.tsx
"use client"
Props: onUploadComplete: (fileUrl: string, fileName: string, fileKey: string, fileSize: number) => void

Use UploadDropzone from "@/lib/uploadthing"
endpoint="legalDocumentUploader"
Style the dropzone:
  Dashed border border-dashed border-[#8B5CF6] border-2
  Rounded-xl, p-8, flex col center
  "⚖️" large emoji
  "Drop your PDF or DOCX here" text
  "or click to browse" subtext
  "PDF, DOCX — Max 16MB" small muted text
Show progress while uploading
onClientUploadComplete: extract first file, call onUploadComplete
onUploadError: show error message below the dropzone in red

FILE 20: src/components/code/LanguageSelector.tsx
"use client"
Props: value: string, onChange: (v: string) => void
Use shadcn Select component
Options list: typescript, javascript, python, go, rust, java, c, cpp,
  csharp, php, ruby, swift, kotlin, sql, bash, dockerfile, yaml, json, html, css, solidity
Placeholder: "Select language"

FILE 21: src/components/code/CodeEditor.tsx
"use client"
Props: value: string, onChange: (v: string) => void, language: string

Outer div: relative, rounded-xl overflow-hidden, border border-[#1E1E2E]

Header: small bar at top showing language name, dark bg

Textarea:
  className includes font-mono (var(--font-mono))
  Background: bg-[#0D0D14]
  Text: text-gray-100
  Width: w-full
  Min height: min-h-[300px]
  Padding: p-4
  Resize: resize-y
  No outline on focus (outline-none)
  spellCheck={false}
  onKeyDown: if Tab key → e.preventDefault(), insert 2 spaces at cursor position
  placeholder: "Paste your code here..."
  value and onChange wired up

Bottom bar: small, shows character count right-aligned

Write TASK 4 COMPLETE REPORT.
STOP. Ask permission before Task 5.
```

---

## ═══════════════════════════════════════════════════════════════
## TASK 5 — Final Wiring, Fixes, and Config
## Recommended model: DeepSeek V3 or Qwen 2.5 72B
## ═══════════════════════════════════════════════════════════════

```
TASK 5: Final wiring, configuration files, environment template, and project polish.
This is the last task. After this, the app should run.

FILE 1: .env.example (in project root)
Create this file with ALL environment variables documented.
Every variable must have a comment explaining what it is and where to get it.
Include the Upstash Redis variables.
See CONTEXT.md "Environment Variables" section for full list.
Format:
# ── SECTION NAME ──────────────────────────
# Description of what this is and where to get it
VARIABLE_NAME=example_value_or_placeholder

FILE 2: next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",  // Google profile photos
      },
      {
        protocol: "https",
        hostname: "uploadthing.com",             // UploadThing CDN
      },
      {
        protocol: "https",
        hostname: "utfs.io",                     // UploadThing CDN alternate
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@neondatabase/serverless"],
  },
}
export default nextConfig

FILE 3: package.json scripts section
Add these scripts (keep all existing scripts):
"db:push": "drizzle-kit push",
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate",
"db:studio": "drizzle-kit studio",
"type-check": "tsc --noEmit"

FILE 4: src/lib/utils.ts
Make sure this file exists and exports:
- cn(...classes): string — class name merger (uses clsx + tailwind-merge if installed,
  otherwise use simple filter join)
- formatDate(date: Date | string): string — formats to "Jan 15, 2026" style
- formatRelativeTime(date: Date | string): string — "2 hours ago", "3 days ago", etc.
- truncate(str: string, maxLength: number): string — truncates with "..."

FILE 5: VERIFY AND FIX — Check all imports

Go through each file listed below and verify the imports are correct.
If any import is wrong, fix it. Report what you fixed.

Check list:
1. src/lib/db/index.ts — imports neon from "@neondatabase/serverless", drizzle from "drizzle-orm/neon-http"
2. src/lib/auth/tokens.ts — imports SignJWT, jwtVerify from "jose" only
3. src/lib/auth/password.ts — imports from "bcryptjs" not "bcrypt"
4. src/lib/ai/client.ts — imports OpenAI from "openai"
5. src/app/api/uploadthing/core.ts — imports from "uploadthing/next" and "uploadthing/server"
6. src/lib/uploadthing.ts — imports from "@uploadthing/react"
7. Any file using react-syntax-highlighter — try this import first:
   import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
   If it causes an error, use:
   import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism"
8. All "use client" files — confirm none import from "@/lib/db" or "jose" or "bcryptjs"
9. All API route files — confirm they import getSession from "@/lib/auth/session"
10. src/middleware.ts — confirm it imports from "@/lib/auth/session" and uses jose

FILE 6: VERIFY AND FIX — Check all "use client" markers

These files MUST have "use client" at the very first line:
- src/hooks/useChat.ts
- src/hooks/useSessions.ts
- src/hooks/useSession.ts
- src/components/auth/LoginForm.tsx
- src/components/auth/SignupForm.tsx
- src/components/auth/GoogleButton.tsx
- src/components/chat/ChatWindow.tsx
- src/components/chat/ChatMessage.tsx
- src/components/chat/ChatInput.tsx
- src/components/chat/TypingIndicator.tsx
- src/components/code/CodeBlock.tsx
- src/components/code/CodeEditor.tsx
- src/components/code/LanguageSelector.tsx
- src/components/legal/DocumentUploader.tsx
- src/components/legal/RiskBadge.tsx
- src/components/layout/Navbar.tsx
- src/components/layout/Sidebar.tsx
- src/components/shared/LoadingSpinner.tsx
- src/components/shared/EmptyState.tsx
- src/components/shared/ErrorBanner.tsx
- src/app/dashboard/legal/page.tsx
- src/app/dashboard/code/page.tsx

These files must NOT have "use client":
- src/app/layout.tsx
- src/app/page.tsx
- src/app/dashboard/layout.tsx
- src/app/dashboard/page.tsx
- src/app/dashboard/legal/[sessionId]/page.tsx
- src/app/dashboard/code/[sessionId]/page.tsx
- src/app/dashboard/admin/page.tsx
- All src/app/api/**/*.ts files
- All src/lib/**/*.ts files

FILE 7: FINAL CHECK — Run these commands in the terminal

Run each command and report the output:

Command 1: npx tsc --noEmit
This checks for TypeScript errors. Fix any errors reported.

Command 2: npx next build
This checks if the app builds successfully.
If there are build errors: fix them and run again.

Command 3 (if build succeeds): npx next dev
Start the dev server. Confirm it starts without errors.

━━━ FINAL REPORT ━━━

After all fixes and the build succeeds, write a comprehensive final report:
1. List every file in the project (all tasks 1-5)
2. Confirm all TypeScript errors are resolved
3. Confirm the build succeeds
4. List the test steps the user should follow:
   a. Open http://localhost:3000 — does landing page load?
   b. Go to /auth/signup — create account — does it redirect to /dashboard?
   c. Go to /dashboard/legal — upload a PDF — does AI analysis stream?
   d. Go to /dashboard/code — paste code — does review stream?
   e. Sign out, sign in with Google — does it work?
   f. Refresh page — are sessions still there?

5. List any remaining known issues or things that need manual testing
6. Upstash Redis setup instructions:
   - Go to upstash.com
   - Create free account
   - Create new Redis database (free tier)
   - Copy REST URL and REST TOKEN
   - Add to .env.local as UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN

TASK 5 IS COMPLETE. The build is done.
```

---

## ═══════════════════════════════════════════════════════════════
## UPSTASH REDIS SETUP (Do this after Task 1 completes)
## ═══════════════════════════════════════════════════════════════

This is a separate setup step you do in your browser, not in OpenCode.

1. Open https://upstash.com in your browser
2. Click "Sign Up Free" — sign up with Google or email
3. After login: click "Create Database"
4. Settings:
   - Name: justiceai-redis
   - Type: Regional
   - Region: US-East-1 (or closest to you)
   - Plan: Free
5. Click "Create"
6. On the database page: look for "REST API" section
7. Copy "UPSTASH_REDIS_REST_URL" — looks like: https://moving-xxx.upstash.io
8. Copy "UPSTASH_REDIS_REST_TOKEN" — long token string
9. Paste both into your .env.local file

Done. Redis is now connected.
