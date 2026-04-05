/**
 * Predatory lender / scam alert system.
 * Runs BEFORE Gemini — intercepts dangerous financial content immediately.
 */

const PREDATORY_KEYWORDS = [
  'payday loan', 'payday advance', 'cash advance', 'title loan',
  'title pawn', 'rent to own', 'check cashing', 'western union loan',
  'easy approval', 'no credit check loan', 'guaranteed loan',
  'borrow cash fast', 'quick cash', 'same day loan', '500% apr',
  'collateral loan', 'pawn shop loan',
  // existing keywords from insuranceEducation.js
  'payday', 'fast cash', 'easy money', 'loan shark',
]

const PREDATORY_KEYWORDS_ES = [
  'préstamo de día de pago', 'adelanto en efectivo', 'préstamo sobre título',
  'empeño', 'efectivo rápido', 'aprobación fácil', 'sin verificación de crédito',
  'préstamo garantizado', 'préstamo rápido', 'dinero fácil',
]

const WARNING_EN = `Heads up — that sounds like it could be a predatory lender. These places charge 300-500% interest and trap people in debt cycles.

Before you sign anything, text me the name of the company and I will look it up for you.

Safer options right now:
- Bank On certified accounts (no fees, no minimums)
- OneUnited Bank — specifically serves people rebuilding credit
- Local credit unions — search "credit union near me"

You deserve better than a payday trap. Want me to help you find a real bank account instead?`

const WARNING_ES = `Cuidado — eso suena como un prestamista abusivo. Estos lugares cobran 300-500% de interés y atrapan a la gente en ciclos de deuda.

Antes de firmar nada, escríbeme el nombre de la empresa y lo busco para ti.

Opciones más seguras ahora mismo:
- Cuentas Bank On certificadas (sin tarifas, sin mínimos)
- OneUnited Bank — diseñado para personas reconstruyendo su crédito
- Cooperativas de crédito locales

Mereces algo mejor que una trampa de préstamos. ¿Quieres que te ayude a encontrar una cuenta bancaria real?`

/**
 * Detect predatory lending keywords in a message.
 * Returns { isPredatory, matchedKeyword }
 */
export function detectPredatoryContent(messageText) {
  const lower = messageText.toLowerCase()
  for (const kw of PREDATORY_KEYWORDS) {
    if (lower.includes(kw)) return { isPredatory: true, matchedKeyword: kw }
  }
  for (const kw of PREDATORY_KEYWORDS_ES) {
    if (lower.includes(kw)) return { isPredatory: true, matchedKeyword: kw }
  }
  return { isPredatory: false, matchedKeyword: null }
}

/**
 * Get the warning message in the appropriate language.
 */
export function getPredatoryWarning(preferredLanguage = 'en') {
  return preferredLanguage === 'es' ? WARNING_ES : WARNING_EN
}

/**
 * Increment predatory_warnings count for a user in Supabase.
 */
export async function logPredatoryWarning(userId, supabase) {
  try {
    // Use RPC to increment atomically, or fetch-then-update
    const { data: user } = await supabase
      .from('users')
      .select('predatory_warnings')
      .eq('id', userId)
      .single()

    const current = user?.predatory_warnings || 0
    await supabase
      .from('users')
      .update({ predatory_warnings: current + 1 })
      .eq('id', userId)
  } catch (err) {
    console.error('[PredatoryDetector] Failed to log warning:', err.message)
  }
}
