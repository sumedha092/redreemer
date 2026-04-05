import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/api.js'

export default function MessageComposer({ clientId }) {
  const { getAccessTokenSilently } = useAuth0()
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState(null) // 'sending' | 'sent' | 'error'

  async function handleSend(e) {
    e.preventDefault()
    if (!message.trim()) return

    setStatus('sending')
    try {
      const token = await getAccessTokenSilently()
      const api = createApiClient(token)
      await api.post(`/api/clients/${clientId}/message`, { message })
      setMessage('')
      setStatus('sent')
      setTimeout(() => setStatus(null), 3000)
    } catch (err) {
      console.error('Send message error:', err)
      setStatus('error')
      setTimeout(() => setStatus(null), 3000)
    }
  }

  return (
    <div>
      <h3 className="text-[hsl(var(--foreground))] font-semibold text-sm mb-3">Send Direct Message</h3>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-[hsl(var(--card))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={status === 'sending' || !message.trim()}
          className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-[hsl(var(--foreground))] font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          {status === 'sending' ? '...' : 'Send'}
        </button>
      </form>
      {status === 'sent' && <p className="text-green-400 text-xs mt-2">Message sent via SMS</p>}
      {status === 'error' && <p className="text-red-400 text-xs mt-2">Failed to send. Try again.</p>}
    </div>
  )
}
