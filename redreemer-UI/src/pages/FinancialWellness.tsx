import { useState, useMemo, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet, Shield, TrendingDown, Target, BookOpen, Activity, ShieldCheck,
  BarChart2, ChevronRight, Sun, Moon, ExternalLink, AlertTriangle,
  Landmark, TrendingUp, Apple, FileText, Home, Car, Heart, CheckCircle, X,
  Database
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/components/Toast';
import Logo from '@/components/Logo';
import DataInsights from '@/components/DataInsights';
import AIInsightPanel from '@/components/AIInsightPanel';
import { useAIAlerts } from '@/context/AIAlertContext';

// ── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { id: 'budget',    label: 'Budget',           Icon: Wallet },
  { id: 'networth',  label: 'Net Worth',         Icon: BarChart2 },
  { id: 'emergency', label: 'Emergency Fund',    Icon: Shield },
  { id: 'debt',      label: 'Debt Payoff',       Icon: TrendingDown },
  { id: 'insurance', label: 'Insurance',         Icon: ShieldCheck },
  { id: 'goals',     label: 'Savings Goals',     Icon: Target },
  { id: 'risk',      label: 'Risk Score',        Icon: Activity },
  { id: 'learn',     label: 'Learn',             Icon: BookOpen },
  { id: 'community', label: 'Community Data',    Icon: Database },
] as const;

type TabId = typeof TABS[number]['id'];

// ── Embeddable content (used by ClientDashboard) ─────────────────────────────

export function WellnessContent({ tool }: { tool: string }) {
  return (
    <div>
      {tool === 'budget'    && <BudgetTracker />}
      {tool === 'networth'  && <NetWorth />}
      {tool === 'emergency' && <EmergencyFund />}
      {tool === 'debt'      && <DebtPayoff />}
      {tool === 'insurance' && <InsuranceEducation />}
      {tool === 'goals'     && <SavingsGoals />}
      {tool === 'risk'      && <RiskScore />}
      {tool === 'learn'     && <FinancialLiteracy />}
      {tool === 'community' && <DataInsights />}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function FinancialWellness() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>('budget');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Flourish header */}
      <div className="border-b border-border px-6 py-5" style={{ background: 'linear-gradient(180deg, rgba(16,185,129,0.08) 0%, transparent 100%)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <button onClick={() => navigate('/dashboard')} className="hover:text-foreground transition-colors">Dashboard</button>
              <ChevronRight size={12} />
              <span className="text-emerald-400">Financial Wellness</span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <Logo size="sm" />
            </div>
            <h1 className="font-heading font-bold text-2xl text-foreground mt-2">
              Financial Wellness Suite
              <span className="block w-16 h-[3px] rounded-full mt-1" style={{ background: 'linear-gradient(90deg, #10B981, #059669)' }} />
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Empowering financial confidence at every stage of the journey</p>
          </div>
          <button onClick={toggleTheme} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors">
            <Sun size={16} />
          </button>
        </div>
      </div>

      {/* Tab nav — Flourish emerald */}
      <div className="border-b border-border overflow-x-auto">
        <div className="max-w-6xl mx-auto px-6 flex gap-1 py-2">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}>
              <tab.Icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {activeTab === 'budget'    && <BudgetTracker />}
        {activeTab === 'networth'  && <NetWorth />}
        {activeTab === 'emergency' && <EmergencyFund />}
        {activeTab === 'debt'      && <DebtPayoff />}
        {activeTab === 'insurance' && <InsuranceEducation />}
        {activeTab === 'goals'     && <SavingsGoals />}
        {activeTab === 'risk'      && <RiskScore />}
        {activeTab === 'learn'     && <FinancialLiteracy />}
        {activeTab === 'community' && <DataInsights />}
      </div>
    </div>
  );
}

// ── Shared card style helper ─────────────────────────────────────────────────

const card = 'glass-card !p-5';
const cardSm = 'glass-card !p-4';
const inputCls = 'bg-muted border border-border text-foreground placeholder:text-muted-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary';
const tipCls = 'bg-primary/10 border border-primary/30 rounded-xl p-4';

// ── Budget Tracker ───────────────────────────────────────────────────────────

interface BudgetCategory {
  id: number; name: string; budget: number; spent: number; color: string; icon: string;
}

const DEFAULT_CATEGORIES: BudgetCategory[] = [
  { id: 1, name: 'Housing',    budget: 800, spent: 800, color: '#f59e0b', icon: 'home' },
  { id: 2, name: 'Food',       budget: 300, spent: 210, color: '#10b981', icon: 'food' },
  { id: 3, name: 'Transport',  budget: 150, spent: 95,  color: '#6366f1', icon: 'bus' },
  { id: 4, name: 'Phone',      budget: 50,  spent: 50,  color: '#ec4899', icon: 'phone' },
  { id: 5, name: 'Healthcare', budget: 100, spent: 40,  color: '#14b8a6', icon: 'health' },
  { id: 6, name: 'Clothing',   budget: 50,  spent: 0,   color: '#8b5cf6', icon: 'clothes' },
  { id: 7, name: 'Savings',    budget: 200, spent: 200, color: '#22c55e', icon: 'savings' },
  { id: 8, name: 'Other',      budget: 100, spent: 65,  color: '#94a3b8', icon: 'other' },
];

function CategoryBar({ cat }: { cat: BudgetCategory }) {
  const pct = cat.budget > 0 ? Math.min((cat.spent / cat.budget) * 100, 100) : 0;
  const over = cat.spent > cat.budget;
  return (
    <div className={cardSm}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
          <span className="text-foreground font-medium text-sm">{cat.name}</span>
        </div>
        <div className="text-right">
          <span className={`text-sm font-semibold ${over ? 'text-destructive' : 'text-foreground'}`}>${cat.spent}</span>
          <span className="text-muted-foreground text-xs"> / ${cat.budget}</span>
        </div>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: over ? '#ef4444' : cat.color }} />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-muted-foreground text-xs">{Math.round(pct)}% used</span>
        <span className={`text-xs ${over ? 'text-destructive' : 'text-accent'}`}>
          {over ? `${cat.spent - cat.budget} over` : `${cat.budget - cat.spent} left`}
        </span>
      </div>
    </div>
  );
}

function BudgetTracker() {
  const [income, setIncome] = useState(1800);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newEntry, setNewEntry] = useState({ category: '', amount: '' });
  const { addAlert } = useAIAlerts();

  const totalSpent = useMemo(() => categories.reduce((s, c) => s + c.spent, 0), [categories]);
  const remaining = income - totalSpent;
  const spentPct = income > 0 ? Math.min((totalSpent / income) * 100, 100) : 0;

  function addEntry(e: FormEvent) {
    e.preventDefault();
    if (!newEntry.category || !newEntry.amount) return;
    const amt = parseFloat(newEntry.amount);
    setCategories(prev => prev.map(c => c.name === newEntry.category ? { ...c, spent: c.spent + amt } : c));
    setNewEntry({ category: '', amount: '' });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl text-foreground">Budget Tracker</h2>
        <span className="text-muted-foreground text-sm">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Income', value: `$${income.toLocaleString()}`, cls: 'text-accent' },
          { label: 'Total Spent',    value: `$${totalSpent.toLocaleString()}`, cls: 'text-primary' },
          { label: 'Remaining',      value: `$${remaining.toLocaleString()}`, cls: remaining >= 0 ? 'text-accent' : 'text-destructive' },
          { label: 'Savings Rate',   value: `${income > 0 ? Math.round((200 / income) * 100) : 0}%`, cls: 'text-secondary' },
        ].map(c => (
          <div key={c.label} className={cardSm}>
            <p className="text-muted-foreground text-xs mb-1">{c.label}</p>
            <p className={`text-xl font-mono font-bold ${c.cls}`}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className={card}>
        <div className="flex justify-between mb-2">
          <span className="text-foreground font-medium">Monthly Spending</span>
          <span className="text-muted-foreground text-sm">${totalSpent} of ${income}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div className="h-3 rounded-full transition-all duration-700" style={{ width: `${spentPct}%`, backgroundColor: spentPct > 90 ? '#ef4444' : '#f59e0b' }} />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-muted-foreground text-xs">{Math.round(spentPct)}% of income spent</span>
          <span className="text-accent text-xs">50/30/20 rule: aim for 20% savings</span>
        </div>
      </div>
      <div className={`${cardSm} flex items-center gap-4`}>
        <label className="text-foreground text-sm font-medium whitespace-nowrap">Monthly Income</label>
        <span className="text-muted-foreground">$</span>
        <input type="number" value={income} onChange={e => setIncome(Number(e.target.value))} className={`${inputCls} w-32`} />
        <span className="text-muted-foreground text-xs">After tax</span>
      </div>
      <div>
        <h3 className="font-heading font-semibold text-foreground mb-3">Spending by Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map(cat => <CategoryBar key={cat.id} cat={cat} />)}
        </div>
      </div>
      <div className={card}>
        <h3 className="font-heading font-semibold text-foreground mb-4">Log a Transaction</h3>
        <form onSubmit={addEntry} className="flex flex-wrap gap-3">
          <select value={newEntry.category} onChange={e => setNewEntry(p => ({ ...p, category: e.target.value }))} className={inputCls}>
            <option value="">Category</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.icon} {c.name}</option>)}
          </select>
          <input type="number" placeholder="Amount" value={newEntry.amount} onChange={e => setNewEntry(p => ({ ...p, amount: e.target.value }))} className={`${inputCls} w-28`} />
          <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm transition-colors">Add</button>
        </form>
      </div>
      <div className={tipCls}>
        <p className="text-primary font-semibold text-sm mb-1">The 50/30/20 Rule</p>
        <p className="text-muted-foreground text-sm">50% needs · 30% wants · 20% savings & debt payoff. On $1,800/month: $900 needs, $540 wants, $360 savings.</p>
      </div>
      <AIInsightPanel
        tool="budget"
        data={{ income, totalSpent, remaining, categories: categories.map(c => ({ name: c.name, budget: c.budget, spent: c.spent })) }}
        onAlert={(msg, lvl) => addAlert(msg, lvl, 'budget')}
      />
    </div>
  );
}

