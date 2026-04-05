import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import { getNearbyResources, detectResourceType, extractLocation } from './places.js'
import { languageInstructionName } from './safety.js'
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const HOMELESS_LADDER = `
Homeless 8-step ladder:
1. Connect to Redreemer
2. Get a free state ID
3. Get shelter address for mail
4. Open Bank On account
5. Enroll in benefits
6. Find stable income source
7. Save first $200
8. Save $500 housing deposit`

const REENTRY_LADDER = `
Reentry 8-step ladder:
1. Connect to Redreemer
2. Complete first parole check-in
3. Get free state ID
4. Open Bank On account
5. Enroll in benefits
6. Find Ban the Box employer
7. Start paying court debt with legal aid help
8. Save first $500 emergency fund`

function buildHomelessPrompt(user, history) {
  return `You are Redreemer, a financial empowerment assistant for people experiencing homelessness.
User profile: ${user.name || 'unknown'}, city: ${user.city || 'unknown'}, step: ${user.current_step}/8
Conversation history:
${history.map(m => `${m.role === 'user' ? 'User' : 'Redreemer'}: ${m.content}`).join('\n')}
${HOMELESS_LADDER}

Rules:
- Answer immediate survival need first (food, shelter, safety)
- Be specific — real addresses, hours, phone numbers for ${user.city || 'their city'}
- Append one financial literacy sentence at the end (one sentence only, naturally woven in)
- Warm, never clinical or condescending
- Never suggest credit check or permanent address services until prerequisite step done
- If they mention self-harm or crisis, provide 988 Suicide & Crisis Lifeline immediately
- Nudge toward next step naturally
- Max 3 short paragraphs, plain English, no jargon
- If the user has clearly completed their current step ${user.current_step}, append [STEP_COMPLETE] at the very end
- If the user mentions an appointment with a specific date/time, append [REMINDER: <description> | <ISO8601 datetime>] at the very end`
}

function buildReentryPrompt(user, history) {
  return `You are Redreemer, a financial empowerment assistant for people recently released from incarceration.
User profile: ${user.name || 'unknown'}, city: ${user.city || 'unknown'}, step: ${user.current_step}/8
Conversation history:
${history.map(m => `${m.role === 'user' ? 'User' : 'Redreemer'}: ${m.content}`).join('\n')}
${REENTRY_LADDER}

Rules:
- Step 1: prioritize parole check-in above everything
- Be specific — real addresses, hours, resources for ${user.city || 'their city'}
- Append one financial literacy sentence at the end (one sentence only, naturally woven in)
- Peer support tone, not social work
- Never share user info with parole or any authority — you are their ally, not a monitor
- If they mention self-harm or crisis, provide 988 Suicide & Crisis Lifeline immediately
- Nudge toward next step naturally
- Max 3 short paragraphs, plain English, no jargon
- If the user has clearly completed their current step ${user.current_step}, append [STEP_COMPLETE] at the very end
- If the user mentions an appointment with a specific date/time, append [REMINDER: <description> | <ISO8601 datetime>] at the very end`
}

function buildCombinedPrompt(user, history) {
  return `You are Redreemer, a financial empowerment assistant for someone who is both experiencing homelessness and recently released from incarceration.
User profile: ${user.name || 'unknown'}, city: ${user.city || 'unknown'}, step: ${user.current_step}/8
Conversation history:
${history.map(m => `${m.role === 'user' ? 'User' : 'Redreemer'}: ${m.content}`).join('\n')}
${HOMELESS_LADDER}
${REENTRY_LADDER}

Rules:
- Address the most urgent immediate need first (parole check-in if day 1, then shelter/food)
- Be specific — real addresses, hours, resources for ${user.city || 'their city'}
- Append one financial literacy sentence at the end
- Warm, peer support tone — never clinical, never surveillance
- Never share info with parole or any authority
- If they mention self-harm or crisis, provide 988 Suicide & Crisis Lifeline immediately
- Max 3 short paragraphs, plain English, no jargon
- If the user has clearly completed their current step ${user.current_step}, append [STEP_COMPLETE] at the very end
- If the user mentions an appointment with a specific date/time, append [REMINDER: <description> | <ISO8601 datetime>] at the very end`
}

