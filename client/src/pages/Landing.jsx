import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Phone, ArrowRight, ShieldCheck, Smartphone, Clock, MapPin,
  Users, MessageSquare, DollarSign, CreditCard, Home, FileText,
  Key, Briefcase, Landmark, BarChart2, Award,
  Wallet, Shield, TrendingDown, Target, BookOpen, Activity,
  CheckCircle, Zap, Sun, Moon,
} from 'lucide-react'
import { useTheme } from '../lib/useTheme.js'

// ─── Stats counter hook ──────────────────────────────────────────────────────
function useCountUp(target, inView) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView || target === 0) { setVal(target); return }
    let start = 0
    const step = Math.ceil(target / (1500 / 16))
    const id = setInterval(() => {
      start += step
      if (start >= target) { setVal(target); clearInterval(id) }
      else setVal(start)
    }, 16)
    return () => clearInterval(id)
  }, [inView, target])
  return val
}

// ─── Navbar ──────────────────────────────────────────────────────────────────
function LandingNav() {
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'backdrop-blur-xl border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/0.85)]' : ''}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center font-heading font-bold text-[hsl(var(--primary-foreground))] text-lg">R</div>
          <span className="font-heading font-bold text-[hsl(var(--foreground))] text-lg">Redreemer</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="w-9 h-9 rounded-lg glass flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={() => navigate('/help?demo=1')}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-[hsl(var(--muted-foreground))] text-sm hover:text-[hsl(var(--foreground))] transition-colors"
          >
            Demo (1 min)
          </button>
          <button
            onClick={() => navigate('/help')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[hsl(var(--accent)/0.15)] border border-[hsl(var(--accent)/0.4)] text-[hsl(var(--accent))] text-sm font-medium hover:bg-[hsl(var(--accent)/0.25)] transition-all"
          >
            Help me now <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[hsl(var(--primary))] text-[hsl(var(--primary))] text-sm font-medium hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))] transition-all"
          >
            For Caseworkers <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  )
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero() {
  const navigate = useNavigate()
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden dot-grid grain">
      <div className="absolute top-20 right-20 w-[600px] h-[600px] rounded-full opacity-100 pointer-events-none"
        style={{ background: 'rgba(245,158,11,0.15)', filter: 'blur(120px)', animation: 'aurora-1 20s ease-in-out infinite alternate' }} />
      <div className="absolute bottom-20 left-20 w-[600px] h-[600px] rounded-full opacity-100 pointer-events-none"
        style={{ background: 'rgba(99,102,241,0.15)', filter: 'blur(120px)', animation: 'aurora-2 20s ease-in-out infinite alternate' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 grid lg:grid-cols-2 gap-16 items-center w-full">
        <div className="max-w-[600px]">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-xs font-medium mb-8">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            Free for everyone. Always.
          </div>

          <h1 className="font-heading font-extrabold text-5xl md:text-7xl leading-[1.1] mb-6 text-[hsl(var(--foreground))]">
            A second chance<br />starts with<br />
            <span className="text-gradient-amber">one text.</span>
          </h1>

          <p className="text-[hsl(var(--muted-foreground))] text-lg md:text-xl leading-relaxed max-w-[480px] mb-8">
            Redreemer meets homeless individuals and returning citizens exactly where they are. No smartphone. No app. No internet. Just a text and a path forward.
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <button
              type="button"
              onClick={() => navigate('/help')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] font-semibold text-base hover:opacity-95 transition-all shadow-lg"
            >
              <MessageSquare className="w-5 h-5" /> I need help now
            </button>
            <a href="sms:+16812911362" className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-base hover:glow-amber transition-all">
              <Phone className="w-5 h-5" /> Text +1 (681) 291-1362
            </a>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl glass text-[hsl(var(--foreground))] font-medium text-base hover:bg-[hsl(var(--foreground)/0.1)] transition-all"
            >
              Caseworker Login <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[hsl(var(--accent))]" /> Free forever</span>
            <span className="w-px h-3 bg-[hsl(var(--border))]" />
            <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> Works on any phone</span>
            <span className="w-px h-3 bg-[hsl(var(--border))]" />
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> 24/7 AI support</span>
          </div>
        </div>

        {/* Phone mockup */}
        <div className="relative hidden lg:flex justify-center">
          <div className="absolute w-[400px] h-[400px] rounded-full pointer-events-none"
            style={{ background: 'rgba(245,158,11,0.12)', filter: 'blur(80px)' }} />
          <div className="relative w-[340px] rounded-[40px] border-2 border-[hsl(var(--border))] bg-[hsl(var(--card))] overflow-hidden"
            style={{ animation: 'float 6s ease-in-out infinite alternate' }}>
            <div className="flex items-center justify-center gap-2 py-4 border-b border-[hsl(var(--border))]">
              <span className="font-heading font-bold text-[hsl(var(--foreground))] text-sm">Redreemer</span>
              <span className="w-2 h-2 rounded-full bg-[hsl(var(--accent))]" />
              <span className="text-xs text-[hsl(var(--accent))]">Online</span>
            </div>
            <div className="p-4 space-y-3 min-h-[480px]">
              {[
                { side: 'left',  text: "Hey, I'm here to help. Do you have a safe place to sleep tonight?" },
                { side: 'right', text: "no im on the street in phoenix" },
                { side: 'left',  text: "Found 2 shelters open right now:\n\n• Human Services Campus\n  204 S 12th Ave — Open 24hrs\n\n• St. Vincent de Paul\n  420 W Watkins St — Open until midnight\n\nCan you get to either of these?" },
                { side: 'right', text: "yes the first one thank you" },
                { side: 'left',  text: "Great. When you get there, ask about their ID recovery program — it's your first step toward housing." },
              ].map((msg, i) => (
                <div key={i} className={`flex ${msg.side === 'right' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap leading-snug
                    ${msg.side === 'right'
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-tr-sm'
                      : 'glass text-[hsl(var(--foreground)/0.9)] rounded-tl-sm'
                    }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-[hsl(var(--border))]">
              <div className="glass rounded-full py-2.5 px-4 text-xs text-[hsl(var(--muted-foreground))]">Type a message…</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Stats Banner ────────────────────────────────────────────────────────────
function StatsBanner() {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])

  const stats = [
    { icon: Users,         value: 47,   label: 'People Helped' },
    { icon: MessageSquare, value: 1284, label: 'Messages Sent' },
    { icon: DollarSign,    value: 0,    label: 'Cost to Users', display: '$0' },
    { icon: Clock,         value: 0,    label: 'AI Availability', display: '24/7' },
  ]

  return (
    <section ref={ref} className="w-full border-y border-[hsl(var(--border))] bg-[hsl(var(--foreground)/0.02)] py-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => {
          // eslint-disable-next-line react-hooks/rules-of-hooks
          const count = useCountUp(s.value, inView)
          return (
            <div key={i} className="text-center">
              <s.icon className="w-5 h-5 text-[hsl(var(--primary))] mx-auto mb-2" />
              <div className="font-mono text-4xl md:text-5xl text-[hsl(var(--primary))] font-medium">
                {s.display ?? count.toLocaleString()}
              </div>
              <div className="text-sm text-[hsl(var(--muted-foreground))] mt-1">{s.label}</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─── How It Works ────────────────────────────────────────────────────────────
function HowItWorks() {
  const cards = [
    { icon: MessageSquare, color: 'text-[hsl(var(--primary))]', bg: 'bg-[hsl(var(--primary)/0.15)]', step: '01', title: 'Text Anything', body: 'Text our number from any phone. Our AI meets you where you are — whether you need shelter tonight or help understanding your paycheck.' },
    { icon: MapPin,        color: 'text-[hsl(var(--secondary))]', bg: 'bg-[hsl(var(--secondary)/0.15)]', step: '02', title: 'Get Real Help', body: 'We find real shelters, food banks, and reentry programs near you with actual addresses and phone numbers. Not generic advice. Real places.' },
    { icon: BarChart2,     color: 'text-[hsl(var(--accent))]', bg: 'bg-[hsl(var(--accent)/0.15)]', step: '03', title: 'Build Your Future', body: 'As you stabilize, we walk you through budgeting, avoiding predatory lenders, building credit, and saving for your first apartment.' },
  ]
  return (
    <section className="py-28 px-6">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <p className="text-[hsl(var(--primary))] text-xs font-semibold tracking-[0.15em] uppercase mb-3">How It Works</p>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-[hsl(var(--foreground))] mb-4">Three steps. One number. Real change.</h2>
        <p className="text-[hsl(var(--muted-foreground))] text-lg">No downloads. No accounts. No barriers.</p>
      </div>
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
        {cards.map(c => (
          <div key={c.step} className="glass-card group">
            <div className={`w-12 h-12 rounded-full ${c.bg} flex items-center justify-center mb-4`}>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <span className="font-mono text-xs text-[hsl(var(--muted-foreground))]">{c.step}</span>
            <h3 className="font-heading font-bold text-xl text-[hsl(var(--foreground))] mt-1 mb-2">{c.title}</h3>
            <p className="text-[hsl(var(--muted-foreground))] text-sm leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Who We Serve ────────────────────────────────────────────────────────────
function WhoWeServe() {
  const cards = [
    { icon: Home,    title: 'Experiencing Homelessness', gradient: 'from-[hsl(var(--primary)/0.85)] to-[hsl(var(--background)/0.9)]', img: 'https://images.unsplash.com/photo-1518398046578-8cca57782e17?w=800', body: 'Over 582,000 Americans are experiencing homelessness tonight. Most have no access to apps, email, or internet — but most have access to a phone that can text.', stat: '1 in 5 homeless individuals has no access to social services' },
    { icon: Key,     title: 'Recently Released', gradient: 'from-[hsl(var(--secondary)/0.85)] to-[hsl(var(--background)/0.9)]', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', body: 'Over 600,000 people are released from prison each year. The first 90 days are the most critical — and the most underserved. We bridge that gap.', stat: '68% of released individuals are rearrested within 3 years' },
  ]
  return (
    <section className="px-6 py-20">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
        {cards.map(c => (
          <div key={c.title} className="relative rounded-3xl overflow-hidden h-[520px] flex items-end">
            <img src={c.img} alt={c.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
            <div className={`absolute inset-0 bg-gradient-to-t ${c.gradient}`} />
            <div className="relative z-10 p-8 md:p-10">
              <c.icon className="w-12 h-12 text-white mb-4" />
              <h3 className="font-heading font-bold text-2xl md:text-3xl text-white mb-3">{c.title}</h3>
              <p className="text-white/80 text-base leading-relaxed max-w-[380px] mb-4">{c.body}</p>
              <div className="glass inline-flex px-4 py-2 rounded-full text-xs text-white/90">{c.stat}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Journey Ladder ──────────────────────────────────────────────────────────
function Journey() {
  const steps = [
    { icon: CreditCard, label: 'Get your ID',      sub: 'The key to everything' },
    { icon: Home,       label: 'Find safe shelter', sub: 'A roof over your head', milestone: true },
    { icon: FileText,   label: 'Enroll in benefits',sub: 'Food stamps, Medicaid' },
    { icon: Key,        label: 'Stable housing',    sub: 'Your own address',      milestone: true },
    { icon: Briefcase,  label: 'Find employment',   sub: 'Your first paycheck' },
    { icon: Landmark,   label: 'Open bank account', sub: 'Financial access',      milestone: true },
    { icon: BarChart2,  label: 'Build financial plan', sub: 'Budget, save, grow' },
    { icon: Award,      label: 'Full independence', sub: 'You made it',           milestone: true },
  ]
  return (
    <section className="py-28 px-6">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <p className="text-[hsl(var(--primary))] text-xs font-semibold tracking-[0.15em] uppercase mb-3">The Journey</p>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-[hsl(var(--foreground))] mb-4">We walk with you, every step.</h2>
        <p className="text-[hsl(var(--muted-foreground))] text-lg">From survival to independence.</p>
      </div>
      <div className="max-w-7xl mx-auto overflow-x-auto pb-4">
        <div className="flex items-center gap-0 min-w-[900px] px-4">
          {steps.map((s, i) => {
            const done = i < 4
            return (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center text-center w-24">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all
                    ${done ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'border-2 border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]'}
                    ${s.milestone && done ? 'ring-4 ring-[hsl(var(--primary)/0.3)]' : ''}
                    ${s.milestone && !done ? 'ring-4 ring-[hsl(var(--accent)/0.3)]' : ''}
                  `}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs font-medium mt-2 ${done ? 'text-[hsl(var(--foreground))]' : 'text-[hsl(var(--muted-foreground))]'}`}>{s.label}</span>
                  <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{s.sub}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 ${i < 3 ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--border))]'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// ─── Financial Tools ─────────────────────────────────────────────────────────
function FinancialTools() {
  const navigate = useNavigate()
  const tools = [
    { icon: Wallet,      color: 'text-[hsl(var(--primary))]',   title: 'Budget Tracker',     body: 'Your first paycheck, managed right' },
    { icon: Shield,      color: 'text-[hsl(var(--accent))]',    title: 'Emergency Fund',     body: 'Even $10 a week builds a safety net' },
    { icon: TrendingDown,color: 'text-[hsl(var(--secondary))]', title: 'Debt Payoff',        body: 'Court fines to medical bills, one clear plan' },
    { icon: Target,      color: 'text-[hsl(var(--primary))]',   title: 'Savings Goals',      body: 'Your first apartment deposit, planned' },
    { icon: BookOpen,    color: 'text-purple-400',               title: 'Financial Literacy', body: '6 modules that could change everything' },
    { icon: Activity,    color: 'text-red-400',                  title: 'Risk Score',         body: 'Know your financial health, own your future' },
  ]
  return (
    <section className="py-28 px-6">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <p className="text-[hsl(var(--primary))] text-xs font-semibold tracking-[0.15em] uppercase mb-3">Financial Tools</p>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-[hsl(var(--foreground))] mb-4">Built for real life.</h2>
        <p className="text-[hsl(var(--muted-foreground))] text-lg">Not for people who already have money.</p>
      </div>
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map(t => (
          <button key={t.title} onClick={() => navigate('/wellness')} className="glass-card flex flex-col items-start text-left w-full">
            <t.icon className={`w-8 h-8 ${t.color} mb-4`} />
            <h3 className="font-heading font-bold text-lg text-[hsl(var(--foreground))] mb-1">{t.title}</h3>
            <p className="text-[hsl(var(--muted-foreground))] text-sm">{t.body}</p>
          </button>
        ))}
      </div>
    </section>
  )
}

// ─── Testimonials ────────────────────────────────────────────────────────────
function Testimonials() {
  const testimonials = [
    { initial: 'M', bg: 'bg-[hsl(var(--primary))]', name: 'Marcus', location: 'Phoenix, AZ', badge: 'Homeless to housed in 6 weeks', quote: "I didn't have a smartphone. I didn't have internet. I just had an old flip phone. I texted that number and within 10 minutes I had a bed for the night." },
    { initial: 'J', bg: 'bg-[hsl(var(--secondary))]', name: 'James', location: 'Atlanta, GA', badge: 'Released to employed in 4 weeks', quote: "I got out with $40 and a bus ticket. The AI walked me through everything and warned me about a payday lender that would have taken half my first paycheck." },
    { initial: 'D', bg: 'bg-purple-500', name: 'Darnell', location: 'Detroit, MI', badge: 'Step 2 to Step 5 in 3 months', quote: "My caseworker could see my progress every day. When I got stuck, she messaged me directly. I never felt alone in this." },
  ]
  return (
    <section className="py-28 px-6">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <p className="text-[hsl(var(--primary))] text-xs font-semibold tracking-[0.15em] uppercase mb-3">Real Stories</p>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-[hsl(var(--foreground))]">Real change.</h2>
      </div>
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6">
        {testimonials.map(t => (
          <div key={t.name} className="glass-card">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 ${t.bg} rounded-full flex items-center justify-center font-heading font-bold text-white text-lg`}>{t.initial}</div>
              <div>
                <div className="font-heading font-bold text-[hsl(var(--foreground))]">{t.name}</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">{t.location}</div>
              </div>
            </div>
            <div className="glass inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-[hsl(var(--accent))] mb-4">
              <CheckCircle className="w-3 h-3" /> {t.badge}
            </div>
            <p className="text-[hsl(var(--foreground)/0.8)] text-sm italic leading-relaxed">"{t.quote}"</p>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── For Caseworkers ─────────────────────────────────────────────────────────
function ForCaseworkers() {
  const navigate = useNavigate()
  const features = [
    'Real-time conversation history',
    'Financial Health Score per client',
    'Step progress and milestone tracking',
    'AI voice milestone celebrations',
    'Direct message composer',
    'Progress report export for grants',
  ]
  return (
    <section className="py-28 px-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-xs font-medium mb-6">
            <Users className="w-3.5 h-3.5" /> For Social Workers and Nonprofits
          </div>
          <h2 className="font-heading font-bold text-3xl md:text-4xl text-[hsl(var(--foreground))] mb-4">Your clients, always in view.</h2>
          <p className="text-[hsl(var(--muted-foreground))] text-base leading-relaxed mb-8">
            The Redreemer dashboard gives you real-time visibility into every client's journey. See who is progressing, who has gone quiet, and who needs a human touch.
          </p>
          <div className="space-y-3 mb-8">
            {features.map(f => (
              <div key={f} className="flex items-center gap-2.5 text-[hsl(var(--foreground))] text-sm">
                <CheckCircle className="w-4 h-4 text-[hsl(var(--primary))] shrink-0" /> {f}
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold hover:glow-amber transition-all"
          >
            Access the Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="relative hidden lg:block">
          <div className="absolute inset-0 pointer-events-none rounded-full"
            style={{ background: 'rgba(245,158,11,0.1)', filter: 'blur(60px)' }} />
          <div className="relative glass rounded-2xl p-6 border border-[hsl(var(--border))]">
            <div className="flex gap-1.5 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400/60" />
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--primary)/0.6)]" />
              <div className="w-3 h-3 rounded-full bg-[hsl(var(--accent)/0.6)]" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[['Marcus', 72], ['James', 48], ['Darnell', 31]].map(([name, pct]) => (
                <div key={name} className="glass rounded-lg p-3">
                  <div className="text-xs font-heading font-bold text-[hsl(var(--foreground))]">{name}</div>
                  <div className="h-1.5 rounded bg-[hsl(var(--primary)/0.2)] mt-2">
                    <div className="h-full bg-[hsl(var(--primary))] rounded" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-center">
              <div className="relative w-20 h-20">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="2" className="stroke-[hsl(var(--border))]" />
                  <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="2" strokeDasharray="65 35"
                    stroke="hsl(var(--primary))" strokeLinecap="round" />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center font-mono text-[hsl(var(--primary))] text-sm font-bold">52</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Mission ─────────────────────────────────────────────────────────────────
function Mission() {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0">
        <img src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=1600" alt="Mission" className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-[hsl(var(--background)/0.85)]" />
      </div>
      <div className="relative z-10 max-w-[800px] mx-auto text-center">
        <p className="text-[hsl(var(--primary))] text-xs font-semibold tracking-[0.15em] uppercase mb-6">Our Mission</p>
        <h2 className="font-heading font-extrabold text-4xl md:text-6xl text-[hsl(var(--foreground))] leading-tight mb-6">
          <span className="text-gradient-amber">Financial exclusion is a design problem.</span>{' '}
          We're redesigning it.
        </h2>
        <p className="text-[hsl(var(--foreground)/0.8)] text-lg md:text-xl leading-relaxed mb-8">
          Every financial app assumes you have a smartphone, an email address, a bank account. We built Redreemer for the 582,000 Americans experiencing homelessness tonight and the 600,000 released from prison each year.
        </p>
        <a href="sms:+16812911362"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold text-lg hover:glow-amber transition-all">
          Text Us Now <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </section>
  )
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="relative bg-[hsl(var(--card))] border-t border-[hsl(var(--border))]">
      <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent" />
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8 items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-md bg-[hsl(var(--primary))] flex items-center justify-center font-heading font-bold text-[hsl(var(--primary-foreground))] text-sm">R</div>
            <span className="font-heading font-bold text-[hsl(var(--foreground))]">Redreemer</span>
          </div>
          <p className="text-[hsl(var(--muted-foreground))] text-sm italic">Redream what's possible.</p>
        </div>
        <div className="flex gap-6 text-sm text-[hsl(var(--muted-foreground))] justify-center">
          {['About', 'Privacy', 'Security', 'Contact'].map(l => (
            <a key={l} href="#" className="hover:text-[hsl(var(--foreground))] transition-colors">{l}</a>
          ))}
        </div>
        <div className="text-right">
          <span className="inline-flex items-center gap-1.5 text-sm text-[hsl(var(--muted-foreground))]">
            <Zap className="w-4 h-4 text-[hsl(var(--primary))]" /> Built at InnovationHacks 2026
          </span>
        </div>
      </div>
      <div className="border-t border-[hsl(var(--border))]">
        <div className="max-w-7xl mx-auto px-6 py-4 text-center text-xs text-[hsl(var(--muted-foreground))]">
          2026 Redreemer — Free forever — Made with purpose
        </div>
      </div>
    </footer>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function Landing() {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] scroll-smooth">
      <LandingNav />
      <Hero />
      <StatsBanner />
      <HowItWorks />
      <WhoWeServe />
      <Journey />
      <FinancialTools />
      <Testimonials />
      <ForCaseworkers />
      <Mission />
      <Footer />
    </div>
  )
}
