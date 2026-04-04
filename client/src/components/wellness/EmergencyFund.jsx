import { useState, useMemo } from 'react'

export default function EmergencyFund() {
  const [monthlyExpenses, setMonthlyExpenses] = useState(1460)
  const [currentSaved, setCurrentSaved] = useState(200)
  const [targetMonths, setTargetMonths] = useState(3)
  const [monthlySavings, setMonthlySavings] = useState(50)

  const target = useMemo(() => monthlyExpenses * targetMonths, [monthlyExpenses, targetMonths])
  const remaining = useMemo(() => Math.max(target - currentSaved, 0), [target, currentSaved])
  const pct = useMemo(() => target > 0 ? Math.min((currentSaved / target) * 100, 100) : 0, [currentSaved, target])
  const monthsToGoal = useMemo(() => monthlySavings > 0 ? Math.ceil(remaining / monthlySavings) : null, [remaining, monthlySavings])

  const milestones = [
    { label: '$200 — First buffer',    amount: 200,   desc: 'Covers a broken phone or missed shift' },
    { label: '$500 — Housing deposit', amount: 500,   desc: 'Qualifies you for most rental programs' },
    { label: '1 month expenses',       amount: monthlyExpenses * 1, desc: 'Covers a full month if income stops' },
    { label: '3 months expenses',      amount: monthlyExpenses * 3, desc: 'Standard emergency fund goal' },
    { label: '6 months expenses',      amount: monthlyExpenses * 6, desc: 'Full financial resilience' },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Emergency Fund Planner</h2>

      {/* Progress ring area */}
      <div className="bg-navy-800 rounded-2xl p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Circle progress */}
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="64" fill="none" stroke="#1e2d6b" strokeWidth="16" />
              <circle
                cx="80" cy="80" r="64" fill="none"
                stroke={pct >= 100 ? '#22c55e' : '#f59e0b'}
                strokeWidth="16"
                strokeDasharray={`${2 * Math.PI * 64}`}
                strokeDashoffset={`${2 * Math.PI * 64 * (1 - pct / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">{Math.round(pct)}%</span>
              <span className="text-navy-400 text-xs">funded</span>
            </div>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-navy-400 text-xs mb-1">Saved</p>
                <p className="text-green-400 text-2xl font-bold">${currentSaved.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-navy-400 text-xs mb-1">Goal</p>
                <p className="text-white text-2xl font-bold">${target.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-navy-400 text-xs mb-1">Still needed</p>
                <p className="text-amber-400 text-xl font-bold">${remaining.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-navy-400 text-xs mb-1">Time to goal</p>
                <p className="text-blue-400 text-xl font-bold">
                  {monthsToGoal ? `${monthsToGoal} mo` : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Monthly Expenses', value: monthlyExpenses, set: setMonthlyExpenses, hint: 'Housing + food + transport + phone' },
          { label: 'Currently Saved',  value: currentSaved,    set: setCurrentSaved,    hint: 'What you have right now' },
          { label: 'Monthly Savings',  value: monthlySavings,  set: setMonthlySavings,  hint: 'How much you can save per month' },
        ].map(field => (
          <div key={field.label} className="bg-navy-800 rounded-xl p-4">
            <label className="text-white text-sm font-medium block mb-1">{field.label}</label>
            <div className="flex items-center gap-2">
              <span className="text-navy-400">$</span>
              <input
                type="number"
                value={field.value}
                onChange={e => field.set(Number(e.target.value))}
                className="bg-navy-700 border border-navy-600 text-white rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-amber-500"
              />
            </div>
            <p className="text-navy-500 text-xs mt-1">{field.hint}</p>
          </div>
        ))}

        <div className="bg-navy-800 rounded-xl p-4">
          <label className="text-white text-sm font-medium block mb-2">Target Coverage</label>
          <div className="flex gap-2">
            {[1, 3, 6].map(m => (
              <button
                key={m}
                onClick={() => setTargetMonths(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  targetMonths === m ? 'bg-amber-500 text-navy-900' : 'bg-navy-700 text-navy-300 hover:bg-navy-600'
                }`}
              >
                {m} mo
              </button>
            ))}
          </div>
          <p className="text-navy-500 text-xs mt-2">
            {targetMonths === 1 ? 'Minimum safety net' : targetMonths === 3 ? 'Standard recommendation' : 'Full resilience'}
          </p>
        </div>
      </div>

      {/* Milestones */}
      <div className="bg-navy-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Milestones</h3>
        <div className="space-y-3">
          {milestones.map(m => {
            const reached = currentSaved >= m.amount
            return (
              <div key={m.label} className={`flex items-center gap-4 p-3 rounded-lg ${reached ? 'bg-green-500/10 border border-green-500/20' : 'bg-navy-700'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${reached ? 'bg-green-500 text-white' : 'bg-navy-600 text-navy-400'}`}>
                  {reached ? '✓' : '○'}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${reached ? 'text-green-400' : 'text-white'}`}>{m.label}</p>
                  <p className="text-navy-400 text-xs">{m.desc}</p>
                </div>
                <span className={`text-sm font-bold ${reached ? 'text-green-400' : 'text-navy-400'}`}>
                  ${m.amount.toLocaleString()}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <p className="text-amber-400 font-semibold text-sm mb-1">💡 Start with $200</p>
        <p className="text-navy-200 text-sm">Even $5/day gets you to $200 in 40 days. Once you hit $200, you qualify for matched savings programs that can double your deposit. The first $200 is the hardest — after that, saving becomes a habit.</p>
      </div>
    </div>
  )
}