// ── Net Worth ────────────────────────────────────────────────────────────────

interface WorthItem { id: number; name: string; value: number; }

function NetWorth() {
  const [assets, setAssets] = useState<WorthItem[]>([
    { id: 1, name: 'Checking Account', value: 340 },
    { id: 2, name: 'Savings Account',  value: 200 },
    { id: 3, name: 'Cash on Hand',     value: 80  },
  ]);
  const [liabilities, setLiabilities] = useState<WorthItem[]>([
    { id: 1, name: 'Court Debt',         value: 13000 },
    { id: 2, name: 'Phone Plan Balance', value: 120   },
  ]);
  const [newAsset, setNewAsset] = useState({ name: '', value: '' });
  const [newLiability, setNewLiability] = useState({ name: '', value: '' });

  const totalAssets = useMemo(() => assets.reduce((s, a) => s + a.value, 0), [assets]);
  const totalLiabilities = useMemo(() => liabilities.reduce((s, l) => s + l.value, 0), [liabilities]);
  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="space-y-6">
      <h2 className="font-heading font-bold text-xl text-foreground">Net Worth Calculator</h2>
      <div className={`${card} text-center`}>
        <p className="text-muted-foreground text-sm mb-2">Your Net Worth</p>
        <p className={`text-5xl font-mono font-bold ${netWorth >= 0 ? 'text-accent' : 'text-destructive'}`}>
          {netWorth < 0 ? '-' : ''}${Math.abs(netWorth).toLocaleString()}
        </p>
        <p className="text-muted-foreground text-sm mt-3">
          {netWorth < 0 ? "You owe more than you own right now. That's okay — this is your starting point." : "You own more than you owe. Keep building."}
        </p>
      </div>
      <div className={card}>
        <div className="flex justify-between mb-3">
          <span className="text-accent font-medium text-sm">Assets: ${totalAssets.toLocaleString()}</span>
          <span className="text-destructive font-medium text-sm">Liabilities: ${totalLiabilities.toLocaleString()}</span>
        </div>
        <div className="flex h-4 rounded-full overflow-hidden">
          {totalAssets + totalLiabilities > 0 && (
            <>
              <div className="bg-accent transition-all duration-700" style={{ width: `${(totalAssets / (totalAssets + totalLiabilities)) * 100}%` }} />
              <div className="bg-destructive transition-all duration-700" style={{ width: `${(totalLiabilities / (totalAssets + totalLiabilities)) * 100}%` }} />
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Assets */}
        <div className={card}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-accent font-semibold">Assets</h3>
            <span className="text-accent font-bold">${totalAssets.toLocaleString()}</span>
          </div>
          {assets.map(a => (
            <div key={a.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-foreground text-sm">{a.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-foreground font-medium text-sm">${a.value.toLocaleString()}</span>
                <button onClick={() => setAssets(p => p.filter(x => x.id !== a.id))} className="text-muted-foreground hover:text-destructive text-xs transition-colors">✕</button>
              </div>
            </div>
          ))}
          <form onSubmit={e => { e.preventDefault(); if (!newAsset.name || !newAsset.value) return; setAssets(p => [...p, { id: Date.now(), name: newAsset.name, value: parseFloat(newAsset.value) }]); setNewAsset({ name: '', value: '' }); }} className="flex gap-2 mt-3">
            <input placeholder="Name" value={newAsset.name} onChange={e => setNewAsset(p => ({ ...p, name: e.target.value }))} className={`flex-1 ${inputCls} text-xs`} />
            <input type="number" placeholder="$" value={newAsset.value} onChange={e => setNewAsset(p => ({ ...p, value: e.target.value }))} className={`w-20 ${inputCls} text-xs`} />
            <button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground px-3 py-1.5 rounded-lg text-xs transition-colors">+</button>
          </form>
        </div>
        {/* Liabilities */}
        <div className={card}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-destructive font-semibold">Liabilities</h3>
            <span className="text-destructive font-bold">${totalLiabilities.toLocaleString()}</span>
          </div>
          {liabilities.map(l => (
            <div key={l.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <span className="text-foreground text-sm">{l.name}</span>
              <div className="flex items-center gap-3">
                <span className="text-foreground font-medium text-sm">${l.value.toLocaleString()}</span>
                <button onClick={() => setLiabilities(p => p.filter(x => x.id !== l.id))} className="text-muted-foreground hover:text-destructive text-xs transition-colors">✕</button>
              </div>
            </div>
          ))}
          <form onSubmit={e => { e.preventDefault(); if (!newLiability.name || !newLiability.value) return; setLiabilities(p => [...p, { id: Date.now(), name: newLiability.name, value: parseFloat(newLiability.value) }]); setNewLiability({ name: '', value: '' }); }} className="flex gap-2 mt-3">
            <input placeholder="Name" value={newLiability.name} onChange={e => setNewLiability(p => ({ ...p, name: e.target.value }))} className={`flex-1 ${inputCls} text-xs`} />
            <input type="number" placeholder="$" value={newLiability.value} onChange={e => setNewLiability(p => ({ ...p, value: e.target.value }))} className={`w-20 ${inputCls} text-xs`} />
            <button type="submit" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-3 py-1.5 rounded-lg text-xs transition-colors">+</button>
          </form>
        </div>
      </div>
      <div className={tipCls}>
        <p className="text-primary font-semibold text-sm mb-1">Why net worth matters</p>
        <p className="text-muted-foreground text-sm">Net worth is your financial scoreboard. Even if it's negative right now, tracking it monthly shows you're moving in the right direction.</p>
      </div>
    </div>
  );
}

// ── Emergency Fund ───────────────────────────────────────────────────────────

function EmergencyFund() {
  const [monthlyExpenses, setMonthlyExpenses] = useState(1460);
  const [currentSaved, setCurrentSaved] = useState(200);
  const [targetMonths, setTargetMonths] = useState(3);
  const [monthlySavings, setMonthlySavings] = useState(50);
  const { addAlert } = useAIAlerts();

  const target = useMemo(() => monthlyExpenses * targetMonths, [monthlyExpenses, targetMonths]);
  const remaining = useMemo(() => Math.max(target - currentSaved, 0), [target, currentSaved]);
  const pct = useMemo(() => target > 0 ? Math.min((currentSaved / target) * 100, 100) : 0, [currentSaved, target]);
  const monthsToGoal = useMemo(() => monthlySavings > 0 ? Math.ceil(remaining / monthlySavings) : null, [remaining, monthlySavings]);

  const milestones = [
    { label: '$200 — First buffer',    amount: 200,                  desc: 'Covers a broken phone or missed shift' },
    { label: '$500 — Housing deposit', amount: 500,                  desc: 'Qualifies you for most rental programs' },
    { label: '1 month expenses',       amount: monthlyExpenses,      desc: 'Covers a full month if income stops' },
    { label: '3 months expenses',      amount: monthlyExpenses * 3,  desc: 'Standard emergency fund goal' },
    { label: '6 months expenses',      amount: monthlyExpenses * 6,  desc: 'Full financial resilience' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="font-heading font-bold text-xl text-foreground">Emergency Fund Planner</h2>
      <div className={card}>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg className="w-40 h-40 -rotate-90" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="64" fill="none" stroke="hsl(var(--muted))" strokeWidth="16" />
              <circle cx="80" cy="80" r="64" fill="none"
                stroke={pct >= 100 ? '#22c55e' : 'hsl(var(--primary))'}
                strokeWidth="16"
                strokeDasharray={`${2 * Math.PI * 64}`}
                strokeDashoffset={`${2 * Math.PI * 64 * (1 - pct / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-mono font-bold text-foreground">{Math.round(pct)}%</span>
              <span className="text-muted-foreground text-xs">funded</span>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            <div><p className="text-muted-foreground text-xs mb-1">Saved</p><p className="text-accent text-2xl font-mono font-bold">${currentSaved.toLocaleString()}</p></div>
            <div><p className="text-muted-foreground text-xs mb-1">Goal</p><p className="text-foreground text-2xl font-mono font-bold">${target.toLocaleString()}</p></div>
            <div><p className="text-muted-foreground text-xs mb-1">Still needed</p><p className="text-primary text-xl font-mono font-bold">${remaining.toLocaleString()}</p></div>
            <div><p className="text-muted-foreground text-xs mb-1">Time to goal</p><p className="text-secondary text-xl font-mono font-bold">{monthsToGoal ? `${monthsToGoal} mo` : '—'}</p></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Monthly Expenses', value: monthlyExpenses, set: setMonthlyExpenses, hint: 'Housing + food + transport + phone' },
          { label: 'Currently Saved',  value: currentSaved,    set: setCurrentSaved,    hint: 'What you have right now' },
          { label: 'Monthly Savings',  value: monthlySavings,  set: setMonthlySavings,  hint: 'How much you can save per month' },
        ].map(f => (
          <div key={f.label} className={cardSm}>
            <label className="text-foreground text-sm font-medium block mb-1">{f.label}</label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">$</span>
              <input type="number" value={f.value} onChange={e => f.set(Number(e.target.value))} className={`${inputCls} w-full`} />
            </div>
            <p className="text-muted-foreground text-xs mt-1">{f.hint}</p>
          </div>
        ))}
        <div className={cardSm}>
          <label className="text-foreground text-sm font-medium block mb-2">Target Coverage</label>
          <div className="flex gap-2">
            {[1, 3, 6].map(m => (
              <button key={m} onClick={() => setTargetMonths(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${targetMonths === m ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                {m} mo
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={card}>
        <h3 className="font-heading font-semibold text-foreground mb-4">Milestones</h3>
        <div className="space-y-3">
          {milestones.map((m, idx) => {
            const reached = currentSaved >= m.amount;
            return (
              <div key={m.label} className={`flex items-center gap-4 p-3 rounded-lg ${reached ? 'bg-accent/10 border border-accent/20' : 'bg-muted/50'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${reached ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                  {reached ? <CheckCircle size={14} /> : idx + 1}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${reached ? 'text-accent' : 'text-foreground'}`}>{m.label}</p>
                  <p className="text-muted-foreground text-xs">{m.desc}</p>
                </div>
                <span className={`text-sm font-mono font-bold ${reached ? 'text-accent' : 'text-muted-foreground'}`}>${m.amount.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className={tipCls}>
        <p className="text-primary font-semibold text-sm mb-1">Start with $200</p>
        <p className="text-muted-foreground text-sm">Even $5/day gets you to $200 in 40 days. Once you hit $200, you qualify for matched savings programs that can double your deposit.</p>
      </div>
      <AIInsightPanel
        tool="emergency"
        data={{ monthlyExpenses, currentSaved, monthlySavings, target, targetMonths, pct: Math.round(pct), categories: [] }}
        onAlert={(msg, lvl) => addAlert(msg, lvl, 'emergency')}
      />
    </div>
  );
}

// ── Debt Payoff ──────────────────────────────────────────────────────────────

interface Debt { id: number; name: string; balance: number; rate: number; minPayment: number; }

const DEFAULT_DEBTS: Debt[] = [
  { id: 1, name: 'Court Debt',   balance: 13000, rate: 0,    minPayment: 50 },
  { id: 2, name: 'Phone Plan',   balance: 120,   rate: 29.9, minPayment: 30 },
  { id: 3, name: 'Medical Bill', balance: 340,   rate: 0,    minPayment: 20 },
];

function calcPayoff(debts: Debt[], extraPayment: number, method: string) {
  if (debts.length === 0) return { months: 0, totalInterest: 0 };
  let remaining = debts.map(d => ({ ...d }));
  let months = 0, totalInterest = 0;
  while (remaining.some(d => d.balance > 0) && months < 360) {
    months++;
    const sorted = method === 'avalanche'
      ? [...remaining].sort((a, b) => b.rate - a.rate)
      : [...remaining].sort((a, b) => a.balance - b.balance);
    let extra = extraPayment;
    for (const debt of sorted) {
      const d = remaining.find(x => x.id === debt.id)!;
      if (d.balance <= 0) continue;
      const interest = (d.balance * (d.rate / 100)) / 12;
      totalInterest += interest;
      d.balance += interest;
      const payment = Math.min(d.balance, d.minPayment + (extra > 0 ? extra : 0));
      extra = Math.max(0, extra - Math.max(0, payment - d.minPayment));
      d.balance = Math.max(0, d.balance - payment);
    }
  }
  return { months, totalInterest: Math.round(totalInterest) };
}

function DebtPayoff() {
  const [debts, setDebts] = useState<Debt[]>(DEFAULT_DEBTS);
  const [method, setMethod] = useState<'snowball' | 'avalanche'>('snowball');
  const [extraPayment, setExtraPayment] = useState(50);
  const [newDebt, setNewDebt] = useState({ name: '', balance: '', rate: '', minPayment: '' });
  const { addAlert } = useAIAlerts();

  const snowball = useMemo(() => calcPayoff(debts, extraPayment, 'snowball'), [debts, extraPayment]);
  const avalanche = useMemo(() => calcPayoff(debts, extraPayment, 'avalanche'), [debts, extraPayment]);
  const current = method === 'snowball' ? snowball : avalanche;
  const totalDebt = useMemo(() => debts.reduce((s, d) => s + d.balance, 0), [debts]);
  const sortedDebts = method === 'avalanche' ? [...debts].sort((a, b) => b.rate - a.rate) : [...debts].sort((a, b) => a.balance - b.balance);

  function addDebt(e: FormEvent) {
    e.preventDefault();
    if (!newDebt.name || !newDebt.balance) return;
    setDebts(p => [...p, { id: Date.now(), name: newDebt.name, balance: parseFloat(newDebt.balance), rate: parseFloat(newDebt.rate) || 0, minPayment: parseFloat(newDebt.minPayment) || 25 }]);
    setNewDebt({ name: '', balance: '', rate: '', minPayment: '' });
  }

  return (
    <div className="space-y-6">
      <h2 className="font-heading font-bold text-xl text-foreground">Debt Payoff Calculator</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { id: 'snowball' as const, label: 'Snowball Method', desc: 'Pay smallest balance first. Builds momentum with quick wins.', months: snowball.months, interest: snowball.totalInterest },
          { id: 'avalanche' as const, label: 'Avalanche Method', desc: 'Pay highest interest first. Saves the most money overall.', months: avalanche.months, interest: avalanche.totalInterest },
        ].map(m => (
          <button key={m.id} onClick={() => setMethod(m.id)}
            className={`text-left p-5 rounded-xl border-2 transition-all ${method === m.id ? 'border-primary bg-primary/10' : 'border-border bg-muted/30 hover:border-muted-foreground'}`}>
            <p className="text-foreground font-semibold mb-1">{m.label}</p>
            <p className="text-muted-foreground text-xs mb-3">{m.desc}</p>
            <div className="flex gap-4">
              <div><p className="text-muted-foreground text-xs">Payoff time</p><p className="text-primary font-mono font-bold">{m.months} months</p></div>
              <div><p className="text-muted-foreground text-xs">Total interest</p><p className="text-destructive font-mono font-bold">${m.interest.toLocaleString()}</p></div>
            </div>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className={`${cardSm} text-center`}><p className="text-muted-foreground text-xs mb-1">Total Debt</p><p className="text-destructive text-xl font-mono font-bold">${totalDebt.toLocaleString()}</p></div>
        <div className={`${cardSm} text-center`}><p className="text-muted-foreground text-xs mb-1">Debt-Free In</p><p className="text-primary text-xl font-mono font-bold">{current.months} mo</p></div>
        <div className={`${cardSm} text-center`}><p className="text-muted-foreground text-xs mb-1">Interest Paid</p><p className="text-foreground text-xl font-mono font-bold">${current.totalInterest.toLocaleString()}</p></div>
      </div>
      <div className={card}>
        <div className="flex justify-between mb-2">
          <label className="text-foreground font-medium text-sm">Extra Monthly Payment</label>
          <span className="text-primary font-mono font-bold">${extraPayment}</span>
        </div>
        <input type="range" min="0" max="500" step="10" value={extraPayment} onChange={e => setExtraPayment(Number(e.target.value))} className="w-full accent-primary" />
        <div className="flex justify-between text-muted-foreground text-xs mt-1"><span>$0</span><span>$500</span></div>
      </div>
      <div className={card}>
        <h3 className="font-heading font-semibold text-foreground mb-4">Your Debts</h3>
        <div className="space-y-3">
          {sortedDebts.map((debt, i) => (
            <div key={debt.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
              <div className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
              <div className="flex-1">
                <p className="text-foreground text-sm font-medium">{debt.name}</p>
                <p className="text-muted-foreground text-xs">{debt.rate > 0 ? `${debt.rate}% APR` : 'No interest'} · Min ${debt.minPayment}/mo</p>
              </div>
              <p className="text-foreground font-mono font-bold text-sm">${debt.balance.toLocaleString()}</p>
              <button onClick={() => setDebts(p => p.filter(d => d.id !== debt.id))} className="text-muted-foreground hover:text-destructive text-xs transition-colors">✕</button>
            </div>
          ))}
        </div>
        <form onSubmit={addDebt} className="flex flex-wrap gap-2 mt-4">
          <input placeholder="Debt name" value={newDebt.name} onChange={e => setNewDebt(p => ({ ...p, name: e.target.value }))} className={`flex-1 min-w-24 ${inputCls} text-xs`} />
          <input type="number" placeholder="Balance $" value={newDebt.balance} onChange={e => setNewDebt(p => ({ ...p, balance: e.target.value }))} className={`w-24 ${inputCls} text-xs`} />
          <input type="number" placeholder="Rate %" value={newDebt.rate} onChange={e => setNewDebt(p => ({ ...p, rate: e.target.value }))} className={`w-20 ${inputCls} text-xs`} />
          <input type="number" placeholder="Min $" value={newDebt.minPayment} onChange={e => setNewDebt(p => ({ ...p, minPayment: e.target.value }))} className={`w-20 ${inputCls} text-xs`} />
          <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-lg text-xs transition-colors">Add</button>
        </form>
      </div>
      <div className={tipCls}>
        <p className="text-primary font-semibold text-sm mb-1">Court debt tip</p>
        <p className="text-muted-foreground text-sm">Most court fines can be reduced or put on a payment plan. Legal aid organizations help for free. Paying even $50/month shows good faith.</p>
      </div>
      <AIInsightPanel
        tool="debt"
        data={{ debts: debts.map(d => ({ name: d.name, balance: d.balance, rate: d.rate, minPayment: d.minPayment })), extraPayment, method }}
        onAlert={(msg, lvl) => addAlert(msg, lvl, 'debt')}
      />
    </div>
  );
}

// ── Insurance Guide ──────────────────────────────────────────────────────────

interface InsuranceType {
  id: string; icon: string; name: string; tagline: string; color: string;
  why: string; whoNeeds: string; whatCovers: string[]; whatDoesnt: string[];
  avgCost: string; howToGet: string; forUs: string;
  costCalc: { base: number; perThousand: number } | null;
}

const INSURANCE_TYPES: InsuranceType[] = [
  { id: 'renters', icon: 'home', name: 'Renters Insurance', tagline: '$11/month. Covers everything you own.', color: 'amber',
    why: "If your apartment floods, burns, or gets broken into — renters insurance replaces your stuff.",
    whoNeeds: "Anyone renting an apartment or room. Required by many landlords.",
    whatCovers: ["Personal property (clothes, electronics, furniture)", "Liability if someone gets hurt in your home", "Temporary housing if your place becomes uninhabitable", "Theft — even outside your home"],
    whatDoesnt: ["Floods (need separate flood insurance)", "Earthquakes", "Your car"],
    avgCost: "$11–$20/month", howToGet: "Go to lemonade.com or progressive.com. Takes 5 minutes. No credit check required.",
    forUs: "Once you have a mailing address, get renters insurance before you move in.",
    costCalc: { base: 11, perThousand: 0.5 } },
  { id: 'health', icon: 'health', name: 'Health Insurance', tagline: 'Medicaid is free if you qualify. You probably do.', color: 'green',
    why: "One ER visit without insurance can cost $3,000–$10,000. Health insurance means you pay $0–$50 instead.",
    whoNeeds: "Everyone. If your income is low, Medicaid covers you for free.",
    whatCovers: ["Doctor visits and checkups", "Emergency room visits", "Prescriptions", "Mental health and substance use treatment"],
    whatDoesnt: ["Cosmetic procedures", "Some experimental treatments"],
    avgCost: "$0/month on Medicaid · $0–$50/month on ACA plans", howToGet: "Go to healthcare.gov. You can enroll anytime if newly released from prison or newly homeless.",
    forUs: "If you were recently released from prison or are experiencing homelessness, you qualify for a Special Enrollment Period.",
    costCalc: null },
  { id: 'life', icon: 'family', name: 'Life Insurance', tagline: 'Protects your family if something happens to you.', color: 'blue',
    why: "If you have children or someone who depends on your income, life insurance makes sure they're not left with nothing.",
    whoNeeds: "People with dependents (children, elderly parents).",
    whatCovers: ["Pays a lump sum to your beneficiary when you die", "Term life: covers you for 10–30 years", "Whole life: covers you forever, builds cash value"],
    whatDoesnt: ["Suicide in first 2 years", "Death from illegal activities"],
    avgCost: "$15–$30/month for a healthy 30-year-old (term life)", howToGet: "Start with term life. Try policygenius.com to compare quotes.",
    forUs: "If you have kids, even a $50,000 policy at $15/month gives them a safety net.",
    costCalc: null },
  { id: 'auto', icon: 'car', name: 'Auto Insurance', tagline: 'Required by law in 49 states.', color: 'purple',
    why: "Driving without insurance can result in license suspension, fines, and personal liability for accidents.",
    whoNeeds: "Anyone who drives a car, even occasionally.",
    whatCovers: ["Liability: damage you cause to others", "Collision: damage to your car in an accident", "Comprehensive: theft, weather, fire"],
    whatDoesnt: ["Mechanical breakdowns", "Personal belongings in the car"],
    avgCost: "$80–$150/month (varies by state, driving record, car)", howToGet: "Compare at thegeneral.com or progressive.com — both work with people who have imperfect records.",
    forUs: "If you have a DUI or criminal record, The General and Progressive specialize in high-risk drivers.",
    costCalc: null },
];

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  amber:  { bg: 'bg-primary/10',    border: 'border-primary/30',    text: 'text-primary' },
  green:  { bg: 'bg-accent/10',     border: 'border-accent/30',     text: 'text-accent' },
  blue:   { bg: 'bg-secondary/10',  border: 'border-secondary/30',  text: 'text-secondary' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
};

function InsuranceGuide() {
  const [selected, setSelected] = useState('renters');
  const [propValue, setPropValue] = useState(2000);
  const ins = INSURANCE_TYPES.find(i => i.id === selected)!;
  const c = colorMap[ins.color];

  return (
    <div className="space-y-6">
      <h2 className="font-heading font-bold text-xl text-foreground">Insurance Education</h2>
      <p className="text-muted-foreground text-sm">Insurance explained in plain English — no jargon, no sales pitch.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {INSURANCE_TYPES.map(type => (
          <button key={type.id} onClick={() => setSelected(type.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${selected === type.id ? `${colorMap[type.color].bg} ${colorMap[type.color].border}` : 'border-border bg-muted/30 hover:border-muted-foreground'}`}>
            <div className="text-2xl mb-2">{type.icon}</div>
            <p className="text-foreground font-medium text-sm">{type.name}</p>
            <p className="text-muted-foreground text-xs mt-1">{type.avgCost}</p>
          </button>
        ))}
      </div>
      <div className={`${card} space-y-5`}>
        <div className="flex items-start gap-4">
          <span className="text-4xl">{ins.icon}</span>
          <div><h3 className="text-foreground text-xl font-heading font-bold">{ins.name}</h3><p className={`${c.text} font-medium`}>{ins.tagline}</p></div>
        </div>
        <div><h4 className="text-foreground font-semibold text-sm mb-2">Why you need it</h4><p className="text-muted-foreground text-sm leading-relaxed">{ins.why}</p></div>
        <div className={`${c.bg} border ${c.border} rounded-xl p-4`}>
          <h4 className={`${c.text} font-semibold text-sm mb-1`}>Who needs it</h4>
          <p className="text-muted-foreground text-sm">{ins.whoNeeds}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-accent font-semibold text-sm mb-2">What it covers</h4>
            <ul className="space-y-1">{ins.whatCovers.map((item, i) => <li key={i} className="text-muted-foreground text-sm flex items-start gap-2"><span className="text-accent mt-0.5">•</span>{item}</li>)}</ul>
          </div>
          <div>
            <h4 className="text-destructive font-semibold text-sm mb-2">What it doesn't cover</h4>
            <ul className="space-y-1">{ins.whatDoesnt.map((item, i) => <li key={i} className="text-muted-foreground text-sm flex items-start gap-2"><span className="text-destructive mt-0.5">•</span>{item}</li>)}</ul>
          </div>
        </div>
        <div className="bg-muted/50 rounded-xl p-4">
          <h4 className="text-foreground font-semibold text-sm mb-1">Average cost</h4>
          <p className={`${c.text} font-mono font-bold text-lg`}>{ins.avgCost}</p>
        </div>
        {ins.costCalc && (
          <div className="bg-muted/50 rounded-xl p-4">
            <h4 className="text-foreground font-medium text-sm mb-3">Cost Estimator</h4>
            <div className="flex items-center gap-3 mb-2">
              <label className="text-muted-foreground text-xs whitespace-nowrap">Property value: ${propValue.toLocaleString()}</label>
              <input type="range" min="500" max="10000" step="500" value={propValue} onChange={e => setPropValue(Number(e.target.value))} className="flex-1 accent-primary" />
            </div>
            <p className="text-primary font-mono font-bold">Estimated: ~${(ins.costCalc.base + (propValue / 1000) * ins.costCalc.perThousand).toFixed(0)}/month</p>
          </div>
        )}
        <div className={`${c.bg} border ${c.border} rounded-xl p-4`}>
          <h4 className={`${c.text} font-semibold text-sm mb-2`}>For people using Redreemer</h4>
          <p className="text-muted-foreground text-sm leading-relaxed">{ins.forUs}</p>
        </div>
        <div><h4 className="text-foreground font-semibold text-sm mb-2">How to get it</h4><p className="text-muted-foreground text-sm leading-relaxed">{ins.howToGet}</p></div>
      </div>
    </div>
  );
}

// ── Savings Goals ────────────────────────────────────────────────────────────

interface Goal { id: number; name: string; target: number; saved: number; icon: string; color: string; deadline: string | null; }

const DEFAULT_GOALS: Goal[] = [
  { id: 1, name: 'Emergency Fund',  target: 500,  saved: 200, icon: 'shield', color: '#f59e0b', deadline: '2026-08-01' },
  { id: 2, name: 'Housing Deposit', target: 1000, saved: 200, icon: 'home', color: '#10b981', deadline: '2026-12-01' },
  { id: 3, name: 'Phone Upgrade',   target: 200,  saved: 80,  icon: 'phone', color: '#6366f1', deadline: '2026-06-01' },
];

const GOAL_ICONS = ['Goal', 'Home', 'Car', 'Phone', 'Travel', 'School', 'Health', 'Safety', 'Personal', 'Pet'];

function GoalCard({ goal, onUpdate, onDelete }: { goal: Goal; onUpdate: (id: number, v: number) => void; onDelete: (id: number) => void }) {
  const [addAmt, setAddAmt] = useState('');
  const pct = goal.target > 0 ? Math.min((goal.saved / goal.target) * 100, 100) : 0;
  const remaining = goal.target - goal.saved;
  const daysLeft = goal.deadline ? Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000)) : null;
  const dailyNeeded = daysLeft && daysLeft > 0 ? (remaining / daysLeft).toFixed(2) : null;

  return (
    <div className={card}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
            {goal.icon.slice(0, 2)}
          </div>
          <div>
            <h3 className="text-foreground font-semibold">{goal.name}</h3>
            {goal.deadline && <p className="text-muted-foreground text-xs">{daysLeft && daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}</p>}
          </div>
        </div>
        <button onClick={() => onDelete(goal.id)} className="text-muted-foreground hover:text-destructive text-xs transition-colors">✕</button>
      </div>
      <div className="w-full bg-muted rounded-full h-3 mb-2">
        <div className="h-3 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: pct >= 100 ? '#22c55e' : goal.color }} />
      </div>
      <div className="flex justify-between mb-4">
        <span className="text-foreground font-mono font-bold">${goal.saved.toLocaleString()}</span>
        <span className="text-muted-foreground text-sm">of ${goal.target.toLocaleString()} ({Math.round(pct)}%)</span>
      </div>
      {pct < 100 && dailyNeeded && <p className="text-muted-foreground text-xs mb-4">Save ${dailyNeeded}/day to hit your deadline</p>}
      {pct >= 100 && <div className="bg-accent/10 border border-accent/20 rounded-lg p-2 mb-4 text-center"><span className="text-accent text-sm font-semibold">Goal reached!</span></div>}
      <div className="flex gap-2">
        <input type="number" placeholder="Add $" value={addAmt} onChange={e => setAddAmt(e.target.value)} className={`flex-1 ${inputCls}`} />
        <button onClick={() => { const amt = parseFloat(addAmt); if (amt > 0) { onUpdate(goal.id, Math.min(goal.saved + amt, goal.target)); setAddAmt(''); } }}
          className="bg-muted hover:bg-muted/80 text-foreground px-3 py-1.5 rounded-lg text-sm transition-colors">Save</button>
      </div>
    </div>
  );
}

