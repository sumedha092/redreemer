/**
 * Single source for Gemini text model id across SMS, insights, jobs, and UI translate.
 *
 * Default avoids gemini-2.5-* preview ids that some keys/regions reject.
 * Override in server/.env: GEMINI_MODEL=gemini-2.0-flash
 */
export const GEMINI_TEXT_MODEL = (process.env.GEMINI_MODEL || 'gemini-1.5-flash').trim()

/** Ordered fallbacks when the primary model errors (quota, unknown model, region). */
export const GEMINI_TEXT_MODEL_FALLBACKS = ['gemini-2.0-flash', 'gemini-2.5-flash']

/** @param {import('@google/generative-ai').GoogleGenerativeAI} genAI */
export async function generateContentWithFallback(genAI, prompt) {
  const order = [GEMINI_TEXT_MODEL, ...GEMINI_TEXT_MODEL_FALLBACKS].filter(
    (m, i, a) => m && a.indexOf(m) === i
  )
  let lastErr
  for (const modelName of order) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName })
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (e) {
      lastErr = e
      console.warn('[Gemini] model failed, may retry:', modelName, e?.message || e)
    }
  }
  throw lastErr
}
