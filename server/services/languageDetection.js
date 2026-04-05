const SPANISH_KEYWORDS = ['hola', 'ayuda', 'ayúdame', 'necesito', 'no hablo ingles', 'hablas español', 'español', 'socorro']

export function detectSpanish(message) {
  const lower = message.toLowerCase()
  return SPANISH_KEYWORDS.some(kw => lower.includes(kw))
}

export const BILINGUAL_GREETING = "Hola. Estoy aqui para ayudarte. / Hello, I am here to help you.\nPuedo ayudarte en español o inglés. I can help in Spanish or English.\n¿Español o English?"
