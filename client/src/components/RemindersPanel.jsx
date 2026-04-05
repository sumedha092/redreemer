import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/api.js'
import { Bell, BellOff, Clock, CheckCircle2 } from 'lucide-react'

const isMock = import.meta.env.VITE_MOCK_MODE === 'true'

function formatDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function isPast(iso) {
  return iso && new Date(iso) < new Date()
}

export default function RemindersPanel({ clientId, mockReminders = [] }) {
  const { getAccessTokenSilently } = useAuth0()
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isMock) { setReminders(mockReminders); setLoading(false); return }
    async function load() {
      try {
        const token = await getAccessTokenSilently()
        const api = createApiClient(token)
        const { data } = await api.get(`/api/clients/${clientId}/reminders`)
        setReminders(data || [])
      } catch {
        setError('Could not load reminders')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [clientId])

  const upcoming = reminders.filter(r => !r.sent && !isPast(r.send_at))
  const pastOrSent = reminders.filter(r => r.sent || isPast(r.send_at))

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Bell className="w-4 h-4 text-[hsl(var(--primary))]" />
        <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Reminders</span>
        <span className="ml-auto text-[10px] text-[hsl(var(--muted-foreground))]">
          {upcoming.length} upcoming
        </span>
      </div>

      <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed">
        Reminders are automatically parsed by the AI when clients mention appointments or deadlines in their messages.
      </p>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {loading && (
        <div className="space-y-2">
          {[1, 2].map(i => <div key={i} className="h-14 rounded-lg bg-[hsl(var(--muted)/0.5)] animate-pulse" />)}
        </div>
      )}

      {!loading && reminders.length === 0 && (
        <div className="text-center py-6">
          <BellOff className="w-8 h-8 text-[hsl(var(--muted-foreground))] mx-auto mb-2 opacity-40" />
          <p className="text-xs text-[hsl(var(--muted-foreground))] italic">No reminders yet. They appear when the AI detects appointments in conversations.</p>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--primary))]">Upcoming</p>
          {upcoming.map(r => (
            <div key={r.id} className="flex items-start gap-3 bg-[hsl(var(--primary)/0.08)] border border-[hsl(var(--primary)/0.2)] rounded-lg px-3 py-2.5">
              <Clock className="w-4 h-4 text-[hsl(var(--primary))] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[hsl(var(--foreground))] leading-snug">{r.reminder_text}</p>
                <p className="text-[10px] text-[hsl(var(--primary))] mt-1">{formatDateTime(r.send_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Past / sent */}
      {pastOrSent.length > 0 && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">Sent / Past</p>
          {pastOrSent.map(r => (
            <div key={r.id} className="flex items-start gap-3 bg-[hsl(var(--muted)/0.3)] border border-[hsl(var(--border))] rounded-lg px-3 py-2.5 opacity-60">
              <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[hsl(var(--foreground))] leading-snug line-through decoration-[hsl(var(--muted-foreground)/0.5)]">{r.reminder_text}</p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1">{formatDateTime(r.send_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
