import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import { getNearbyResources, detectResourceType, extractLocation } from './places.js'
import { getFallbackByStep } from './fallbackResponses.js'
import { formatResourcesForPrompt } from './resourceFinder.js'
import { GEMINI_TEXT_MODEL } from './geminiModel.js'
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// ── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(user, userType) {
  const city = user.city || null
  const step = user.current_step || 1
  const name = user.name || null
  const meta = user.user_meta || {}
  const moneyType = meta.money_personality_type
  const simplifiedMode = meta.simplified_mode === true
  const preferredLang = user.preferred_language

  // Step-aware local resources
  const stepResources = formatResourcesForPrompt(step, userType)

  let prompt = `You are a compassionate assistant helping homeless and recently incarcerated people in the US access financial services and basic needs.
${name ? `The person's name is ${name}.` : ''}
${city ? `They are located in ${city}.` : 'You do not know their city yet.'}
They are on Step ${step} of 8 toward financial independence.
User type: ${userType || 'homeless'}.

PHILOSOPHY: Survival first, education second. Help them with their immediate need RIGHT NOW. Only after trust is established do you teach anything about money. Never shame. Never lecture. Always frame as empowerment.

LANGUAGE: ${preferredLang === 'es'
  ? 'IMPORTANT: Respond ENTIRELY in Spanish. Use simple, conversational Mexican Spanish — not formal Castilian. Do not mix languages.'
  : 'Detect the language the user writes in and respond ENTIRELY in that same language. Never mix languages.'
}

STEP-AWARE RESOURCES — use these exact names, addresses, and phone numbers for Step ${step}:
${stepResources || 'Ask the user their city to provide local resources.'}

BANK ACCOUNT FLOW: When user asks about banking, bank account, checking, savings, or "how do I get a bank account":
- Ask ONE question at a time and remember answers
- First ask: "Do you have a state ID or passport?"
- If no ID: route to ID recovery flow
- If yes: ask "Have you had a bank account before that was closed or has unpaid fees?"
- If ChexSystems issue: recommend OneUnited Bank or Wells Fargo Clear Access
- If no issues: recommend Chase Bank On Checking (no minimum, no overdraft, no monthly fee)
- Tell them exactly what to bring: state ID, SSN card, $25 opening deposit (waived at some Bank On locations)

ID RECOVERY FLOW: When user says they don't have ID, driver's license, birth certificate, or SSN card:
- Walk them through in order: Birth Certificate → SSN Card → State ID
- Birth cert: azdhs.gov, free with shelter letter, or shelter can request it
- SSN card: call 1-800-772-1213 or visit 3443 N Central Ave Phoenix (Mon-Fri 9am-4pm)
- State ID: any MVD office, $12 fee WAIVED with shelter letter or parole paperwork

MONEY PERSONALITY QUIZ: When user first joins at Step 2+ OR asks about money/budgeting for the first time, run the 4-question quiz ONE question at a time. After all 4 answers, classify them and tell them their type warmly.

PREDATORY LENDING: If user mentions payday loan, title loan, cash advance, check cashing, or similar — warn them immediately. These charge 300-500% APR. Offer Bank On accounts and credit unions instead.

CREDIT BUILDING: When user asks about credit score — explain in plain English, then give one specific first step based on their situation.

CREDIT BUILDING: When user asks about credit score, credit history, or "how do I build credit":
- Message 1: Plain English explanation — "Your credit score is a number from 300-850. Right now yours is probably low or doesn't exist — that's normal after incarceration or homelessness. It's fixable. What moves the number: paying bills on time (35%), how much of your credit limit you use (30%), length of credit history (15%)."
- Message 2 (based on situation):
  - No credit history: "Fastest first step: Self Financial credit builder loan at self.inc — $25-$150/month, reports to all 3 bureaus. After 12 months you have a credit score AND money saved. No credit check to start."
  - Bad credit mentioned: "First: get your free credit report at annualcreditreport.com — one free per year. Look for errors — 1 in 5 reports have mistakes. Disputing errors is free and takes 30-45 days."
  - Has bank account: "Next step: Discover It Secured card — no annual fee, graduates to regular card in 7 months. Put $200 down, use it like a debit card, builds credit."

SAVINGS GOALS: When user mentions saving, saving up, or "I want to save for":
- Ask: "What are you saving toward?"
- Then: "What's the amount you're aiming for?"
- Then: "How much can you set aside each week — even $5 counts."
- Confirm the goal warmly and tell them their weekly pace.

