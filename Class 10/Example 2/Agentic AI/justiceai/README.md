# ⚖️ JusticeAI
### Free AI-powered legal document analysis and code review — for everyone on Earth.

---

## THE PROBLEM THIS APP SOLVES

This is not just a legal tool for lawyers or a code tool for engineers.
This is infrastructure for justice. Here is why it exists:

### The Global Justice Gap

In the United States:
- 92% of low-income Americans get zero legal help for serious legal problems
- 53% of all Americans cannot find or afford a lawyer when they need one
- 75% of civil court cases have at least one party with NO legal representation

In Ghana (where this app was built) and across Africa:
- Legal aid infrastructure is almost non-existent in most countries
- A single lawyer consultation costs more than a week's wages for most people
- Millions sign contracts, leases, employment agreements they cannot understand
- Tenants are evicted because they don't know their rights
- Workers are exploited because they can't read their employment contracts
- Small business owners sign vendor deals with catastrophic hidden clauses

In India, Brazil, Nigeria, Indonesia, and every developing nation:
- The problem is the same or worse
- English-language legal documents are used in commerce even where it is not the primary language
- Most people have never spoken to a lawyer in their life

### The Code Quality Gap

- Junior developers ship code with SQL injection vulnerabilities they have never heard of
- Freelancers build APIs with authentication flaws that expose thousands of users
- Students submit code with critical bugs they cannot see without an expert eye
- A senior code reviewer costs $150–300/hour — most developers never get one

---

## WHAT JUSTICEAI DOES

### Tool 1: Legal Document Analyzer
- User uploads any PDF or DOCX (contract, lease, NDA, loan, employment agreement,
  terms of service, vendor agreement, partnership deal)
- AI reads the entire document
- Returns: document type, overall risk level (LOW/MEDIUM/HIGH/CRITICAL),
  executive summary, every risky clause explained in plain English,
  what to negotiate, what to refuse, what is acceptable
- User can ask follow-up questions in a persistent AI chat
- All sessions saved — user can return and continue any time

### Tool 2: AI Code Reviewer
- User pastes code or uploads a code file
- Selects programming language
- AI reviews for: security vulnerabilities (OWASP Top 10), bugs, performance issues,
  bad practices, and architecture problems
- Returns: quality score, critical issues with fixes, warnings, suggestions,
  what is done well, refactored version of problem sections
- Persistent chat — user can ask follow-up questions

### Who Uses It
| User | Problem Solved |
|---|---|
| Tenant in Accra, Ghana | Understands lease before signing |
| Freelancer in Lagos | Knows their client contract protects their IP |
| Developer in Nairobi | Gets security review they could never afford |
| Small business in Jakarta | Understands vendor agreement risks |
| Student in São Paulo | Gets code review for their assignment |
| Worker anywhere | Understands their employment contract |

---

## TECH STACK

| Layer | Technology | Why |
|---|---|---|
| Frontend + Backend | Next.js 15 App Router (TypeScript) | One codebase, server components, API routes |
| Database | Neon PostgreSQL + Drizzle ORM | Serverless, free tier, type-safe queries |
| Cache + Rate Limiting | Upstash Redis | Free serverless Redis, protects AI API quota |
| Auth | Custom JWT (jose + bcryptjs) + Google OAuth + reCAPTCHA v3 | No vendor lock-in, full control |
| AI | OpenRouter (free tier, 4-model fallback, streaming SSE) | Free, resilient, OpenAI-compatible |
| File Uploads | UploadThing | Free tier, PDF + DOCX, authenticated |
| UI | Tailwind CSS v4 + shadcn/ui | Dark theme, professional, fast |

---

## PROJECT STATUS

Built task by task using OpenCode with free LLM models.
Each task is documented in the PROMPTS.md file.

---

## LOCAL SETUP (After Build is Complete)

```powershell
# 1. Install dependencies (already done)
npm install

# 2. Set up environment variables
# Copy .env.example to .env.local and fill in all values

# 3. Push database schema to Neon
npx drizzle-kit push

# 4. Start development server
npx next dev

# 5. Open browser
# http://localhost:3000
```

---

## ENVIRONMENT VARIABLES NEEDED

See `.env.example` for the full list.
You need accounts at:
- neon.tech (database — free)
- openrouter.ai (AI — free tier)
- uploadthing.com (file uploads — free tier)
- Google Cloud Console (OAuth + reCAPTCHA — free)
- upstash.com (Redis cache — free tier)

---

*Built in Ghana. Designed for the world.*
*Justice should not be a luxury.*
