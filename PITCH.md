# Redreemer — Full Pitch Document
## Demo, Presentation & Judging Criteria Guide

---

## THE ONE-LINE PITCH

**Redreemer is the only financial empowerment platform built for people who don't have a smartphone, a bank account, or an address — just a phone that can text.**

---

## THE PROBLEM (60-second version)

Tonight, **582,000 Americans are experiencing homelessness**. This year, **600,000 people will be released from prison**.

Every financial app in existence assumes you have:
- A smartphone with internet
- An email address
- A bank account
- A permanent address
- Time to learn a new app

These people have none of that. They have a flip phone. They have $40 and a bus ticket. They have a parole officer to check in with tomorrow morning.

**The financial system was not designed for them. It was designed around them.**

The result: 19% of Arizona residents are unbanked or underbanked. Payday lenders charge 300-500% APR and specifically target people in financial crisis. 68% of released prisoners are rearrested within 3 years — not because they want to go back, but because the system makes stability nearly impossible to reach.

**Financial exclusion is a design problem. We're redesigning it.**

---

## THE SOLUTION

Redreemer is a **free SMS-based financial empowerment platform**. Users text a single phone number in plain English. Our AI responds with real local resources, real phone numbers, real addresses — and walks them through an 8-step ladder from survival to financial independence.

**No app. No download. No bank account required. No address required. Just a text.**

---

## WHAT MAKES US DIFFERENT — THE GAPS WE FILL

### Gap 1: No existing platform intercepts predatory lenders in real time

When someone in financial crisis texts "I need a payday loan," every other platform either ignores it or gives generic advice. **Redreemer intercepts it before the AI even responds.**

We detect 20+ predatory keywords (payday loan, title loan, cash advance, check cashing, easy approval, guaranteed loan, 500% APR, etc.) in English AND Spanish. The moment we detect it, we fire a bilingual warning with safer alternatives — Bank On certified accounts, OneUnited Bank, local credit unions — and log the attempt so caseworkers can see how many scam attempts their clients are facing.

**No other platform does this. Not one.**

### Gap 2: No existing platform gives step-aware local resources

Generic financial apps give generic advice. "Open a bank account." Great — which one? Where? What do I bring?

Redreemer knows exactly what step each user is on and injects **real Phoenix addresses, real phone numbers, real hours** into every AI response. Step 1 user asking for help? They get the Human Services Campus address and phone number. Step 4 user asking about banking? They get Chase Bank On Checking, Wells Fargo Clear Access, and OneUnited Bank with exactly what to bring.

**The AI doesn't make things up. It uses verified local resources matched to the user's exact situation.**

### Gap 3: No existing platform has a money personality system for this population

Research from Virginia Supportive Housing showed that understanding someone's relationship with money — before teaching them anything about it — dramatically improves outcomes.

Redreemer runs a **4-question SMS quiz** that classifies users into Survivor, Planner, or Builder. Every future AI response is then tailored to that personality. A Survivor gets immediate wins and stability framing. A Planner gets step-by-step structure. A Builder gets detail and long-term framing.

**This is the first time behavioral finance psychology has been applied to homeless and reentry populations via SMS.**

### Gap 4: No existing platform has an expungement eligibility checker via text

Most people with criminal records don't know they qualify for expungement. The process is free in Arizona. But nobody tells them.

Redreemer walks users through a 3-question SMS flow, applies Arizona's actual eligibility rules (misdemeanor: 3 years, Class 4-6 felony: 5 years, Class 2-3 felony: 7 years), and either gives them the exact steps to file for free OR sets a reminder for when they become eligible.

**This is a legal service delivered via text message to people who can't afford a lawyer.**

### Gap 5: No existing platform has a fair-chance employer finder with a call script

When someone texts "I need a job but I have a record," Redreemer returns 3 real Phoenix employers with fair-chance hiring policies, their phone numbers, addresses, and a specific script: "When you call, you don't have to mention your record upfront — these employers have fair-chance policies which means they evaluate you as a person first."

That one sentence removes the biggest psychological barrier to applying.

### Gap 6: No existing platform has a benefits navigator that asks the right questions

"You may qualify for SNAP" is useless. Redreemer asks 4 yes/no questions (income, kids, citizenship, disability) and returns a **personalized benefits list** — SNAP, AHCCCS, SSI, LIHEAP, TANF — with exact application URLs and phone numbers, in English or Spanish.

### Gap 7: No existing platform has a caseworker dashboard with engagement risk scoring

Caseworkers manage dozens of clients. They can't check in with everyone every day. Redreemer's dashboard automatically flags:
- Clients silent for 7+ days (amber warning)
- Clients silent for 14+ days (red warning)
- Clients silent for 21+ days ("Lost contact" — moved to top of list)