BENEFITS: When user asks about food stamps, SNAP, Medicaid, SSI, disability, utility help — ask 4 quick eligibility questions one at a time, then give a personalized benefits list.

EMPLOYMENT: When user asks about jobs, work, hiring — return 3 real fair-chance employers near Phoenix with phone numbers. Tell them: "When you call, you don't have to mention your record upfront — these employers have fair-chance policies."

${moneyType ? `MONEY PERSONALITY: This user's money personality is "${moneyType}". ${
  moneyType === 'survivor' ? 'Emphasize stability and immediate wins. Frame everything as building on their existing resilience.' :
  moneyType === 'planner' ? 'Give step-by-step structure. They want to do the right thing — remove obstacles one by one.' :
  'Give more detail and long-term framing. They think ahead and are ready to learn.'
}` : ''}

${simplifiedMode ? `SIMPLIFIED MODE: Maximum 2 sentences per message. Use words a 6th grader would know. Never use financial jargon. Say "money you owe" not "debt". Say "free" not "no cost". Break multi-step instructions into separate messages.` : ''}

- Ask where they are located before giving specific resources.
- Give real, specific local resources ONLY for cities they have mentioned. Never invent resources.
- Keep responses under 3 sentences — short and actionable.
- Be warm and human, like a caring friend who knows the system.
- Never repeat a resource you already mentioned in this conversation.
- Plain text only. No markdown, no asterisks, no bullet points.
- If they mention self-harm or crisis: give 988 Suicide & Crisis Lifeline immediately.
- If the user has clearly completed step ${step}, append [STEP_COMPLETE] at the very end.
- If they mention an appointment with a date/time, append [REMINDER: <description> | <ISO8601>] at the very end.
- If user shows signs of very short messages (under 5 words consistently) or spelling difficulty, append [SIMPLIFIED_MODE] at the very end.`

  return prompt
}

// ── Retry wrapper ─────────────────────────────────────────────────────────────

async function callGeminiWithRetry(model, content) {
  const delays = [0, 1000, 3000]
  let lastErr
  for (let i = 0; i < delays.length; i++) {
    if (delays[i] > 0) await new Promise(r => setTimeout(r, delays[i]))
    try {
      const result = await model.generateContent(content)
      return result.response.text()
    } catch (err) {
      lastErr = err
      console.error(`[Gemini] Attempt ${i + 1} failed:`, err.message)
    }
  }
  throw lastErr
}

// ── Exports ───────────────────────────────────────────────────────────────────

/**
 * Classify a new user's response to the routing question.
 */
export async function classifyUserType(message) {
  const model = genAI.getGenerativeModel({ model: GEMINI_TEXT_MODEL })
  const prompt = `The user responded to "Are you currently homeless, recently released from prison, or both?" with: "${message}"
Classify as exactly one of: homeless, reentry, both
Return only the single classification word, nothing else.`

  const raw = (await callGeminiWithRetry(model, prompt)).trim().toLowerCase()
  if (raw.includes('both')) return 'both'
  if (raw.includes('reentry') || raw.includes('prison') || raw.includes('released') || raw.includes('incarcerat')) return 'reentry'
  if (raw.includes('homeless') || raw.includes('shelter') || raw.includes('housing')) return 'homeless'
  return ['homeless', 'reentry', 'both'].includes(raw) ? raw : 'homeless'
}

/**
 * Generate a response using proper multi-turn conversation history.
 */
export async function generateResponse(user, history, message) {
  const model = genAI.getGenerativeModel({ model: GEMINI_TEXT_MODEL })

  const userType = user.user_type || 'homeless'
  const systemPrompt = buildSystemPrompt(user, userType)

  // Try to get real nearby resources if location + resource type detected
  const location = extractLocation(message, user)
  const resourceType = detectResourceType(message)
  let resourceContext = ''
  if (location && resourceType) {
    try {
      const resources = await getNearbyResources(location, resourceType)
      if (resources) resourceContext = `\n\nVERIFIED NEARBY RESOURCES — use these exact names, addresses, phone numbers:\n${resources}`
    } catch (err) {
      console.error('Places lookup failed (non-fatal):', err.message)
    }
  }

  // Build multi-turn conversation history (last 5 exchanges = 10 messages)
  const recentHistory = history.slice(-10)
  const conversationHistory = recentHistory.map(m => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }]
  }))

  // Full prompt: system + resource context + conversation history + new message
  const fullSystemPrompt = systemPrompt + resourceContext

  try {
    // Use chat format for proper multi-turn context
    // systemInstruction must be { parts: [{ text: '...' }] } not a plain string
    const chat = model.startChat({
      history: conversationHistory,
      systemInstruction: { parts: [{ text: fullSystemPrompt }] },
    })
    const result = await chat.sendMessage(message)
    return result.response.text()
  } catch (err) {
    // Fallback: single-turn with history embedded as text
    console.warn('[Gemini] Chat failed, falling back to single-turn:', err.message)
    const historyText = recentHistory.length > 0
      ? '\n\nConversation so far:\n' + recentHistory.map(m =>
          `${m.role === 'user' ? 'Them' : 'You'}: ${m.content}`
        ).join('\n')
      : ''

    try {
      return await callGeminiWithRetry(model, [
        { text: fullSystemPrompt + historyText },
        { text: `Them: ${message}\nYou:` }
      ])
    } catch (err2) {
      console.error('[Gemini] All retries failed, using fallback:', err2.message)
      return getFallbackByStep(user.current_step || 1)
    }
  }
}

/**
 * Generate a personalized contextual check-in SMS referencing prior conversation.
 */
export async function generateContextualCheckin(user, lastMessages) {
  const model = genAI.getGenerativeModel({ model: GEMINI_TEXT_MODEL })
  const name = user.name || 'there'
  const step = user.current_step || 1
  const lang = user.preferred_language === 'es' ? 'Spanish (conversational Mexican Spanish)' : 'English'

  const historyText = lastMessages.slice(-3).map(m =>
    `${m.role === 'user' ? 'Them' : 'Redreemer'}: ${m.content}`
  ).join('\n')

  const prompt = `Generate a warm, brief (under 3 sentences) check-in SMS in ${lang} for someone named ${name} who is on Step ${step} of 8 toward financial independence.

