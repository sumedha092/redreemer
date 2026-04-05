/**
 * Client-side crisis / scam checks for instant UI feedback (mirrors server rules).
 */

const CRISIS_PATTERNS = [
  /\bkill\s+myself\b/i,
  /\bkill\s+my\s+self\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bgoing\s+to\s+die\b/i,
  /\bwish\s+i\s+(was|were)\s+dead\b/i,
  /\bsuicid/i,
  /\bend\s+my\s+life\b/i,
  /\bend\s+it\s+all\b/i,
  /\bself[\s-]?harm/i,
  /\bhurt\s+myself\b/i,
  /\bcut\s+myself\b/i,
  /\boverdose\b/i,
  /\bhanging\s+myself\b/i,
  /\bjump\s+off\b.*\b(bridge|building|roof)\b/i,
  /\bno\s+reason\s+to\s+live\b/i,
]

const IMMINENT_DANGER_PATTERNS = [
  /\bbeing\s+(hurt|attacked|beaten)\b.*\bnow\b/i,
  /\bthey\s+have\s+a\s+gun\b/i,
  /\bim\s+in\s+danger\b.*\bnow\b/i,
  /\bhelp\s+me\s+.*\b(kill|hurt|attack)/i,
  /\bgoing\s+to\s+kill\s+me\b/i,
]

const SCAM_RULES = [
  {
    id: 'predatory_lending',
    test: /\bpayday(\s+loan)?\b|\btitle\s+loan\b|\bcash\s*advance\b|\bwire\s+money\s+first\b/i,
    title: 'Quick money can cost you',
    body: 'Payday and title loans often trap people in debt. Prefer food banks, benefits, or nonprofit help. Never wire money to “unlock” a loan.',
  },
  {
    id: 'job_fee',
    test: /\bguaranteed\s+job\b.*\b(fee|pay|deposit)\b|\bpay\s+to\s+apply\b|\btraining\s+fee\b.*\bjob\b/i,
    title: 'Real jobs rarely ask for money up front',
    body: 'Be careful if someone asks you to pay before you start work.',
  },
  {
    id: 'housing_upfront',
    test: /\b(send|wire|pay)\b.*\b(deposit|first\s+month)\b.*\b(never\s+met|only\s+online|gift\s*card)\b|\bkeys\s+after\s+you\s+pay\b/i,
    title: 'Housing scams are common',
    body: 'Never pay for keys or deposits before you verify the landlord. Avoid gift-card rent payments.',
  },
  {
    id: 'ssn_bank',
    test: /\b(ssn|social\s+security)\b.*\b(text|email|dm)\b|\bbank\s+(account|routing)\b.*\b(text|pin)\b|\bgive\s+me\s+your\s+ssn\b/i,
    title: 'Protect your SSN and bank info',
    body: 'Do not share your Social Security number or bank details over text with strangers.',
  },
]

export function detectCrisisSeverity(message) {
  if (!message || typeof message !== 'string') return null
  const t = message.trim()
  if (!t) return null
  if (IMMINENT_DANGER_PATTERNS.some(re => re.test(t))) return 'imminent'
  if (CRISIS_PATTERNS.some(re => re.test(t))) return 'crisis'
  return null
}

export function detectScamHints(message) {
  if (!message || typeof message !== 'string') return []
  return SCAM_RULES.filter(rule => rule.test.test(message)).map(({ id, title, body }) => ({ id, title, body }))
}

export const REASSURANCE_LINES = [
  'No judgment here.',
  "You're not alone.",
  "We'll take this one step at a time.",
]
