# SANKOFA HUB V2 — CHAT TESTING GUIDE

> **How to use this guide:** Open http://localhost:5173 in your browser. Test each question one by one in the AI Chat page (/ai) or via the floating chat widget. Compare the bot's response against the expected behavior below.

---

## TABLE OF CONTENTS

1. [How the System Works (For Testers)](#1-how-the-system-works)
2. [Quick Reference: Bot Routing Rules](#2-quick-reference)
3. [Full Test Questionnaire — 34 Questions](#3-full-test-questionnaire)
4. [RAG vs Non-RAG Comparison](#4-rag-vs-non-rag-comparison)
5. [RAG Knowledge Base Contents](#5-rag-knowledge-base-contents)
6. [Limitations & Edge Cases](#6-limitations--edge-cases)
7. [Step-by-Step UI Testing](#7-step-by-step-ui-testing)

---

## 1. HOW THE SYSTEM WORKS

### The Routing Flow (What Happens Behind the Scenes)

When you type a message, here's what happens:

```
You type: "What are the visa requirements for Ghana?"
     │
     ▼
[1] Message sent to Nana Kwame (Router Bot)
     │  Nana Kwame reads the question
     │  He decides: "This is about TRAVEL → tourism domain"
     │  He responds: "ROUTE: tourism"
     │
     ▼
[2] System sees "ROUTE: tourism" → forwards message to Maame Yaa (Tourism Bot)
     │
     ▼
[3] FOR RAG DOMAINS (tourism/language) ONLY:
     │  System searches ChromaDB for relevant knowledge base chunks
     │  Finds: "Visa & Entry Requirements" section from knowledge base
     │  Injects context: "[Source: Visa And Entry | Section: Overview]"
     │
     ▼
[4] Maame Yaa answers with the RAG context + her knowledge
     │
     ▼
[5] You see: "Maame Yaa" as the responding bot
     │  The answer includes specific details from the knowledge base
```

### What You See in the UI

- **Bot name** appears in the message header (Nana Kwame, Maame Yaa, Osei Tutu, or Obaa Sarpongmaa)
- **Bot avatar** color indicates the domain:
  - Gold = Nana Kwame (General/Router)
  - Green = Maame Yaa (Tourism)
  - Red = Osei Tutu (Culture)
  - Indigo = Obaa Sarpongmaa (Language)
- **No routing indicators** — the user never sees "ROUTE: tourism" or "connecting you to..."

---

## 2. QUICK REFERENCE

| Bot | Handles | Does NOT Handle |
|-----|---------|-----------------|
| **Nana Kwame** | Greetings, cross-domain, system questions, declines off-topic | Specific tourism/culture/language questions |
| **Maame Yaa** | Travel logistics, visas, attractions, accommodation, food tourism, travel safety, cultural etiquette FOR tourists | Pure linguistics, pure cultural heritage without travel context |
| **Osei Tutu** | Cultural practices, symbols, festivals, history, colonialism, artefact repatriation, traditional governance | Travel logistics, pure linguistics |
| **Obaa Sarpongmaa** | Translation, linguistics, tonal languages, endangerment, code-switching, pidgin, AI language limitations | Travel logistics, cultural heritage without linguistic framing |

### Domain Nuance Rules

- **"What languages are spoken in Cape Verde and will English be enough for tourists?"** → **Maame Yaa** (the PURPOSE is travel practicality)
- **"What cultural customs should a tourist respect at a Ghanaian funeral?"** → **Osei Tutu** (the SUBSTANCE is cultural knowledge, despite tourist framing)
- **"What is the cultural and historical significance of the Sankofa symbol beyond its linguistic meaning?"** → **Osei Tutu** (user explicitly frames it as cultural)

---

## 3. FULL TEST QUESTIONNAIRE

### Nana Kwame Tests (7 questions)

| # | Question | Expected Bot | Why | What to Look For |
|---|----------|-------------|-----|------------------|
| 1 | "Hello, what can you help me with?" | Nana Kwame | Greeting/system question | Should introduce the platform and its 3 domains |
| 2 | "How does language shape cultural identity in tourism destinations?" | Nana Kwame | Cross-domain (tourism + culture + language equally) | Should answer as a cross-domain question, sign off as Nana Kwame |
| 3 | "What are the visa requirements to visit Ghana?" | Maame Yaa | Clear travel question | Should provide visa info, mention ECOWAS, e-visa, yellow fever cert |
| 4 | "Tell me about the significance of Adinkra symbols in Ghanaian culture." | Osei Tutu | Clear culture question | Should explain Adinkra symbols, their meanings, cultural importance |
| 5 | "What is the difference between Asante Twi and Akuapem Twi?" | Obaa Sarpongmaa | Clear language question | Should explain dialect differences, mutual intelligibility |
| 6 | "What is the best diet for losing weight fast?" | Nana Kwame | Off-topic → decline | Should politely decline, mention what it CAN help with |
| 7 | "Who won the Champions League last night?" | Nana Kwame | Off-topic → decline | Should politely decline, mention Ghana/West Africa focus |

### Maame Yaa Tests (8 questions)

| # | Question | Expected Bot | RAG? | What to Look For |
|---|----------|-------------|------|------------------|
| 1 | "What are the top 5 tourist attractions in Ghana I should not miss?" | Maame Yaa | Yes | Should mention Cape Coast Castle, Kakum, Mole, etc. with specific details |
| 2 | "Do Nigerians need a visa to enter Ghana?" | Maame Yaa | Yes | Should mention ECOWAS passport holders don't need visa |
| 3 | "What is eco-tourism and how is it being practised in West Africa?" | Maame Yaa | Yes | Should explain eco-tourism concept + Ghana examples |
| 4 | "What languages are spoken in Cape Verde and will English be enough for tourists?" | Maame Yaa | Yes | Tourist framing → tourism domain. Should address travel practicality |
| 5 | "What is food tourism and what Ghanaian dishes should a first-time visitor try?" | Maame Yaa | Yes | Should mention jollof, fufu, waakye, kelewele, etc. |
| 6 | "How do I book a guided tour of Elmina Castle? What are the hours and prices?" | Maame Yaa | Yes | Should provide practical booking info, hours, fees |
| 7 | "I want to learn how to translate documents from French to English professionally." | Obaa Sarpongmaa | No | Translation request → language domain |
| 8 | "What is the history and cultural meaning of the Homowo festival?" | Osei Tutu | No | Pure cultural heritage → culture domain |

### Osei Tutu Tests (9 questions)

| # | Question | Expected Bot | What to Look For |
|---|----------|-------------|------------------|
| 1 | "What is the cultural significance of Kente cloth in Akan society?" | Osei Tutu | Should explain Kente's royal origins, weaving traditions, symbolic meanings |
| 2 | "What criteria does UNESCO use to designate a World Heritage Site?" | Osei Tutu | Should explain UNESCO criteria, mention Cape Coast Castle as example |
| 3 | "What are some traditional initiation rites practised in Ghana?" | Osei Tutu | Should discuss puberty rites, Damba, etc. with cultural sensitivity |
| 4 | "Why are there ongoing debates about returning African artefacts from European museums?" | Osei Tutu | Should discuss Benin Bronzes, repatriation, colonial theft |
| 5 | "What cultural customs should a foreign tourist respect at a Ghanaian funeral?" | Osei Tutu | Tourist framing but substance is cultural → Osei Tutu |
| 6 | "Was colonialism beneficial to African cultural development?" | Osei Tutu | Should present multiple scholarly perspectives |
| 7 | "How do the grammatical structures of Twi and Ga compare linguistically?" | Obaa Sarpongmaa | Linguistic comparison → language domain |
| 8 | "What are the best stocks to invest in right now?" | Nana Kwame | Off-topic → decline |
| 9 | "Can you help me write a Python script to scrape hotel prices?" | Nana Kwame | Off-topic → decline |

### Obaa Sarpongmaa Tests (10 questions)

| # | Question | Expected Bot | What to Look For |
|---|----------|-------------|------------------|
| 1 | "Please translate this phrase into Twi: 'Welcome to our cultural festival...'" | Obaa Sarpongmaa | Should provide Twi translation with register notes |
| 2 | "What makes Akan a tonal language, and how does tone change meaning in Twi?" | Obaa Sarpongmaa | Should explain high/low tones, give examples (e.g., "kra" vs "krã") |
| 3 | "How many Ghanaian languages are considered endangered?" | Obaa Sarpongmaa | Should mention specific languages, UNESCO categories |
| 4 | "Why do most AI translation tools perform poorly on African languages?" | Obaa Sarpongmaa | Should discuss data scarcity, tonal complexity, morphology |
| 5 | "Is Pidgin English a 'real' language or just broken English?" | Obaa Sarpongmaa | Should firmly correct the misconception with linguistic evidence |
| 6 | "Is Ghanaian Sign Language (GhSL) a fully developed language?" | Obaa Sarpongmaa | Should explain GhSL's structure and status |
| 7 | "How does code-switching between English and Twi reflect social identity in urban Ghana?" | Obaa Sarpongmaa | Should discuss sociolinguistic identity markers |
| 8 | "I'm planning a trip to Accra next month. What are the best affordable hotels near the airport?" | Maame Yaa | Travel logistics → tourism |
| 9 | "What is the cultural and historical significance of the Sankofa symbol beyond its linguistic meaning?" | Osei Tutu | Cultural framing → culture |
| 10 | "Can you recommend a good workout routine for building muscle?" | Nana Kwame | Off-topic → decline |

---

## 4. RAG VS NON-RAG COMPARISON

### What is RAG?

RAG (Retrieval-Augmented Generation) is a technique where the system:
1. **Retrieves** relevant documents from a knowledge base before answering
2. **Augments** the prompt with those documents as context
3. **Generates** an answer grounded in the retrieved information

### How RAG Works in This Project

```
User asks: "What are the entry fees for Kakum National Park?"
     │
     ▼
[1] Nana Kwame routes to Maame Yaa (tourism domain)
     │
     ▼
[2] System embeds the question using SentenceTransformer (all-MiniLM-L6-v2)
     │
     ▼
[3] System queries ChromaDB (tourism_kb collection)
     │  Finds 3 relevant chunks:
     │  - "Kakum National Park" section (score: 0.82)
     │  - "Ghana Tourist Sites" section (score: 0.71)
     │  - "Transport in Ghana" section (score: 0.48)
     │
     ▼
[4] Chunks injected into Maame Yaa's prompt:
     │  "=== KNOWLEDGE BASE CONTEXT ===
     │   [Source 1: Ghana Tourist Sites — Kakum National Park]
     │   Kakum National Park... canopy walkway stretches 330 metres...
     │   Entry fees: GHS 80 (international adults)..."
     │
     ▼
[5] Maame Yaa answers WITH the specific data from the knowledge base
```

### Without RAG (What Would Happen)

**Without RAG**, Maame Yaa would answer from her general LLM training data only:
- Might provide outdated or incorrect entry fees
- Might confuse Ghana with other countries
- Might not know specific current prices
- Would still give a helpful answer, but less grounded

### With RAG (What Actually Happens)

**With RAG**, Maame Yaa gets specific, verified information:
- Entry fees: GHS 80 (international adults), GHS 40 (international children), GHS 20 (Ghanaian adults)
- Canopy walkway: 330 metres, 30-40 metres height
- Opening hours: 8am–4pm daily
- Max 6 visitors at a time

### Side-by-Side Comparison

| Aspect | Without RAG | With RAG |
|--------|------------|----------|
| **Data source** | LLM training data only | Knowledge base + LLM |
| **Accuracy** | General knowledge, may be outdated | Specific, verified facts |
| **Prices/fees** | May be wrong or missing | Exact figures from knowledge base |
| **Hours/schedules** | May be incorrect | Current information from source |
| **Specificity** | Broad, general answers | Detailed, sourced answers |
| **Confidence** | "As of my last update..." | "According to the Ghana Tourism Authority..." |

### Test RAG Yourself

Try these questions and observe the difference:

**Tourism RAG test:**
1. "What are the entry fees for Cape Coast Castle?"
   - Look for: GHS 100 (international), GHS 20 (Ghanaian), guided tours included
2. "What hotels are near Mole National Park?"
   - Look for: Mole Motel (only accommodation inside park), Zaina Lodge (premium eco-lodge)
3. "Is it safe to drink tap water in Ghana?"
   - Look for: Clear "No" with explanation from travel_safety.md

**Language RAG test:**
1. "How do you say 'good morning' in Ga?"
   - Look for: "Ojekoo" with response "Ojekai"
2. "What endangered languages exist in Ghana?"
   - Look for: Specific names (Nkonya, Siwu, Animere) with UNESCO categories

---

## 5. RAG KNOWLEDGE BASE CONTENTS

### Tourism Knowledge Base (`tourism_kb` — 40 chunks)

| File | Topics Covered | Key Facts Available |
|------|---------------|---------------------|
| `accommodation_guide.md` | Hotels across Ghana | Kempinski, Labadi Beach, Mole Motel, Zaina Lodge, budget options, price ranges |
| `food_and_cuisine.md` | Ghanaian cuisine | Jollof rice, waakye, fufu, banku, kelewele, chop bars, food markets, safety tips |
| `ghana_tourist_sites.md` | Major attractions | Cape Coast Castle (GHS 100), Kakum (GHS 80), Mole, Elmina, Wli Waterfalls, Aburi Gardens |
| `transport_in_ghana.md` | Getting around | STC buses, VIP, tro-tros, Bolt/Uber, domestic flights, car rental, traffic |
| `travel_safety.md` | Safety information | Malaria, yellow fever, petty theft, road safety, emergency numbers, scams |
| `visa_and_entry.md` | Visa requirements | ECOWAS free entry, e-visa process, yellow fever cert mandatory, fees USD 60-100 |

### Language Knowledge Base (`language_kb` — 42 chunks)

| File | Topics Covered | Key Facts Available |
|------|---------------|---------------------|
| `endangered_languages.md` | Language endangerment | UNESCO scale, Nkonya, Siwu, Animere, causes, preservation efforts |
| `ga_language_guide.md` | Ga language | Overview, greetings (Ojekoo, Ojekai), phrases, Homowo festival, AI limitations |
| `ghanaian_english.md` | Ghanaian English | Features, vocabulary (go slow, chop bar, trotro), code-switching, legitimacy |
| `hausa_overview.md` | Hausa in Ghana | Role as lingua franca, features, trade language |
| `language_policy_ghana.md` | Policy | Official language, mother tongue education, multilingual education |
| `translation_notes.md` | Translation challenges | Tonal languages, cultural context, AI limitations |
| `twi_basics.md` | Twi language | Dialects (Asante, Akuapem, Fante), greetings, basic phrases, tonal system |

### RAG Configuration

| Parameter | Value | Location |
|-----------|-------|----------|
| Embedding Model | all-MiniLM-L6-v2 | Local (no API needed) |
| Chunk Size | 300 words | `rag/chunker.py` |
| Chunk Overlap | 50 words | `rag/chunker.py` |
| Score Floor | 0.45 | `.env` → `RAG_SCORE_FLOOR` |
| Top K Retrieved | 5 | `.env` → `RAG_TOP_K` |
| Top 3 Used | 3 (after filtering) | `rag/retrieval.py` |
| Similarity | Cosine | `rag/vector_store.py` |
| Storage | ChromaDB persistent | `./chroma_db/` |

---

## 6. LIMITATIONS & EDGE CASES

### Known Limitations

1. **LLM Response Time**: Each message takes 5-15 seconds because it calls OpenRouter API. The system is NOT real-time.

2. **RAG Only for Tourism & Language**: Culture questions (Osei Tutu) do NOT use RAG. He relies purely on his LLM training data. This means:
   - Culture answers may be less specific than tourism/language answers
   - Culture answers may reference outdated information
   - Tourism and language answers benefit from the grounded knowledge base

3. **Routing Errors**: The router (Nana Kwame) sometimes misroutes. Examples of potential misrouting:
   - "What are the best books about Ghanaian history?" → Could go to Osei Tutu (culture) or Nana Kwame (general)
   - "How do Ghanaians greet each other?" → Could go to Obaa Sarpongmaa (language) or Osei Tutu (culture)

4. **Knowledge Base Staleness**: The RAG knowledge base contains static markdown files. Information like prices, visa fees, and opening hours may become outdated. The bots are instructed to say "as of my last information" when uncertain.

5. **Translation Accuracy**: Obaa Sarpongmaa's translations are limited by:
   - AI training data scarcity for African languages
   - Tonal nuances may be lost in text
   - Formal vs informal registers may not always be distinguished
   - Small languages (Ga, Ewe, Dagbani) have lower accuracy than Twi

6. **No Multi-Language UI**: The frontend is English-only. The bots respond in English even when asked to translate.

7. **Session Memory**: The floating chat widget has limited memory. After 6 messages, unauthenticated users are nudged to sign in. Authenticated users get full conversation history in the /ai page.

8. **Model Limitations**: The LLMs used (via OpenRouter free tier) may have:
   - Rate limiting
   - Inconsistent availability
   - Lower quality than paid models
   - Occasional hallucinations despite RAG grounding

### Edge Cases to Test

| Question | Why It's Tricky | Expected Behavior |
|----------|----------------|-------------------|
| "What languages do tourists need in Ghana?" | Cross-domain (tourism + language) | Nana Kwame should handle as cross-domain or route to Maame Yaa |
| "How do you say 'visa' in Twi?" | Translation but about travel | Obaa Sarpongmaa (translation request) |
| "Tell me about the Door of No Return" | Culture (history) or Tourism (attraction)? | Could go either way — both are acceptable |
| "Is Ghana safe for solo female travellers?" | Tourism safety | Maame Yaa (travel safety is tourism domain) |
| "What does 'Sankofa' mean linguistically?" | Language (etymology) | Obaa Sarpongmaa |
| "What does 'Sankofa' mean culturally?" | Culture (symbol) | Osei Tutu |
| "Can you cook jollof rice?" | Off-topic (cooking) | Nana Kwame should decline |
| "Write a poem about Ghana" | Off-topic (creative writing) | Nana Kwame should decline or handle as general |

---

## 7. STEP-BY-STEP UI TESTING

### Prerequisites

1. Backend running: `uv run uvicorn main:app --reload --port 8000`
2. Frontend running: `cd client && npm run dev`
3. Browser open at http://localhost:5173

### Test Flow 1: Basic Chat (No Auth Required)

1. Click the **chat bubble** (bottom-right corner) on the homepage
2. Wait for it to auto-open (2 seconds) or click to open
3. **Observe:** Welcome message with "6 free questions remaining"
4. Type: `"Hello, what can you help me with?"`
5. Press Enter
6. **Observe:**
   - Shows "Thinking..." indicator
   - Shows "Nana Kwame is typing..." with gold avatar indicator
   - Response from Nana Kwame explaining the 3 domains
   - Bot name badge shows "NANA KWAME" in gold
   - Message bubble has gold left border and warm cream background
7. **Pass criteria:** Bot-specific styling visible (gold theme for Nana Kwame)

### Test Flow 2: Routing Test

1. In the same chat, type: `"What are the visa requirements for Ghana?"`
2. Press Enter
3. **Observe:**
   - Response from **Maame Yaa** (not Nana Kwame)
   - Bot name badge shows "MAAME YAA" in green
   - Message bubble has green left border and light green background
   - Avatar shows green theme with map emoji
4. **Pass criteria:** Distinct green tourism styling visible

### Test Flow 3: RAG Test with Rich Content

1. Type: `"What are the entry fees for Kakum National Park?"`
2. Press Enter
3. **Observe:**
   - Response from Maame Yaa with green styling
   - Should include: GHS 80 (international adults), GHS 40 (children), GHS 20 (Ghanaian)
   - May include a 📝 Quick Quiz section
   - May include a mermaid diagram showing the park's features
4. **Pass criteria:** Specific data from knowledge base + rich content (quiz/diagram)

### Test Flow 4: Bot Styling Comparison

1. Ask 4 questions to trigger each bot:
   - `"Hello!"` → Nana Kwame (gold theme)
   - `"Best tourist sites in Ghana?"` → Maame Yaa (green theme)
   - `"Tell me about Adinkra symbols"` → Osei Tutu (red theme)
   - `"How do you say hello in Twi?"` → Obaa Sarpongmaa (indigo theme)
2. **Observe each response has:**
   - Unique avatar emoji (👑, 🗺️, 🏛️, 📚)
   - Unique name badge color
   - Unique message bubble background
   - Unique left border color
3. **Pass criteria:** All 4 bots have visually distinct styling

### Test Flow 5: Guest Question Limit

1. Open the chat widget (not logged in)
2. Send 6 questions
3. **Observe:** After question 6, the chat locks with a message:
   - "You've used all 6 free questions"
   - "Sign in to continue chatting"
   - Two buttons: "Sign In / Register" and "Continue in Full Chat"
   - "Your X messages are saved and will be available after login"
4. **Pass criteria:** Chat locks after 6 questions, navigation links work

### Test Flow 6: Authentication

1. Click "Sign In / Register" in the locked chat widget
2. Or navigate to `/auth`
3. Click **"Create Account"** tab
4. Fill in: Name, Email, Password (min 8 chars)
5. Click **Register**
6. **Observe:**
   - Redirected to `/ai` (full-page chat)
   - Navbar shows your name and dropdown
7. **Pass criteria:** Registration works, you're logged in

### Test Flow 7: Full-Page Chat

1. Navigate to `/ai` (or click "AI Chat" in navbar)
2. **Observe:**
   - Left sidebar with conversation history (grouped by Today/Yesterday/This Week)
   - Main chat area with Sankofa logo
   - Chat input at bottom
3. Type a question and press Enter
4. **Observe:**
   - Response appears with bot-specific styling (color, avatar, name badge)
   - Conversation appears in sidebar
5. Click a previous conversation in sidebar
6. **Observe:** Previous messages load correctly with correct bot styling
7. **Pass criteria:** Conversations persist, bot styling consistent

### Test Flow 8: Admin Dashboard

1. Register with an email matching `ADMIN_EMAIL` in `.env`
2. Navigate to `/admin`
3. **Observe:**
   - Back arrow button (top-left) → returns to home
   - Stats cards (users, conversations, messages today, total messages)
   - Messages by Bot bar chart
   - User Management table with search bar
   - Conversation history table
   - Audit log table
4. Test user management:
   - **Search:** Type a name/email → filters results
   - **Edit:** Click pencil icon → change name/email → Save
   - **Deactivate:** Click user-x icon → Confirm dialog → user becomes inactive
   - **Promote:** Click shield icon → Confirm dialog → user becomes admin
   - **Delete:** Click trash icon → Confirm dialog → user is removed
5. **Pass criteria:** Back button works, all CRUD operations work, audit log records actions

### Test Flow 9: Conversation Resumption

1. Send 3 messages in the chat widget (bottom-right)
2. Navigate to `/ai`
3. Click the conversation in the sidebar
4. **Observe:** All 3 messages load with correct bot responses and styling
5. Send a 4th message in the same conversation
6. **Observe:** It continues the same conversation (not a new one)
7. **Pass criteria:** Conversation ID is maintained, history is完整

### Performance Checklist

| Metric | Expected | How to Test |
|--------|----------|-------------|
| Chat response time | 5-15 seconds | Time from send to response |
| RAG response time | 8-20 seconds | Slightly slower due to embedding + ChromaDB query |
| Page load time | < 3 seconds | Time from navigation to interactive |
| Build time | < 30 seconds | `npm run build` in client/ |
| TypeScript errors | 0 | `npx tsc --noEmit` in client/ |

---

## QUICK VERIFICATION CHECKLIST

After testing, verify:

- [ ] All 34 test questions route to the correct bot
- [ ] Each bot has distinct visual styling (color, avatar, bubble background)
- [ ] RAG responses include specific data from knowledge base
- [ ] RAG responses may include quizzes and mermaid diagrams
- [ ] Guest users are limited to 6 questions then locked
- [ ] Locked chat shows sign-in and full-chat navigation links
- [ ] Minimize button closes the chat panel
- [ ] Admin dashboard has back button to home
- [ ] Admin user CRUD works (search, edit, delete, promote, demote)
- [ ] Authentication flow works (register → login → me)
- [ ] Conversation history persists across page reloads
- [ ] 0 TypeScript errors, 0 Python lint errors
- [ ] No TypeScript errors in frontend
- [ ] No Python lint errors in backend
- [ ] Server starts without database errors
