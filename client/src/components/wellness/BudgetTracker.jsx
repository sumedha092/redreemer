import { useState, useMemo } from 'react'

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Housing',      budget: 800,  spent: 800,  color: '#f59e0b', icon: '🏠' },
  { id: 2, name: 'Food',         budget: 300,  spent: 210,  color: '#10b981', icon: '🍎' },
  { id: 3, name: 'Transport',    budget: 150,  spent: 95,   color: '#6366f1', icon: '🚌' },
  { id: 4, name: 'Phone',        budget: 50,   spent: 50,   color: '#ec4899', icon: '📱' },
  { id: 5, name: 'Healthcare',   budget: 100,  spent: 40,   color: '#14b8a6', icon: '💊' },
  { id: 6, name: 'Clothing',     budget: 50,   spent: 0,    color: '#8b5cf6', icon: '👕' },
  { id: 7, name: 'Savings',      budget: 200,  spent: 200,  color: '#22c55e', icon: '💰' },
  { id: 8, name: 'Other',        budget: 100,  spent: 65,   color: '#94a3b8', icon: '📦' },
]

function CategoryBar({ cat, onEdit }) {
  const pct = cat.budget > 0 ? Math.min((cat.spent / cat.budget) * 100, 100) : 0
  const over = cat.spent > cat.budget
  return (
    <div className="bg-navy-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span>{cat.icon}</span>
          <span className="text-white font-medium text-sm">{cat.name}</span>
        </div>
        <div className="text-right">
          <span className={`text-sm font-semibold ${over ? 'text-red-400' : 'text-white'}`}>
            ${cat.spent}
          </span>
          <span className="text-navy-400 text-xs"> / ${cat.budget}</span>
        </div>
      </div>
      <div className="w-full bg-navy-700 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: over ? '#ef4444' : cat.color }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-navy-400 text-xs">{Math.round(pct)}% used</span>
        <span className={`text-xs ${over ? 'text-red-400' : 'text-green-400'}`}>
          {over ? `$${cat.spent - cat.budget} over` : `$${cat.budget - cat.spent} left`}
        </span>
      </div>
    </div>
  )
}

