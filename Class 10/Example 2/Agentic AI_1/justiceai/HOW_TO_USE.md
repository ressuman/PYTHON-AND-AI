# HOW TO USE THESE FILES
## Step-by-step guide — read this first

---

## WHAT THESE FILES ARE

You have 5 files in this folder:

| File | What It Is |
|---|---|
| README.md | What JusticeAI does and why it exists |
| CONTEXT.md | All technical decisions and stack details |
| RULES.md | Rules the AI must never break |
| SKILL.md | Code patterns and templates |
| PROMPTS.md | The actual task prompts to paste into OpenCode |
| HOW_TO_USE.md | This file — how to use everything |

---

## BEFORE YOU START

Make sure you have done these things already:

- [ ] Created the justiceai project with `npx create-next-app@latest`
- [ ] Installed all npm packages
- [ ] Set up shadcn/ui components
- [ ] Created .env.local with your Neon, OpenRouter, UploadThing, Google, reCAPTCHA keys
- [ ] Already pushed the DB schema (or ready to do it in Task 1)
- [ ] Have an Upstash account (or sign up at upstash.com — it is free)

---

## STEP 1 — Copy All 5 Files Into Your Project

Copy README.md, CONTEXT.md, RULES.md, SKILL.md, and PROMPTS.md
into the ROOT of your justiceai project folder.

Your project folder should now look like this:
```
justiceai/
├── README.md         ← copied here
├── CONTEXT.md        ← copied here
├── RULES.md          ← copied here
├── SKILL.md          ← copied here
├── PROMPTS.md        ← copied here (for your reference — do not paste this whole file)
├── src/
├── package.json
├── .env.local
└── ...
```

---

## STEP 2 — Open OpenCode

In PowerShell, from inside your justiceai folder:
```powershell
opencode
```

---

## STEP 3 — Start Every OpenCode Session With the Master Context Prompt

Open PROMPTS.md and find the section labeled:
```
## MASTER CONTEXT PROMPT
## Paste this FIRST in every new OpenCode session
```

Copy that entire block (everything between the triple backticks).
Paste it into OpenCode.
Wait for OpenCode to confirm it has read all 4 files.

---

## STEP 4 — Do Tasks One at a Time

Open PROMPTS.md and find TASK 1.
Copy the entire TASK 1 block.
Paste it into OpenCode.

Wait for OpenCode to:
1. Finish all the files
2. Write a complete report
3. Ask you for permission to continue

DO NOT paste Task 2 until OpenCode has stopped and asked permission.

---

## STEP 5 — Change Your Model Between Tasks

After each task report, change your OpenCode model before continuing.
This prevents the model from getting confused by too much context.

Recommended models (use free ones from OpenRouter):
- DeepSeek V3 Free — good for logic and TypeScript
- Qwen 2.5 72B Free — good for long files
- Llama 4 Maverick Free — good for reasoning
- DeepSeek Coder V2 Free — good for code-heavy tasks

To change model in OpenCode: use the model selector in the OpenCode interface.

---

## STEP 6 — Give Permission to Continue

After you have:
1. Read the task report
2. Changed your model
3. Confirmed no obvious problems

Type in OpenCode:
```
continue
```

Then immediately paste the NEXT task prompt from PROMPTS.md.

---

## STEP 7 — Set Up Upstash Redis (Between Task 1 and Task 2)

After Task 1 is complete, before pasting Task 2:
1. Go to https://upstash.com
2. Sign up free
3. Create a database (see PROMPTS.md "Upstash Redis Setup" section)
4. Add the two variables to your .env.local
5. Then paste Task 2

---

## TASK ORDER SUMMARY

```
Open OpenCode
↓
Paste MASTER CONTEXT PROMPT → wait for confirmation
↓
Paste TASK 1 → wait for report → change model → type "continue"
↓
Set up Upstash Redis (in browser, 5 minutes)
↓
Paste TASK 2 → wait for report → change model → type "continue"
↓
Paste TASK 3 → wait for report → change model → type "continue"
↓
Paste TASK 4 → wait for report → change model → type "continue"
↓
Paste TASK 5 → wait for final report
↓
Run: npx next dev
↓
Test the app
```

---

## WHAT TO DO IF SOMETHING GOES WRONG

### If OpenCode gives you an error about a missing import:
Copy the error message. Paste it back into OpenCode with:
"Fix this error: [paste error]"

### If OpenCode writes partial code (stops midway):
Paste this into OpenCode:
"You stopped writing [filename]. Please continue from where you stopped and complete the entire file."

### If the dev server has TypeScript errors:
Run: `npx tsc --noEmit`
Copy the errors. Paste into OpenCode:
"Fix these TypeScript errors: [paste errors]"

### If you see a database connection error:
Check your DATABASE_URL in .env.local.
It must NOT have ?sslmode=require or any query parameters.
Format: postgresql://user:password@host.neon.tech/dbname

### If the AI chat is not streaming:
Check /api/chat/legal or /api/chat/code route for SSE headers.
The Response must have Content-Type: text/event-stream

---

## TESTING CHECKLIST (After All 5 Tasks)

Run: `npx next dev`
Open: http://localhost:3000

Test in this exact order:

- [ ] 1. Landing page loads with all sections
- [ ] 2. Go to /auth/signup — sign up with email
- [ ] 3. Redirected to /dashboard — welcome message shows
- [ ] 4. Click "Legal Analyzer" card
- [ ] 5. Upload a PDF file
- [ ] 6. AI analysis starts streaming
- [ ] 7. Ask a follow-up question — AI responds
- [ ] 8. Refresh page — session is still there in sidebar
- [ ] 9. Click "Code Reviewer" card
- [ ] 10. Paste some code, select language, click "Review My Code"
- [ ] 11. AI review streams
- [ ] 12. Sign out (from Navbar dropdown)
- [ ] 13. Sign in with Google button
- [ ] 14. Google OAuth completes, redirected to /dashboard
- [ ] 15. Previous sessions visible in sidebar

If all 15 pass: the app is working correctly.

---

## DEPLOYING TO VERCEL (Optional — After Testing Locally)

1. Push your code to GitHub
2. Go to vercel.com, connect your GitHub
3. Import the justiceai repository
4. Add all environment variables from .env.local
5. Change NEXT_PUBLIC_APP_URL to your Vercel URL
6. Add your Vercel URL to:
   - Google Cloud Console OAuth credentials (Authorized origins + redirect URIs)
   - Google reCAPTCHA admin (Domains)
7. Deploy

---

*You built this. Justice for everyone.*
