import { useState, useRef, useEffect, useCallback } from 'react'
import { Phone, Globe, Shield, CheckCircle2, Sparkles } from 'lucide-react'
import CrisisOverlay from './CrisisOverlay.jsx'
import { getApiBaseUrl } from '../lib/apiBase.js'
import { detectCrisisSeverity, detectScamHints, REASSURANCE_LINES } from '../lib/safety.js'
import { emotionalProgress } from '../lib/journeyCopy.js'

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'zh', label: '中文' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ar', label: 'العربية' },
]

export default function CompanionChat({
  phone,
  reassuranceStrip = true,
  className = '',
  onFeedback,
}) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [stepInfo, setStepInfo] = useState(null)
  const [error, setError] = useState(null)
  const [crisisMode, setCrisisMode] = useState(false)
  const [scamHints, setScamHints] = useState([])
  const [lang, setLang] = useState(() => localStorage.getItem('redreemer_response_lang') || 'en')
  const [toast, setToast] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('redreemer_response_lang', lang)
  }, [lang])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, crisisMode])

  const showToast = useCallback((text) => {
    setToast(text)
    onFeedback?.(text)
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [onFeedback])

  async function sendMessage(text, meta = {}) {
    const msg = (text || input).trim()
    if (!msg || !phone || loading) return

    const localCrisis = detectCrisisSeverity(msg)
    if (localCrisis) setCrisisMode(true)

    const localScams = detectScamHints(msg)
    if (localScams.length) setScamHints(localScams)

    setInput('')
    setError(null)
    setMessages(prev => [...prev, { role: 'user', content: msg, ts: Date.now() }])
    setLoading(true)

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message: msg, responseLanguage: lang }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')

      if (data.crisis) setCrisisMode(true)
      if (data.scamHints?.length) setScamHints(data.scamHints)
      else if (!localScams.length) setScamHints([])

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, ts: Date.now(), crisis: data.crisis }])
      setStepInfo({
        step: data.newStep ?? data.user?.current_step,
        stepCompleted: data.stepCompleted,
        user: data.user,
      })
      if (meta.label) showToast(`Got it — we’re focusing on ${meta.label}.`)
      else showToast('Message sent.')
    } catch (err) {
      const m = err.message || 'Could not reach the server.'
      setError(m)
      setMessages(prev => [...prev, {
        role: 'error',
        content: `We couldn’t get a reply: ${m}\n\nYou can still text ${formatSmsLink()} — or if you’re in crisis, call or text 988.`,
        ts: Date.now(),
      }])
      showToast('Couldn’t connect — see below')
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 80)
    }
  }

  function formatSmsLink() {
    return '+1 (681) 291-1362'
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const prog = stepInfo
    ? emotionalProgress(stepInfo.step, stepInfo.stepCompleted)
    : null

  const canSend = input.trim() && phone && !loading

  return (
    <div className={`relative flex flex-col ${className}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 rounded-full glass border border-[hsl(var(--primary)/0.35)] text-sm text-[hsl(var(--foreground))] shadow-lg animate-[fade-in_0.25s_ease-out]"
          role="status"
        >
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[hsl(var(--accent))]" />
            {toast}
          </span>
        </div>
      )}

      <CrisisOverlay open={crisisMode} onClose={() => setCrisisMode(false)} />

      {reassuranceStrip && (
        <div className="flex flex-wrap gap-2 mb-3">
          {REASSURANCE_LINES.map(line => (
            <span
              key={line}
              className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.25)]"
            >
              <Sparkles className="w-3 h-3 shrink-0" />
              {line}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <Globe className="w-4 h-4 text-[hsl(var(--muted-foreground))]" aria-hidden />
        <span className="text-xs text-[hsl(var(--muted-foreground))]">Replies in:</span>
        <select
          value={lang}
          onChange={e => setLang(e.target.value)}
          className="text-xs rounded-lg bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary))]"
          aria-label="Response language"
        >
          {LANGUAGES.map(l => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </select>
        <span className="text-[10px] text-[hsl(var(--muted-foreground))]">You can type in English.</span>
      </div>

      {scamHints.length > 0 && (
        <div className="mb-3 space-y-2">
          {scamHints.map(h => (
            <div
              key={h.id}
              className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3 py-2.5 text-sm"
            >
              <div className="flex items-center gap-2 font-medium text-amber-200 mb-0.5">
                <Shield className="w-4 h-4 shrink-0" />
                {h.title}
              </div>
              <p className="text-[hsl(var(--foreground)/0.85)] text-xs leading-relaxed">{h.body}</p>
            </div>
          ))}
        </div>
      )}

      {prog && (
        <div className="mb-3 rounded-2xl glass border border-[hsl(var(--border))] p-3 space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Your journey</p>
          <p className="text-sm text-[hsl(var(--foreground))]">
            <span className="text-[hsl(var(--muted-foreground))]">You’ve already: </span>
            {prog.doneLabel}
          </p>
          <p className="text-sm text-[hsl(var(--foreground))]">
            <span className="text-[hsl(var(--primary))] font-medium">Next step: </span>
            {prog.nextLabel}
          </p>
          <div className="flex gap-1 pt-1">
            {Array.from({ length: 8 }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-colors ${i < prog.step ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted))]'}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 min-h-[280px] md:min-h-[360px] overflow-y-auto rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.4)] px-3 py-3 space-y-3 mb-3">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 px-4">
            <p className="text-[hsl(var(--muted-foreground))] text-sm max-w-xs">
              What should we do first? Tap a quick action below or type in your own words.
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-xs font-bold text-[hsl(var(--primary-foreground))] mr-2 flex-shrink-0 mt-auto">
                R
              </div>
            )}
            <div className="max-w-[90%] sm:max-w-md">
              <div
                className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap transition-all duration-200 ${
                  msg.role === 'user'
                    ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-br-sm'
                    : msg.role === 'error'
                    ? 'bg-red-500/15 border border-red-500/30 text-red-200 rounded-bl-sm'
                    : msg.crisis
                    ? 'bg-[hsl(var(--secondary)/0.2)] border border-[hsl(var(--secondary)/0.4)] text-[hsl(var(--foreground))] rounded-bl-sm'
                    : 'glass text-[hsl(var(--foreground))] rounded-bl-sm'
                }`}
              >
                {msg.content}
              </div>
              <p className={`text-[10px] text-[hsl(var(--muted-foreground))] mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                {new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-xs font-bold text-[hsl(var(--primary-foreground))] mr-2 flex-shrink-0">
              R
            </div>
            <div className="glass rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--muted-foreground))] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--muted-foreground))] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-[hsl(var(--muted-foreground))] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="text-xs text-red-400 mb-2 flex items-center gap-1" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {[
          { label: 'Shelter tonight', text: 'I need a shelter tonight', short: 'Shelter' },
          { label: 'Food', text: 'I need food today', short: 'Food' },
          { label: 'Money help', text: 'I need help with money or a loan', short: 'Money' },
          { label: 'Job', text: 'I need help finding a job', short: 'Job' },
          { label: 'Benefits', text: 'Help me with benefits like SNAP or Medicaid', short: 'Benefits' },
          { label: 'Not sure', text: "I don't know what I need — can you help me figure it out?", short: 'help' },
        ].map(a => (
          <button
            key={a.label}
            type="button"
            disabled={!phone || loading}
            onClick={() => sendMessage(a.text, { label: a.short })}
            className="px-3 py-2 rounded-xl text-xs font-medium bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary)/0.45)] hover:bg-[hsl(var(--primary)/0.08)] disabled:opacity-40 transition-all active:scale-[0.98]"
          >
            {a.label}
          </button>
        ))}
      </div>

      <div className="flex items-end gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)/0.3)] p-2">
        <textarea
          ref={inputRef}
          rows={1}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!phone || loading}
          placeholder={phone ? 'Type what’s going on…' : 'Pick a way to connect first'}
          className="flex-1 bg-transparent border-0 text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-0 disabled:opacity-40 min-h-[44px]"
          style={{ maxHeight: '120px' }}
          aria-label="Your message"
        />
        <button
          type="button"
          onClick={() => sendMessage()}
          disabled={!canSend}
          className="h-11 w-11 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold disabled:opacity-40 flex items-center justify-center shrink-0 transition-transform active:scale-95 hover:glow-amber"
          aria-label="Send"
        >
          →
        </button>
      </div>

      <a
        href="sms:+16812911362"
        className="mt-3 inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[hsl(var(--primary)/0.4)] text-sm font-medium text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.08)] transition-colors"
      >
        <Phone className="w-4 h-4" />
        Or text us: {formatSmsLink()}
      </a>

      <p className="mt-2 text-[10px] text-center text-[hsl(var(--muted-foreground))] flex items-center justify-center gap-1">
        <Shield className="w-3 h-3" />
        We only use your messages to help you. Caseworkers may see chats when enrolled in a program.
      </p>
    </div>
  )
}
