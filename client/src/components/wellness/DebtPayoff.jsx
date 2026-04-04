import { useState, useMemo } from 'react'

const DEFAULT_DEBTS = [
  { id: 1, name: 'Court Debt',         balance: 13000, rate: 0,   minPayment: 50  },
  { id: 2, name: 'Phone Plan',         balance: 120,   rate: 29.9, minPayment: 30  },
  { id: 3, name: 'Medical Bill',       balance: 340,   rate: 0,   minPayment: 20  },
]

function calcPayoff(debts, extraPayment, method) {
  if (debts.length === 0) return { months: 0, totalInterest: 0, schedule: [] }

  let remaining = debts.map(d => ({ ...d, balance: d.balance }))
  let months = 0
  let totalInterest = 0
  const MAX_MONTHS = 360

  while (remaining.some(d => d.balance > 0) && months < MAX_MONTHS) {
    months++
    // Sort by method
    const sorted = method === 'avalanche'
      ? [...remaining].sort((a, b) => b.rate - a.rate)
      : [...remaining].sort((a, b) => a.balance - b.balance)

    let extra = extraPayment

    for (const debt of sorted) {
      const d = remaining.find(x => x.id === debt.id)
      if (d.balance <= 0) continue
      const interest = (d.balance * (d.rate / 100)) / 12
      totalInterest += interest
      d.balance += interest
      const payment = Math.min(d.balance, d.minPayment + (extra > 0 ? extra : 0))
      extra = Math.max(0, extra - Math.max(0, payment - d.minPayment))
      d.balance = Math.max(0, d.balance - payment)
    }
  }

  return { months, totalInterest: Math.round(totalInterest) }
}

