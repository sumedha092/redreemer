import { useState, useMemo } from 'react'

const QUESTIONS = [
  {
    id: 'housing',
    category: 'Housing Stability',
    question: 'What is your current housing situation?',
    options: [
      { label: 'Stable housing (lease or owned)', score: 0 },
      { label: 'Staying with family/friends temporarily', score: 2 },
      { label: 'Shelter or transitional housing', score: 3 },
      { label: 'Unsheltered / no stable housing', score: 5 },
    ]
  },
  {
    id: 'income',
    category: 'Income Stability',
    question: 'How stable is your income right now?',
    options: [
      { label: 'Steady job or benefits (reliable monthly income)', score: 0 },
      { label: 'Part-time or gig work (inconsistent)', score: 2 },
      { label: 'No income currently, actively looking', score: 4 },
      { label: 'No income and not currently looking', score: 5 },
    ]
  },
  {
    id: 'savings',
    category: 'Emergency Savings',
    question: 'How much do you have saved for emergencies?',
    options: [
      { label: '$500 or more', score: 0 },
      { label: '$200–$499', score: 1 },
      { label: '$1–$199', score: 3 },
      { label: 'Nothing saved', score: 5 },
    ]
  },
  {
    id: 'banking',
    category: 'Banking Access',
    question: 'Do you have a bank account?',
    options: [
      { label: 'Yes, a checking and savings account', score: 0 },
      { label: 'Yes, but only a prepaid card', score: 2 },
      { label: 'No bank account', score: 4 },
      { label: 'Blacklisted by ChexSystems', score: 5 },
    ]
  },
  {
    id: 'id',
    category: 'Documentation',
    question: 'Do you have a valid government-issued ID?',
    options: [
      { label: 'Yes, valid state ID or driver\'s license', score: 0 },
      { label: 'Expired ID', score: 2 },
      { label: 'No ID currently', score: 4 },
    ]
  },
  {
    id: 'support',
    category: 'Support Network',
    question: 'Do you have people you can rely on in a crisis?',
    options: [
      { label: 'Strong network (family, friends, caseworker)', score: 0 },
      { label: 'Some support but limited', score: 2 },
      { label: 'Very little support', score: 4 },
      { label: 'No support network', score: 5 },
    ]
  },
  {
    id: 'debt',
    category: 'Debt Burden',
    question: 'How much debt do you currently have?',
    options: [
      { label: 'No significant debt', score: 0 },
      { label: 'Under $1,000', score: 1 },
      { label: '$1,000–$10,000', score: 3 },
      { label: 'Over $10,000', score: 5 },
    ]
  },
  {
    id: 'insurance',
    category: 'Insurance Coverage',
    question: 'Do you have health insurance?',
    options: [
      { label: 'Yes, full coverage', score: 0 },
      { label: 'Yes, but limited coverage', score: 1 },
      { label: 'No health insurance', score: 4 },
    ]
  },
]

