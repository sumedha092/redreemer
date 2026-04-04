# Redreemer

> Redeem what was lost. Redream what's possible.

SMS-based financial empowerment platform for homeless individuals and people recently released from prison. One phone number. Text anything. Gemini responds with real local resources, tracks your 8-step progress toward housing stability, and proactively reaches out when it matters.

---

## What It Does

- **SMS layer** — Text the Redreemer number in plain English. Gemini routes you to the right experience (homeless or reentry), answers with real local resources via Google Places API, and tracks your progress automatically.
- **8-step ladder** — Two ladders (homeless + reentry), each guiding users from first contact to financial stability.
- **Proactive outreach** — Weather alerts below 35°F, appointment reminders, 5-day check-ins.
- **ElevenLabs voice milestones** — Warm human voice messages when users complete major steps.
- **Caseworker dashboard** — React app with Auth0 login, client management, financial health scores, analytics, and demo mode.
- **Financial Wellness suite** — Budget tracker, net worth calculator, emergency fund planner, debt payoff calculator, insurance education, savings goals, risk assessment, financial literacy modules.

---

## Stack

| Tool | Role |
|------|------|
| Node.js + Express | Backend |
| React + Tailwind CSS | Caseworker dashboard |
| Supabase | Database + RLS |
| Twilio | SMS in/out + voice delivery |
| Gemini API (gemini-1.5-flash) | All AI — routing, responses, weekly summaries |
| ElevenLabs | Milestone voice messages |
| Auth0 | Caseworker auth + role-based access |
| Google Places API | Real nearby resources |
| Recharts | Analytics charts |
| Vercel | Deployment |

---

## Setup

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/redreemer.git
cd redreemer
```

### 2. Server

```bash
cd server
npm install
cp .env.example .env   # fill in your keys
npm run dev
```

### 3. Client

```bash
cd client
npm install
cp .env.example .env   # fill in your keys
npm run dev
```

### 4. Database

Run `supabase/schema.sql` in your Supabase SQL editor, then optionally `supabase/seed.sql` for demo data.

Add the `financial_health_score` column if upgrading:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS financial_health_score integer default 0;
```

### 5. Twilio Webhook

```bash
ngrok http 3001
```

Set your Twilio number webhook to:
```
https://your-ngrok-url.ngrok.io/sms/incoming
```
Method: HTTP POST

---

## Environment Variables

### server/.env

```
PORT=3001
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
GEMINI_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
AUTH0_DOMAIN=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_AUDIENCE=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
WEATHER_API_KEY=
GOOGLE_PLACES_API_KEY=
```

### client/.env

```
VITE_MOCK_MODE=false
VITE_AUTH0_DOMAIN=
VITE_AUTH0_CLIENT_ID=
VITE_AUTH0_AUDIENCE=
VITE_API_URL=http://localhost:3001
```

---

## Demo

Set `VITE_MOCK_MODE=true` in `client/.env` to run the dashboard with mock data (Marcus, James, Darnell) without any backend.

For a live demo, click "Run Demo" on the Analytics page to create Alex — a pre-scripted 3-week conversation showing survival → stability → empowerment.

---

## Hackathon Tracks

- **State Farm Financial Wellness** — Financial literacy through every SMS interaction, 8-step ladder, accessible to most excluded populations
- **Google Agentic AI** — Gemini reads context, reasons about user situation, routes, selects resources, tracks progress, proactively reaches out
- **Best Use of ElevenLabs** — Milestone voice messages at key steps
- **Best Use of Auth0** — Two roles (caseworker + admin), RLS enforced at database level
