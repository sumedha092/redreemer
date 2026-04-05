import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Search, UserPlus, AlertTriangle, X, Filter } from 'lucide-react'
import { createApiClient } from '../lib/api.js'
import { MOCK_CLIENTS } from '../lib/mockData.js'

const isMock = import.meta.env.VITE_MOCK_MODE === 'true'

const TYPE_DOT = {
  homeless: 'bg-[hsl(var(--primary))]',
  reentry:  'bg-[hsl(var(--secondary))]',
  both:     'bg-purple-500',
}
const TYPE_LABEL = { homeless: 'Homeless', reentry: 'Reentry', both: 'Both' }

const FILTERS = [
  { value: 'all',      label: 'All' },
  { value: 'homeless', label: 'Homeless' },
  { value: 'reentry',  label: 'Reentry' },
  { value: 'both',     label: 'Both' },
  { value: 'inactive', label: '⚠ Inactive' },
]

function daysAgo(iso) {
  if (!iso) return null
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}

function lastSeenLabel(iso) {
  if (!iso) return 'Never'
  const d = daysAgo(iso)
  if (d === 0) return 'Today'
  if (d === 1) return 'Yesterday'
  return `${d}d ago`
}

function ClientRow({ client, isSelected, onClick }) {
  const dot = TYPE_DOT[client.user_type] || TYPE_DOT.homeless
  const pct = ((client.current_step || 1) / 8) * 100
  const d = daysAgo(client.last_active)
  const inactive = d !== null && d >= 5

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-all group border-l-[3px] ${
        isSelected
          ? 'bg-[hsl(var(--muted)/0.8)] border-[hsl(var(--primary))]'
          : 'hover:bg-[hsl(var(--muted)/0.4)] border-transparent'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className={`w-9 h-9 rounded-full ${dot} flex items-center justify-center font-heading font-bold text-white text-sm shrink-0`}>
          {(client.name || '?')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="text-sm font-medium text-[hsl(var(--foreground))] truncate">{client.name || 'Unknown'}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] shrink-0">
              {TYPE_LABEL[client.user_type] || '—'}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-[hsl(var(--muted))] mb-1">
            <div
              className="h-full rounded-full bg-[hsl(var(--primary))] transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[hsl(var(--muted-foreground))]">Step {client.current_step || 1}/8</span>
            {inactive ? (
              <span className="flex items-center gap-0.5 text-[10px] text-red-400">
                <AlertTriangle className="w-2.5 h-2.5" />
                {d}d inactive
              </span>
            ) : (
              <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{lastSeenLabel(client.last_active)}</span>
            )}
          </div>
        </div>
      </div>
    </button>
  )
}

function AddClientInline({ onAdded, onCancel }) {
  const { getAccessTokenSilently } = useAuth0()
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!phone.trim()) return
    setStatus('adding')
    try {
      const token = await getAccessTokenSilently()
      const api = createApiClient(token)
      const { data } = await api.post('/api/clients', { phone_number: phone })
      setStatus('done')
      if (onAdded) onAdded(data)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus(null), 3000)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-3 mb-2 glass rounded-xl p-3 border border-[hsl(var(--primary)/0.3)]">
      <p className="text-xs font-medium text-[hsl(var(--foreground))] mb-2">Add new client</p>
      <input
        type="tel"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="+1 555 000 0000"
        className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] mb-2"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === 'adding'}
          className="flex-1 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-medium py-1.5 rounded-lg text-xs disabled:opacity-50 transition-colors"
        >
          {status === 'adding' ? 'Adding…' : 'Add & Send Welcome'}
        </button>
        <button type="button" onClick={onCancel} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]">
          <X className="w-4 h-4" />
        </button>
      </div>
      {status === 'error' && <p className="text-red-400 text-xs mt-1">Failed to add client.</p>}
    </form>
  )
}

