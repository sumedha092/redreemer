import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/api.js'
import { Radio, X, CheckCircle2, AlertTriangle, Send } from 'lucide-react'

const isMock = import.meta.env.VITE_MOCK_MODE === 'true'

const PRESETS = [
  { label: 'Parole reminder', text: "Hey, just a reminder to complete your parole check-in this week. Let me know if you need help with directions or paperwork — I'm here." },
  { label: 'Benefits deadline', text: "Important: benefits renewal deadline is coming up. Text me your city and I'll find the nearest office and what to bring." },
  { label: 'Check-in', text: "Checking in — how are things going? Any roadblocks this week? I'm here if you need anything." },
  { label: 'Bank On reminder', text: "Reminder: opening a Bank On account is one of the most important steps you can take. No credit check, no minimum balance. Text me your city for the nearest location." },
]

export default function BroadcastModal({ clients, onClose }) {
  const { getAccessTokenSilently } = useAuth0()
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState('all')
  const [status, setStatus] = useState(null) // null | 'sending' | { sent, failed }
  const [error, setError] = useState(null)

  const filtered = clients.filter(c => {
    if (filter === 'all') return true
    if (filter === 'inactive') return Math.floor((Date.now() - new Date(c.last_active || 0)) / 86400000) >= 5
    return c.user_type === filter
  })

  const charCount = message.length
  const smsPages = Math.ceil(charCount / 160) || 1

  async function handleSend() {
    if (!message.trim() || filtered.length === 0) return
    if (!window.confirm(`Send to ${filtered.length} client${filtered.length !== 1 ? 's' : ''}? This will send real SMS messages.`)) return

    setStatus('sending')
    setError(null)

    if (isMock) {
      await new Promise(r => setTimeout(r, 1200))
      setStatus({ sent: filtered.length, failed: 0 })
      return
    }

    try {
      const token = await getAccessTokenSilently()
      const api = createApiClient(token)
      const { data } = await api.post('/api/broadcast', {
        clientIds: filtered.map(c => c.id),
        message: message.trim()
      })
      setStatus({ sent: data.sent, failed: data.failed })
    } catch (err) {
      setError('Broadcast failed: ' + (err.response?.data?.error || err.message))
      setStatus(null)
    }
  }

  const isDone = status && typeof status === 'object'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg rounded-2xl border border-[hsl(var(--border))] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[hsl(var(--border))]">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-[hsl(var(--primary))]" />
            <span className="font-semibold text-[hsl(var(--foreground))]">Broadcast Message</span>
          </div>
          <button onClick={onClose} className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {isDone ? (
            /* Result screen */
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto" />
              <p className="text-lg font-bold text-[hsl(var(--foreground))]">Broadcast sent!</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                <span className="text-green-400 font-semibold">{status.sent} delivered</span>
                {status.failed > 0 && <span className="text-red-400 font-semibold ml-2">{status.failed} failed</span>}
              </p>
              <button onClick={onClose} className="mt-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors">
                Close
              </button>
            </div>
          ) : (
            <>
              {/* Audience filter */}
              <div>
                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-2 uppercase tracking-wide">Send to</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All clients' },
                    { value: 'homeless', label: 'Homeless' },
                    { value: 'reentry', label: 'Reentry' },
                    { value: 'both', label: 'Both' },
                    { value: 'inactive', label: 'Inactive 5+ days' },
                  ].map(f => (
                    <button
                      key={f.value}
                      onClick={() => setFilter(f.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        filter === f.value
                          ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                          : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted)/0.7)]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-[hsl(var(--muted-foreground))] mt-2">
                  {filtered.length === 0
                    ? 'No clients match this filter'
                    : <><span className="text-[hsl(var(--foreground))] font-medium">{filtered.length}</span> recipient{filtered.length !== 1 ? 's' : ''}: {filtered.map(c => c.name || c.phone_number).slice(0, 4).join(', ')}{filtered.length > 4 ? ` +${filtered.length - 4} more` : ''}</>
                  }
                </p>
              </div>

              {/* Preset buttons */}
              <div>
                <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] mb-2 uppercase tracking-wide">Quick templates</p>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map(p => (
                    <button
                      key={p.label}
                      onClick={() => setMessage(p.text)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] text-[hsl(var(--foreground)/0.7)] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary)/0.4)] transition-all"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">Message</p>
                  <span className={`text-[10px] ${charCount > 320 ? 'text-red-400' : 'text-[hsl(var(--muted-foreground))]'}`}>
                    {charCount}/320 · {smsPages} SMS segment{smsPages !== 1 ? 's' : ''}
                  </span>
                </div>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={4}
                  maxLength={640}
                  placeholder="Type your message…"
                  className="w-full bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] resize-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </div>
              )}

              {/* Send */}
              <button
                onClick={handleSend}
                disabled={status === 'sending' || !message.trim() || filtered.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-[hsl(var(--primary))] hover:glow-amber text-[hsl(var(--primary-foreground))] font-semibold py-3 rounded-xl text-sm disabled:opacity-40 transition-all"
              >
                {status === 'sending'
                  ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Sending to {filtered.length}…</>
                  : <><Send className="w-4 h-4" />Send to {filtered.length} client{filtered.length !== 1 ? 's' : ''}</>
                }
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