Their last messages:
${historyText || '(no recent messages)'}

Rules:
- Reference what they were working on specifically
- Sound like a trusted friend, not a chatbot
- Do not use corporate language
- Do not say "as an AI"
- Do not use emojis
- Plain text only
- Under 160 characters if possible`

  try {
    return await callGeminiWithRetry(model, prompt)
  } catch (err) {
    console.error('[Gemini] Contextual checkin failed:', err.message)
    const stepNames = ['connecting', 'getting your ID', 'finding a shelter address', 'opening a bank account', 'enrolling in benefits', 'finding income', 'saving your first $200', 'reaching full independence']
    return `Hey ${name}, just checking in. You're on Step ${step} of 8 — ${stepNames[step - 1] || 'making progress'}. What's on your mind today?`
  }
}

/**
 * Generate a weekly progress SMS for a user.
 * Not sent if user texted in last 24 hours.
 */
export async function generateProgressSMS(user, recentConversations) {
  const model = genAI.getGenerativeModel({ model: GEMINI_TEXT_MODEL })
  const meta = user.user_meta || {}
  const moneyType = meta.money_personality_type || 'survivor'
  const lang = user.preferred_language === 'es' ? 'Spanish (conversational Mexican Spanish)' : 'English'

  const STEP_NAMES = [
    'Connect to Redreemer', 'Get a free state ID', 'Get shelter address for mail',
    'Open Bank On account', 'Enroll in benefits', 'Find stable income',
    'Save first $200', 'Save $500 housing deposit'
  ]
  const STEP_ACTIONS = [
    'Text me what you need most right now.',
    'Go to any MVD office — bring any one document. The fee is waived.',
    'Ask your shelter for a letter with their address. Takes 5 minutes.',
    'Call OneUnited Bank at 1-800-482-2265 and ask about the Bank On account.',
    'Text BENEFITS and I will walk you through what you qualify for.',
    'Call Chicanos Por La Causa at (602) 257-0700 — they hire people with records.',
    'Open a savings account and put in $5 this week. That is how it starts.',
    'Call CPLC at (602) 257-0700 for free financial coaching.'
  ]

  const step = user.current_step || 1
  const stepName = STEP_NAMES[step - 1] || `Step ${step}`
  const nextAction = STEP_ACTIONS[step - 1] || 'Text me what you need.'

  const historySnippet = recentConversations.slice(-6)
    .map(m => `${m.role === 'user' ? 'Them' : 'Redreemer'}: ${m.content}`)
    .join('\n')

  const prompt = `Write a weekly Sunday check-in SMS in ${lang} for ${user.name || 'there'}.
Step: ${step}/8 — ${stepName}
Money personality: ${moneyType}
Recent conversation:
${historySnippet || '(no recent messages)'}