Each client has an **engagement risk score (0-10)** computed from days silent, current step, predatory warning count, and recent activity. Caseworkers see a colored dot on every client card with a hover tooltip explaining the risk.

**No other caseworker platform has this. Most are just spreadsheets.**

### Gap 8: No existing platform has literacy-aware simplified mode

If a user consistently sends messages under 5 words, Redreemer automatically detects potential low literacy and switches to simplified mode: max 2 sentences per message, 6th-grade vocabulary, no financial jargon.

---

## THE 8-STEP LADDER

Every user follows a structured path from survival to independence:

**Homeless Path:**
1. Connect to Redreemer
2. Get a free state ID (unlocks everything)
3. Get shelter address for mail (required for bank accounts)
4. Open Bank On account (no credit check, no minimum)
5. Enroll in benefits (SNAP, Medicaid, LIHEAP)
6. Find stable income (Ban the Box employers)
7. Save first $200 (emergency buffer)
8. Save $500 housing deposit (full independence)

**Reentry Path:**
1. Connect to Redreemer
2. Complete parole check-in (Day 1 priority)
3. Get free state ID
4. Open Bank On account
5. Enroll in benefits
6. Find Ban the Box employer
7. Start paying court debt (legal aid helps)
8. Save first $500

Each step completion triggers a **voice milestone message** via ElevenLabs — a warm human voice saying "You just opened your first bank account. That is not a small thing." Delivered as an MMS.

---

## THE TECHNOLOGY

### SMS Layer (Twilio + Gemini 2.5 Flash)
- Users text +1 (415) 523-8886 from any phone
- Twilio webhook → Express server → 20+ detection layers → Gemini AI
- Gemini 2.5 Flash generates responses in any language (auto-detected)
- Responses split into 300-character chunks with 1-second delays (SMS-friendly)

### Detection Pipeline (runs before AI, in order)
1. Medical emergency → 911 response immediately
2. Crisis/suicide → 988 Lifeline immediately
3. Opt-out (STOP) → mark opted out
4. Predatory lending → bilingual warning, log to DB
5. Money quiz state machine → 4-question flow
6. Benefits navigator → 4-question eligibility flow
7. Expungement checker → 3-question Arizona flow
8. Fair-chance employer finder → 3 real employers
9. Insurance education → deductible/copay/coverage
10. Keyword shortcuts (FOOD, SHELTER, BANK, ID, BENEFITS, JOB, DEBT, HELP)
11. Gemini AI → full multi-turn conversation with step-aware resources

### AI System (Gemini 2.5 Flash)
- System prompt includes: user's name, city, step, user type, money personality, simplified mode flag
- Step-aware resources injected for every response (real Phoenix addresses)
- Detects [STEP_COMPLETE] signal → advances step, triggers voice clip
- Detects [REMINDER: text | ISO8601] signal → saves to DB for cron delivery
- Detects [SIMPLIFIED_MODE] signal → enables literacy-aware responses
- Full multi-turn conversation history (last 20 messages)

### Proactive Outreach (Cron Jobs)
- **Daily 10am**: Contextual check-in — Gemini reads last 3 messages and writes a personalized check-in referencing what the user was working on
- **Sunday 9am**: Weekly progress SMS + weekly wins (skips users who texted in last 24h)
- **Every 6 hours**: Weather alert — if temp < 35°F in a city with homeless users, sends shelter alert
- **Every 5 minutes**: Reminder delivery — sends any saved appointment reminders

### Financial Wellness Suite (9 tools)
All tools have real-time AI analysis via Gemini:
1. **Budget Tracker** — 50/30/20 rule, category tracking, AI identifies top spending issue
2. **Emergency Fund Planner** — ring chart, milestone tracking, AI predicts risk level and months until need
3. **Debt Payoff Calculator** — snowball vs avalanche, AI recommends method based on debt profile
4. **Net Worth Calculator** — assets vs liabilities, AI gives 6-month trajectory
5. **Savings Goals** — multiple goals, AI identifies most achievable and at-risk goals
6. **Risk Score Assessment** — 10-question assessment, AI gives trend (improving/stable/declining)
7. **Financial Literacy** — 6 modules (bank accounts, credit, SNAP, budgeting, insurance, housing)
8. **Insurance Education** — deductible, copay, renters insurance, Medicaid eligibility
9. **Community Data** — CFPB complaints, FDIC unbanked rates, ACS income by zip, banking desert map

