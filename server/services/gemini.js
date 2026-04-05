import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import { getNearbyResources, detectResourceType, extractLocation } from './places.js'
import { getFallbackByStep } from './fallbackResponses.js'
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

// ── System prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(user, userType) {
  const city = user.city || null
  const step = user.current_step || 1
  const name = user.name || null

  return `You are a compassionate assistant helping homeless and recently incarcerated people in the US access financial services and basic needs.
${name ? `The person's name is ${name}.` : ''}
${city ? `They are located in ${city}.` : 'You do not know their city yet.'}
They are on Step ${step} of 8 toward financial independence.
User type: ${userType || 'homeless'}.

- Always respond in the same language the user writes in.
- Ask where they are located before giving specific resources.
- Give real, specific local resources ONLY for cities they have mentioned. Never invent resources.
- Keep responses under 3 sentences — short and actionable.
- Be warm and human, like a caring friend who knows the system.
- Never repeat a resource you already mentioned in this conversation.
- Listen to what they need most right now before pivoting to banking or financial topics.
- Plain text only. No markdown, no asterisks, no bullet points.
- If they mention self-harm or crisis: give 988 Suicide & Crisis Lifeline immediately.
- If the user has clearly completed step ${step}, append [STEP_COMPLETE] at the very end.
- If they mention an appointment with a date/time, append [REMINDER: <description> | <ISO8601>] at the very end.`
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
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
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
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

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
 * Generate a personalized weekly Sunday summary SMS.
 */
export async function generateWeeklySummary(user, recentConversations) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const historySnippet = recentConversations.slice(-10)
    .map(m => `${m.role === 'user' ? 'User' : 'Redreemer'}: ${m.content}`)
    .join('\n')

  const prompt = `Detect the language the user is writing in and respond entirely in that same language.

Write a warm, brief weekly Sunday check-in SMS for a Redreemer user.
User: ${user.name || 'there'}, step: ${user.current_step}/8, city: ${user.city || 'unknown'}
Recent conversation:
${historySnippet}

- Start with "Hey ${user.name || 'there'}."
- Reference something specific from their recent conversations
- State their current step and what it means
- Give one specific actionable thing to do this week
- End with real encouragement — not cheesy
- Under 320 characters. Plain text only. No emojis.`

  try {
    return await callGeminiWithRetry(model, prompt)
  } catch (err) {
    console.error('[Gemini] Weekly summary failed:', err.message)
    return `Hey ${user.name || 'there'}. You are on Step ${user.current_step || 1} of 8. Keep going — one small step this week moves you forward. Call 211 if you need anything.`
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
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

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

