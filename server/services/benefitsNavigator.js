/**
 * Feature 10: Public Benefits Navigator
 * Walks users through eligibility questions and returns personalized benefits list.
 * State machine stored in-memory (benefitsState Map).
 */

export const BENEFITS_QUESTIONS_EN = [
  'Are you currently working or getting any income? (yes/no)',
  'Do you have kids under 18 living with you? (yes/no)',
  'Are you a US citizen or legal resident? (yes/no)',
  'Do you have a disability or chronic health condition? (yes/no)',
]

export const BENEFITS_QUESTIONS_ES = [
  '¿Estás trabajando actualmente o recibiendo algún ingreso? (sí/no)',
  '¿Tienes hijos menores de 18 años viviendo contigo? (sí/no)',
  '¿Eres ciudadano estadounidense o residente legal? (sí/no)',
  '¿Tienes una discapacidad o condición de salud crónica? (sí/no)',
]

/**
 * Detect benefits-related keywords.
 */
export function detectBenefitsKeywords(message) {
  const lower = message.toLowerCase()
  const keywords = [
    'food stamp', 'snap', 'benefits', 'assistance', 'medicaid', 'ssi', 'disability',
    'cash assistance', 'utility help', 'what help', 'qualify', 'liheap', 'ahcccs',
    'welfare', 'government help', 'free food', 'ayuda', 'beneficios', 'estampillas',
  ]
  return keywords.some(kw => lower.includes(kw))
}

/**
 * Parse yes/no from a message.
 */
export function parseYesNo(message) {
  const lower = message.toLowerCase().trim()
  if (/^(yes|y|yeah|yep|si|sí|yup|sure|ok|okay|true|1)/.test(lower)) return true
  if (/^(no|n|nope|nah|not|false|0)/.test(lower)) return false
  return null
}

/**
 * Generate personalized benefits list based on answers.
 * answers: [hasIncome, hasKids, isCitizen, hasDisability] — all booleans
 */
export function generateBenefitsList(answers, lang = 'en') {
  const [hasIncome, hasKids, isCitizen, hasDisability] = answers
  const benefits = []

  if (isCitizen !== false) {
    // SNAP — eligible if low income
    if (!hasIncome || hasIncome === false) {
      benefits.push(lang === 'es'
        ? 'SNAP (cupones de alimentos): Probablemente calificas — hasta $281/mes para comestibles. Aplica en des.az.gov o llama al 1-855-HEA-PLUS. Tarda unos 30 días.'
        : 'SNAP (food stamps): You likely qualify — up to $281/month for groceries. Apply at des.az.gov or call 1-855-HEA-PLUS. Takes about 30 days.'
      )
    }

    // Medicaid/AHCCCS
    benefits.push(lang === 'es'
      ? 'AHCCCS (Medicaid de Arizona): Probablemente calificas para cobertura de salud gratuita. Aplica en healthearizonaplus.gov'
      : 'AHCCCS (Arizona Medicaid): You likely qualify for free health coverage. Apply at healthearizonaplus.gov'
    )

    // SSI/SSDI if disability
    if (hasDisability) {
      benefits.push(lang === 'es'
        ? 'SSI: Puedes calificar para hasta $943/mes si tienes una discapacidad. Llama al SSA: 1-800-772-1213 para iniciar una solicitud.'
        : 'SSI: You may qualify for up to $943/month if you have a disability. Call SSA at 1-800-772-1213 to start a claim.'
      )
    }

    // LIHEAP — always mention in AZ
    benefits.push(lang === 'es'
      ? 'LIHEAP (ayuda con servicios públicos): Arizona LIHEAP ayuda con las facturas de electricidad — crítico en los veranos de Phoenix. Aplica en des.az.gov/liheap'
      : 'LIHEAP (utility help): Arizona LIHEAP helps with electricity bills — critical in Phoenix summers. Apply at des.az.gov/liheap'
    )

    // TANF if kids
    if (hasKids) {
      benefits.push(lang === 'es'
        ? 'TANF (asistencia en efectivo para familias): Con hijos menores de 18, puedes calificar para asistencia en efectivo. Llama al 1-855-HEA-PLUS.'
        : 'TANF (cash assistance for families): With kids under 18, you may qualify for cash assistance. Call 1-855-HEA-PLUS.'
      )
    }
  }

  const closing = lang === 'es'
    ? 'Solicitar los beneficios que te corresponden no es caridad — es para lo que existe el programa. ¿Quieres ayuda para saber cuál solicitar primero?'
    : "Applying for benefits you're owed is not charity — it's what the program is there for. Want help figuring out which to apply for first?"

  return benefits.join('\n\n') + '\n\n' + closing
}
