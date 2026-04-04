import { useState, useMemo } from 'react'

const DEFAULT_ASSETS = [
  { id: 1, name: 'Checking Account',  value: 340,   category: 'liquid' },
  { id: 2, name: 'Savings Account',   value: 200,   category: 'liquid' },
  { id: 3, name: 'Cash on Hand',      value: 80,    category: 'liquid' },
]

const DEFAULT_LIABILITIES = [
  { id: 1, name: 'Court Debt',        value: 13000, category: 'debt' },
  { id: 2, name: 'Phone Plan Balance',value: 120,   category: 'debt' },
]

function ItemRow({ item, onDelete, onEdit }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-navy-700 last:border-0">
      <span className="text-white text-sm">{item.name}</span>
      <div className="flex items-center gap-3">
        <span className="text-white font-medium text-sm">${item.value.toLocaleString()}</span>
        <button onClick={() => onDelete(item.id)} className="text-navy-500 hover:text-red-400 text-xs transition-colors">✕</button>
      </div>
    </div>
  )
}

export default function NetWorth() {
  const [assets, setAssets] = useState(DEFAULT_ASSETS)
  const [liabilities, setLiabilities] = useState(DEFAULT_LIABILITIES)
  const [newAsset, setNewAsset] = useState({ name: '', value: '' })
  const [newLiability, setNewLiability] = useState({ name: '', value: '' })

  const totalAssets = useMemo(() => assets.reduce((s, a) => s + a.value, 0), [assets])
  const totalLiabilities = useMemo(() => liabilities.reduce((s, l) => s + l.value, 0), [liabilities])
  const netWorth = totalAssets - totalLiabilities

  function addAsset(e) {
    e.preventDefault()
    if (!newAsset.name || !newAsset.value) return
    setAssets(p => [...p, { id: Date.now(), name: newAsset.name, value: parseFloat(newAsset.value), category: 'liquid' }])
    setNewAsset({ name: '', value: '' })
  }

  function addLiability(e) {
    e.preventDefault()
    if (!newLiability.name || !newLiability.value) return
    setLiabilities(p => [...p, { id: Date.now(), name: newLiability.name, value: parseFloat(newLiability.value), category: 'debt' }])
    setNewLiability({ name: '', value: '' })
  }

  const netWorthColor = netWorth >= 0 ? 'text-green-400' : 'text-red-400'

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Net Worth Calculator</h2>

      {/* Net worth display */}
      <div className="bg-navy-800 rounded-2xl p-8 text-center">
        <p className="text-navy-400 text-sm mb-2">Your Net Worth</p>
        <p className={`text-5xl font-bold ${netWorthColor}`}>
          {netWorth < 0 ? '-' : ''}${Math.abs(netWorth).toLocaleString()}
        </p>
        <p className="text-navy-400 text-sm mt-3">
          {netWorth < 0
            ? "You owe more than you own right now. That's okay — this is your starting point."
            : "You own more than you owe. Keep building."}
        </p>
      </div>

      {/* Assets vs Liabilities bar */}
      <div className="bg-navy-800 rounded-xl p-5">
        <div className="flex justify-between mb-3">
          <span className="text-green-400 font-medium text-sm">Assets: ${totalAssets.toLocaleString()}</span>
          <span className="text-red-400 font-medium text-sm">Liabilities: ${totalLiabilities.toLocaleString()}</span>
        </div>
        <div className="flex h-4 rounded-full overflow-hidden">
          {totalAssets + totalLiabilities > 0 && (
            <>
              <div
                className="bg-green-500 transition-all duration-700"
                style={{ width: `${(totalAssets / (totalAssets + totalLiabilities)) * 100}%` }}
              />
              <div
                className="bg-red-500 transition-all duration-700"
                style={{ width: `${(totalLiabilities / (totalAssets + totalLiabilities)) * 100}%` }}
              />
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assets */}
        <div className="bg-navy-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-green-400 font-semibold">Assets</h3>
            <span className="text-green-400 font-bold">${totalAssets.toLocaleString()}</span>
          </div>
          {assets.map(a => (
            <ItemRow key={a.id} item={a} onDelete={id => setAssets(p => p.filter(x => x.id !== id))} />
          ))}
          <form onSubmit={addAsset} className="flex gap-2 mt-3">
            <input
              placeholder="Name"
              value={newAsset.name}
              onChange={e => setNewAsset(p => ({ ...p, name: e.target.value }))}
              className="flex-1 bg-navy-700 border border-navy-600 text-white placeholder-navy-400 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-green-500"
            />
            <input
              type="number"
              placeholder="$"
              value={newAsset.value}
              onChange={e => setNewAsset(p => ({ ...p, value: e.target.value }))}
              className="w-20 bg-navy-700 border border-navy-600 text-white placeholder-navy-400 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-green-500"
            />
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs transition-colors">+</button>
          </form>
        </div>

        {/* Liabilities */}
        <div className="bg-navy-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-red-400 font-semibold">Liabilities</h3>
            <span className="text-red-400 font-bold">${totalLiabilities.toLocaleString()}</span>
          </div>
          {liabilities.map(l => (
            <ItemRow key={l.id} item={l} onDelete={id => setLiabilities(p => p.filter(x => x.id !== id))} />
          ))}
          <form onSubmit={addLiability} className="flex gap-2 mt-3">
            <input
              placeholder="Name"
              value={newLiability.name}
              onChange={e => setNewLiability(p => ({ ...p, name: e.target.value }))}
              className="flex-1 bg-navy-700 border border-navy-600 text-white placeholder-navy-400 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-red-500"
            />
            <input
              type="number"
              placeholder="$"
              value={newLiability.value}
              onChange={e => setNewLiability(p => ({ ...p, value: e.target.value }))}
              className="w-20 bg-navy-700 border border-navy-600 text-white placeholder-navy-400 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-red-500"
            />
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs transition-colors">+</button>
          </form>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
        <p className="text-amber-400 font-semibold text-sm mb-1">💡 Why net worth matters</p>
        <p className="text-navy-200 text-sm">Net worth is your financial scoreboard. Even if it's negative right now, tracking it monthly shows you're moving in the right direction. Most people who start with negative net worth reach zero within 2-3 years of consistent saving.</p>
      </div>
    </div>
  )
}
