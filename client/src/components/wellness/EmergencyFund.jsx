import { useMemo } from 'react'
import { useLocalStorage } from '../../lib/useLocalStorage.js'

export default function EmergencyFund() {
  const [monthlyExpenses, setMonthlyExpenses] = useLocalStorage('ef_monthlyExpenses', 1460)
  const [currentSaved, setCurrentSaved] = useLocalStorage('ef_currentSaved', 200)
  const [targetMonths, setTargetMonths] = useLocalStorage('ef_targetMonths', 3)
  const [monthlySavings, setMonthlySavings] = useLocalStorage('ef_monthlySavings', 50)

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
      <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Emergency Fund Planner</h2>

      {/* Progress ring area */}
      <div className="glass-card rounded-2xl p-8">
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
              <span className="text-2xl font-bold text-[hsl(var(--foreground))]">{Math.round(pct)}%</span>
              <span className="text-[hsl(var(--muted-foreground))] text-xs">funded</span>
            </div>
          </div>

          <div className="flex-1 space-y-4 w-full">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[hsl(var(--muted-foreground))] text-xs mb-1">Saved</p>
                <p className="text-green-400 text-2xl font-bold">${currentSaved.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[hsl(var(--muted-foreground))] text-xs mb-1">Goal</p>
                <p className="text-[hsl(var(--foreground))] text-2xl font-bold">${target.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[hsl(var(--muted-foreground))] text-xs mb-1">Still needed</p>
                <p className="text-amber-400 text-xl font-bold">${remaining.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[hsl(var(--muted-foreground))] text-xs mb-1">Time to goal</p>
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
          <div key={field.label} className="glass-card rounded-xl p-4">
            <label className="text-[hsl(var(--foreground))] text-sm font-medium block mb-1">{field.label}</label>
            <div className="flex items-center gap-2">
              <span className="text-[hsl(var(--muted-foreground))]">$</span>
              <input
                type="number"
                value={field.value}
                onChange={e => field.set(Number(e.target.value))}
                className="bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-amber-500"
              />
            </div>
            <p className="text-[hsl(var(--muted-foreground))] text-xs mt-1">{field.hint}</p>
          </div>
        ))}

        <div className="glass-card rounded-xl p-4">
          <label className="text-[hsl(var(--foreground))] text-sm font-medium block mb-2">Target Coverage</label>
          <div className="flex gap-2">
            {[1, 3, 6].map(m => (
              <button
                key={m}
                onClick={() => setTargetMonths(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  targetMonths === m ? 'bg-amber-500 text-[hsl(var(--primary-foreground))]' : 'bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--foreground)/0.7)] hover:bg-[hsl(var(--muted))]'
                }`}
              >
                {m} mo
              </button>
            ))}
          </div>
          <p className="text-[hsl(var(--muted-foreground))] text-xs mt-2">
            {targetMonths === 1 ? 'Minimum safety net' : targetMonths === 3 ? 'Standard recommendation' : 'Full resilience'}
          </p>
        </div>
      </div>

      {/* Milestones */}
      <div className="glass-card rounded-xl p-5">
        <h3 className="text-[hsl(var(--foreground))] font-semibold mb-4">Milestones</h3>
        <div className="space-y-3">
          {milestones.map(m => {
            const reached = currentSaved >= m.amount
            return (
              <div key={m.label} className={`flex items-center gap-4 p-3 rounded-lg ${reached ? 'bg-green-500/10 border border-green-500/20' : 'bg-[hsl(var(--muted)/0.5)]'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${reached ? 'bg-green-500 text-[hsl(var(--foreground))]' : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'}`}>
                  {reached ? '✓' : '○'}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${reached ? 'text-green-400' : 'text-[hsl(var(--foreground))]'}`}>{m.label}</p>
                  <p className="text-[hsl(var(--muted-foreground))] text-xs">{m.desc}</p>
                </div>
                <span className={`text-sm font-bold ${reached ? 'text-green-400' : 'text-[hsl(var(--muted-foreground))]'}`}>
                  ${m.amount.toLocaleString()}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <p className="text-amber-400 font-semibold text-sm mb-1">💡 Start with $200</p>
        <p className="text-[hsl(var(--foreground)/0.8)] text-sm">Even $5/day gets you to $200 in 40 days. Once you hit $200, you qualify for matched savings programs that can double your deposit. The first $200 is the hardest — after that, saving becomes a habit.</p>
      </div>
    </div>
  )
}
