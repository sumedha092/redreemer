import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * Translate flat UI strings (dot-path keys → English values) to target locale.
 * Returns same keys with translated values. Preserves brand tokens in prompt.
 */
export async function translateUiStrings(targetLang, flatEntries) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }
  const base = String(targetLang || '').split('-')[0].toLowerCase()
  if (base === 'en') {
    return { ...flatEntries }
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

  const prompt = `You translate UI strings for a nonprofit web app "Redreemer" (housing, reentry, financial wellness).

Target locale BCP-47 code: "${targetLang}"

Input is a JSON object mapping string keys to English UI text. Output ONLY a JSON object with the EXACT SAME keys and translated values. No markdown fences, no commentary.

Rules:
- Translate values only; keys stay as-is (do not rename keys).
- Keep unchanged: "Redreemer", "Bank On", "SNAP", "Medicaid", "SSI", "WhatsApp", SMS command words like FOOD, SHELTER, BANK, ID, BENEFITS, JOB, DEBT, HELP when shown as codes; phone numbers, URLs, currency amounts like $1,800/mo, percentages, "24/7", "AI", step codes S1–S8.
- Preserve placeholders exactly: {{name}}, {{count}}, {name}, etc.
- Tone: respectful, inclusive, plain language; suitable for crisis-adjacent and reentry contexts.
- If a value is only punctuation or a number, return it unchanged.

Input JSON:
${JSON.stringify(flatEntries)}`

  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()
  let jsonStr = text
  if (text.startsWith('```')) {
    jsonStr = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  }
  const parsed = JSON.parse(jsonStr)
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Model returned non-object JSON')
  }
  const out = {}
  for (const key of Object.keys(flatEntries)) {
    if (typeof parsed[key] === 'string') {
      out[key] = parsed[key]
    } else {
      out[key] = flatEntries[key]
    }
  }
  return out
}
