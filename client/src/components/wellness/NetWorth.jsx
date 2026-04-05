import { useState, useMemo } from 'react'
import { useLocalStorage } from '../../lib/useLocalStorage.js'

const DEFAULT_ASSETS = [
  { id: 1, name: 'Checking Account', value: 340, category: 'liquid' },
  { id: 2, name: 'Savings Account',  value: 200, category: 'liquid' },
  { id: 3, name: 'Cash on Hand',     value: 80,  category: 'liquid' },
]

const DEFAULT_LIABILITIES = [
  { id: 1, name: 'Court Debt',         value: 13000, category: 'debt' },
  { id: 2, name: 'Phone Plan Balance', value: 120,   category: 'debt' },
]

function ItemRow({ item, onDelete }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[hsl(var(--border))] last:border-0">
      <span className="text-[hsl(var(--foreground))] text-sm">{item.name}</span>
      <div className="flex items-center gap-3">
        <span className="text-[hsl(var(--foreground))] font-medium text-sm">${item.value.toLocaleString()}</span>
        <button onClick={() => onDelete(item.id)} className="text-[hsl(var(--muted-foreground))] hover:text-red-400 text-xs transition-colors">✕</button>
      </div>
    </div>
  )
}

const inputCls = "bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"

export default function NetWorth() {
  const [assets, setAssets]           = useLocalStorage('nw_assets', DEFAULT_ASSETS)
  const [liabilities, setLiabilities] = useLocalStorage('nw_liabilities', DEFAULT_LIABILITIES)
  const [newAsset, setNewAsset]       = useState({ name: '', value: '' })
  const [newLiab, setNewLiab]         = useState({ name: '', value: '' })

  const totalAssets      = useMemo(() => assets.reduce((s, a) => s + a.value, 0), [assets])
  const totalLiabilities = useMemo(() => liabilities.reduce((s, l) => s + l.value, 0), [liabilities])
  const netWorth         = totalAssets - totalLiabilities

  function addAsset(e) {
    e.preventDefault()
    if (!newAsset.name || !newAsset.value) return
    setAssets(p => [...p, { id: Date.now(), name: newAsset.name, value: parseFloat(newAsset.value), category: 'liquid' }])
    setNewAsset({ name: '', value: '' })
  }

  function addLiability(e) {
    e.preventDefault()
    if (!newLiab.name || !newLiab.value) return
    setLiabilities(p => [...p, { id: Date.now(), name: newLiab.name, value: parseFloat(newLiab.value), category: 'debt' }])
    setNewLiab({ name: '', value: '' })
  }

  const netColor = netWorth >= 0 ? 'text-green-400' : 'text-red-400'

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Net Worth Calculator</h2>

      {/* Big number */}
      <div className="glass-card rounded-2xl p-8 text-center">
        <p className="text-[hsl(var(--muted-foreground))] text-sm mb-2">Your Net Worth</p>
        <p className={`text-5xl font-bold ${netColor}`}>
          {netWorth < 0 ? '-' : ''}${Math.abs(netWorth).toLocaleString()}
        </p>
        <p className="text-[hsl(var(--muted-foreground))] text-sm mt-3">
          {netWorth < 0
            ? "You owe more than you own right now. That's okay — this is your starting point."
            : "You own more than you owe. Keep building."}
        </p>
      </div>

      {/* Ratio bar */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex justify-between mb-3">
          <span className="text-green-400 font-medium text-sm">Assets: ${totalAssets.toLocaleString()}</span>
          <span className="text-red-400 font-medium text-sm">Liabilities: ${totalLiabilities.toLocaleString()}</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden bg-[hsl(var(--muted))]">
          {totalAssets + totalLiabilities > 0 && (
            <>
              <div className="bg-green-500 transition-all duration-700"
                style={{ width: `${(totalAssets / (totalAssets + totalLiabilities)) * 100}%` }} />
              <div className="bg-red-500 transition-all duration-700"
                style={{ width: `${(totalLiabilities / (totalAssets + totalLiabilities)) * 100}%` }} />
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assets */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-green-400 font-semibold">Assets</h3>
            <span className="text-green-400 font-bold">${totalAssets.toLocaleString()}</span>
          </div>
          {assets.map(a => <ItemRow key={a.id} item={a} onDelete={id => setAssets(p => p.filter(x => x.id !== id))} />)}
          <form onSubmit={addAsset} className="flex gap-2 mt-3">
            <input placeholder="Name" value={newAsset.name} onChange={e => setNewAsset(p => ({ ...p, name: e.target.value }))}
              className={`flex-1 ${inputCls} focus:ring-green-500`} />
            <input type="number" placeholder="$" value={newAsset.value} onChange={e => setNewAsset(p => ({ ...p, value: e.target.value }))}
              className={`w-20 ${inputCls} focus:ring-green-500`} />
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs transition-colors">+</button>
          </form>
        </div>

        {/* Liabilities */}
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-red-400 font-semibold">Liabilities</h3>
            <span className="text-red-400 font-bold">${totalLiabilities.toLocaleString()}</span>
          </div>
          {liabilities.map(l => <ItemRow key={l.id} item={l} onDelete={id => setLiabilities(p => p.filter(x => x.id !== id))} />)}
          <form onSubmit={addLiability} className="flex gap-2 mt-3">
            <input placeholder="Name" value={newLiab.name} onChange={e => setNewLiab(p => ({ ...p, name: e.target.value }))}
              className={`flex-1 ${inputCls} focus:ring-red-500`} />
            <input type="number" placeholder="$" value={newLiab.value} onChange={e => setNewLiab(p => ({ ...p, value: e.target.value }))}
              className={`w-20 ${inputCls} focus:ring-red-500`} />
            <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs transition-colors">+</button>
          </form>
        </div>
      </div>

      <div className="bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--primary)/0.25)] rounded-xl p-4">
        <p className="text-[hsl(var(--primary))] font-semibold text-sm mb-1">💡 Why net worth matters</p>
        <p className="text-[hsl(var(--foreground)/0.7)] text-sm leading-relaxed">Net worth is your financial scoreboard. Even if it's negative right now, tracking it monthly shows you're moving in the right direction. Most people who start with negative net worth reach zero within 2–3 years of consistent saving.</p>
      </div>
    </div>
  )
}
