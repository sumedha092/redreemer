import { useState } from 'react'

const DEFAULT_GOALS = [
  { id: 1, name: 'Emergency Fund',    target: 500,  saved: 200,  icon: '🛡️', color: '#f59e0b', deadline: '2026-08-01' },
  { id: 2, name: 'Housing Deposit',   target: 1000, saved: 200,  icon: '🏠', color: '#10b981', deadline: '2026-12-01' },
  { id: 3, name: 'Phone Upgrade',     target: 200,  saved: 80,   icon: '📱', color: '#6366f1', deadline: '2026-06-01' },
]

function GoalCard({ goal, onUpdate, onDelete }) {
  const pct = goal.target > 0 ? Math.min((goal.saved / goal.target) * 100, 100) : 0
  const remaining = goal.target - goal.saved
  const daysLeft = goal.deadline
    ? Math.max(0, Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24)))
    : null
  const dailyNeeded = daysLeft > 0 ? (remaining / daysLeft).toFixed(2) : null

  return (
    <div className="bg-navy-800 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{goal.icon}</span>
          <div>
            <h3 className="text-white font-semibold">{goal.name}</h3>
            {goal.deadline && (
              <p className="text-navy-400 text-xs">
                {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
              </p>
            )}
          </div>
        </div>
        <button onClick={() => onDelete(goal.id)} className="text-navy-500 hover:text-red-400 text-xs transition-colors">✕</button>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-navy-700 rounded-full h-3 mb-2">
        <div
          className="h-3 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? '#22c55e' : goal.color }}
        />
      </div>

      <div className="flex justify-between mb-4">
        <span className="text-white font-bold">${goal.saved.toLocaleString()}</span>
        <span className="text-navy-400 text-sm">of ${goal.target.toLocaleString()} ({Math.round(pct)}%)</span>
      </div>

      {pct < 100 && (
        <div className="flex items-center gap-2 mb-4">
          <p className="text-navy-400 text-xs">
            {dailyNeeded ? `Save $${dailyNeeded}/day to hit your deadline` : `$${remaining.toLocaleString()} to go`}
          </p>
        </div>
      )}

      {pct >= 100 && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2 mb-4 text-center">
          <span className="text-green-400 text-sm font-semibold">🎉 Goal reached!</span>
        </div>
      )}

      {/* Add savings input */}
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Add $"
          className="flex-1 bg-navy-700 border border-navy-600 text-white placeholder-navy-400 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              const amt = parseFloat(e.target.value)
              if (amt > 0) { onUpdate(goal.id, Math.min(goal.saved + amt, goal.target)); e.target.value = '' }
            }
          }}
        />
        <button
          className="bg-navy-700 hover:bg-navy-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
          onClick={e => {
            const input = e.target.previousSibling
            const amt = parseFloat(input.value)
            if (amt > 0) { onUpdate(goal.id, Math.min(goal.saved + amt, goal.target)); input.value = '' }
          }}
        >
          Save
        </button>
      </div>
    </div>
  )
}

export default function SavingsGoals() {
  const [goals, setGoals] = useState(DEFAULT_GOALS)
  const [newGoal, setNewGoal] = useState({ name: '', target: '', icon: '🎯', deadline: '' })
  const [showForm, setShowForm] = useState(false)

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0)
  const totalTarget = goals.reduce((s, g) => s + g.target, 0)

  function addGoal(e) {
    e.preventDefault()
    if (!newGoal.name || !newGoal.target) return
    setGoals(p => [...p, {
      id: Date.now(),
      name: newGoal.name,
      target: parseFloat(newGoal.target),
      saved: 0,
      icon: newGoal.icon,
      color: '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0'),
      deadline: newGoal.deadline || null
    }])
    setNewGoal({ name: '', target: '', icon: '🎯', deadline: '' })
    setShowForm(false)
  }

  const ICONS = ['🎯', '🏠', '🚗', '📱', '✈️', '🎓', '💊', '🛡️', '💍', '🐾']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Savings Goals</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-500 hover:bg-amber-600 text-navy-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          + New Goal
        </button>
      </div>

      {/* Overall progress */}
      <div className="bg-navy-800 rounded-xl p-5">
        <div className="flex justify-between mb-2">
          <span className="text-white font-medium">Total Saved Across All Goals</span>
          <span className="text-amber-400 font-bold">${totalSaved.toLocaleString()} / ${totalTarget.toLocaleString()}</span>
        </div>
        <div className="w-full bg-navy-700 rounded-full h-3">
          <div
            className="h-3 rounded-full bg-amber-500 transition-all duration-700"
            style={{ width: `${totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* New goal form */}
      {showForm && (
        <form onSubmit={addGoal} className="bg-navy-800 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-semibold">New Savings Goal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              placeholder="Goal name (e.g. Housing Deposit)"
              value={newGoal.name}
              onChange={e => setNewGoal(p => ({ ...p, name: e.target.value }))}
              className="bg-navy-700 border border-navy-600 text-white placeholder-navy-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            />
            <div className="flex items-center gap-2">
              <span className="text-navy-400">$</span>
              <input
                type="number"
                placeholder="Target amount"
                value={newGoal.target}
                onChange={e => setNewGoal(p => ({ ...p, target: e.target.value }))}
                className="flex-1 bg-navy-700 border border-navy-600 text-white placeholder-navy-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
            <input
              type="date"
              value={newGoal.deadline}
              onChange={e => setNewGoal(p => ({ ...p, deadline: e.target.value }))}
              className="bg-navy-700 border border-navy-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
            />
            <div className="flex flex-wrap gap-2">
              {ICONS.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setNewGoal(p => ({ ...p, icon }))}
                  className={`w-9 h-9 rounded-lg text-lg transition-colors ${newGoal.icon === icon ? 'bg-amber-500' : 'bg-navy-700 hover:bg-navy-600'}`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-navy-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
              Create Goal
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-navy-400 hover:text-white px-4 py-2 text-sm transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Goal cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map(goal => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onUpdate={(id, newSaved) => setGoals(p => p.map(g => g.id === id ? { ...g, saved: newSaved } : g))}
            onDelete={id => setGoals(p => p.filter(g => g.id !== id))}
          />
        ))}
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <p className="text-amber-400 font-semibold text-sm mb-1">💡 Automate it</p>
        <p className="text-navy-200 text-sm">Once you have a Bank On account, set up an automatic transfer of even $5/week to savings. Automation removes the decision — you save without thinking about it. Small amounts compound into real money.</p>
      </div>
    </div>
  )
}