export default function ClientList({ selectedId, onSelect, onClientsLoaded }) {
  const { getAccessTokenSilently } = useAuth0()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        if (isMock) { setClients(MOCK_CLIENTS); onClientsLoaded?.(MOCK_CLIENTS); return }
        const token = await getAccessTokenSilently()
        const api = createApiClient(token)
        const { data } = await api.get('/api/clients')
        setClients(data)
        onClientsLoaded?.(data)
      } catch {
        setLoadError('Could not load clients. Check your connection.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = clients.filter(c => {
    // text search
    const matchesSearch = !search ||
      (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.phone_number || '').includes(search)

    // filter pill
    let matchesFilter = true
    if (filter === 'inactive') matchesFilter = daysAgo(c.last_active) >= 5
    else if (filter !== 'all') matchesFilter = c.user_type === filter

    return matchesSearch && matchesFilter
  })

  const sorted = [...filtered].sort((a, b) => {
    const aInactive = daysAgo(a.last_active) >= 5 ? 1 : 0
    const bInactive = daysAgo(b.last_active) >= 5 ? 1 : 0
    if (aInactive !== bInactive) return bInactive - aInactive
    return new Date(b.last_active || 0) - new Date(a.last_active || 0)
  })

  const inactiveCount = clients.filter(c => daysAgo(c.last_active) >= 5).length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search + controls */}
      <div className="p-3 space-y-2 border-b border-[hsl(var(--border))]">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search clients…"
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-sm text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
            />
          </div>
          <button
            onClick={() => setShowFilters(f => !f)}
            className={`px-2.5 rounded-lg border transition-all ${
              filter !== 'all' || showFilters
                ? 'bg-[hsl(var(--primary)/0.15)] border-[hsl(var(--primary)/0.4)] text-[hsl(var(--primary))]'
                : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter pills */}
        {showFilters && (
          <div className="flex flex-wrap gap-1.5">
            {FILTERS.map(f => {
              const count = f.value === 'all' ? clients.length
                : f.value === 'inactive' ? inactiveCount
                : clients.filter(c => c.user_type === f.value).length
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    filter === f.value
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                      : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted)/0.7)]'
                  }`}
                >
                  {f.label}
                  <span className={`text-[10px] ${filter === f.value ? 'opacity-70' : 'opacity-60'}`}>{count}</span>
                </button>
              )
            })}
          </div>
        )}

        {!isMock && !showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-xs font-medium hover:glow-amber transition-all"
          >
            <UserPlus className="w-3.5 h-3.5" /> Add Client
          </button>
        )}
      </div>

      {/* Add client form */}
      {showAdd && (
        <AddClientInline
          onAdded={c => { setClients(prev => [c, ...prev]); setShowAdd(false) }}
          onCancel={() => setShowAdd(false)}
        />
      )}

      {/* Client list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {loading && (
          <div className="space-y-2 p-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-16 rounded-lg bg-[hsl(var(--muted)/0.5)] animate-pulse" />
            ))}
          </div>
        )}
        {loadError && (
          <div className="mx-2 mt-2 flex items-start gap-2 text-red-400 text-xs p-3 bg-red-500/10 rounded-lg">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            {loadError}
          </div>
        )}
        {!loading && !loadError && sorted.length === 0 && (
          <div className="text-center py-10 text-[hsl(var(--muted-foreground))] text-sm">
            {search || filter !== 'all' ? 'No clients match' : 'No clients yet'}
          </div>
        )}
        {sorted.map(c => (
          <ClientRow key={c.id} client={c} isSelected={c.id === selectedId} onClick={() => onSelect(c)} />
        ))}
      </div>

      {/* Footer */}
      {!loading && sorted.length > 0 && (
        <div className="px-4 py-2 border-t border-[hsl(var(--border))] text-[10px] text-[hsl(var(--muted-foreground))] flex items-center justify-between">
          <span>{sorted.length} client{sorted.length !== 1 ? 's' : ''}{filter !== 'all' ? ` · ${FILTERS.find(f=>f.value===filter)?.label}` : ''}</span>
          {filter !== 'all' && (
            <button onClick={() => setFilter('all')} className="text-[hsl(var(--primary))] hover:underline">Clear</button>
          )}
        </div>
      )}
    </div>
  )
}
