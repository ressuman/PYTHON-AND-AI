# JUSTICEAI — SKILL.md
## Technical Patterns, Code Templates, and Implementation Reference

Read this when you need to know HOW to implement something.
Every pattern here is verified and correct for this stack.

---

## PATTERN 1: Drizzle + Neon Query Patterns

### Select one record
```typescript
import { eq, and } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"

const [user] = await db
  .select({ id: users.id, email: users.email, name: users.name, role: users.role })
  .from(users)
  .where(eq(users.email, email))
  .limit(1)
// user is undefined if not found — always check before using
```

### Insert and get back
```typescript
const [newUser] = await db
  .insert(users)
  .values({ name, email, passwordHash, role })
  .returning({ id: users.id, email: users.email, name: users.name, role: users.role })
```

### Update
```typescript
await db
  .update(sessions)
  .set({ title: newTitle, updatedAt: new Date() })
  .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)))
```

### Select with join (not needed often — prefer separate queries)
```typescript
const result = await db
  .select()
  .from(messages)
  .where(eq(messages.sessionId, sessionId))
  .orderBy(asc(messages.createdAt))
  .limit(20)
```

---

## PATTERN 2: JWT Token Handling

### Sign access token
```typescript
import { SignJWT } from "jose"

const secret = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!)
const token = await new SignJWT({ userId, email, name, role, tokenType: "access" })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuedAt()
  .setExpirationTime("15m")
  .sign(secret)
```

### Verify token
```typescript
import { jwtVerify } from "jose"

try {
  const { payload } = await jwtVerify(
    token,
    new TextEncoder().encode(process.env.JWT_ACCESS_SECRET!)
  )
  return payload as AccessTokenPayload
} catch {
  return null // expired, invalid, or tampered
}
```

---

## PATTERN 3: Set Cookies on Response

```typescript
import { NextResponse } from "next/server"

const isProd = process.env.NODE_ENV === "production"
const response = NextResponse.json({ success: true })

// Access token (15 min)
response.cookies.set("lexcode_access", accessToken, {
  httpOnly: true,
  secure: isProd,
  sameSite: "strict",
  path: "/",
  maxAge: 60 * 15, // 15 minutes in seconds
})

// Refresh token (7 days or 30 days)
response.cookies.set("lexcode_refresh", refreshToken, {
  httpOnly: true,
  secure: isProd,
  sameSite: "strict",
  path: "/",
  maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24 * 7,
})
```

---

## PATTERN 4: Read Cookies in Server

```typescript
// In API routes and Server Components
import { cookies } from "next/headers"
const cookieStore = await cookies() // ← must await in Next.js 15
const token = cookieStore.get("lexcode_access")?.value

// In Middleware (uses NextRequest)
const token = req.cookies.get("lexcode_access")?.value
```

---

## PATTERN 5: SSE Streaming Response

