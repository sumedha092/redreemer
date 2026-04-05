# Redreemer — Test Results & Manual Testing Checklist

## Automated Tests — 129/129 PASSING ✅

```
npm test -- test/unit.test.js test/api.test.js
```

### Unit Tests (100/100) — `server/test/unit.test.js`
Pure function tests, no network/DB required. Run in ~500ms.

| Suite | Tests | Status |
|-------|-------|--------|
| smsFormatter | 5 | ✅ |
| privacy (hashPhone, normalizePhone) | 3 | ✅ |
| crisisDetection | 7 | ✅ |
| predatoryDetector | 7 | ✅ |
| languageDetection | 5 | ✅ |
| moneyQuiz | 10 | ✅ |
| benefitsNavigator | 13 | ✅ |
| expungementChecker | 13 | ✅ |
| employerFinder | 9 | ✅ |
| resourceFinder | 5 | ✅ |
| insuranceEducation | 7 | ✅ |
| fallbackResponses | 3 | ✅ |
| smsSignalParsing | 5 | ✅ |
| supabase.computeRiskScore | 5 | ✅ |
| supabase.getRiskLabel | 3 | ✅ |

### API Integration Tests (29/29) — `server/test/api.test.js`
Requires server running on localhost:3001.

| Suite | Tests | Status |
|-------|-------|--------|
| GET /health | 1 | ✅ |
| GET /api/impact | 2 | ✅ |
| POST /api/sms/simulate | 3 | ✅ |
| GET /api/clients/:id/messages | 2 | ✅ |
| POST /api/ai/insights | 4 | ✅ |
| POST /api/tts | 4 | ✅ |
| POST /sms/incoming | 8 | ✅ |
| Protected endpoints (401) | 4 | ✅ |
| Rate limiting | 1 | ✅ |

---

## Manual Testing Checklist

### 🌐 Landing Page — redreemer.vercel.app

- [ ] Page loads without errors
- [ ] Animated dot grid background visible and subtle
- [ ] Logo (reverse-logo.png) shows in navbar and browser tab favicon
- [ ] "Text +1 (415) 523-8886" button opens WhatsApp with `join redreemer` pre-filled
- [ ] "Get Started" button navigates to /signup
- [ ] Stats banner shows animated numbers (47 people, 1284 messages, etc.)
- [ ] "How It Works" cards have colored top borders (yellow/indigo/emerald)
- [ ] Journey section has dark indigo background, yellow step circles animate on scroll
- [ ] Testimonials section has dark emerald background
- [ ] "For Caseworkers" section has indigo-tinted background
- [ ] Demo CTA section (lemon yellow band) shows before footer
- [ ] "Open Caseworker Dashboard" button goes to /dashboard
- [ ] "Try Client View" button goes to /signup
- [ ] Footer privacy/security modals open correctly
- [ ] Page is responsive on mobile

### 🎬 Demo Player (Landing Page)

- [ ] Auto-plays on load after 600ms
- [ ] Scene 1: "I'm homeless" → shelter response appears
- [ ] Scene 2: "payday loan" → scam alert fires with red badge
- [ ] Scene 3: "job but I have a record" → 3 employers appear
- [ ] Scene 4: milestone celebration message appears
- [ ] Scene 5: caseworker view shows
- [ ] Scene 6: impact stats show (47 people, $0 cost)
- [ ] Progress bar advances correctly
- [ ] Scene jump buttons work
- [ ] Auto-loops after 60 seconds
- [ ] "Live Demo" button switches to real PhoneSimulator

### 📱 Phone Simulator (SMS Demo)