export default function DebtPayoff() {
  const [debts, setDebts] = useState(DEFAULT_DEBTS)
  const [method, setMethod] = useState('snowball')
  const [extraPayment, setExtraPayment] = useState(50)
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', rate: '', minPayment: '' })

  const snowball = useMemo(() => calcPayoff(debts, extraPayment, 'snowball'), [debts, extraPayment])
  const avalanche = useMemo(() => calcPayoff(debts, extraPayment, 'avalanche'), [debts, extraPayment])
  const current = method === 'snowball' ? snowball : avalanche

  const totalDebt = useMemo(() => debts.reduce((s, d) => s + d.balance, 0), [debts])

  function addDebt(e) {
    e.preventDefault()
    if (!newDebt.name || !newDebt.balance) return
    setDebts(p => [...p, {
      id: Date.now(),
      name: newDebt.name,
      balance: parseFloat(newDebt.balance),
      rate: parseFloat(newDebt.rate) || 0,
      minPayment: parseFloat(newDebt.minPayment) || 25
    }])
    setNewDebt({ name: '', balance: '', rate: '', minPayment: '' })
  }

  const sortedDebts = method === 'avalanche'
    ? [...debts].sort((a, b) => b.rate - a.rate)
    : [...debts].sort((a, b) => a.balance - b.balance)

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Debt Payoff Calculator</h2>

      {/* Method selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            id: 'snowball',
            label: '❄️ Snowball Method',
            desc: 'Pay smallest balance first. Builds momentum with quick wins.',
            months: snowball.months,
            interest: snowball.totalInterest
          },
          {
            id: 'avalanche',
            label: '🏔️ Avalanche Method',
            desc: 'Pay highest interest first. Saves the most money overall.',
            months: avalanche.months,
            interest: avalanche.totalInterest
          }
        ].map(m => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={`text-left p-5 rounded-xl border-2 transition-all ${
              method === m.id
                ? 'border-amber-500 bg-amber-500/10'
                : 'border-navy-700 bg-navy-800 hover:border-navy-500'
            }`}
          >
            <p className="text-white font-semibold mb-1">{m.label}</p>
            <p className="text-navy-400 text-xs mb-3">{m.desc}</p>
            <div className="flex gap-4">
              <div>
                <p className="text-navy-400 text-xs">Payoff time</p>
                <p className="text-amber-400 font-bold">{m.months} months</p>
              </div>
              <div>
                <p className="text-navy-400 text-xs">Total interest</p>
                <p className="text-red-400 font-bold">${m.interest.toLocaleString()}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-navy-800 rounded-xl p-4 text-center">
          <p className="text-navy-400 text-xs mb-1">Total Debt</p>
          <p className="text-red-400 text-xl font-bold">${totalDebt.toLocaleString()}</p>
        </div>
        <div className="bg-navy-800 rounded-xl p-4 text-center">
          <p className="text-navy-400 text-xs mb-1">Debt-Free In</p>
          <p className="text-amber-400 text-xl font-bold">{current.months} mo</p>
        </div>
        <div className="bg-navy-800 rounded-xl p-4 text-center">
          <p className="text-navy-400 text-xs mb-1">Interest Paid</p>
          <p className="text-white text-xl font-bold">${current.totalInterest.toLocaleString()}</p>
        </div>
      </div>

      {/* Extra payment slider */}
      <div className="bg-navy-800 rounded-xl p-5">
        <div className="flex justify-between mb-2">
          <label className="text-white font-medium text-sm">Extra Monthly Payment</label>
          <span className="text-amber-400 font-bold">${extraPayment}</span>
        </div>
        <input
          type="range"
          min="0" max="500" step="10"
          value={extraPayment}
          onChange={e => setExtraPayment(Number(e.target.value))}
          className="w-full accent-amber-500"
        />
        <div className="flex justify-between text-navy-400 text-xs mt-1">
          <span>$0</span>
          <span>$500</span>
        </div>
        {extraPayment > 0 && (
          <p className="text-green-400 text-sm mt-2">
            +${extraPayment}/mo saves you ${Math.max(0, calcPayoff(debts, 0, method).totalInterest - current.totalInterest).toLocaleString()} in interest
          </p>
        )}
      </div>

      {/* Debt list */}
      <div className="bg-navy-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">
          Your Debts — {method === 'snowball' ? 'Smallest First' : 'Highest Rate First'}
        </h3>
        <div className="space-y-3">
          {sortedDebts.map((debt, i) => (
            <div key={debt.id} className="flex items-center gap-4 p-3 bg-navy-700 rounded-lg">
              <div className="w-7 h-7 bg-amber-500 text-navy-900 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{debt.name}</p>
                <p className="text-navy-400 text-xs">
                  {debt.rate > 0 ? `${debt.rate}% APR` : 'No interest'} · Min ${debt.minPayment}/mo
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-sm">${debt.balance.toLocaleString()}</p>
              </div>
              <button
                onClick={() => setDebts(p => p.filter(d => d.id !== debt.id))}
                className="text-navy-500 hover:text-red-400 text-xs transition-colors"
              >✕</button>
            </div>
          ))}
        </div>

        {/* Add debt form */}
        <form onSubmit={addDebt} className="flex flex-wrap gap-2 mt-4">
          <input placeholder="Debt name" value={newDebt.name} onChange={e => setNewDebt(p => ({ ...p, name: e.target.value }))}
            className="flex-1 min-w-24 bg-navy-700 border border-navy-600 text-white placeholder-navy-400 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500" />
          <input type="number" placeholder="Balance $" value={newDebt.balance} onChange={e => setNewDebt(p => ({ ...p, balance: e.target.value }))}
            className="w-24 bg-navy-700 border border-navy-600 text-white placeholder-navy-400 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500" />
          <input type="number" placeholder="Rate %" value={newDebt.rate} onChange={e => setNewDebt(p => ({ ...p, rate: e.target.value }))}
            className="w-20 bg-navy-700 border border-navy-600 text-white placeholder-navy-400 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500" />
          <input type="number" placeholder="Min $" value={newDebt.minPayment} onChange={e => setNewDebt(p => ({ ...p, minPayment: e.target.value }))}
            className="w-20 bg-navy-700 border border-navy-600 text-white placeholder-navy-400 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-amber-500" />
          <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-navy-900 font-semibold px-4 py-2 rounded-lg text-xs transition-colors">Add</button>
        </form>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <p className="text-amber-400 font-semibold text-sm mb-1">💡 Court debt tip</p>
        <p className="text-navy-200 text-sm">Most court fines can be reduced or put on a payment plan. Legal aid organizations help for free. Paying even $50/month shows good faith and can prevent license suspension or re-incarceration.</p>
      </div>
    </div>
  )
}