```typescript
export async function POST(req: NextRequest) {
  // ... auth + validation ...

  const encoder = new TextEncoder()
  let fullResponse = ""

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await streamWithFallback({
          messages: aiMessages,
          toolType: "legal",
          onChunk: (chunk) => {
            fullResponse += chunk
            // Format: "data: JSON\n\n" — the double newline is REQUIRED
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`)
            )
          },
          onDone: async () => {
            // Save to DB after stream completes
            await db.insert(messages).values({
              sessionId, userId: session.userId,
              role: "assistant", content: fullResponse,
            })
            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
            controller.close()
          },
          onError: (err) => {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: err })}\n\n`)
            )
            controller.close()
          },
        })
      } catch (err) {
        console.error("[STREAM ERROR]", err)
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: "Stream failed" })}\n\n`)
        )
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no", // Required for Vercel/Nginx streaming
    },
  })
}
```

---

## PATTERN 6: Client-Side SSE Reading

```typescript
const res = await fetch(`/api/chat/${toolType}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ sessionId, message: content }),
  signal: abortController.signal,
})

if (!res.body) throw new Error("No stream body")

const reader = res.body.getReader()
const decoder = new TextDecoder()
let buffer = ""

while (true) {
  const { done, value } = await reader.read()
  if (done) break

  buffer += decoder.decode(value, { stream: true })
  const lines = buffer.split("\n")
  buffer = lines.pop() ?? "" // keep incomplete line in buffer

  for (const line of lines) {
    if (!line.startsWith("data: ")) continue
    const data = line.slice(6).trim()
    if (data === "[DONE]") break

    try {
      const parsed = JSON.parse(data)
      if (parsed.error) { /* handle error */ }
      if (parsed.content) { /* append to message */ }
    } catch {
      // Skip malformed SSE frames silently
    }
  }
}
```

---

## PATTERN 7: Upstash Redis Rate Limiter

```typescript
// src/lib/redis.ts
import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// src/lib/rate-limit.ts
import { redis } from "./redis"

interface RateLimitResult {
  success: boolean
  remaining: number
  reset: number
}

export async function rateLimiter(
  identifier: string,
  options: { max: number; window: number } // window in seconds
): Promise<RateLimitResult> {
  const key = `rate_limit:${identifier}`
  const now = Math.floor(Date.now() / 1000)
  const windowStart = now - options.window

  try {
    // Use Redis sorted set to track request timestamps
    const pipeline = redis.pipeline()
    pipeline.zremrangebyscore(key, 0, windowStart)    // Remove old entries
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` })
    pipeline.zcard(key)                                // Count requests in window
    pipeline.expire(key, options.window)               // Auto-expire key
    const results = await pipeline.exec()

    const count = results[2] as number

    return {
      success: count <= options.max,
      remaining: Math.max(0, options.max - count),
      reset: now + options.window,
    }
  } catch (err) {
    // If Redis fails, allow the request (fail open — don't block users)
    console.error("[RATE LIMIT ERROR]", err)
    return { success: true, remaining: options.max, reset: now + options.window }
  }
}
```

### Using Rate Limiter in API Routes
```typescript
// In /api/chat/legal/route.ts
const session = await getSession()
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

// Rate limit: 10 chat messages per minute per user
const rateLimit = await rateLimiter(`chat:${session.userId}`, { max: 10, window: 60 })
if (!rateLimit.success) {
  return NextResponse.json(
    { error: "Too many messages. Please wait a moment before sending again." },
    { status: 429, headers: { "Retry-After": "60" } }
  )
}
```

---

## PATTERN 8: Zod Schema Validation

```typescript
import { z } from "zod"

const SignupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password too long"),
  role: z.enum(["lawyer", "engineer", "general", "both"]).default("both"),
  recaptchaToken: z.string().min(1, "Security check required"),
  rememberMe: z.boolean().default(false),
})

// In API route:
const body = await req.json()
const parsed = SignupSchema.safeParse(body)
if (!parsed.success) {
  return NextResponse.json(
    { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
    { status: 400 }
  )
}
const { name, email, password, role, recaptchaToken, rememberMe } = parsed.data
```

---

## PATTERN 9: Google OAuth State Cookie

```typescript
// /api/auth/google/route.ts — INITIATE
const state = crypto.randomUUID()
const authUrl = generateGoogleAuthUrl(state)
const response = NextResponse.redirect(authUrl)

// IMPORTANT: sameSite MUST be "lax" for OAuth state cookie
// "strict" will block the cookie on Google's redirect back
response.cookies.set("google_oauth_state", state, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",  // ← lax, NOT strict
  path: "/",
  maxAge: 600, // 10 minutes
})
return response

// /api/auth/google/callback/route.ts — VERIFY
const storedState = req.cookies.get("google_oauth_state")?.value
const receivedState = searchParams.get("state")

if (!storedState || storedState !== receivedState) {
  return NextResponse.redirect(new URL("/auth/login?error=state_mismatch", req.url))
}

// Clear the state cookie immediately after verifying
const response = NextResponse.redirect(new URL("/dashboard", req.url))
response.cookies.set("google_oauth_state", "", { maxAge: 0 })
```

---

## PATTERN 10: reCAPTCHA v3 Client Side

```typescript
// Load the reCAPTCHA script in useEffect
useEffect(() => {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  if (!siteKey || siteKey === "fill_in_later") return // Dev bypass

  const script = document.createElement("script")
  script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
  script.async = true
  document.head.appendChild(script)

  return () => {
    document.head.removeChild(script)
  }
}, [])

// Get token on form submit
const getRecaptchaToken = async (action: string): Promise<string> => {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  if (!siteKey || siteKey === "fill_in_later") return "bypass"

  return new Promise((resolve) => {
    window.grecaptcha.ready(() => {
      window.grecaptcha
        .execute(siteKey, { action })
        .then(resolve)
    })
  })
}

