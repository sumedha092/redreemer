# Redreemer

> Redeem what was lost. Redream what's possible.

Free SMS-based financial empowerment platform for homeless individuals and people recently released from prison. One phone number. Text anything. Gemini AI responds with real local resources, tracks 8-step progress toward housing stability, and proactively reaches out when it matters.

**No app. No bank account. No address required. Just a text.**

---

## What It Does

### SMS Features (text the number from any phone)
- **Gemini 2.5 Flash AI** — routes to homeless or reentry path, responds in any language automatically
- **Predatory lender detection** — intercepts payday loan / title loan keywords before Gemini, fires bilingual warning with safer alternatives
- **Step-aware resources** — injects real Phoenix addresses and phone numbers for the user's current step into every AI response
- **Bank account guide** — conversational flow: ID check → ChexSystems check → specific Bank On recommendation
- **ID recovery guide** — walks through Birth Certificate → SSN Card → State ID in order
- **Money personality quiz** — 4-question SMS quiz, classifies into Survivor/Planner/Builder, tailors all future AI tone
- **Fair-chance employer finder** — 6 real Phoenix employers with phones, fires at Step 4+
- **Benefits navigator** — 4-question eligibility flow, returns personalized SNAP/AHCCCS/SSI/LIHEAP list
- **Credit explainer** — plain English + situation-specific first step (Self Financial, annualcreditreport.com, Discover It Secured)
- **Expungement checker** — Arizona eligibility rules, 3-question flow, stores eligibility year for future reminder
- **Literacy-aware simplified mode** — auto-detects short messages, switches to 6th-grade vocabulary
- **Contextual check-ins** — Gemini generates personalized check-in referencing what user was working on
- **Voice milestone clips** — ElevenLabs MMS auto-sent on step advance, text fallback if MMS fails
- **Weekly progress SMS** — Sunday 9am, skips users who texted in last 24h
- **Weekly wins SMS** — celebrates what user actually did that week, never generic
- **Spanish support** — full bilingual: all flows, cron jobs, predatory warnings, benefits navigator
- **Crisis detection** — 988 Lifeline, Crisis Text Line, National Homeless Hotline
- **Keyword shortcuts** — FOOD, SHELTER, BANK, ID, BENEFITS, JOB, DEBT, HELP

### Caseworker Dashboard
- Client management with step advancement and notes
- Silent client alerts — amber banner for 7d, red for 14d, "Lost contact" for 21d
- Engagement risk score — green/amber/red dot per client with hover tooltip
- "Reach Out" button with pre-filled suggested message
- AI caseload analysis (Gemini)
- Analytics with Recharts charts (step funnel, type breakdown, health scores)
- Scam attempts blocked counter per client

### Client Dashboard (homeless/reentry users)
- "What do you need right now?" quick actions (Shelter, Food, Money, Job, Benefits)
- Emotional progress language ("You've already done X. Your next step is Y.")
- Crisis banner always visible → CrisisModal with 988, Crisis Text Line, Homeless Hotline
- Scam warning banner (dismissible)
- Financial tools behind progressive disclosure toggle
- Language selector (7 languages)
- Full Financial Wellness suite inline

### Financial Wellness Suite
- Budget Tracker with AI insights
- Emergency Fund Planner with milestone tracking + AI risk prediction
- Debt Payoff Calculator (snowball/avalanche) + AI recommendation
- Net Worth Calculator + AI trajectory
- Savings Goals + AI coaching
- Risk Score Assessment + AI summary
- Financial Literacy (6 modules)
- Insurance Education
- Community Data — CFPB complaints, FDIC unbanked rates, ACS income by zip, banking desert map

---

## Stack

| Tool | Role |
|------|------|
| Node.js + Express (ESM) | Backend |
| React 18 + TypeScript + Vite | Primary frontend (redreemer-UI) |
| Tailwind CSS + shadcn/ui | UI components |
| Supabase (PostgreSQL + RLS) | Database |
| Twilio | SMS in/out + MMS voice delivery |
| Gemini 2.5 Flash | All AI — routing, responses, check-ins, wins, quiz |
| ElevenLabs | Milestone voice messages (6 clips) |
| Auth0 | Caseworker auth + role-based access |
| TanStack Query | Server state management |
| Recharts | Data visualization |
| Framer Motion | Animations |

---

## Quick Start

### 1. Database
Run in Supabase SQL editor in order:
```
supabase/schema.sql
supabase/migrations/002_add_new_columns.sql
supabase/seed.sql   (optional demo data)
```

### 2. Server
```bash
cd redreemer/server
npm install
cp .env.example .env   # fill in your keys
npm run dev
```

### 3. Frontend
```bash
cd redreemer/redreemer-UI
npm install
cp .env.example .env   # fill in Auth0 + API URL
npm run dev
```

### 4. SMS webhook (local dev)
```bash
ngrok http 3001
# Set Twilio webhook to: https://<ngrok-url>/sms/incoming (POST)
```

---

## Environment Variables

### server/.env
```
PORT=3001
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
GEMINI_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
AUTH0_DOMAIN=
AUTH0_AUDIENCE=
```

### redreemer-UI/.env
```
VITE_AUTH0_DOMAIN=
VITE_AUTH0_CLIENT_ID=
VITE_AUTH0_AUDIENCE=
VITE_API_URL=http://localhost:3001
VITE_MOCK_MODE=true   # set false to use real backend
```

---

## Demo

Text **+1 (415) 523-8886** from any phone. Try:
- "I'm homeless and I have nowhere to sleep"
- "I need a payday loan" (scam alert fires)
- "I need a job but I have a record" (fair-chance employers)
- "what benefits do I qualify for" (eligibility navigator)
- "how do I expunge my record" (expungement checker)
- "hola necesito ayuda" (Spanish mode activates)

Or visit the landing page and click "Live Demo" in the demo player.

---

## Hackathon Judging Criteria

**Innovation** — First platform to combine SMS-first financial empowerment with predatory lender detection, expungement eligibility checking, money personality profiling, and step-aware local resources — all in one text message.

**Technical Execution** — Full-stack: Node.js/Express backend, React/TypeScript frontend, Supabase database, Twilio SMS, Gemini 2.5 Flash AI, ElevenLabs voice, 20 distinct features across 3 phases.

**Accessibility & Inclusivity** — Works on any phone including flip phones. No app, no email, no bank account required. Multilingual (auto-detects any language). Literacy-aware simplified mode. Crisis detection in every message.

**Real-World Impact** — All resources are real Phoenix addresses with real phone numbers. FDIC, CFPB, and Census Bureau data embedded. Could be deployed today — just point a Twilio number at the webhook.

**Clarity** — 60-second auto-play demo on the landing page. 6 scenes covering every major feature. "Live Demo" button for judges who want to text the real AI.
