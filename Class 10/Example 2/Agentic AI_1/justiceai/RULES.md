# JUSTICEAI — ABSOLUTE RULES FOR AI CODING AGENTS
## These rules exist because free LLMs hallucinate. Follow them exactly.

---

## BEFORE YOU WRITE ANY CODE

1. Read CONTEXT.md completely
2. Read the task prompt completely
3. Only then start writing

If you skip reading, you will make mistakes that waste the user's tokens.

---

## RULES THAT CANNOT BE BROKEN

### Rule 1: TypeScript Strict
- Zero `any` types. Not one. Not even "just for now".
- If you do not know the type: use `unknown` and add a runtime type guard
- Example of WRONG: `const data: any = await res.json()`
- Example of RIGHT: `const data = await res.json() as { success: boolean; user: UserProfile }`

### Rule 2: Every API Route Authenticates First
```typescript
// CORRECT — first thing after parsing the request
export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  // ... rest of handler
}

// WRONG — never do logic before auth check
export async function POST(req: NextRequest) {
  const body = await req.json() // ← WRONG: parsed before auth
  const session = await getSession()
```

### Rule 3: Always Validate Input with Zod
```typescript
// CORRECT
const Schema = z.object({ email: z.string().email(), name: z.string().min(2).max(100) })
const parsed = Schema.safeParse(await req.json())
if (!parsed.success) {
  return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 })
}
const { email, name } = parsed.data  // ← type-safe

// WRONG — never use raw request body without validation
const { email, name } = await req.json()
```

### Rule 4: Never Import Server Secrets in Client Files
```typescript
// WRONG — in any "use client" file
const apiKey = process.env.OPENROUTER_API_KEY // ← exposed to browser!

// RIGHT — server-side only (API routes, server components, lib/ files)
// Client components NEVER touch process.env.OPENROUTER_API_KEY
```

### Rule 5: Use jose, NOT jsonwebtoken
```typescript
// CORRECT
import { SignJWT, jwtVerify } from "jose"

// WRONG — breaks in Next.js Edge Middleware
import jwt from "jsonwebtoken"
```

### Rule 6: Use bcryptjs, NOT bcrypt
```typescript
// CORRECT
import bcrypt from "bcryptjs"

// WRONG — native C++ deps, breaks on Vercel/serverless
import bcrypt from "bcrypt"
```

### Rule 7: Use Neon HTTP Driver, NOT pg.Pool
```typescript
// CORRECT
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })

// WRONG — TCP connection pool does not work in serverless
import { Pool } from "pg"
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
```

### Rule 8: DATABASE_URL Has No Query Params
```
# CORRECT
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname

# WRONG — neon() HTTP driver ignores/breaks on these params
DATABASE_URL=postgresql://user:pass@host.neon.tech/dbname?sslmode=require
```

### Rule 9: JWT Cookies Are httpOnly Only
```typescript
// CORRECT — httpOnly cookie, browser JS cannot read it
response.cookies.set("lexcode_access", token, { httpOnly: true, ... })

// WRONG — never put tokens here
localStorage.setItem("token", accessToken)
// Also WRONG
const [token, setToken] = useState(accessToken)
```

### Rule 10: Same Error Message for Wrong Email OR Wrong Password
```typescript
// CORRECT — prevents user enumeration attack
if (!user || !(await comparePassword(password, user.passwordHash))) {
  return NextResponse.json({ error: "Invalid email or password." }, { status: 401 })
}

// WRONG — tells attackers which emails are registered
if (!user) return NextResponse.json({ error: "Email not found." }, { status: 404 })
if (!match) return NextResponse.json({ error: "Wrong password." }, { status: 401 })
```

### Rule 11: Google OAuth State Cookie Must Use SameSite=Lax
```typescript
// CORRECT — "lax" allows cookie to be sent after Google redirect
response.cookies.set("google_oauth_state", state, { sameSite: "lax", ... })

// WRONG — "strict" blocks cookie after Google's cross-site redirect
response.cookies.set("google_oauth_state", state, { sameSite: "strict", ... })
```

### Rule 12: SSE Streaming Format Is Exact
```typescript
// CORRECT SSE format for each chunk
controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))

// CORRECT done signal
controller.enqueue(encoder.encode("data: [DONE]\n\n"))

// CORRECT error signal
controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "message" })}\n\n`))

