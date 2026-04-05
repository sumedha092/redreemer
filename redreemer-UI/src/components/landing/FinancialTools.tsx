import { useEffect, useRef, useState } from 'react';
import { Wallet, Shield, TrendingDown, Target, BookOpen, Activity } from 'lucide-react';

// ── Mini demo components ──────────────────────────────────────────────────────

function BudgetDemo({ active }: { active: boolean }) {
  const categories = [
    { label: 'Housing', pct: 44, color: '#f59e0b' },
    { label: 'Food',    pct: 17, color: '#10b981' },
    { label: 'Savings', pct: 11, color: '#22c55e' },
    { label: 'Other',   pct: 28, color: '#6366f1' },
  ];
  return (
    <div className="mt-4 space-y-2 w-full">
      {categories.map((c, i) => (
        <div key={c.label}>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
            <span>{c.label}</span><span>{c.pct}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: active ? `${c.pct}%` : '0%', backgroundColor: c.color, transitionDelay: `${i * 120}ms` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmergencyDemo({ active }: { active: boolean }) {
  const pct = 34;
  const r = 28, circ = 2 * Math.PI * r;
  return (
    <div className="mt-4 flex items-center gap-4 w-full">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
          <circle cx="32" cy="32" r={r} fill="none" stroke="#10b981" strokeWidth="5"
            strokeDasharray={circ}
            strokeDashoffset={active ? circ * (1 - pct / 100) : circ}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease 0.2s' }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">{active ? `${pct}%` : '0%'}</span>
      </div>
      <div>
        <p className="text-xs text-foreground font-medium">$340 saved</p>
        <p className="text-[10px] text-muted-foreground">Goal: $1,000</p>
        <p className="text-[10px] text-accent mt-1">+$50 this week</p>
      </div>
    </div>
  );
}

function DebtDemo({ active }: { active: boolean }) {
  const debts = [
    { label: 'Court Debt', bal: 13000, color: '#ef4444' },
    { label: 'Medical',    bal: 340,   color: '#f59e0b' },
    { label: 'Phone',      bal: 120,   color: '#6366f1' },
  ];
  const max = 13000;
  return (
    <div className="mt-4 space-y-2 w-full">
      {debts.map((d, i) => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-16 shrink-0">{d.label}</span>
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: active ? `${(d.bal / max) * 100}%` : '0%', backgroundColor: d.color, transitionDelay: `${i * 150}ms` }} />
          </div>
          <span className="text-[10px] text-muted-foreground w-12 text-right">${d.bal.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

function SavingsDemo({ active }: { active: boolean }) {
  const goals = [
    { label: 'Emergency Fund', pct: 40, color: '#f59e0b' },
    { label: 'Housing Deposit', pct: 20, color: '#10b981' },
    { label: 'Phone Upgrade',   pct: 60, color: '#6366f1' },
  ];
  return (
    <div className="mt-4 space-y-2.5 w-full">
      {goals.map((g, i) => (
        <div key={g.label}>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-0.5">
            <span>{g.label}</span><span>{g.pct}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: active ? `${g.pct}%` : '0%', backgroundColor: g.color, transitionDelay: `${i * 130}ms` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function LiteracyDemo({ active }: { active: boolean }) {
  const modules = ['How Bank Accounts Work', 'Understanding Credit', 'SNAP Benefits', 'Budgeting Basics'];
  const done = [true, true, false, false];
  return (
    <div className="mt-4 space-y-1.5 w-full">
      {modules.map((m, i) => (
        <div key={m}
          className={`flex items-center gap-2 text-[10px] transition-all duration-500 ${active ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3'}`}
          style={{ transitionDelay: `${i * 100}ms` }}>
          <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[8px] font-bold ${done[i] ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
            {done[i] ? '✓' : i + 1}
          </div>
          <span className={done[i] ? 'text-foreground' : 'text-muted-foreground'}>{m}</span>
        </div>
      ))}
    </div>
  );
}

function RiskDemo({ active }: { active: boolean }) {
  const score = 62;
  const r = 28, circ = 2 * Math.PI * r;
  return (
    <div className="mt-4 flex items-center gap-4 w-full">
      <div className="relative w-16 h-16 flex-shrink-0">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="5" />
          <circle cx="32" cy="32" r={r} fill="none" stroke="#f59e0b" strokeWidth="5"
            strokeDasharray={circ}
            strokeDashoffset={active ? circ * (1 - score / 100) : circ}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease 0.2s' }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">{active ? score : 0}</span>
      </div>
      <div className="space-y-1">
        {['Housing', 'Income', 'Banking', 'Savings'].map((cat, i) => (
          <div key={cat} className="flex items-center gap-1.5">
            <div className="h-1 rounded-full bg-muted overflow-hidden" style={{ width: 60 }}>
              <div className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: active ? `${[70, 40, 55, 30][i]}%` : '0%', transitionDelay: `${i * 100 + 300}ms` }} />
            </div>
            <span className="text-[9px] text-muted-foreground">{cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const tools = [
  { icon: Wallet,      color: 'text-primary',     title: 'Budget Tracker',      body: 'Your first paycheck, managed right',          Demo: BudgetDemo   },
  { icon: Shield,      color: 'text-accent',       title: 'Emergency Fund',      body: 'Even $10 a week builds a safety net',         Demo: EmergencyDemo },
  { icon: TrendingDown,color: 'text-secondary',    title: 'Debt Payoff',         body: 'Court fines to medical bills, one clear plan', Demo: DebtDemo     },
  { icon: Target,      color: 'text-primary',      title: 'Savings Goals',       body: 'Your first apartment deposit, planned',        Demo: SavingsDemo  },
  { icon: BookOpen,    color: 'text-purple-400',   title: 'Financial Literacy',  body: '6 modules that could change everything',       Demo: LiteracyDemo },
  { icon: Activity,    color: 'text-destructive',  title: 'Risk Score',          body: 'Know your financial health, own your future',  Demo: RiskDemo     },
];

export default function FinancialTools() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-28 px-6">
      <div className="max-w-7xl mx-auto text-center mb-16">
        <p className="text-primary text-xs font-semibold tracking-[0.15em] uppercase mb-3">Financial Tools</p>
        <h2 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-4">Built for real life.</h2>
        <p className="text-muted-foreground text-lg">Not for people who already have money.</p>
      </div>
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tools.map((t, i) => (
          <div key={t.title}
            className={`glass-card flex flex-col items-start transition-all duration-500 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            style={{ transitionDelay: `${i * 80}ms` }}>
            <t.icon className={`w-8 h-8 ${t.color} mb-3`} />
            <h3 className="font-heading font-bold text-lg text-foreground mb-1">{t.title}</h3>
            <p className="text-muted-foreground text-sm">{t.body}</p>
            <t.Demo active={inView} />
          </div>
        ))}
      </div>
    </section>
  );
}