export default function BudgetTracker() {
  const [income, setIncome] = useState(1800)
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [newEntry, setNewEntry] = useState({ category: '', amount: '', type: 'expense' })
  const [entries, setEntries] = useState([
    { id: 1, date: '2026-04-01', category: 'Housing',   amount: 800,  type: 'expense', note: 'Rent' },
    { id: 2, date: '2026-04-02', category: 'Food',      amount: 45,   type: 'expense', note: 'Grocery run' },
    { id: 3, date: '2026-04-03', category: 'Transport', amount: 30,   type: 'expense', note: 'Bus pass' },
    { id: 4, date: '2026-04-05', category: 'Food',      amount: 12,   type: 'expense', note: 'Lunch' },
    { id: 5, date: '2026-04-07', category: 'Savings',   amount: 200,  type: 'expense', note: 'Monthly savings' },
  ])

  const totalBudgeted = useMemo(() => categories.reduce((s, c) => s + c.budget, 0), [categories])
  const totalSpent = useMemo(() => categories.reduce((s, c) => s + c.spent, 0), [categories])
  const remaining = income - totalSpent

  function addEntry(e) {
    e.preventDefault()
    if (!newEntry.category || !newEntry.amount) return
    const amt = parseFloat(newEntry.amount)
    const entry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      category: newEntry.category,
      amount: amt,
      type: newEntry.type,
      note: ''
    }
    setEntries(prev => [entry, ...prev])
    // Update category spent
    setCategories(prev => prev.map(c =>
      c.name === newEntry.category ? { ...c, spent: c.spent + amt } : c
    ))
    setNewEntry({ category: '', amount: '', type: 'expense' })
  }

  const spentPct = income > 0 ? Math.min((totalSpent / income) * 100, 100) : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Budget Tracker</h2>
        <span className="text-navy-400 text-sm">April 2026</span>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Income',  value: `$${income.toLocaleString()}`,        color: 'text-green-400' },
          { label: 'Total Spent',     value: `$${totalSpent.toLocaleString()}`,     color: 'text-amber-400' },
          { label: 'Remaining',       value: `$${remaining.toLocaleString()}`,      color: remaining >= 0 ? 'text-green-400' : 'text-red-400' },
          { label: 'Savings Rate',    value: `${income > 0 ? Math.round((200/income)*100) : 0}%`, color: 'text-blue-400' },
        ].map(card => (
          <div key={card.label} className="bg-navy-800 rounded-xl p-4">
            <p className="text-navy-400 text-xs mb-1">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="bg-navy-800 rounded-xl p-5">
        <div className="flex justify-between mb-2">
          <span className="text-white font-medium">Monthly Spending</span>
          <span className="text-navy-400 text-sm">${totalSpent} of ${income}</span>
        </div>
        <div className="w-full bg-navy-700 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-700"
            style={{ width: `${spentPct}%`, backgroundColor: spentPct > 90 ? '#ef4444' : '#f59e0b' }}
          />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-navy-400 text-xs">{Math.round(spentPct)}% of income spent</span>
          <span className="text-green-400 text-xs">50/30/20 rule: aim for 20% savings</span>
        </div>
      </div>

      {/* Income input */}
      <div className="bg-navy-800 rounded-xl p-4 flex items-center gap-4">
        <label className="text-white text-sm font-medium whitespace-nowrap">Monthly Income</label>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-navy-400">$</span>
          <input
            type="number"
            value={income}
            onChange={e => setIncome(Number(e.target.value))}
            className="bg-navy-700 border border-navy-600 text-white rounded-lg px-3 py-2 text-sm w-32 focus:outline-none focus:border-amber-500"
          />
        </div>
        <span className="text-navy-400 text-xs">After tax</span>
      </div>

      {/* Category bars */}
      <div>
        <h3 className="text-white font-semibold mb-3">Spending by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map(cat => (
            <CategoryBar key={cat.id} cat={cat} />
          ))}
        </div>
      </div>

      {/* Add transaction */}
      <div className="bg-navy-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Log a Transaction</h3>
        <form onSubmit={addEntry} className="flex flex-wrap gap-3">
          <select
            value={newEntry.category}
            onChange={e => setNewEntry(p => ({ ...p, category: e.target.value }))}
            className="bg-navy-700 border border-navy-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
          >
            <option value="">Category</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={newEntry.amount}
            onChange={e => setNewEntry(p => ({ ...p, amount: e.target.value }))}
            className="bg-navy-700 border border-navy-600 text-white placeholder-navy-400 rounded-lg px-3 py-2 text-sm w-28 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="bg-amber-500 hover:bg-amber-600 text-navy-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            Add
          </button>
        </form>
      </div>

      {/* Recent transactions */}
      <div className="bg-navy-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">Recent Transactions</h3>
        <div className="space-y-2">
          {entries.slice(0, 8).map(entry => (
            <div key={entry.id} className="flex items-center justify-between py-2 border-b border-navy-700 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-lg">{categories.find(c => c.name === entry.category)?.icon || '📦'}</span>
                <div>
                  <p className="text-white text-sm">{entry.note || entry.category}</p>
                  <p className="text-navy-400 text-xs">{entry.date}</p>
                </div>
              </div>
              <span className="text-red-400 font-medium text-sm">-${entry.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 50/30/20 tip */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <p className="text-amber-400 font-semibold text-sm mb-1">💡 The 50/30/20 Rule</p>
        <p className="text-navy-200 text-sm">50% needs (housing, food, transport) · 30% wants · 20% savings & debt payoff. On $1,800/month: $900 needs, $540 wants, $360 savings.</p>
      </div>
    </div>
  )
}