// WRONG — missing double newline, client parser will not work
controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n`))
```

### Rule 13: Verify Session Ownership on Every DB Operation
```typescript
// CORRECT — check that the session belongs to the requesting user
const [chatSession] = await db
  .select()
  .from(sessions)
  .where(and(eq(sessions.id, sessionId), eq(sessions.userId, currentUser.userId)))
  .limit(1)
if (!chatSession) {
  return NextResponse.json({ error: "Session not found" }, { status: 404 })
}

// WRONG — session could belong to another user
const [chatSession] = await db
  .select()
  .from(sessions)
  .where(eq(sessions.id, sessionId))
```

### Rule 14: Never Return passwordHash in API Responses
```typescript
// CORRECT — explicitly exclude password hash
const [user] = await db
  .select({ id: users.id, email: users.email, name: users.name, role: users.role })
  .from(users)
  .where(eq(users.id, userId))

// WRONG — returns all columns including passwordHash
const [user] = await db.select().from(users).where(eq(users.id, userId))
```

### Rule 15: Rate Limit All Chat and Auth Routes
```typescript
// Every chat route and auth route must call rateLimiter
import { rateLimiter } from "@/lib/rate-limit"

const result = await rateLimiter(identifier, { max: 10, window: 60 })
if (!result.success) {
  return NextResponse.json(
    { error: "Too many requests. Please wait a moment." },
    { status: 429, headers: { "Retry-After": String(result.reset) } }
  )
}
```

### Rule 16: No pages/ Directory
- This is Next.js 15 App Router
- Every page is in src/app/
- There is no pages/ directory
- Never create pages/ directory

### Rule 17: "use client" Only When Necessary
Add "use client" ONLY to files that use:
- useState, useEffect, useRef, useCallback, useMemo
- onClick, onChange, onSubmit (event handlers)
- Browser APIs: window, document, navigator, localStorage
- Custom hooks that use the above

Do NOT add "use client" to:
- Layout files (breaks RSC)
- Files that only display data
- API route files (they are always server-side)

### Rule 18: Write Complete Files
- Never write partial files
- Never write "// ... rest of implementation"
- Never write "// TODO: implement this"
- If a file is long, write all of it
- If you run out of space, continue in the next message

### Rule 19: await cookies() in Next.js 15
```typescript
// CORRECT — Next.js 15 requires await
const cookieStore = await cookies()
const token = cookieStore.get("lexcode_access")?.value

// WRONG — Next.js 15 changed this, synchronous access is deprecated
const cookieStore = cookies()
const token = cookieStore.get("lexcode_access")?.value
```

### Rule 20: Stop and Report After Each Task
- After completing every task: stop completely
- Write a full report of what was created
- List every file with its path
- List any issues or warnings found
- Ask: "May I continue to the next task?"
- Do NOT continue until the user says yes

---

## INSTALLED PACKAGES (Use ONLY These)

```json
{
  "dependencies": {
    "next": "15.x",
    "react": "19.x",
    "react-dom": "19.x",
    "typescript": "5.x",
    "tailwindcss": "4.x",
    "drizzle-orm": "0.30.x",
    "@neondatabase/serverless": "0.9.x",
    "bcryptjs": "2.4.x",
    "jose": "5.x",
    "zod": "3.x",
    "openai": "4.x",
    "uploadthing": "6.x",
    "@uploadthing/react": "6.x",
    "lucide-react": "latest",
    "react-markdown": "latest",
    "react-syntax-highlighter": "latest",
    "@upstash/redis": "latest",
    "arctic": "latest"
  },
  "devDependencies": {
    "drizzle-kit": "0.21.x",
    "dotenv": "latest",
    "@types/bcryptjs": "latest",
    "@types/react-syntax-highlighter": "latest"
  }
}
```

If a package is NOT in this list, do NOT import it.
Do NOT suggest installing additional packages unless absolutely necessary.
If you think you need a new package, STOP and ask the user first.

---

## WHAT TO DO IF YOU ARE UNSURE

If you are unsure about something:
1. Do NOT guess
2. Do NOT hallucinate an API
3. STOP and write: "I am unsure about [specific thing]. Here are my options: [A, B, C]. Which should I use?"
4. Wait for user input

A stopped build is better than a broken build.