- [ ] Dark iMessage UI renders correctly
- [ ] Type a message and press send
- [ ] Typing indicator (3 dots) appears while AI responds
- [ ] AI response appears within ~10 seconds
- [ ] "Listen" button appears under each message
- [ ] "Hear" button appears next to input field
- [ ] Messages scroll to bottom automatically
- [ ] Test: "I need shelter" → gets shelter resources
- [ ] Test: "I need a payday loan" → gets predatory warning
- [ ] Test: "I need a job" → gets fair-chance employers
- [ ] Test: "what benefits do I qualify for" → starts eligibility quiz
- [ ] Test: "hola necesito ayuda" → responds in Spanish
- [ ] Test: "I want to die" → gets 988 crisis response

### 🏠 Client Dashboard (/dashboard → client view)

To test: go to /signup, select "I'm experiencing homelessness", then /dashboard

- [ ] "My Journey" home tab loads
- [ ] Crisis banner visible at top with "Get Help Now" button
- [ ] Crisis modal opens with 988, Crisis Text Line, Homeless Hotline
- [ ] Scam warning banner shows and can be dismissed
- [ ] "What do you need right now?" quick actions grid shows 6 buttons
- [ ] Each quick action navigates to correct tab
- [ ] Journey progress shows step pills and progress bar
- [ ] Health score ring shows (38/100)
- [ ] Quick stats grid shows (Saved, Debt, Steps, Score)
- [ ] "Financial Tools" expand button shows/hides 9 tool cards
- [ ] Each tool card navigates to correct wellness tool
- [ ] Breadcrumb navigation works (back to My Journey)
- [ ] SMS tab shows PhoneSimulator
- [ ] Profile tab shows user info
- [ ] Settings tab shows notification toggles
- [ ] Language selector in top bar (7 languages)
- [ ] Sidebar collapses/expands with menu button
- [ ] Search bar finds nav items
- [ ] Notification bell shows AI alerts

### 💼 Caseworker Dashboard (/dashboard → caseworker view)

Default in mock mode — just go to /dashboard

- [ ] Overview tab loads with 4 stat cards
- [ ] "Send Daily Tip" button works (shows toast)
- [ ] SMS keyword reference card shows all 8 keywords
- [ ] At-risk client alerts show (Darnell)
- [ ] Client list shows 4 clients with risk dots
- [ ] Risk dot colors: green (Marcus), amber (James), red (Darnell)
- [ ] Hover over risk dot shows tooltip with reason
- [ ] Silent client attention banner shows (Darnell 6d)
- [ ] Clicking banner navigates to Clients tab with filter
- [ ] Clients tab: search works
- [ ] Clients tab: "need attention" filter toggle works
- [ ] "Reach Out" button on Darnell opens pre-filled modal
- [ ] Reach Out modal has "Use suggested message" button
- [ ] Client detail shows step progress, health score, conversations
- [ ] "Advance Step" button works
- [ ] "AI Summary" button calls Gemini and shows result
- [ ] Caseworker notes textarea saves
- [ ] Analytics tab shows charts (step funnel, type pie, health scores)
- [ ] "AI Caseload Analysis" button calls Gemini
- [ ] Messages tab shows client list + conversation
- [ ] Profile tab shows 2-column layout
- [ ] Settings tab shows notification toggles
- [ ] Sign out button works

### 💰 Financial Wellness Suite

Access via client dashboard sidebar or /wellness

- [ ] Budget Tracker: income input updates remaining/savings rate
- [ ] Budget Tracker: add transaction form works
- [ ] Budget Tracker: AI Insights panel auto-analyzes on load
- [ ] Budget Tracker: AI shows risk level badge
- [ ] Emergency Fund: ring chart animates to 34%
- [ ] Emergency Fund: milestone list shows correct checkmarks
- [ ] Emergency Fund: AI predicts risk level
- [ ] Debt Payoff: snowball/avalanche toggle changes payoff time
- [ ] Debt Payoff: add debt form works
- [ ] Net Worth: add asset/liability works, net worth updates
- [ ] Savings Goals: add goal form works
- [ ] Risk Score: questionnaire updates score
- [ ] Financial Literacy: 6 modules show
- [ ] Insurance: deductible/copay/renters tabs work
- [ ] Community Data: CFPB bar chart renders
- [ ] Community Data: income table shows 10 rows, low-income highlighted
- [ ] Community Data: banking desert map shows colored squares
- [ ] AI Insight Panel: "Refresh" button re-analyzes
- [ ] AI alerts fire to notification bell for high-risk states

