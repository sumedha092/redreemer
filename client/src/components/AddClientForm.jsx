import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/api.js'

export default function AddClientForm({ onClientAdded }) {
  const { getAccessTokenSilently } = useAuth0()
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState(null)
  const [open, setOpen] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!phone.trim()) return
    setStatus('adding')
    try {
      const token = await getAccessTokenSilently()
      const api = createApiClient(token)
      const { data } = await api.post('/api/clients', { phone_number: phone })
      setPhone('')
      setStatus('added')
      setOpen(false)
      if (onClientAdded) onClientAdded(data)
      setTimeout(() => setStatus(null), 3000)
    } catch (err) {
      console.error('Add client error:', err)
      setStatus('error')
      setTimeout(() => setStatus(null), 3000)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border border-dashed border-navy-600 hover:border-amber-500 text-navy-400 hover:text-amber-500 rounded-lg py-2 text-sm transition-colors"
      >
        + Add Client
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-navy-800 rounded-lg p-3 space-y-2">
      <input
        type="tel"
        value={phone}
        onChange={e => setPhone(e.target.value)}
        placeholder="+1 (555) 000-0000"
        className="w-full bg-navy-700 border border-navy-600 text-white placeholder-navy-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === 'adding'}
          className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-navy-900 font-semibold py-1.5 rounded-lg text-sm transition-colors"
        >
          {status === 'adding' ? 'Adding...' : 'Add & Send Welcome'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 text-navy-400 hover:text-white text-sm"
        >
          Cancel
        </button>
      </div>
      {status === 'error' && <p className="text-red-400 text-xs">Failed to add client.</p>}
    </form>
  )
}