function SavingsGoals() {
  const [goals, setGoals] = useState<Goal[]>(DEFAULT_GOALS);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', icon: 'Goal', deadline: '' });
  const [showForm, setShowForm] = useState(false);

  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const totalTarget = goals.reduce((s, g) => s + g.target, 0);

  function addGoal(e: FormEvent) {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target) return;
    setGoals(p => [...p, { id: Date.now(), name: newGoal.name, target: parseFloat(newGoal.target), saved: 0, icon: newGoal.icon, color: '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0'), deadline: newGoal.deadline || null }]);
    setNewGoal({ name: '', target: '', icon: 'Goal', deadline: '' });
    setShowForm(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl text-foreground">Savings Goals</h2>
        <button onClick={() => setShowForm(v => !v)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm transition-colors">+ New Goal</button>
      </div>
      <div className={card}>
        <div className="flex justify-between mb-2">
          <span className="text-foreground font-medium">Total Saved Across All Goals</span>
          <span className="text-primary font-mono font-bold">${totalSaved.toLocaleString()} / ${totalTarget.toLocaleString()}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-3">
          <div className="h-3 rounded-full bg-primary transition-all duration-700" style={{ width: `${totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0}%` }} />
        </div>
      </div>
      {showForm && (
        <form onSubmit={addGoal} className={`${card} space-y-4`}>
          <h3 className="font-heading font-semibold text-foreground">New Savings Goal</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Goal name" value={newGoal.name} onChange={e => setNewGoal(p => ({ ...p, name: e.target.value }))} className={inputCls} />
            <div className="flex items-center gap-2"><span className="text-muted-foreground">$</span><input type="number" placeholder="Target amount" value={newGoal.target} onChange={e => setNewGoal(p => ({ ...p, target: e.target.value }))} className={`flex-1 ${inputCls}`} /></div>
            <input type="date" value={newGoal.deadline} onChange={e => setNewGoal(p => ({ ...p, deadline: e.target.value }))} className={inputCls} />
            <div className="flex flex-wrap gap-2">{GOAL_ICONS.map(icon => <button key={icon} type="button" onClick={() => setNewGoal(p => ({ ...p, icon }))} className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${newGoal.icon === icon ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}>{icon}</button>)}</div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 py-2 rounded-lg text-sm transition-colors">Create Goal</button>
            <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground px-4 py-2 text-sm transition-colors">Cancel</button>
          </div>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map(goal => (
          <GoalCard key={goal.id} goal={goal}
            onUpdate={(id, v) => setGoals(p => p.map(g => g.id === id ? { ...g, saved: v } : g))}
            onDelete={id => setGoals(p => p.filter(g => g.id !== id))}
          />
        ))}
      </div>
      <div className={tipCls}>
        <p className="text-primary font-semibold text-sm mb-1">Automate it</p>
        <p className="text-muted-foreground text-sm">Once you have a Bank On account, set up an automatic transfer of even $5/week to savings. Automation removes the decision — you save without thinking about it.</p>
      </div>
    </div>
  );
}

// ── Risk Score ───────────────────────────────────────────────────────────────

interface RiskQuestion {
  id: string; category: string; question: string;
  options: { label: string; score: number }[];
}

const RISK_QUESTIONS: RiskQuestion[] = [
  { id: 'housing', category: 'Housing Stability', question: 'What is your current housing situation?',
    options: [{ label: 'Stable housing (lease or owned)', score: 0 }, { label: 'Staying with family/friends temporarily', score: 2 }, { label: 'Shelter or transitional housing', score: 3 }, { label: 'Unsheltered / no stable housing', score: 5 }] },
  { id: 'income', category: 'Income Stability', question: 'How stable is your income right now?',
    options: [{ label: 'Steady job or benefits', score: 0 }, { label: 'Part-time or gig work', score: 2 }, { label: 'No income, actively looking', score: 4 }, { label: 'No income and not looking', score: 5 }] },
  { id: 'savings', category: 'Emergency Savings', question: 'How much do you have saved for emergencies?',
    options: [{ label: '$500 or more', score: 0 }, { label: '$200–$499', score: 1 }, { label: '$1–$199', score: 3 }, { label: 'Nothing saved', score: 5 }] },
  { id: 'banking', category: 'Banking Access', question: 'Do you have a bank account?',
    options: [{ label: 'Yes, checking and savings', score: 0 }, { label: 'Yes, but only a prepaid card', score: 2 }, { label: 'No bank account', score: 4 }, { label: 'Blacklisted by ChexSystems', score: 5 }] },
  { id: 'id', category: 'Documentation', question: 'Do you have a valid government-issued ID?',
    options: [{ label: 'Yes, valid state ID or driver\'s license', score: 0 }, { label: 'Expired ID', score: 2 }, { label: 'No ID currently', score: 4 }] },
  { id: 'support', category: 'Support Network', question: 'Do you have people you can rely on in a crisis?',
    options: [{ label: 'Strong network (family, friends, caseworker)', score: 0 }, { label: 'Some support but limited', score: 2 }, { label: 'Very little support', score: 4 }, { label: 'No support network', score: 5 }] },
  { id: 'debt', category: 'Debt Burden', question: 'How much debt do you currently have?',
    options: [{ label: 'No significant debt', score: 0 }, { label: 'Under $1,000', score: 1 }, { label: '$1,000–$10,000', score: 3 }, { label: 'Over $10,000', score: 5 }] },
  { id: 'insurance', category: 'Insurance Coverage', question: 'Do you have health insurance?',
    options: [{ label: 'Yes, full coverage', score: 0 }, { label: 'Yes, but limited coverage', score: 1 }, { label: 'No health insurance', score: 4 }] },
];

const RISK_LEVELS = [
  { max: 8,  label: 'Low Risk',    color: 'text-accent',      bg: 'bg-accent/10',      border: 'border-accent/30',      bar: '#22c55e', desc: "You have a solid foundation. Focus on building savings and protecting what you have." },
  { max: 18, label: 'Medium Risk', color: 'text-primary',     bg: 'bg-primary/10',     border: 'border-primary/30',     bar: '#f59e0b', desc: "You have some vulnerabilities. A few key steps can significantly improve your stability." },
  { max: 40, label: 'High Risk',   color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', bar: '#ef4444', desc: "You're in a vulnerable position right now. That's exactly what Redreemer is here for. Let's tackle this one step at a time." },
];

function RiskScore() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const { addAlert } = useAIAlerts();

  const totalScore = useMemo(() =>
    Object.entries(answers).reduce((sum, [id, optIdx]) => {
      const q = RISK_QUESTIONS.find(q => q.id === id);
      return sum + (q?.options[optIdx as number]?.score || 0);
    }, 0), [answers]);

  const maxScore = RISK_QUESTIONS.reduce((s, q) => s + Math.max(...q.options.map(o => o.score)), 0);
  const riskLevel = RISK_LEVELS.find(r => totalScore <= r.max) ?? RISK_LEVELS[2];
  const pct = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
  const answered = Object.keys(answers).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl text-foreground">Financial Risk Assessment</h2>
        {submitted && <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="text-muted-foreground hover:text-foreground text-sm transition-colors">Retake</button>}
      </div>
      {!submitted ? (
        <>
          <p className="text-muted-foreground text-sm">Answer {RISK_QUESTIONS.length} questions to understand your financial risk level.</p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div className="h-2 rounded-full bg-primary transition-all duration-300" style={{ width: `${(answered / RISK_QUESTIONS.length) * 100}%` }} />
            </div>
            <span className="text-muted-foreground text-xs whitespace-nowrap">{answered}/{RISK_QUESTIONS.length}</span>
          </div>
          <div className="space-y-4">
            {RISK_QUESTIONS.map(q => (
              <div key={q.id} className={card}>
                <p className="text-primary text-xs font-medium mb-1">{q.category}</p>
                <p className="text-foreground font-medium mb-3">{q.question}</p>
                <div className="space-y-2">
                  {q.options.map((opt, i) => (
                    <button key={i} onClick={() => setAnswers(p => ({ ...p, [q.id]: i }))}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${answers[q.id] === i ? 'bg-primary/20 border border-primary/50 text-foreground' : 'bg-muted/50 hover:bg-muted text-muted-foreground border border-transparent'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setSubmitted(true)} disabled={answered < RISK_QUESTIONS.length}
            className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-bold py-3 rounded-xl text-base transition-colors">
            {answered < RISK_QUESTIONS.length ? `Answer all ${RISK_QUESTIONS.length} questions` : 'See My Risk Score'}
          </button>
        </>
      ) : (
        <>
          <div className={`${riskLevel.bg} border ${riskLevel.border} rounded-2xl p-8 text-center`}>
            <p className="text-muted-foreground text-sm mb-2">Your Financial Risk Level</p>
            <p className={`text-5xl font-heading font-bold ${riskLevel.color} mb-2`}>{riskLevel.label}</p>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">{riskLevel.desc}</p>
          </div>
          <div className={card}>
            <div className="flex justify-between mb-2">
              <span className="text-foreground font-medium">Risk Score</span>
              <span className={`font-mono font-bold ${riskLevel.color}`}>{totalScore} / {maxScore}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-4">
              <div className="h-4 rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: riskLevel.bar }} />
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground"><span>Low Risk</span><span>High Risk</span></div>
          </div>
          <div className={card}>
            <h3 className="font-heading font-semibold text-foreground mb-4">Category Breakdown</h3>
            <div className="space-y-3">
              {RISK_QUESTIONS.map(q => {
                const optIdx = answers[q.id] ?? 0;
                const score = q.options[optIdx]?.score || 0;
                const maxQ = Math.max(...q.options.map(o => o.score));
                const qPct = maxQ > 0 ? (score / maxQ) * 100 : 0;
                const color = score === 0 ? '#22c55e' : score <= 2 ? '#f59e0b' : '#ef4444';
                return (
                  <div key={q.id}>
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground text-xs">{q.category}</span>
                      <span className="text-xs" style={{ color }}>{q.options[optIdx]?.label}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${qPct}%`, backgroundColor: color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <AIInsightPanel
            tool="risk"
            data={{ score: totalScore, answers: Object.fromEntries(Object.entries(answers).map(([id, idx]) => [id, RISK_QUESTIONS.find(q => q.id === id)?.options[idx]?.label || ''])) }}
          />
        </>
      )}
    </div>
  );
}

// ── Financial Literacy ───────────────────────────────────────────────────────

interface LiteracyModule {
  id: string; icon: string; title: string; duration: string; category: string; color: string;
  intro: string; sections: { heading: string; content: string }[];
}

const MODULES: LiteracyModule[] = [
  { id: 'banking', icon: 'bank', title: 'How Bank Accounts Work', duration: '3 min', category: 'Banking', color: 'amber',
    intro: "A bank account is a safe place to store money, receive paychecks, and build financial history. Without one, you're paying fees to cash checks and carrying cash that can be stolen.",
    sections: [
      { heading: 'Types of accounts', content: '**Checking account** — For everyday spending. Use a debit card to pay for things.\n\n**Savings account** — For money you\'re setting aside. Earns a small amount of interest.\n\n**Bank On accounts** — Special accounts with no minimum balance, no monthly fees, and no ChexSystems check.' },
      { heading: 'What ChexSystems is', content: 'ChexSystems is like a credit report for bank accounts. If you\'ve had a bank account closed for overdrafts or fraud, you may be on ChexSystems.\n\nBank On certified accounts don\'t use ChexSystems. That\'s why they\'re the right starting point.' },
      { heading: 'How to open a Bank On account', content: '1. Go to bankonsites.org and find a location near you\n2. Bring your state ID and a mailing address (a shelter address works)\n3. Takes about 20 minutes\n4. No credit check, no minimum deposit, no monthly fees' },
    ] },
  { id: 'credit', icon: 'credit', title: 'Understanding Credit Scores', duration: '4 min', category: 'Credit', color: 'blue',
    intro: "A credit score is a number between 300 and 850 that tells lenders how likely you are to repay debt. It affects whether you can rent an apartment, get a phone plan, or borrow money.",
    sections: [
      { heading: 'What makes up your score', content: '**Payment history (35%)** — Do you pay on time? This is the biggest factor.\n\n**Credit utilization (30%)** — How much of your available credit are you using? Keep it under 30%.\n\n**Length of credit history (15%)** — How long have you had credit? Older is better.' },
      { heading: 'How to build credit from zero', content: '1. **Secured credit card** — You deposit $200, that becomes your credit limit.\n\n2. **Credit-builder loan** — A small loan where the money goes into a savings account.\n\n3. **Pay every bill on time** — Even phone bills and utilities can now be reported to credit bureaus.' },
      { heading: 'What a good score unlocks', content: '**620+** — Most landlords will rent to you\n**650+** — Better phone plans, some credit cards\n**700+** — Good interest rates on loans\n**750+** — Best rates, premium credit cards' },
    ] },
  { id: 'snap', icon: 'food', title: 'SNAP Benefits Explained', duration: '3 min', category: 'Benefits', color: 'green',
    intro: "SNAP provides monthly money for food. The average benefit is $200/month. If you qualify, this frees up cash for savings and other needs.",
    sections: [
      { heading: 'Do you qualify?', content: 'You likely qualify for SNAP if:\n- Your monthly income is under $1,580 (single person)\n- You\'re experiencing homelessness\n- You were recently released from prison\n- You\'re receiving other government assistance' },
      { heading: 'How to apply', content: '1. Go to benefits.gov or your state\'s SNAP website\n2. Apply online — takes about 20 minutes\n3. You\'ll get an interview (usually by phone)\n4. If approved, you receive an EBT card within 30 days\n5. Emergency SNAP can be approved in 7 days' },
      { heading: 'What SNAP covers', content: 'SNAP covers most food items at grocery stores. It does NOT cover:\n- Hot prepared food (restaurant meals)\n- Alcohol or tobacco\n- Non-food items (soap, paper products)\n\nThe average benefit is $200/month for a single person.' },
    ] },
  { id: 'budgeting', icon: 'savings', title: 'Budgeting When You Have Almost Nothing', duration: '4 min', category: 'Budgeting', color: 'purple',
    intro: "Budgeting feels impossible when you're surviving day to day. But even with $50, a budget helps you make intentional decisions instead of watching money disappear.",
    sections: [
      { heading: 'The zero-based budget', content: 'Give every dollar a job. If you have $200 this week:\n- $80 food\n- $30 transport\n- $50 phone\n- $40 savings\n\nTotal: $200. Every dollar has a purpose.' },
      { heading: 'The 50/30/20 rule', content: '**50% needs** — Housing, food, transport, phone, healthcare\n**30% wants** — Anything that isn\'t strictly necessary\n**20% savings and debt** — Emergency fund, debt payoff\n\nOn $1,000/month: $500 needs, $300 wants, $200 savings.' },
      { heading: 'The one rule that changes everything', content: '**Pay yourself first.** Before you spend anything, move your savings amount to a separate account.\n\nIf you wait until the end of the month to save "whatever\'s left," there will never be anything left.' },
    ] },
];

const litColorMap: Record<string, { border: string; text: string }> = {
  amber:  { border: 'border-primary/30',    text: 'text-primary' },
  blue:   { border: 'border-secondary/30',  text: 'text-secondary' },
  green:  { border: 'border-accent/30',     text: 'text-accent' },
  purple: { border: 'border-purple-500/30', text: 'text-purple-400' },
};

function ModuleReader({ module, onComplete, onBack }: { module: LiteracyModule; onComplete: () => void; onBack: () => void }) {
  const [section, setSection] = useState(0);
  const total = module.sections.length;

  function renderContent(text: string) {
    return text.split('\n\n').map((para, i) => {
      const formatted = para.replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground">$1</strong>');
      return <p key={i} className="text-muted-foreground text-sm leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: formatted }} />;
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors text-sm">← Back</button>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground text-sm">{module.category}</span>
      </div>
      <div className={card}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
            <BookOpen size={22} />
          </div>
          <div><h2 className="text-foreground text-xl font-heading font-bold">{module.title}</h2><p className="text-muted-foreground text-sm">{module.duration} read</p></div>
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed italic border-l-2 border-primary pl-4">{module.intro}</p>
      </div>
      <div className="flex gap-2">
        {module.sections.map((_, i) => (
          <button key={i} onClick={() => setSection(i)} className={`flex-1 h-1.5 rounded-full transition-colors ${i <= section ? 'bg-primary' : 'bg-muted'}`} />
        ))}
      </div>
      <div className={card}>
        <h3 className="text-primary font-semibold mb-4">{module.sections[section].heading}</h3>
        {renderContent(module.sections[section].content)}
      </div>
      <div className="flex gap-3">
        {section > 0 && <button onClick={() => setSection(s => s - 1)} className="flex-1 bg-muted hover:bg-muted/80 text-foreground py-3 rounded-xl text-sm transition-colors">← Previous</button>}
        {section < total - 1
          ? <button onClick={() => setSection(s => s + 1)} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl text-sm transition-colors">Next →</button>
          : <button onClick={onComplete} className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3 rounded-xl text-sm transition-colors">✓ Mark Complete</button>
        }
      </div>
    </div>
  );
}

function FinancialLiteracy() {
  const [activeModule, setActiveModule] = useState<LiteracyModule | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState('All');

  const categories = ['All', ...Array.from(new Set(MODULES.map(m => m.category)))];
  const filtered = filter === 'All' ? MODULES : MODULES.filter(m => m.category === filter);

  if (activeModule) {
    return <ModuleReader module={activeModule} onBack={() => setActiveModule(null)} onComplete={() => { setCompleted(p => new Set([...p, activeModule.id])); setActiveModule(null); }} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading font-bold text-xl text-foreground">Financial Literacy</h2>
        <span className="text-muted-foreground text-sm">{completed.size}/{MODULES.length} completed</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div className="h-2 rounded-full bg-primary transition-all duration-700" style={{ width: `${(completed.size / MODULES.length) * 100}%` }} />
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${filter === cat ? 'bg-primary text-primary-foreground font-medium' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
            {cat}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(module => {
          const c = litColorMap[module.color];
          const done = completed.has(module.id);
          return (
            <button key={module.id} onClick={() => setActiveModule(module)}
              className={`text-left p-5 rounded-xl border transition-all hover:scale-[1.01] ${done ? 'border-accent/30 bg-accent/5' : `${c.border} bg-muted/20`}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <BookOpen size={18} />
                </div>
                {done && <span className="text-accent text-xs bg-accent/20 px-2 py-1 rounded-full">✓ Done</span>}
              </div>
              <p className="text-foreground font-semibold mb-1">{module.title}</p>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium ${c.text}`}>{module.category}</span>
                <span className="text-muted-foreground text-xs">·</span>
                <span className="text-muted-foreground text-xs">{module.duration} read</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Insurance Education (State Farm track) ───────────────────────────────────
function InsuranceEducation() {
  const [activeModule, setActiveModule] = useState(0);
  const [loanAmount, setLoanAmount] = useState(300);
  const [loanFee, setLoanFee] = useState(45);
  const [propertyValue, setPropertyValue] = useState(3000);

  const apr = loanAmount > 0 ? Math.round((loanFee / loanAmount) * 26 * 100) : 0;
  const totalRepay = loanAmount + loanFee;
  const rentersMonthly = Math.round(11 + (propertyValue / 1000) * 0.5);

  const modules = [
    { title: 'Health Insurance Basics', icon: <Shield size={20} />, color: 'bg-emerald-500/20 text-emerald-400' },
    { title: 'Renters Insurance', icon: <ShieldCheck size={20} />, color: 'bg-amber-500/20 text-amber-400' },
    { title: 'Spotting Predatory Lenders', icon: <AlertTriangle size={20} />, color: 'bg-red-500/20 text-red-400' },
    { title: 'Building Credit from Zero', icon: <Activity size={20} />, color: 'bg-indigo-500/20 text-indigo-400' },
  ];

  const card = 'glass-card !p-5 flourish-card';
  const inputCls = 'bg-muted border border-border text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500';

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-heading font-bold text-xl text-foreground">Insurance Education</h2>
          <p className="text-muted-foreground text-sm mt-1">Health coverage, renters insurance, and protection basics</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
          <ShieldCheck size={12} /> Powered by State Farm
        </div>
      </div>

      {/* Module tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {modules.map((m, i) => (
          <button key={i} onClick={() => setActiveModule(i)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${activeModule === i ? 'border-emerald-500 bg-emerald-500/10' : 'border-border bg-muted/30 hover:border-muted-foreground'}`}>
            <div className={`w-10 h-10 rounded-full ${m.color} flex items-center justify-center mb-2`}><BookOpen size={18} /></div>
            <p className="text-foreground font-medium text-xs">{m.title}</p>
          </button>
        ))}
      </div>

      {/* Module 0: Health Insurance */}
      {activeModule === 0 && (
        <div className="space-y-4">
          <div className={card}>
            <h3 className="font-heading font-bold text-foreground mb-3">Health Insurance Basics</h3>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Premium</strong> — What comes out of your paycheck each month. Even $0 plans exist through Medicaid.</p>
              <p><strong className="text-foreground">Deductible</strong> — What you pay before insurance kicks in. A $1,000 deductible means you pay the first $1,000 of medical bills.</p>
              <p><strong className="text-foreground">Copay</strong> — Your cost per doctor visit, usually $20–$40. Insurance pays the rest.</p>
              <p><strong className="text-foreground">Out-of-pocket max</strong> — The most you'll ever pay in a year. After that, insurance covers 100%.</p>
            </div>
          </div>
          <div className={`${card} bg-emerald-500/5 border-emerald-500/20`}>
            <p className="text-emerald-400 font-semibold text-sm mb-2">If you qualify for Medicaid (AHCCCS in Arizona)</p>
            <p className="text-muted-foreground text-sm mb-3">Free health insurance for people with low income. If you're experiencing homelessness or recently released from prison, you likely qualify.</p>
            <a href="https://healthearizonaplus.gov" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">
              Check if you qualify for AHCCCS <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}

      {/* Module 1: Renters Insurance */}
      {activeModule === 1 && (
        <div className="space-y-4">
          <div className={card}>
            <h3 className="font-heading font-bold text-foreground mb-3">Why You Need Renters Insurance</h3>
            <p className="text-muted-foreground text-sm mb-4">Your landlord's insurance covers the building — not your belongings. If there's a fire, flood, or theft, you lose everything without renters insurance.</p>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
              <p className="text-amber-400 font-semibold text-sm mb-1">Cost breakdown</p>
              <p className="text-muted-foreground text-sm">$15/month = $180/year protects $5,000+ in belongings</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">What would it cost to replace your stuff? ${propertyValue.toLocaleString()}</label>
                <input type="range" min="500" max="15000" step="500" value={propertyValue} onChange={e => setPropertyValue(Number(e.target.value))} className="w-full accent-emerald-500" />
              </div>
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-muted-foreground text-xs mb-1">Estimated monthly premium</p>
                <p className="text-emerald-400 font-mono font-bold text-2xl">~${rentersMonthly}/month</p>
              </div>
            </div>
          </div>
          <div className={`${card} bg-amber-500/5 border-amber-500/20`}>
            <p className="text-amber-400 font-semibold text-sm mb-2">Get a quote from State Farm</p>
            <p className="text-muted-foreground text-sm mb-3">Takes 10 minutes. Call 1-800-782-8332 or get a quote online.</p>
            <a href="https://statefarm.com" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-navy-900 text-sm font-semibold transition-colors">
              Get a State Farm Quote <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}

      {/* Module 2: Predatory Lenders */}
      {activeModule === 2 && (
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm font-medium">If you have been offered a payday loan, text our number immediately before signing anything.</p>
          </div>
          <div className={card}>
            <h3 className="font-heading font-bold text-foreground mb-3">APR Calculator — See the Real Cost</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Loan amount</label>
                <div className="flex items-center gap-2"><span className="text-muted-foreground">$</span><input type="number" value={loanAmount} onChange={e => setLoanAmount(Number(e.target.value))} className={`${inputCls} w-full`} /></div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Fee (2-week loan)</label>
                <div className="flex items-center gap-2"><span className="text-muted-foreground">$</span><input type="number" value={loanFee} onChange={e => setLoanFee(Number(e.target.value))} className={`${inputCls} w-full`} /></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-red-500/10 rounded-xl p-3 text-center">
                <p className="text-muted-foreground text-xs mb-1">Real APR</p>
                <p className="text-red-400 font-mono font-bold text-2xl">{apr}%</p>
              </div>
              <div className="bg-muted/50 rounded-xl p-3 text-center">
                <p className="text-muted-foreground text-xs mb-1">You repay</p>
                <p className="text-foreground font-mono font-bold text-2xl">${totalRepay}</p>
              </div>
            </div>
          </div>
          <div className={card}>
            <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Better Options</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2"><span className="text-emerald-400 font-bold">1.</span><span className="text-muted-foreground">Call 211 — emergency assistance funds available</span></div>
              <div className="flex items-start gap-2"><span className="text-emerald-400 font-bold">2.</span><span className="text-muted-foreground">Ask your employer for a paycheck advance (free)</span></div>
              <div className="flex items-start gap-2"><span className="text-emerald-400 font-bold">3.</span><span className="text-muted-foreground">Credit unions offer emergency loans at ~18% APR vs {apr}%</span></div>
            </div>
          </div>
        </div>
      )}

      {/* Module 3: Building Credit */}
      {activeModule === 3 && (
        <div className="space-y-4">
          <div className={card}>
            <h3 className="font-heading font-bold text-foreground mb-3">Building Credit from Zero</h3>
            <p className="text-muted-foreground text-sm mb-4">You can go from no credit to a 700+ score in 24 months with consistent habits.</p>
            <div className="space-y-3">
              {[
                { month: 'Month 1', action: 'Get a secured credit card ($200 deposit)', score: '—' },
                { month: 'Month 3', action: 'First payment reported to credit bureaus', score: '~580' },
                { month: 'Month 6', action: 'Score appears — keep utilization under 30%', score: '~600' },
                { month: 'Month 12', action: 'Upgrade to unsecured card', score: '~640' },
                { month: 'Month 24', action: 'Consistent payments, low utilization', score: '700+' },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{step.month}</p>
                    <p className="text-foreground text-sm">{step.action}</p>
                  </div>
                  <span className="text-emerald-400 font-mono text-sm font-bold">{step.score}</span>
                </div>
              ))}
            </div>
          </div>
          <a href="https://azcreditunion.org" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
            Find a credit union near you <ExternalLink size={14} />
          </a>
        </div>
      )}
    </div>
  );
}