### 🔐 Auth0 (requires Auth0 callback URLs set)

- [ ] /login shows Auth0 login button
- [ ] Clicking login redirects to Auth0
- [ ] After login, redirects to /dashboard
- [ ] /signup shows 3 user type cards
- [ ] Selecting "Caseworker" → routes to CaseworkerDashboard
- [ ] Selecting "Homeless" → routes to ClientDashboard
- [ ] Selecting "Reentry" → routes to ClientDashboard (reentry steps)
- [ ] Sign out clears session and redirects to /

### 📡 SMS (requires ngrok + Twilio webhook)

- [ ] Text "help" to +1 (415) 523-8886 → gets welcome message
- [ ] Text "STOP" → gets opt-out confirmation
- [ ] Text "FOOD" → gets food bank info
- [ ] Text "SHELTER" → gets shelter info
- [ ] Text "I need a payday loan" → gets predatory warning
- [ ] Text "I need a job" → gets fair-chance employers
- [ ] Text "what benefits do I qualify for" → starts eligibility quiz
- [ ] Text "how do I expunge my record" → starts expungement checker
- [ ] Text "hola" → responds in Spanish
- [ ] Text "I want to die" → gets 988 crisis response immediately
- [ ] Text "I'm having a heart attack" → gets 911 response
- [ ] Step completion: AI detects completion → voice clip MMS sent
- [ ] Conversation saved to Supabase (check dashboard)

### 🔊 ElevenLabs Voice (requires ELEVENLABS_API_KEY)

- [ ] POST /api/tts with text → returns audio/mpeg
- [ ] "Listen" button in PhoneSimulator plays AI response
- [ ] "Hear" button previews typed message
- [ ] Only one audio plays at a time (others stop)
- [ ] Step completion MMS sends voice clip

### 📊 Supabase (requires SUPABASE_URL + SERVICE_ROLE_KEY)

- [ ] Run schema.sql in Supabase SQL editor
- [ ] Run migrations/002_add_new_columns.sql
- [ ] Run seed.sql for demo data
- [ ] GET /api/impact returns real counts from DB
- [ ] POST /api/sms/simulate creates user in DB
- [ ] Conversations saved after SMS exchange
- [ ] Step logs created on step completion
- [ ] predatory_warnings incremented on payday loan detection
- [ ] user_meta JSONB updated after money quiz

### 🚀 Vercel Deployment

- [ ] redreemer.vercel.app loads landing page
- [ ] /dashboard loads caseworker dashboard (mock mode)
- [ ] /signup loads user type selection
- [ ] /wellness loads financial wellness suite
- [ ] /404-test loads NotFound page
- [ ] Favicon shows reverse-logo.png in browser tab
- [ ] GitHub push to main triggers auto-deploy

---

## Known Issues / Limitations

1. **Twilio daily limit** — Free account has 50 SMS/day. Tests that send real SMS will fail after limit hit.
2. **WhatsApp sandbox** — Users must text `join redreemer` before chatting. Upgrade to WhatsApp Business to remove this.
3. **Auth0 callbacks** — Must add `https://redreemer.vercel.app/dashboard` to Auth0 allowed callbacks for production login to work.
4. **ElevenLabs** — TTS works but voice clips (milestone MMS) require pre-generation on server start.
5. **Google Places API** — `your_google_places_api_key` placeholder in .env — real-time resource lookup won't work without a valid key.
6. **Weather API** — `your_weather_api_key` placeholder — cold weather alerts won't fire without a valid key.
7. **Vercel auto-deploy** — GitHub integration is connected; pushes to `main` auto-deploy. May take 1-2 minutes.