Format exactly:
Line 1: "Hey [name]." then one sentence referencing something specific from their recent conversations.
Line 2: "Step ${step} of 8: ${stepName}. Next: ${nextAction}"
Line 3: One genuine encouraging line tailored to their ${moneyType} personality. Not cheesy. Not corporate.
Line 4: "Reply HELP anytime."

Plain text only. No emojis. Under 320 characters total.`

  try {
    return await callGeminiWithRetry(model, prompt)
  } catch (err) {
    console.error('[Gemini] Progress SMS failed:', err.message)
    return `Hey ${user.name || 'there'}. You are on Step ${step} of 8: ${stepName}. Next: ${nextAction} Reply HELP anytime.`
  }
}

/**
 * Feature 19: Generate weekly wins SMS — celebrates what the user actually did this week.
 * Returns null if nothing to celebrate.
 */
export async function generateWeeklyWins(user, weekSummary) {
  if (!weekSummary.messageCount && !weekSummary.stepsAdvanced && !weekSummary.topics?.length) return null

  const model = genAI.getGenerativeModel({ model: GEMINI_TEXT_MODEL })
  const lang = user.preferred_language === 'es' ? 'Spanish (conversational Mexican Spanish)' : 'English'

  const prompt = `Write a 2-3 line weekly wins message in ${lang} for ${user.name || 'someone'} who is working toward financial independence.

This week's data:
- Messages sent: ${weekSummary.messageCount}
- Steps advanced: ${weekSummary.stepsAdvanced}
- Topics researched: ${weekSummary.topics?.join(', ') || 'general help'}

Rules:
- Be specific about what they actually did — never generic
- Sound like a supportive friend, not a chatbot
- Never say "great job" without saying what specifically was great
- Never say "as an AI"
- Plain text only, no emojis
- Under 160 characters`

  try {
    return await callGeminiWithRetry(model, prompt)
  } catch (err) {
    console.error('[Gemini] Weekly wins failed:', err.message)
    return null
  }
}

/**
 * Generate a personalized weekly Sunday summary SMS (legacy).
 */
export async function generateWeeklySummary(user, recentConversations) {
  const model = genAI.getGenerativeModel({ model: GEMINI_TEXT_MODEL })
  const historySnippet = recentConversations.slice(-10)
    .map(m => `${m.role === 'user' ? 'User' : 'Redreemer'}: ${m.content}`)
    .join('\n')
  const prompt = `Write a warm, brief weekly Sunday check-in SMS for ${user.name || 'there'} on Step ${user.current_step}/8. Reference their recent conversations. Under 320 chars. Plain text only.\n\nRecent:\n${historySnippet}`
  try {
    return await callGeminiWithRetry(model, prompt)
  } catch (err) {
    return `Hey ${user.name || 'there'}. You are on Step ${user.current_step || 1} of 8. Keep going. Call 211 if you need anything.`
  }
}

/**
 * Generate a profile recovery confirmation question.
 */
export async function generateRecoveryQuestion(existingUser) {
  return `Are you ${existingUser.name || 'the person'} from ${existingUser.city || 'the city you mentioned'}? Reply YES to reconnect your Redreemer profile.`
}

/**
 * Generate a 3-part weekly snapshot.
 */
export async function generateWeeklySnapshot(user, recentConversations) {
  const model = genAI.getGenerativeModel({ model: GEMINI_TEXT_MODEL })

  const historySnippet = recentConversations.slice(-10)
    .map(m => `${m.role === 'user' ? 'User' : 'Redreemer'}: ${m.content}`)
    .join('\n')

  const prompt = `Detect the language and respond in that language.
Generate a 3-part weekly SMS. Return ONLY valid JSON: {"part1":"...","part2":"...","part3":"..."}

User: ${user.name || 'there'}, step: ${user.current_step}/8, city: ${user.city || 'unknown'}
Recent conversation:
${historySnippet}

part1 (max 160 chars): Acknowledge progress this week.
part2 (max 160 chars): One practical financial tip for their current step.
part3 (max 160 chars): One specific action with a real resource name and phone number.
Plain text only. No emojis.`

  try {
    const raw = await callGeminiWithRetry(model, prompt)
    return JSON.parse(raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
  } catch (err) {
    console.error('[Gemini] Weekly snapshot failed:', err.message)
    return {
      part1: `Hey ${user.name || 'there'}. You are on Step ${user.current_step || 1} of 8. Every day you keep going matters.`,
      part2: `Tip: Even saving $5 this week builds the habit. Small amounts add up to real security.`,
      part3: `This week: call 211 for local resources. Free, 24 hours, connects you to what you need.`
    }
  }
}

