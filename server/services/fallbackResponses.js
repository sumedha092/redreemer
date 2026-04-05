export function getFallbackByStep(step) {
  if (step <= 2) return "For shelter tonight, call 211 or text your city name to 898-211. For food, search 'food bank near me' or call 1-866-3-HUNGRY. I will be back shortly to guide you further."
  if (step <= 4) return "For benefits questions, call 1-800-342-3009. For housing help, call 2-1-1. I will be back shortly."
  return "For employment resources, visit workforce.az.gov or call 602-542-4016. I will be back to help with your financial planning shortly."
}

export const GENERIC_FALLBACK = "I am having some technical difficulties right now. For immediate help finding resources, call 211 — it is free, available 24 hours, and connects you to local services. I will be back to full service shortly."
