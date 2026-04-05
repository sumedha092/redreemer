import { useRef, useEffect, useState } from 'react'
import { Phone, MessageSquare, ChevronRight, Send, LayoutGrid, StickyNote, Bell, Loader2, AlertTriangle } from 'lucide-react'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/api.js'
import StepProgress from './StepProgress.jsx'
import VoicePlayer from './VoicePlayer.jsx'
import StepEditor from './StepEditor.jsx'
import ExportButton from './ExportButton.jsx'
import HealthScore from './HealthScore.jsx'
import FlagBadges from './FlagBadges.jsx'
import ClientNotes from './ClientNotes.jsx'
import RemindersPanel from './RemindersPanel.jsx'

const isMock = import.meta.env.VITE_MOCK_MODE === 'true'

const TYPE_INFO = {
  homeless: { label: 'Homeless', cls: 'bg-[hsl(var(--primary)/0.15)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.3)]' },
  reentry:  { label: 'Reentry',  cls: 'bg-[hsl(var(--secondary)/0.15)] text-[hsl(var(--secondary))] border-[hsl(var(--secondary)/0.3)]' },
  both:     { label: 'Both',     cls: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
}

const TABS = [
  { id: 'overview',      label: 'Overview',      icon: LayoutGrid },
  { id: 'conversation',  label: 'Conversation',  icon: MessageSquare },
  { id: 'notes',         label: 'Notes',         icon: StickyNote },
  { id: 'reminders',     label: 'Reminders',     icon: Bell },
]

// ─── Conversation view ──────────────────────────────────────────────────────

function ConversationView({ client }) {
  const { getAccessTokenSilently } = useAuth0()
  const [messages, setMessages] = useState([])
  const [msg, setMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [sendStatus, setSendStatus] = useState(null) // 'sent' | 'error'
  const bottomRef = useRef(null)

  useEffect(() => {
    if (isMock) {
      setMessages(client.conversations || [])
      setLoading(false)
      return
    }
    let cancelled = false
    async function load() {
      setLoading(true)
      setLoadError(null)
      try {
        const token = await getAccessTokenSilently()
        const api = createApiClient(token)
        const { data } = await api.get(`/api/clients/${client.id}/conversations`)
        if (!cancelled) setMessages(data || [])
      } catch {
        if (!cancelled) setLoadError('Could not load conversation history.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [client.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e) {
    e.preventDefault()
    if (!msg.trim() || sending) return
    setSending(true)
    setSendStatus(null)
    const optimistic = { role: 'assistant', content: msg, created_at: new Date().toISOString() }
    setMessages(prev => [...prev, optimistic])
    setMsg('')
    try {
      const token = await getAccessTokenSilently()
      const api = createApiClient(token)
      await api.post(`/api/clients/${client.id}/message`, { message: optimistic.content })
      setSendStatus('sent')
      setTimeout(() => setSendStatus(null), 3000)
    } catch {
      setMessages(prev => prev.filter(m => m !== optimistic))
      setMsg(optimistic.content)
      setSendStatus('error')
      setTimeout(() => setSendStatus(null), 4000)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading && (
          <div className="space-y-2 p-2">
            {[1,2,3].map(i => <div key={i} className="h-10 rounded-xl bg-[hsl(var(--muted)/0.5)] animate-pulse" />)}
          </div>
        )}
        {loadError && (
          <div className="flex items-center gap-2 text-red-400 text-xs p-3 bg-red-500/10 rounded-lg">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {loadError}
          </div>
        )}
        {!loading && !loadError && messages.length === 0 && (
          <p className="text-center text-[hsl(var(--muted-foreground))] text-sm italic py-10">
            No messages yet
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] rounded-tr-sm'
                : 'bg-[hsl(var(--primary)/0.12)] border border-[hsl(var(--primary)/0.2)] text-[hsl(var(--foreground))] rounded-tl-sm'
            }`}>
              <p className="whitespace-pre-wrap">{m.content}</p>
              {m.created_at && (
                <p className="text-[10px] opacity-40 mt-1 text-right">
                  {new Date(m.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-[hsl(var(--border))] px-4 py-3 space-y-1.5">
        {sendStatus === 'sent' && <p className="text-green-400 text-xs">Message sent via SMS ✓</p>}
        {sendStatus === 'error' && <p className="text-red-400 text-xs flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Failed to send — check Twilio config</p>}
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder={isMock ? 'Direct messaging disabled in demo mode' : 'Send a direct SMS…'}
            disabled={isMock || sending}
            className="flex-1 bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isMock || sending || !msg.trim()}
            className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-3 py-2 rounded-lg disabled:opacity-40 transition-all hover:glow-amber"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function ClientDetail({ client, onStepUpdate }) {
  const [tab, setTab] = useState('overview')

  // Reset to overview when client changes
  useEffect(() => { setTab('overview') }, [client?.id])

  if (!client) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-[hsl(var(--muted-foreground))]">
        <ChevronRight className="w-10 h-10 opacity-20" />
        <p className="text-sm">Select a client to view details</p>
      </div>
    )
  }

  const typeInfo = TYPE_INFO[client.user_type] || TYPE_INFO.homeless
  const lastActive = client.last_active
    ? new Date(client.last_active).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Never'

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-[hsl(var(--border))] shrink-0">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-[hsl(var(--primary-foreground))] font-bold text-lg shrink-0"
              style={{ background: 'hsl(var(--primary))' }}>
              {(client.name || '?')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-base font-bold text-[hsl(var(--foreground))]">{client.name || 'Unknown'}</h2>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${typeInfo.cls}`}>
                  {typeInfo.label}
                </span>
                {client.phone_number && (
                  <span className="flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))]">
                    <Phone className="w-3 h-3" />{client.phone_number}
                  </span>
                )}
                <span className="text-xs text-[hsl(var(--muted-foreground))]">Active {lastActive}</span>
              </div>
            </div>
          </div>
          <ExportButton client={client} />
        </div>

        <FlagBadges client={client} />

        {/* Tab bar */}
        <div className="flex gap-1 mt-3">
          {TABS.map(t => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  tab === t.id
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                    : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'overview' && (
          <div className="p-5 space-y-4">
            <HealthScore clientId={client.id} initialScore={client.financial_health_score || 0} />
            <div className="glass-card rounded-xl p-4">
              <StepEditor client={client} onUpdate={onStepUpdate} />
            </div>
            <div className="glass-card rounded-xl p-4">
              <StepProgress client={client} />
            </div>
            <div className="glass-card rounded-xl p-4">
              <VoicePlayer client={client} stepLogs={client.stepLogs || []} />
            </div>
          </div>
        )}

        {tab === 'conversation' && (
          <div className="flex flex-col h-full" style={{ height: '100%' }}>
            <ConversationView client={client} />
          </div>
        )}

        {tab === 'notes' && (
          <div className="p-5">
            <ClientNotes
              clientId={client.id}
              mockNotes={client.notes || []}
            />
          </div>
        )}

        {tab === 'reminders' && (
          <div className="p-5">
            <RemindersPanel
              clientId={client.id}
              mockReminders={client.reminders || []}
            />
          </div>
        )}
      </div>
    </div>
  )
}