const RISK_LEVELS = [
  { max: 8,  label: 'Low Risk',     color: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/30',  bar: '#22c55e', desc: "You have a solid foundation. Focus on building savings and protecting what you have." },
  { max: 18, label: 'Medium Risk',  color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  bar: '#f59e0b', desc: "You have some vulnerabilities. A few key steps can significantly improve your stability." },
  { max: 40, label: 'High Risk',    color: 'text-red-400',    bg: 'bg-red-500/10',    border: 'border-red-500/30',    bar: '#ef4444', desc: "You're in a vulnerable position right now. That's exactly what Redreemer is here for. Let's tackle this one step at a time." },
]

const RECOMMENDATIONS = {
  housing: {
    2: "Look into transitional housing programs in your city. Text Redreemer your city for options.",
    3: "Ask your shelter about using their address for mail — this unlocks banking and benefits.",
    5: "Text Redreemer 'shelter' for tonight's available beds near you."
  },
  income: {
    2: "Look into Ban the Box employers who hire without background checks. Text Redreemer your skills.",
    4: "You may qualify for SNAP, SSI, or unemployment benefits. Text Redreemer to find out.",
    5: "Benefits enrollment is your first step. Text Redreemer 'benefits' to get started."
  },
  savings: {
    3: "Open a Bank On account and set a $5/week automatic transfer. Small amounts add up.",
    5: "Your first goal is $200. Even $5/day gets you there in 40 days."
  },
  banking: {
    2: "A Bank On account has no minimum balance and no ChexSystems check. Go to bankonsites.org.",
    4: "Bank On accounts are designed for people without banking history. No credit check needed.",
    5: "Even with ChexSystems issues, Bank On certified accounts accept you. Text Redreemer for the nearest location."
  },
  id: {
    2: "Renew your ID at the DMV. Many states have free ID programs for homeless individuals.",
    4: "Get a free state ID — bring any one document (birth certificate, shelter letter, or SSN card). It's free."
  },
  support: {
    2: "A caseworker can be your support network. Ask Redreemer to connect you with one.",
    4: "Text Redreemer to connect with a housing navigator or social worker in your city.",
    5: "You're not alone. Text Redreemer anything — we're here 24/7."
  },
  debt: {
    3: "Legal aid organizations help reduce or restructure debt for free. Text Redreemer your city.",
    5: "Court debt can often be reduced or put on a payment plan. Legal aid helps for free."
  },
  insurance: {
    1: "Check if you qualify for Medicaid — it's free and covers most medical needs.",
    4: "You likely qualify for Medicaid. Text Redreemer 'medicaid' to find your local office."
  }
}

export default function RiskScore() {
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)

  const totalScore = useMemo(() =>
    Object.entries(answers).reduce((sum, [id, optIdx]) => {
      const q = QUESTIONS.find(q => q.id === id)
      return sum + (q?.options[optIdx]?.score || 0)
    }, 0),
    [answers]
  )

  const maxScore = QUESTIONS.reduce((s, q) => s + Math.max(...q.options.map(o => o.score)), 0)
  const riskLevel = RISK_LEVELS.find(r => totalScore <= r.max) || RISK_LEVELS[2]
  const pct = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
  const answered = Object.keys(answers).length

  const recs = useMemo(() => {
    const result = []
    for (const [id, optIdx] of Object.entries(answers)) {
      const q = QUESTIONS.find(q => q.id === id)
      const score = q?.options[optIdx]?.score || 0
      if (score >= 2 && RECOMMENDATIONS[id]?.[score]) {
        result.push({ category: q.category, text: RECOMMENDATIONS[id][score] })
      }
    }
    return result
  }, [answers])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Financial Risk Assessment</h2>
        {submitted && (
          <button
            onClick={() => { setAnswers({}); setSubmitted(false) }}
            className="text-navy-400 hover:text-white text-sm transition-colors"
          >
            Retake
          </button>
        )}
      </div>

      {!submitted ? (
        <>
          <p className="text-navy-400 text-sm">Answer {QUESTIONS.length} questions to understand your financial risk level and get personalized next steps.</p>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-navy-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-amber-500 transition-all duration-300"
                style={{ width: `${(answered / QUESTIONS.length) * 100}%` }}
              />
            </div>
            <span className="text-navy-400 text-xs whitespace-nowrap">{answered}/{QUESTIONS.length}</span>
          </div>

          <div className="space-y-4">
            {QUESTIONS.map(q => (
              <div key={q.id} className="bg-navy-800 rounded-xl p-5">
                <p className="text-amber-400 text-xs font-medium mb-1">{q.category}</p>
                <p className="text-white font-medium mb-3">{q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => setAnswers(p => ({ ...p, [q.id]: i }))}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${
                        answers[q.id] === i
                          ? 'bg-amber-500/20 border border-amber-500/50 text-amber-100'
                          : 'bg-navy-700 hover:bg-navy-600 text-navy-200 border border-transparent'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setSubmitted(true)}
            disabled={answered < QUESTIONS.length}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-navy-900 font-bold py-3 rounded-xl text-base transition-colors"
          >
            {answered < QUESTIONS.length ? `Answer all ${QUESTIONS.length} questions` : 'See My Risk Score'}
          </button>
        </>
      ) : (
        <>
          {/* Score display */}
          <div className={`${riskLevel.bg} border ${riskLevel.border} rounded-2xl p-8 text-center`}>
            <p className="text-navy-400 text-sm mb-2">Your Financial Risk Level</p>
            <p className={`text-5xl font-bold ${riskLevel.color} mb-2`}>{riskLevel.label}</p>
            <p className="text-navy-200 text-sm max-w-md mx-auto">{riskLevel.desc}</p>
          </div>

          {/* Score bar */}
          <div className="bg-navy-800 rounded-xl p-5">
            <div className="flex justify-between mb-2">
              <span className="text-white font-medium">Risk Score</span>
              <span className={`font-bold ${riskLevel.color}`}>{totalScore} / {maxScore}</span>
            </div>
            <div className="w-full bg-navy-700 rounded-full h-4">
              <div
                className="h-4 rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: riskLevel.bar }}
              />
            </div>
            <div className="flex justify-between mt-1 text-xs text-navy-400">
              <span>Low Risk</span>
              <span>High Risk</span>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="bg-navy-800 rounded-xl p-5">
            <h3 className="text-white font-semibold mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {QUESTIONS.map(q => {
                const optIdx = answers[q.id]
                const score = q.options[optIdx]?.score || 0
                const maxQ = Math.max(...q.options.map(o => o.score))
                const qPct = maxQ > 0 ? (score / maxQ) * 100 : 0
                const color = score === 0 ? '#22c55e' : score <= 2 ? '#f59e0b' : '#ef4444'
                return (
                  <div key={q.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-navy-300 text-xs">{q.category}</span>
                      <span className="text-xs" style={{ color }}>{q.options[optIdx]?.label}</span>
                    </div>
                    <div className="w-full bg-navy-700 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${qPct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Recommendations */}
          {recs.length > 0 && (
            <div className="bg-navy-800 rounded-xl p-5">
              <h3 className="text-white font-semibold mb-4">Your Next Steps</h3>
              <div className="space-y-3">
                {recs.map((rec, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-navy-700 rounded-lg">
                    <div className="w-6 h-6 bg-amber-500 text-navy-900 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-amber-400 text-xs font-medium mb-0.5">{rec.category}</p>
                      <p className="text-navy-200 text-sm">{rec.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
