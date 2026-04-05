import { supabase } from './supabase.js'

export const INSURANCE_KEYWORDS = ['insurance', 'health plan', 'coverage', 'deductible', 'copay', 'renters insurance', 'benefits']

export const PREDATORY_KEYWORDS = ['payday loan', 'payday', 'cash advance', 'title loan', 'check cashing', 'fast cash', 'easy money', 'loan shark']

export function detectInsuranceKeyword(message) {
  const lower = message.toLowerCase()
  return INSURANCE_KEYWORDS.some(kw => lower.includes(kw))
}

export function detectPredatoryLending(message) {
  const lower = message.toLowerCase()
  return PREDATORY_KEYWORDS.some(kw => lower.includes(kw))
}

export const PREDATORY_WARNING = "Warning: Payday loans, title loans, and cash advance services charge 300-400% APR. A $300 loan can become $450 in two weeks — a debt trap designed for people in financial crisis.\n\nBetter options:\n• Call 211 for emergency assistance\n• Ask your employer about a paycheck advance (free)\n• Credit unions offer small emergency loans at normal rates\n• St. Vincent de Paul and local churches often have emergency funds\n\nYou are too close to stability to let predatory lenders take it. What do you actually need the money for? I can help find a safer option."

export function getInsuranceResponse(keyword) {
  const kw = keyword.toLowerCase()

  if (kw.includes('deductible')) {
    return "A deductible is the amount you pay before insurance kicks in. Example: $500 deductible means you pay the first $500 of medical bills, then insurance covers the rest. Lower deductible = higher monthly premium. Higher deductible = lower monthly premium. For most people in your situation, a high-deductible plan with an HSA (Health Savings Account) is the best value."
  }
  if (kw.includes('copay')) {
    return "A copay is a fixed amount you pay each visit — usually $10-$40 for primary care, $50-$100 for specialists. Copays are separate from your deductible. Preventive care (annual checkups, vaccines) is usually free with no copay under the ACA. Always ask if a service is 'preventive' before your appointment."
  }
  if (kw.includes('renters insurance')) {
    return "Renters insurance protects your belongings if there is a fire, theft, or water damage. It also covers liability if someone is injured in your home. Average cost: $15-$30/month. Many landlords require it. Get quotes from Lemonade (lemonade.com) — they offer plans starting at $5/month and approve instantly."
  }
  if (kw.includes('health plan') || kw.includes('coverage') || kw.includes('insurance')) {
    return "If you have no income or low income, you likely qualify for Medicaid — free health coverage. Apply at healthcare.gov or call 1-800-318-2596. If you work, check if your employer offers coverage. Open enrollment is November 1 - January 15. Missing enrollment? A job loss, move, or income change qualifies you for a Special Enrollment Period."
  }
  if (kw.includes('benefits')) {
    return "You may qualify for multiple benefits:\n• Medicaid (free health insurance)\n• SNAP (food assistance)\n• LIHEAP (utility assistance)\n• SSI/SSDI (disability income)\n\nApply for all at once at benefits.gov or call 211. Many people leave thousands in benefits unclaimed every year. What specific benefit do you need help with?"
  }

  return "Insurance protects you from financial catastrophe. Even basic health coverage prevents medical debt — the #1 cause of bankruptcy in the US. What specific insurance question do you have?"
}

export async function logInsuranceProgress(userId, moduleNumber) {
  const { error } = await supabase
    .from('insurance_progress')
    .insert({ user_id: userId, module_number: moduleNumber, engaged: true })
  if (error) console.error('[Insurance] Failed to log progress:', error.message)
}
