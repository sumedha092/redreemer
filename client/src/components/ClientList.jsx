import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/api.js'
import { MOCK_CLIENTS } from '../lib/mockData.js'
import AddClientForm from './AddClientForm.jsx'
import FlagBadges from './FlagBadges.jsx'

const isMock = import.meta.env.VITE_MOCK_MODE === 'true'

const TYPE_COLORS = {
  homeless: 'bg-amber-500/20 text-amber-400',
  reentry: 'bg-blue-500/20 text-blue-400',
  both: 'bg-purple-500/20 text-purple-400'
}

function ClientRow({ client, isSelected, onClick }) {
  const typeColor = TYPE_COLORS[client.user_type] || TYPE_COLORS.homeless
  const lastActive = client.last_active
    ? new Date(client.last_active).toLocaleDateString()
    : '—'

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 rounded-lg transition-colors ${
        isSelected ? 'bg-amber-500/10 border border-amber-500/30' : 'hover:bg-navy-800'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-white font-medium text-sm">{client.name || 'Unknown'}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor}`}>
          {client.user_type || '—'}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-navy-400 text-xs">Step {client.current_step || 1} of 8</span>
        <span className="text-navy-500 text-xs">{lastActive}</span>
      </div>
      <div className="mt-1">
        <FlagBadges client={client} />
      </div>
    </button>
  )
}

export default function ClientList({ selectedId, onSelect }) {
  const { getAccessTokenSilently } = useAuth0()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function loadClients() {
    try {
      if (isMock) {
        setClients(MOCK_CLIENTS)
        setLoading(false)
        return
      }
      const token = await getAccessTokenSilently()
      const api = createApiClient(token)
      const { data } = await api.get('/api/clients')
      setClients(data)
    } catch (err) {
      console.error('Load clients error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadClients() }, [])

  const filtered = clients.filter(c =>
    !search || (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone_number || '').includes(search)
  )

  return (
    <div className="w-72 flex-shrink-0 bg-navy-900 border-r border-navy-700 flex flex-col">
      <div className="p-4 border-b border-navy-700">
        <h2 className="text-white font-semibold text-sm mb-3">Clients</h2>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full bg-navy-800 border border-navy-600 text-white placeholder-navy-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500 mb-3"
        />
        <AddClientForm onClientAdded={c => setClients(prev => [c, ...prev])} />
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {loading && (
          <div className="text-navy-400 text-sm text-center py-8">Loading...</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-navy-400 text-sm text-center py-8">No clients found</div>
        )}
        {filtered.map(client => (
          <ClientRow
            key={client.id}
            client={client}
            isSelected={client.id === selectedId}
            onClick={() => onSelect(client)}
          />
        ))}
      </div>
    </div>
  )
}
