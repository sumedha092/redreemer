/**
 * Feature 16: Expungement Eligibility Checker
 * Handles Arizona only for now. Walks user through eligibility questions.
 * State stored in-memory: expungementState Map.
 */

// Arizona eligibility rules
const AZ_RULES = {
  misdemeanor: { yearsRequired: 3, label: 'misdemeanor' },
  class_4_5_6_felony: { yearsRequired: 5, label: 'Class 4, 5, or 6 felony' },
  class_2_3_felony: { yearsRequired: 7, label: 'Class 2 or 3 felony' },
}

const INELIGIBLE_OFFENSES = [
  'dangerous offense', 'sex offense', 'sexual offense', 'dui with injury',
  'dangerous crime', 'child abuse', 'domestic violence with weapon',
]

/**
 * Detect expungement-related keywords.
 */
export function detectExpungementKeywords(message) {
  const lower = message.toLowerCase()
  const keywords = [
    'expungement', 'expunge', 'sealing my record', 'seal my record',
    'background check', 'criminal history', 'criminal record', 'clear my record',
    'set aside', 'record set aside', 'clean my record', 'antecedentes',
    'limpiar mi record', 'borrar mi record',
  ]
  return keywords.some(kw => lower.includes(kw))
}

/**
 * Check if an offense type is ineligible for expungement.
 */
export function isIneligibleOffense(offenseText) {
  const lower = offenseText.toLowerCase()
  return INELIGIBLE_OFFENSES.some(o => lower.includes(o))
}

/**
 * Calculate years until eligible based on offense type and years since sentence.
 */
export function calculateEligibility(offenseType, yearsSinceSentence) {
  let rule = null

  if (offenseType.includes('misdemeanor')) {
    rule = AZ_RULES.misdemeanor
  } else if (offenseType.includes('class 4') || offenseType.includes('class 5') || offenseType.includes('class 6') ||
             offenseType.includes('class4') || offenseType.includes('class5') || offenseType.includes('class6')) {
    rule = AZ_RULES.class_4_5_6_felony
  } else if (offenseType.includes('class 2') || offenseType.includes('class 3') ||
             offenseType.includes('class2') || offenseType.includes('class3')) {
    rule = AZ_RULES.class_2_3_felony
  } else if (offenseType.includes('felony')) {
    rule = AZ_RULES.class_4_5_6_felony // default felony
  } else {
    rule = AZ_RULES.misdemeanor // default
  }

  const yearsRemaining = Math.max(0, rule.yearsRequired - yearsSinceSentence)
  return {
    eligible: yearsRemaining === 0,
    yearsRemaining,
    yearsRequired: rule.yearsRequired,
    offenseLabel: rule.label,
  }
}

/**
 * Generate the eligibility response message.
 */
export function getExpungementResponse(eligible, yearsRemaining, offenseLabel, lang = 'en') {
  if (eligible) {
    return lang === 'es'
      ? `Buenas noticias — puedes calificar para que tu record sea "set aside" en Arizona. Esto no lo borra pero lo elimina de la mayoría de las verificaciones de antecedentes de empleadores.\n\nPróximos pasos:\n1. Presenta una petición en el tribunal donde fuiste condenado — es gratis\n2. O consigue ayuda gratuita de:\n   - Arizona Justice Project: azjusticeproject.org\n   - Community Legal Services: clsaz.org, (602) 258-3434\n\n¿Quieres que te ayude a encontrar qué tribunal maneja tu caso?`
      : `Good news — you may qualify to have your record set aside in Arizona. This doesn't erase it but removes it from most employer background checks.\n\nNext steps:\n1. File a petition with the court where you were convicted — it's free\n2. Or get free help from:\n   - Arizona Justice Project: azjusticeproject.org\n   - Community Legal Services: clsaz.org, (602) 258-3434\n\nWant me to help you figure out which court handles your case?`
  } else {
    return lang === 'es'
      ? `Todavía no eres elegible, pero lo serás en aproximadamente ${yearsRemaining} año${yearsRemaining !== 1 ? 's' : ''}. Te recordaré cuando llegue ese momento — solo confirma la fecha de tu condena.\n\nMientras tanto, Community Legal Services puede ayudarte con otros problemas legales: (602) 258-3434`
      : `You're not eligible yet, but you will be in approximately ${yearsRemaining} year${yearsRemaining !== 1 ? 's' : ''}. I'll remind you when that time comes — just confirm your conviction date.\n\nIn the meantime, Community Legal Services can help with other legal issues: (602) 258-3434`
  }
}

export const EXPUNGEMENT_QUESTIONS_EN = [
  'What state were you convicted in? (For now I can help with Arizona — for other states I can point you to legal aid)',
  'What type of offense was it — felony or misdemeanor? (If felony, what class — e.g. Class 4 felony)',
  'How many years ago did you complete your sentence, including probation?',
]

export const EXPUNGEMENT_QUESTIONS_ES = [
  '¿En qué estado fuiste condenado? (Por ahora puedo ayudar con Arizona — para otros estados te puedo dirigir a ayuda legal)',
  '¿Qué tipo de delito fue — felonía o misdemeanor? (Si es felonía, ¿qué clase — ej. Clase 4)',
  '¿Hace cuántos años completaste tu sentencia, incluyendo la libertad condicional?',
]
