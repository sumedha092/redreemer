import { useState, useRef, useEffect } from 'react'
import { Globe, Shield, CheckCircle2 } from 'lucide-react'
import { getApiBaseUrl } from '../lib/apiBase.js'
import { detectCrisisSeverity, detectScamHints } from '../lib/safety.js'
import { emotionalProgress } from '../lib/journeyCopy.js'
import CrisisOverlay from './CrisisOverlay.jsx'

const DEMO_PROFILES = [
  { label: 'Web “Help now” demo', phone: '+15550009999', preset: null },
  { label: 'New user (homeless)', phone: '+15550001111', preset: null },
  { label: 'New user (reentry)',  phone: '+15550002222', preset: null },
  { label: 'Marcus — Step 4',    phone: '+15550000001', preset: null },
  { label: 'James — Step 3',     phone: '+15550000002', preset: null },
  { label: 'Custom phone…',      phone: '',             preset: null },
]

const QUICK_MESSAGES = [
  'I need food tonight',
  'I need shelter tonight',
  'How do I open a bank account?',
  "I just got out. I don't know where to go.",
  'Where can I get my ID?',
  'Someone offered me a payday loan',
  'What benefits do I qualify for?',
  'I feel like I want to hurt myself',
]

export default function SmsSim() {
  const [selectedProfile, setSelectedProfile] = useState(0)
  const [customPhone, setCustomPhone] = useState('')
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

  const profile = DEMO_PROFILES[selectedProfile]
  const phone = profile.phone || customPhone

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  function handleProfileChange(idx) {
    setSelectedProfile(idx)
    setMessages([])
    setStepInfo(null)
    setError(null)
    setInput('')
  }

  async function sendMessage(text) {
    const msg = (text || input).trim()
    if (!msg || !phone || loading) return

    if (detectCrisisSeverity(msg)) setCrisisMode(true)
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
      if (!res.ok) throw new Error(data.error || 'Server error')

      if (data.crisis) setCrisisMode(true)
      if (data.scamHints?.length) setScamHints(data.scamHints)
      else if (!localScams.length) setScamHints([])

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        ts: Date.now(),
        crisis: data.crisis,
      }])
      setStepInfo({ step: data.newStep, stepCompleted: data.stepCompleted, user: data.user })
      setToast('Reply received')
      setTimeout(() => setToast(null), 2500)
    } catch (err) {
      setError(err.message)
      setMessages(prev => [...prev, {
        role: 'error',
        content: `We couldn’t reach the server (${err.message}). Check that the API is running, or try again.`,
        ts: Date.now(),
      }])
      setToast('Connection issue')
      setTimeout(() => setToast(null), 3000)
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const canSend = input.trim() && phone && !loading

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">

      {/* Left panel — controls */}
      <div className="lg:w-72 flex-shrink-0 space-y-4">
        <div>
          <h2 className="text-[hsl(var(--foreground))] font-bold text-lg mb-1">SMS Simulator</h2>
          <p className="text-[hsl(var(--muted-foreground))] text-xs leading-relaxed">
            Demo the survival companion flow: Gemini replies, optional crisis routing, scam warnings, and multilingual responses (set language below).
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Globe className="w-3.5 h-3.5 text-[hsl(var(--muted-foreground))]" />
            <select
              value={lang}
              onChange={e => setLang(e.target.value)}
              className="text-xs rounded-lg bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] px-2 py-1"
              aria-label="AI reply language"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="zh">中文</option>
              <option value="vi">Tiếng Việt</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>

        {/* Profile picker */}
        <div className="bg-[hsl(var(--card))] rounded-xl p-4">
          <p className="text-[hsl(var(--muted-foreground))] text-xs font-medium uppercase tracking-wide mb-3">Select a user</p>
          <div className="space-y-1">
            {DEMO_PROFILES.map((p, i) => (
              <button
                key={i}
                onClick={() => handleProfileChange(i)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  selectedProfile === i
                    ? 'bg-[hsl(var(--primary)/0.2)] border border-[hsl(var(--primary)/0.45)] text-[hsl(var(--foreground))]'
                    : 'text-[hsl(var(--foreground)/0.7)] hover:bg-[hsl(var(--muted)/0.5)] border border-transparent'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {selectedProfile === DEMO_PROFILES.length - 1 && (
            <input
              type="tel"
              placeholder="+1 555 000 0000"
              value={customPhone}
              onChange={e => setCustomPhone(e.target.value)}
              className="mt-3 w-full bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[hsl(var(--primary))]"
            />
          )}
        </div>

        {/* Step status */}
        {stepInfo && (() => {
          const ep = emotionalProgress(stepInfo.step, stepInfo.stepCompleted)
          return (
            <div className={`rounded-xl p-4 border ${stepInfo.stepCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-[hsl(var(--card))] border-[hsl(var(--border))]'}`}>
              <p className="text-[hsl(var(--muted-foreground))] text-xs font-medium uppercase tracking-wide mb-2">Journey</p>
              <p className="text-[hsl(var(--foreground))] text-xs mb-1 leading-relaxed">
                <span className="text-[hsl(var(--muted-foreground))]">You’ve already: </span>
                {ep.doneLabel}
              </p>
              <p className="text-[hsl(var(--foreground))] text-xs mb-2 leading-relaxed">
                <span className="text-[hsl(var(--primary))] font-medium">Next: </span>
                {ep.nextLabel}
              </p>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex gap-1 flex-1">
                  {Array.from({ length: 8 }, (_, i) => (
                    <div
                      key={i}
                      className={`h-2 flex-1 rounded-full ${i < stepInfo.step ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--muted)/0.5)]'}`}
                    />
                  ))}
                </div>
                <span className="text-[hsl(var(--foreground))] text-sm font-bold shrink-0">{stepInfo.step}/8</span>
              </div>
              {stepInfo.stepCompleted && (
                <p className="text-green-400 text-xs font-medium">Nice — milestone logged.</p>
              )}
              {stepInfo.user?.user_type && (
                <p className="text-[hsl(var(--muted-foreground))] text-xs mt-1 capitalize">
                  Type: {stepInfo.user.user_type}
                </p>
              )}
              {stepInfo.user?.financial_health_score != null && (
                <p className="text-[hsl(var(--muted-foreground))] text-xs">
                  Health score: <span className="text-[hsl(var(--primary))] font-medium">{stepInfo.user.financial_health_score}</span>
                </p>
              )}
            </div>
          )
        })()}

        {scamHints.length > 0 && (
          <div className="rounded-xl p-3 border border-amber-500/30 bg-amber-500/10 space-y-2">
            <p className="text-[10px] uppercase text-amber-200/90 font-medium flex items-center gap-1">
              <Shield className="w-3 h-3" /> Scam safety
            </p>
            {scamHints.map(h => (
              <div key={h.id} className="text-xs text-[hsl(var(--foreground)/0.9)]">
                <span className="font-medium text-amber-200">{h.title}: </span>
                {h.body}
              </div>
            ))}
          </div>
        )}

        {/* Quick messages */}
        <div className="bg-[hsl(var(--card))] rounded-xl p-4">
          <p className="text-[hsl(var(--muted-foreground))] text-xs font-medium uppercase tracking-wide mb-3">Quick messages</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_MESSAGES.map(msg => (
              <button
                key={msg}
                onClick={() => sendMessage(msg)}
                disabled={!phone || loading}
                className="text-xs px-2.5 py-1.5 bg-[hsl(var(--muted)/0.5)] hover:bg-[hsl(var(--muted))] disabled:opacity-40 disabled:cursor-not-allowed text-[hsl(var(--foreground)/0.8)] rounded-lg transition-colors text-left"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>

        {/* Clear */}
        {messages.length > 0 && (
          <button
            onClick={() => { setMessages([]); setStepInfo(null) }}
            className="w-full text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground)/0.7)] text-xs transition-colors py-1"
          >
            Clear conversation
          </button>
        )}
      </div>

      {/* Right panel — phone UI */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {toast && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[40] px-3 py-1.5 rounded-full glass border border-[hsl(var(--primary)/0.35)] text-xs flex items-center gap-1.5 text-[hsl(var(--foreground))]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[hsl(var(--accent))]" />
            {toast}
          </div>
        )}
        {/* Phone chrome */}
        <div className="bg-[hsl(var(--card))] rounded-2xl overflow-hidden flex flex-col flex-1 border border-[hsl(var(--border))] shadow-2xl relative" style={{ minHeight: '540px' }}>
          <CrisisOverlay open={crisisMode} onClose={() => setCrisisMode(false)} />

          {/* Status bar */}
          <div className="bg-[hsl(var(--muted)/0.35)] px-4 py-2 flex items-center justify-between border-b border-[hsl(var(--border))]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400"></div>
              <span className="text-[hsl(var(--foreground))] text-sm font-semibold">Redreemer</span>
              <span className="text-[hsl(var(--muted-foreground))] text-xs">{phone || '—'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[hsl(var(--muted-foreground))] text-xs">SMS</span>
              <div className="flex gap-0.5">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-0.5 bg-[hsl(var(--muted-foreground))] rounded" style={{ height: `${(i + 1) * 3}px` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ maxHeight: '460px' }}>
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="text-4xl mb-3 opacity-30">💬</div>
                <p className="text-[hsl(var(--muted-foreground))] text-sm">
                  {phone ? 'Select a quick message or type below to start' : 'Select a user profile to begin'}
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-xs font-bold text-[hsl(var(--primary-foreground))] mr-2 flex-shrink-0 mt-auto">
                    R
                  </div>
                )}
                <div className={`max-w-xs lg:max-w-sm xl:max-w-md`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-br-sm'
                        : msg.role === 'error'
                        ? 'bg-red-500/20 border border-red-500/30 text-red-300 rounded-bl-sm'
                        : msg.crisis
                        ? 'bg-[hsl(var(--secondary)/0.2)] border border-[hsl(var(--secondary)/0.4)] text-[hsl(var(--foreground))] rounded-bl-sm'
                        : 'bg-[hsl(var(--muted)/0.5)] text-[hsl(var(--foreground))] rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                  <p className={`text-[hsl(var(--muted-foreground))] text-xs mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {formatTime(msg.ts)}
                  </p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-xs font-bold text-[hsl(var(--primary-foreground))] mr-2 flex-shrink-0">
                  R
                </div>
                <div className="bg-[hsl(var(--muted)/0.5)] rounded-2xl rounded-bl-sm px-4 py-3">
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

          {/* Input bar */}
          <div className="border-t border-[hsl(var(--border))] px-3 py-3 flex items-end gap-2 bg-[hsl(var(--muted)/0.25)]">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!phone || loading}
              placeholder={phone ? 'Type a message…' : 'Select a user above'}
              className="flex-1 bg-[hsl(var(--muted)/0.5)] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))] rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-[hsl(var(--primary))] disabled:opacity-40 transition-colors"
              style={{ maxHeight: '120px' }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!canSend}
              className="w-9 h-9 rounded-full bg-[hsl(var(--primary))] hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0 text-[hsl(var(--primary-foreground))]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-[hsl(var(--muted-foreground))] text-xs text-center mt-2">
          Powered by Gemini 1.5 Flash · Responses saved to Supabase · Enter to send
        </p>
      </div>
    </div>
  )
}
