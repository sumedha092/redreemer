import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Sun, Moon, Home, ChevronRight, Sparkles, Wallet, LayoutDashboard, PlayCircle } from 'lucide-react'
import { useTheme } from '../lib/useTheme.js'
import CompanionChat from '../components/CompanionChat.jsx'

const WEB_DEMO_PHONE = '+15550009999'

const DEMO_STEPS = [
  { title: 'Open Get help', body: 'One calm screen — no dashboard noise.' },
  { title: 'Pick what you need', body: 'Shelter, food, money, job, benefits, or “not sure.”' },
  { title: 'See safety + language', body: '988 flow, scam warnings, replies in your language.' },
]

export default function HelpNow() {
  const { theme, toggle } = useTheme()
  const [searchParams] = useSearchParams()
  const isDemo = searchParams.get('demo') === '1'
  const [phone] = useState(WEB_DEMO_PHONE)

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] dot-grid grain">
      <div
        className="fixed top-0 right-0 w-[min(100%,480px)] h-[min(100%,480px)] rounded-full opacity-90 pointer-events-none -translate-y-1/3 translate-x-1/4"
        style={{ background: 'rgba(245,158,11,0.12)', filter: 'blur(100px)' }}
      />

      <header className="relative z-10 border-b border-[hsl(var(--border))] glass">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggle}
              className="w-9 h-9 rounded-lg glass flex items-center justify-center text-[hsl(var(--muted-foreground))]"
              aria-label="Toggle light or dark mode"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link
              to="/dashboard"
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hidden sm:inline"
            >
              Caseworkers
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-lg mx-auto px-4 py-6 pb-16">
        <nav className="flex items-center gap-1 text-[11px] text-[hsl(var(--muted-foreground))] mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[hsl(var(--foreground))]">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[hsl(var(--foreground))]">Get help now</span>
        </nav>

        {isDemo && (
          <div className="mb-5 rounded-2xl border border-[hsl(var(--primary)/0.35)] bg-[hsl(var(--primary)/0.08)] p-4">
            <div className="flex items-center gap-2 text-[hsl(var(--primary))] text-xs font-semibold mb-2">
              <PlayCircle className="w-4 h-4" />
              1-minute demo path
            </div>
            <ol className="space-y-2">
              {DEMO_STEPS.map((s, i) => (
                <li key={s.title} className="flex gap-2 text-sm text-[hsl(var(--foreground)/0.9)]">
                  <span className="font-mono text-[hsl(var(--primary))] w-5 shrink-0">{i + 1}.</span>
                  <span><span className="font-medium">{s.title}</span> — {s.body}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--accent)/0.12)] text-[hsl(var(--accent))] text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Free · Private demo line · No judgment
        </div>

        <h1 className="font-heading font-bold text-2xl md:text-3xl text-[hsl(var(--foreground))] leading-tight mb-2">
          I need help right now
        </h1>
        <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed mb-6">
          One step at a time. Tap what fits — or type in your own words. If you’re in danger, we’ll show emergency options right away.
        </p>

        <div className="rounded-3xl glass border border-[hsl(var(--border))] p-4 md:p-5 shadow-xl relative mb-6">
          <CompanionChat phone={phone} />
        </div>

        <div className="space-y-2 text-sm text-[hsl(var(--muted-foreground))] mb-6">
          <p className="font-medium text-[hsl(var(--foreground))] text-xs uppercase tracking-wide">More (when you’re ready)</p>
          <div className="flex flex-col gap-2">
            <Link
              to="/wellness"
              className="flex items-center gap-3 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.4)] hover:border-[hsl(var(--primary)/0.35)] transition-colors"
            >
              <Wallet className="w-5 h-5 text-[hsl(var(--primary))]" />
              <span className="text-[hsl(var(--foreground))]">Money tools — budget, savings, debt (guided)</span>
            </Link>
            <Link
              to="/dashboard"
              className="flex items-center gap-3 p-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.4)] hover:border-[hsl(var(--primary)/0.35)] transition-colors"
            >
              <LayoutDashboard className="w-5 h-5 text-[hsl(var(--secondary))]" />
              <span className="text-[hsl(var(--foreground))]">Caseworker sign-in</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