/**
 * Classify a new user's response to the routing question.
 * Returns exactly 'homeless', 'reentry', or 'both'.
 */
export async function classifyUserType(message) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const prompt = `The user responded to "Are you currently homeless, recently released from prison, or both?" with: "${message}"
Classify as exactly one of: homeless, reentry, both
Return only the single classification word, nothing else.`

  const result = await model.generateContent(prompt)
  const raw = result.response.text().trim().toLowerCase()

  if (raw.includes('both')) return 'both'
  if (raw.includes('reentry') || raw.includes('prison') || raw.includes('released') || raw.includes('incarcerat')) return 'reentry'
  if (raw.includes('homeless') || raw.includes('shelter') || raw.includes('housing')) return 'homeless'

  // Default fallback — if Gemini returns something unexpected, default to homeless
  const valid = ['homeless', 'reentry', 'both']
  if (valid.includes(raw)) return raw
  return 'homeless'
}

/**
 * Generate a response for an existing user with known user_type.
 * Returns raw string that may contain [STEP_COMPLETE] and [REMINDER:...] signals.
 * @param {{ responseLanguage?: string }} [options] — BCP-ish code (en, es, …); full reply in that language.
 */
export async function generateResponse(user, history, message, options = {}) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const langCode = (options.responseLanguage || 'en').split('-')[0].toLowerCase()
  const langName = languageInstructionName(langCode)

  // Try to get real nearby resources from Google Places
  const location = extractLocation(message, user)
  const resourceType = detectResourceType(message)
  let realResources = null

  if (location && resourceType) {
    try {
      realResources = await getNearbyResources(location, resourceType)
    } catch (err) {
      console.error('Places lookup failed (non-fatal):', err.message)
    }
  }

  let systemPrompt
  if (user.user_type === 'reentry') {
    systemPrompt = buildReentryPrompt(user, history)
  } else if (user.user_type === 'both') {
    systemPrompt = buildCombinedPrompt(user, history)
  } else {
    systemPrompt = buildHomelessPrompt(user, history)
  }

  // Inject real resources if found
  if (realResources) {
    systemPrompt += `\n\nREAL NEARBY RESOURCES (use these exact names, addresses, and phone numbers in your response):\n${realResources}`
  }

  if (langCode !== 'en') {
    systemPrompt += `\n\nLANGUAGE: Write your entire reply in ${langName} (not English). Use short sentences and plain words for stressed readers. Keep the same safety rules (988, etc.) and use local emergency numbers only if you are certain; otherwise keep US 988/911.`
  }

  const result = await model.generateContent([
    { text: systemPrompt },
    { text: `User message: ${message}` }
  ])

  return result.response.text()
}

/**
 * Generate a personalized weekly Sunday summary SMS.
 */
export async function generateWeeklySummary(user, recentConversations) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const historySnippet = recentConversations
    .slice(-10)
    .map(m => `${m.role === 'user' ? 'User' : 'Redreemer'}: ${m.content}`)
    .join('\n')

  const ladderContext = user.user_type === 'reentry' ? REENTRY_LADDER : HOMELESS_LADDER

  const prompt = `Write a warm, brief weekly Sunday check-in SMS for a Redreemer user.
User: ${user.name || 'there'}, type: ${user.user_type}, step: ${user.current_step}/8, city: ${user.city || 'unknown'}
Recent conversation:
${historySnippet}
${ladderContext}

Format:
- Start with "Hey ${user.name || 'there'}."
- Reference something specific from their recent conversations if possible
- State their current step and what it means
- Give one specific actionable thing to do this week
- End with real encouragement — not cheesy
- Keep under 320 characters total
- No emojis`

  const result = await model.generateContent(prompt)
  return result.response.text()
}

/**
 * Generate a profile recovery confirmation question.
 */
export async function generateRecoveryQuestion(existingUser) {
  return `Are you ${existingUser.name || 'the person'} from ${existingUser.city || 'the city you mentioned'}? Reply YES to reconnect your Redreemer profile.`
}
