/**
 * Crisis and scam detection for SMS / simulate flows.
 * Keep patterns conservative to reduce false positives.
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
    body: 'Payday and title loans often trap people in debt. Prefer food banks, benefits, or nonprofit credit counseling. Never wire money to “unlock” a loan.',
  },
  {
    id: 'job_fee',
    test: /\bguaranteed\s+job\b.*\b(fee|pay|deposit)\b|\bpay\s+to\s+apply\b|\btraining\s+fee\b.*\bjob\b/i,
    title: 'Real jobs rarely ask for money up front',
    body: 'Be careful if someone asks you to pay before you start work. Legit employers usually do not charge application fees.',
  },
  {
    id: 'housing_upfront',
    test: /\b(send|wire|pay)\b.*\b(deposit|first\s+month)\b.*\b(never\s+met|only\s+online|gift\s*card)\b|\bkeys\s+after\s+you\s+pay\b/i,
    title: 'Housing scams are common',
    body: 'Never pay for keys or deposits before you have verified the landlord and seen the unit in person when possible. Avoid gift-card payments for rent.',
  },
  {
    id: 'ssn_bank',
    test: /\b(ssn|social\s+security)\b.*\b(text|email|dm)\b|\bbank\s+(account|routing)\b.*\b(text|pin)\b|\bgive\s+me\s+your\s+ssn\b/i,
    title: 'Protect your SSN and bank info',
    body: 'Do not share your Social Security number, PIN, or full bank details over text with strangers. Real agencies use secure processes.',
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
  const hints = []
  for (const rule of SCAM_RULES) {
    if (rule.test.test(message)) hints.push({ id: rule.id, title: rule.title, body: rule.body })
  }
  return hints
}

const CRISIS_COPY = {
  en: `I'm really glad you reached out. What you're feeling matters, and you deserve support right now — not judgment.

If you might hurt yourself or you're in immediate danger, please:
• Call or text 988 (Suicide & Crisis Lifeline) — free, 24/7
• Text HOME to 741741 (Crisis Text Line)
• If it's an emergency, call 911

You're not alone. When you're safe, we're still here to help with shelter, food, and next steps — one small step at a time.`,
  es: `Me alegra que hayas escrito. Lo que sientes importa y mereces apoyo ahora, sin juicio.

Si podrías hacerte daño o estás en peligro inmediato:
• Llama o envía un mensaje al 988 (Línea de prevención del suicidio) — gratis, 24/7
• Envía HOME al 741741 (línea de texto en crisis)
• Si es una emergencia, llama al 911

No estás solo/a. Cuando estés a salvo, seguimos aquí para ayudarte con refugio, comida y próximos pasos.`,
  fr: `Merci d'avoir écrit. Ce que vous ressentez compte, et vous méritez du soutien maintenant — sans jugement.

Si vous risquez de vous faire du mal ou si vous êtes en danger immédiat :
• Appelez ou envoyez un SMS au 988 (ligne nationale de prévention du suicide) — gratuit, 24h/24
• Envoyez HOME au 741741 (ligne texto)
• En cas d'urgence, appelez le 911 (ou les services locaux)

Vous n'êtes pas seul(e). Quand vous serez en sécurité, nous sommes toujours là pour l'abri, la nourriture et la suite.`,
  zh: `谢谢你愿意说出来。你的感受很重要，你现在值得被支持——不会被评判。

如果你可能伤害自己或处于紧急危险中，请：
• 拨打或发短信 988（美国自杀与危机生命线）— 免费，全天候
• 发短信 HOME 到 741741（危机短信热线）
• 如果是紧急情况，请拨打 911

你并不孤单。当你安全后，我们仍会帮助你解决住所、食物和下一步——一次一小步。`,
  vi: `Cảm ơn bạn đã nhắn. Cảm xúc của bạn quan trọng và bạn xứng đáng được hỗ trợ ngay bây giờ — không phán xét.

Nếu bạn có thể tự làm hại mình hoặc đang gặp nguy hiểm cấp bách:
• Gọi hoặc nhắn 988 (Đường dây khủng hoảng tự tử) — miễn phí, 24/7
• Nhắn HOME tới 741741 (Crisis Text Line)
• Nếu là cấp cứu, gọi 911

Bạn không đơn độc. Khi bạn an toàn, chúng tôi vẫn ở đây để giúp chỗ ở, thức ăn và bước tiếp theo.`,
  ar: `شكراً لتواصلك. ما تشعر به مهم وتستحق الدعم الآن — دون إدانة.

إذا كنت قد تؤذي نفسك أو في خطر مباشر:
• اتصل أو راسل 988 (خط الأزمات والانتحار) — مجاناً، على مدار الساعة
• أرسل HOME إلى 741741 (خط أزمات نصي)
• في الحالات الطارئة اتصل بـ 911

لست وحدك. عندما تكون بأمان، ما زلنا هنا للمساعدة في المأوى والطعام والخطوات التالية.`,
}

export function getCrisisResponse(lang = 'en') {
  const code = (lang || 'en').split('-')[0].toLowerCase()
  return CRISIS_COPY[code] || CRISIS_COPY.en
}

export function languageInstructionName(code) {
  const map = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    zh: 'Simplified Chinese',
    vi: 'Vietnamese',
    ar: 'Arabic',
  }
  const c = (code || 'en').split('-')[0].toLowerCase()
  return map[c] || 'English'
}