### Community Data (Real Public Datasets)
- **CFPB Consumer Complaint Database** — most complained-about financial products in Arizona
- **FDIC How America Banks 2023** — unbanked/underbanked rates (AZ: 19% vs national 18.6%)
- **Census Bureau ACS 2022** — median household income by zip code, bottom 10 highlighted
- **FDIC BankFind** — banking desert map showing 0-branch zip codes in Arizona

### Database (Supabase + PostgreSQL)
- 5 tables: users, conversations, step_logs, reminders, caseworkers
- Row Level Security — caseworkers can only see their own clients
- user_meta JSONB — stores money personality, document status, savings goals, simplified mode
- predatory_warnings counter — tracks scam attempts per user
- Crisis alerts table — logged and resolved by caseworkers

### Caseworker Dashboard
- Real-time client list with engagement risk scores (green/amber/red dots)
- Silent client alerts with "Reach Out" button and pre-filled suggested message
- AI caseload analysis — Gemini analyzes the full caseload and gives strategic recommendations
- Step advancement, direct SMS, caseworker notes
- Analytics: step funnel chart, client type breakdown, health score bars
- Export client progress reports as JSON (for grant applications)
- Scam attempts blocked counter per client

### Voice (ElevenLabs)
- 6 pre-generated milestone voice clips (step 1, 2, 4, 5, 7, 8)
- On-demand TTS via POST /api/tts — "Listen" button on every AI message in the chat UI
- Auto-triggered on step completion via MMS, text fallback if MMS fails

---

## THE DATA STORY

**Why Arizona?**
- 19% of Arizona residents are unbanked or underbanked (FDIC 2023)
- Phoenix has the 5th largest homeless population in the US
- Arizona has 600+ banking desert zip codes
- The CFPB data shows mortgage and credit card complaints dominate — products these users can't even access yet

**The gap we're filling:**
The bottom 10 zip codes in Arizona have median household incomes under $25,000. These are the communities Redreemer serves. Real data. Real gaps. Real help.

---

## JUDGING CRITERIA — HOW WE SCORE

### Innovation ✅
- First platform to combine SMS-first delivery with predatory lender detection, expungement eligibility checking, money personality profiling, and step-aware local resources — all in one text message
- No app, no email, no bank account required — the only financial platform that works on a flip phone
- Behavioral finance psychology (money personality quiz) applied to homeless/reentry populations for the first time via SMS

### Technical Execution ✅
- Full-stack: Node.js/Express backend, React/TypeScript frontend, Supabase database
- 20+ SMS detection layers running before AI
- Gemini 2.5 Flash for all AI (routing, responses, check-ins, weekly wins, quiz)
- ElevenLabs voice milestones
- Twilio SMS + MMS
- 129 automated tests (100 unit + 29 API integration), all passing
- Deployed on Vercel (redreemer.vercel.app), GitHub auto-deploy connected
- 60-second auto-play demo on landing page

### Accessibility & Inclusivity ✅
- Works on any phone including flip phones — no smartphone required
- No app, no email, no bank account, no address required
- Auto-detects any language and responds in that language
- Literacy-aware simplified mode (auto-detects short messages)
- Bilingual (English + Spanish) for all flows including predatory warnings, benefits navigator, expungement checker
- Crisis detection in every message — 988 Lifeline response in under 1 second
- "No judgment. You're not alone." — every interaction designed for vulnerable populations

### Real-World Impact ✅
- All resources are real Phoenix addresses with real phone numbers, verified
- Could be deployed today — just point a Twilio number at the webhook
- Caseworker dashboard is production-ready with Auth0 authentication
- FDIC, CFPB, and Census Bureau data embedded — credibility and depth
- The 8-step ladder is based on real housing stability research
- Expungement checker uses actual Arizona law (ARS § 13-905)

### Clarity of Communication ✅
- 60-second auto-play demo on landing page — 6 scenes covering every major feature
- "Live Demo" button for judges who want to text the real AI
- Landing page tells the full story in the first scroll
- "Open Caseworker Dashboard" button — no login required in mock mode

---

## STATE FARM TRACK — FINANCIAL WELLNESS

State Farm's track focuses on financial wellness tools for underserved populations. Here's how Redreemer directly addresses every criterion:

**"Does the solution address a real gap in financial wellness in a creative or novel way?"**

Yes — and specifically the gap that State Farm's own customers in low-income zip codes face. The FDIC data shows 19% of Arizona residents are unbanked. These are people who pay more for basic financial services than anyone else — check cashing fees, money order fees, payday loan interest. Redreemer eliminates every one of those fees by getting people into Bank On certified accounts.

**"Is the project functional, well-built, and demonstrated effectively?"**

129 automated tests passing. Deployed on Vercel. Real Twilio number. Real Gemini AI. Real Supabase database. The demo player shows the full journey in 60 seconds. Judges can text the real number.

