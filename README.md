# Redreemer

> Redeem what was lost. Redream what's possible.

Redreemer is a free SMS-based financial empowerment platform for two of America's most financially excluded populations — people experiencing homelessness and people recently released from prison.

One phone number. Text anything. Gemini responds with real local resources, tracks your progress on an 8-step ladder, and proactively reaches out when it matters.

---

## How It Works

1. Someone texts the Redreemer number
2. Gemini asks: "Are you currently homeless, recently released from prison, or both?"
3. Based on the answer, Gemini routes them to the correct experience
4. From that point: text anything in plain English, get specific local answers
5. Progress is tracked automatically. Weekly Sunday updates. ElevenLabs voice messages at milestones.

---

## Tech Stack

| Tool | Role |
|------|------|
| Twilio | SMS in/out + voice clip delivery |
| Gemini API (gemini-1.5-flash) | All AI — routing, responses, weekly summaries |
| ElevenLabs | Milestone voice messages |
| Auth0 | Caseworker dashboard auth + role-based access |
| Supabase | Database + Row Level Security |
| React + Tailwind | Caseworker dashboard |
| Node.js + Express | Backend |
| Vercel | Deployment |

---

## Setup

### 1. Clone and install

```bash
# Server
cd redreemer/server
npm install

# Client
cd redreemer/client
npm install
```

### 2. Configure environment variables

Copy `server/.env` and fill in your keys:

```
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
```

Copy `client/.env` and fill in:

```
VITE_AUTH0_DOMAIN=
VITE_AUTH0_CLIENT_ID=
VITE_AUTH0_AUDIENCE=
```

### 3. Set up Supabase

Run `supabase/schema.sql` in your Supabase SQL editor, then `supabase/seed.sql` for demo data.

### 4. Connect Twilio webhook

Start the server and expose it with ngrok:

```bash
ngrok http 3001
```

Set your Twilio webhook URL to:
```
https://your-ngrok-url.ngrok.io/sms/incoming
```
Method: POST

### 5. Run

```bash
# Server
cd server && npm run dev

# Client (separate terminal)
cd client && npm run dev
```

---

## Auth0 Setup

1. Create an Auth0 application (Single Page Application for the dashboard)
2. Create an Auth0 API with your audience URL
3. Add a custom claim to your Auth0 Action (Login flow):
   ```javascript
   exports.onExecutePostLogin = async (event, api) => {
     api.idToken.setCustomClaim('https://redreemer.app/role', event.user.app_metadata.role);
     api.accessToken.setCustomClaim('https://redreemer.app/role', event.user.app_metadata.role);
   };
   ```
4. Set `app_metadata.role` to `caseworker` or `admin` for each user in Auth0 dashboard

---

## Demo

Marcus (homeless, Step 4) and James (reentry, Step 3) are pre-loaded in the seed data.

**Demo SMS flow:**
- Text your Twilio number: "I'm hungry and cold tonight"
- Redreemer responds in ~8 seconds with shelter + food bank

**Demo dashboard:**
- Log in at `localhost:5173`
- See Marcus and James in the client list
- Play ElevenLabs voice clips from their milestone history

---

## Hackathon Tracks

- **Best Use of Gemini** — Gemini IS Redreemer. Every response, routing decision, resource match, and proactive message runs through Gemini. Agentic architecture: reads context, reasons about situation, selects resources, tracks progress, proactively reaches out.
- **Best Use of ElevenLabs** — Milestone voice messages are the emotional peak. Play button prominent in dashboard.
- **Best Use of Auth0** — Two roles (caseworker + admin), RLS enforced at database level, Security & Privacy panel in dashboard.
- **State Farm Financial Wellness** — Financial literacy through every interaction, 8-step ladder, accessible to most excluded populations.
- **Google Agentic AI** — Gemini reads context, reasons, routes, selects resources, tracks progress, proactively reaches out without being prompted.