// In handleSubmit:
const recaptchaToken = await getRecaptchaToken("signup")
// Include in POST body
```

---

## PATTERN 11: React Markdown with Code Blocks

```typescript
import ReactMarkdown from "react-markdown"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { CodeBlock } from "@/components/code/CodeBlock"

// If the above import fails, try:
// import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism"

<ReactMarkdown
  components={{
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "")
      const language = match ? match[1] : ""
      const code = String(children).replace(/\n$/, "")

      if (!inline && language) {
        return <CodeBlock code={code} language={language} />
      }

      return (
        <code
          className="bg-gray-800 px-1.5 py-0.5 rounded text-emerald-300 font-mono text-sm"
          {...props}
        >
          {children}
        </code>
      )
    },
    // ... other component overrides
  }}
>
  {content}
</ReactMarkdown>
```

---

## PATTERN 12: UploadThing Setup

```typescript
// src/app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next"
import { UploadThingError } from "uploadthing/server"
import { getSession } from "@/lib/auth/session"

const f = createUploadthing()

export const ourFileRouter = {
  legalDocumentUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    blob: { maxFileSize: "16MB", maxFileCount: 1 }, // For .docx files
  })
    .middleware(async () => {
      const session = await getSession()
      if (!session) throw new UploadThingError("Unauthorized")
      return { userId: session.userId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return {
        userId: metadata.userId,
        fileUrl: file.url,
        fileKey: file.key,
        fileName: file.name,
        fileSize: file.size,
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter

// src/app/api/uploadthing/route.ts
import { createRouteHandler } from "uploadthing/next"
import { ourFileRouter } from "./core"
export const { GET, POST } = createRouteHandler({ router: ourFileRouter })

// src/lib/uploadthing.ts
import { generateUploadDropzone, generateUploadButton } from "@uploadthing/react"
import type { OurFileRouter } from "@/app/api/uploadthing/core"
export const UploadDropzone = generateUploadDropzone<OurFileRouter>()
export const UploadButton = generateUploadButton<OurFileRouter>()
```

---

## PATTERN 13: OpenRouter Streaming with Fallback

```typescript
// src/lib/ai/models.ts
export async function streamWithFallback(options: {
  messages: { role: "system" | "user" | "assistant"; content: string }[]
  toolType: "legal" | "code"
  onChunk: (chunk: string) => void
  onDone: () => void
  onError: (err: string) => void
}): Promise<void> {
  const models = [
    MODEL_FOR_TOOL[options.toolType],
    FREE_MODELS.fallback1,
    FREE_MODELS.fallback2,
    FREE_MODELS.autoRouter,
  ]

  for (const model of models) {
    try {
      const stream = await openrouter.chat.completions.create({
        model,
        messages: options.messages,
        stream: true,
        max_tokens: 4096,
        temperature: 0.1,
      })

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content
        if (delta) options.onChunk(delta)
      }

      options.onDone()
      return // ← Exit on success

    } catch (err: unknown) {
      const error = err as { status?: number }
      if (error?.status === 429) {
        console.warn(`[AI] Rate limited on ${model}, waiting 2s...`)
        await new Promise((r) => setTimeout(r, 2000))
        continue
      }
      if (error?.status === 503 || error?.status === 502) {
        console.warn(`[AI] Model ${model} unavailable, trying next...`)
        continue
      }
      throw err // Unknown error — propagate
    }
  }

  options.onError(
    "All AI models are temporarily unavailable. Please try again in a moment."
  )
}
```

---

## REPORT TEMPLATE (Copy this after each task)

```
━━━ TASK [N] COMPLETE REPORT ━━━

FILES CREATED:
✅ src/... — [what it does]
✅ src/... — [what it does]

FILES MODIFIED:
📝 src/... — [what changed]

ISSUES FOUND:
⚠️ [any warnings or problems]

PACKAGES USED:
📦 [list any packages imported]

VERIFICATION NEEDED:
🔍 [what the user should check/test]

━━━ AWAITING PERMISSION TO CONTINUE TO TASK [N+1] ━━━
Please confirm:
1. Change your model to [suggested model] for the next task
2. Type "continue" to proceed
```