**"Does the solution meaningfully serve users who lack financial knowledge or access to traditional financial tools?"**

This is the entire point. Every feature was designed for someone who has never had a bank account, doesn't understand what a deductible is, and is afraid to call an employer because of their record. The literacy-aware simplified mode, the money personality quiz, the plain-English explanations — all of it is designed for financial beginners in crisis.

**"Could this be deployed or adopted today?"**

Yes. The server runs on Node.js. The webhook is a single URL. Any organization with a Twilio account and a Supabase database can deploy this in an afternoon. The caseworker dashboard is production-ready with Auth0 authentication and role-based access control.

**"Can a non-technical judge understand what the product does within the first 60 seconds?"**

The landing page headline: "No app. No bank account. No address required. Just a text — and a path from the street to stability." The 60-second demo player shows exactly what happens when someone texts for help.

---

## THE DEMO SCRIPT (60 seconds)

**Scene 1 (0-10s): First contact**
User texts: "I'm homeless and I have nowhere to sleep tonight"
AI responds with 2 real Phoenix shelters, addresses, open now

**Scene 2 (10-20s): Scam alert fires**
User texts: "someone offered me a $500 payday loan"
Predatory lender detected — warning fires automatically with safer alternatives

**Scene 3 (20-30s): Fair-chance jobs**
User texts: "I need a job but I have a record"
3 real Phoenix employers returned with phone numbers and call script

**Scene 4 (30-40s): Step milestone**
Step 4 complete — voice clip fires via MMS
"You just opened your first bank account. That is not a small thing."

**Scene 5 (40-50s): Caseworker view**
Dashboard shows client progress, risk scores, silent client alerts

**Scene 6 (50-60s): Impact**
47 people helped. $0 cost to users. 24/7 available.

---

## WHAT NO ONE ELSE IS DOING

| Feature | Redreemer | Every other platform |
|---------|-----------|---------------------|
| Works on flip phones | ✅ SMS only | ❌ Requires smartphone |
| Predatory lender detection | ✅ Real-time, bilingual | ❌ Doesn't exist |
| Step-aware local resources | ✅ Real addresses + phones | ❌ Generic advice |
| Money personality quiz via SMS | ✅ 4-question, tailored AI | ❌ Doesn't exist |
| Expungement eligibility checker | ✅ Arizona law, via text | ❌ Doesn't exist |
| Fair-chance employer finder | ✅ 3 real employers + call script | ❌ Generic job boards |
| Benefits navigator via SMS | ✅ 4-question, personalized | ❌ Generic links |
| Caseworker engagement risk scores | ✅ 0-10 score, colored dots | ❌ Spreadsheets |
| Literacy-aware simplified mode | ✅ Auto-detects, auto-switches | ❌ Doesn't exist |
| Voice milestones on step completion | ✅ ElevenLabs MMS | ❌ Doesn't exist |
| Contextual check-ins | ✅ Gemini reads prior conversation | ❌ Generic templates |
| Crisis detection in every message | ✅ 988 in under 1 second | ❌ Rarely |
| Multilingual (any language) | ✅ Auto-detects, responds in kind | ❌ English only |
| Community data (CFPB/FDIC/Census) | ✅ Embedded, offline | ❌ Doesn't exist |
| Banking desert map | ✅ FDIC data, colored by density | ❌ Doesn't exist |

---

## THE NUMBERS

- **582,000** Americans experiencing homelessness tonight
- **600,000** people released from prison each year
- **19%** of Arizona residents unbanked or underbanked (FDIC 2023)
- **300-500%** APR charged by payday lenders targeting this population
- **68%** of released prisoners rearrested within 3 years
- **$0** cost to users — Redreemer is free forever
- **24/7** AI availability — no office hours, no waitlist
- **8 steps** from survival to full financial independence
- **20+** SMS detection layers running before AI
- **129** automated tests, all passing
- **9** financial wellness tools with real-time AI analysis
- **4** real public datasets embedded (CFPB, FDIC, Census, BankFind)

---

## LIVE DEMO

**Website**: redreemer.vercel.app

**Text the real AI**: +1 (415) 523-8886
- First time on WhatsApp: send `join redreemer` to activate
- Then text anything: "I need shelter", "I need a job", "I need a payday loan", "hola"

**Dashboard** (no login required): redreemer.vercel.app/dashboard

**Try client view**: redreemer.vercel.app/signup → select user type → dashboard

---

## TEAM

Built at InnovationHacks 2026. Redreemer was built for the people in the bottom 10 zip codes of Arizona. Real data. Real gaps. Real help.

*"Redeem what was lost. Redream what's possible."*
