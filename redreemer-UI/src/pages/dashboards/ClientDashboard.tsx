import { useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import PhoneSimulator from '@/components/PhoneSimulator';
import { WellnessContent } from '@/pages/FinancialWellness';
import CrisisModal from '@/components/CrisisModal';
import { useAuth } from '@/context/AuthContext';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Home, Wallet, Shield, TrendingDown, Target, BookOpen,
  Activity, Settings, User, MessageSquare,
  CheckCircle, ChevronRight, BarChart2, ShieldCheck,
  TrendingUp, AlertCircle, Star, Zap, AlertTriangle,
  Utensils, Building2, DollarSign, Briefcase, HelpCircle,
  ChevronDown, ChevronUp, Heart, Phone
} from 'lucide-react';

// ── Notification toggle ───────────────────────────────────────────────────────
function NotificationToggle({ label, defaultOn }: { label: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-700">{label}</span>
      <button onClick={() => setOn(v => !v)}
        className={`w-11 h-6 rounded-full relative transition-colors ${on ? 'bg-yellow-300' : 'bg-gray-200'}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? 'right-0.5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

// ── Health score ring ─────────────────────────────────────────────────────────
function HealthRing({ score, size = 120 }: { score: number; size?: number }) {
  const r = (size / 2) - 10;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? '#16a34a' : score >= 40 ? '#f5e000' : '#ef4444';
  const label = score >= 70 ? 'Strong' : score >= 40 ? 'Building' : 'Starting';
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono font-bold text-2xl text-gray-900">{score}</span>
          <span className="text-[10px] text-gray-500 font-medium">/100</span>
        </div>
      </div>
      <span className="text-xs font-semibold mt-1" style={{ color }}>{label}</span>
    </div>
  );
}

// ── Step pill ─────────────────────────────────────────────────────────────────
function StepPill({ step, current }: { step: number; current: number }) {
  const done = step < current;
  const active = step === current;
  return (
    <div className={`flex flex-col items-center gap-1 ${step > current ? 'opacity-30' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
        done ? 'bg-green-500 text-white' : active ? 'bg-yellow-300 text-gray-900 ring-4 ring-yellow-100' : 'bg-gray-100 text-gray-400'
      }`}>
        {done ? <CheckCircle size={14} /> : step}
      </div>
    </div>
  );
}

// ── Quick action button ───────────────────────────────────────────────────────
function QuickAction({ icon: Icon, label, color, bg, onClick }: {
  icon: typeof Home; label: string; color: string; bg: string; onClick: () => void;
}) {
  return (
    <button onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-md transition-all group bg-white">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
        <Icon size={22} style={{ color }} />
      </div>
      <span className="text-xs font-semibold text-gray-800 text-center leading-tight">{label}</span>
    </button>
  );
}

// ── Scam warning banner ───────────────────────────────────────────────────────
function ScamWarning({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
      <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-800">Watch out for scams</p>
        <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
          Redreemer is always free. No one from Redreemer will ever ask for money, gift cards, or your Social Security number. If someone does — it's a scam.
        </p>
      </div>
      <button onClick={onDismiss} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
        <ChevronDown size={16} />
      </button>
    </div>
  );
}

// ── Nav definitions ───────────────────────────────────────────────────────────
const NAV_HOMELESS = [
  { id: 'home',      icon: Home,          label: 'My Journey' },
  { id: 'budget',    icon: Wallet,        label: 'Budget' },
  { id: 'emergency', icon: Shield,        label: 'Emergency Fund' },
  { id: 'networth',  icon: BarChart2,     label: 'Net Worth' },
  { id: 'goals',     icon: Target,        label: 'Savings Goals' },
  { id: 'learn',     icon: BookOpen,      label: 'Learn' },
  { id: 'risk',      icon: Activity,      label: 'Risk Score' },
  { id: 'insurance', icon: ShieldCheck,   label: 'Insurance' },
  { id: 'community', icon: BarChart2,     label: 'Community Data' },
  { id: 'demo',      icon: MessageSquare, label: 'SMS' },
  { id: 'profile',   icon: User,          label: 'Profile' },
  { id: 'settings',  icon: Settings,      label: 'Settings' },
];

const NAV_REENTRY = [
  { id: 'home',      icon: Home,          label: 'My Journey' },
  { id: 'debt',      icon: TrendingDown,  label: 'Debt Payoff' },
  { id: 'budget',    icon: Wallet,        label: 'Budget' },
  { id: 'emergency', icon: Shield,        label: 'Emergency Fund' },
  { id: 'networth',  icon: BarChart2,     label: 'Net Worth' },
  { id: 'goals',     icon: Target,        label: 'Savings Goals' },
  { id: 'learn',     icon: BookOpen,      label: 'Learn' },
  { id: 'risk',      icon: Activity,      label: 'Risk Score' },
  { id: 'insurance', icon: ShieldCheck,   label: 'Insurance' },
  { id: 'community', icon: BarChart2,     label: 'Community Data' },
  { id: 'demo',      icon: MessageSquare, label: 'SMS' },
  { id: 'profile',   icon: User,          label: 'Profile' },
  { id: 'settings',  icon: Settings,      label: 'Settings' },
];

const STEPS_HOMELESS = [
  { label: 'Connect to Redreemer',         hint: 'You\'re here — welcome' },
  { label: 'Get a free state ID',          hint: 'Unlocks banking & benefits' },
  { label: 'Get shelter address for mail', hint: 'Required for accounts' },
  { label: 'Open Bank On account',         hint: 'No credit check needed' },
  { label: 'Enroll in benefits',           hint: 'SNAP, Medicaid & more' },
  { label: 'Find stable income',           hint: 'Ban the Box employers' },
  { label: 'Save first $200',              hint: 'Your emergency buffer' },
  { label: 'Save $500 housing deposit',    hint: 'Full independence' },
];

const STEPS_REENTRY = [
  { label: 'Connect to Redreemer',       hint: 'You\'re here — welcome' },
  { label: 'Complete parole check-in',   hint: 'Day 1 priority' },
  { label: 'Get free state ID',          hint: 'Unlocks everything' },
  { label: 'Open Bank On account',       hint: 'No credit check needed' },
  { label: 'Enroll in benefits',         hint: 'SNAP, Medicaid & more' },
  { label: 'Find Ban the Box employer',  hint: 'Fair chance hiring' },
  { label: 'Start paying court debt',    hint: 'Legal aid can help' },
  { label: 'Save first $500',            hint: 'Your emergency fund' },
];

const TOOLS = [
  { tab: 'budget',    icon: Wallet,      label: 'Budget',         desc: 'Track spending',       color: '#f5e000', bg: '#fefce8', stat: '$1,800/mo', statLabel: 'income tracked' },
  { tab: 'emergency', icon: Shield,      label: 'Emergency Fund', desc: 'Build safety net',     color: '#16a34a', bg: '#f0fdf4', stat: '34%',       statLabel: 'funded' },
  { tab: 'goals',     icon: Target,      label: 'Savings Goals',  desc: 'Hit milestones',       color: '#16a34a', bg: '#f0fdf4', stat: '3',         statLabel: 'active goals' },
  { tab: 'debt',      icon: TrendingDown,label: 'Debt Payoff',    desc: 'Clear what you owe',   color: '#ef4444', bg: '#fef2f2', stat: '$13,460',   statLabel: 'total debt' },
  { tab: 'learn',     icon: BookOpen,    label: 'Learn',          desc: 'Financial literacy',   color: '#6366f1', bg: '#eef2ff', stat: '0/6',       statLabel: 'modules done' },
  { tab: 'risk',      icon: Activity,    label: 'Risk Score',     desc: 'Know your health',     color: '#f5e000', bg: '#fefce8', stat: '—',         statLabel: 'not assessed' },
  { tab: 'networth',  icon: BarChart2,   label: 'Net Worth',      desc: 'Assets vs liabilities',color: '#6366f1', bg: '#eef2ff', stat: '-$12,840',  statLabel: 'current' },
  { tab: 'insurance', icon: ShieldCheck, label: 'Insurance',      desc: 'Protect yourself',     color: '#16a34a', bg: '#f0fdf4', stat: 'Free',      statLabel: 'Medicaid eligible' },
  { tab: 'community', icon: BarChart2,   label: 'Community Data', desc: 'AZ financial gaps',    color: '#6366f1', bg: '#eef2ff', stat: '19%',       statLabel: 'unbanked/underbanked' },
];

export default function ClientDashboard() {
  const [tab, setTab] = useState('home');
  const { user } = useAuth0();
  const { userType } = useAuth();
  const [showCrisis, setShowCrisis] = useState(false);
  const [showScamWarning, setShowScamWarning] = useState(true);
  const [showAllTools, setShowAllTools] = useState(false);

  const isReentry = userType === 'reentry';
  const firstName = user?.given_name || user?.name?.split(' ')[0] || 'Friend';
  const steps = isReentry ? STEPS_REENTRY : STEPS_HOMELESS;
  const nav = isReentry ? NAV_REENTRY : NAV_HOMELESS;
  const completedSteps = 2; // mock
  const currentStep = completedSteps + 1;
  const healthScore = 38; // mock
  const demoPhone = isReentry ? '+15550000002' : '+15550000001';
  const demoClientId = isReentry ? '2' : '1';

  // Completed step labels for emotional progress message
  const doneLabels = steps.slice(0, completedSteps).map(s => s.label);

  // Quick actions — map to tabs or crisis
  const quickActions = [
    { icon: Building2,   label: 'Find Shelter',  color: '#6366f1', bg: '#eef2ff', action: () => setTab('demo') },
    { icon: Utensils,    label: 'Get Food',       color: '#16a34a', bg: '#f0fdf4', action: () => setTab('demo') },
    { icon: DollarSign,  label: 'Get Money Help', color: '#f5e000', bg: '#fefce8', action: () => setTab('budget') },
    { icon: Briefcase,   label: 'Find a Job',     color: '#6366f1', bg: '#eef2ff', action: () => setTab('learn') },
    { icon: ShieldCheck, label: 'Get Benefits',   color: '#16a34a', bg: '#f0fdf4', action: () => setTab('learn') },
    { icon: HelpCircle,  label: "I don't know",   color: '#9ca3af', bg: '#f9fafb', action: () => setTab('demo') },
  ];

  return (
    <DashboardShell activeTab={tab} onTabChange={setTab} navItems={nav} userName={user?.name} userEmail={user?.email}>
      {showCrisis && <CrisisModal onClose={() => setShowCrisis(false)} />}

      {/* ── Home ── */}
      {tab === 'home' && (
        <div className="space-y-5">

          {/* Crisis banner — always visible at top */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <Heart size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-800 font-medium">
                In crisis or feeling unsafe?
              </p>
            </div>
            <button onClick={() => setShowCrisis(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors">
              <Phone size={12} />
              Get Help Now
            </button>
          </div>

          {/* Scam warning */}
          {showScamWarning && <ScamWarning onDismiss={() => setShowScamWarning(false)} />}

          {/* Greeting + emotional progress */}
          <div className="glass-card">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Welcome back</p>
            <h1 className="font-heading font-extrabold text-2xl text-gray-900 mb-3">
              Hey {firstName}. You're doing great.
            </h1>
            {doneLabels.length > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-green-50 border border-green-100 mb-3">
                <CheckCircle size={16} className="text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm text-green-800 leading-relaxed">
                  <span className="font-semibold">You've already done: </span>
                  {doneLabels.join(' and ')}.
                </p>
              </div>
            )}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-50 border border-yellow-200">
              <Zap size={16} className="text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-800 leading-relaxed">
                <span className="font-semibold">Your next step: </span>
                {steps[completedSteps]?.label} — {steps[completedSteps]?.hint}.
              </p>
            </div>
          </div>

          {/* What do you need right now? */}
          <div>
            <h2 className="font-heading font-bold text-lg text-gray-900 mb-3">What do you need right now?</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {quickActions.map(a => (
                <QuickAction key={a.label} icon={a.icon} label={a.label} color={a.color} bg={a.bg} onClick={a.action} />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Tap any option — our AI will find real local resources for you
            </p>
          </div>

          {/* Journey progress */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Journey</p>
                <p className="font-heading font-bold text-lg text-gray-900 mt-0.5">Step {currentStep} of 8</p>
              </div>
              <HealthRing score={healthScore} size={80} />
            </div>

            {/* Step pills */}
            <div className="flex items-center gap-1 mb-4">
              {steps.map((_, i) => (
                <div key={i} className="flex items-center flex-1">
                  <StepPill step={i + 1} current={currentStep} />
                  {i < 7 && (
                    <div className={`flex-1 h-0.5 mx-0.5 ${i < completedSteps ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
              <div className="h-2 rounded-full transition-all duration-700"
                style={{ width: `${(completedSteps / 8) * 100}%`, background: 'linear-gradient(90deg, #f5e000, #16a34a)' }} />
            </div>
            <p className="text-xs text-gray-500 text-center">
              {completedSteps} of 8 steps complete · {8 - completedSteps} steps to full independence
            </p>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Saved',        value: '$200',    sub: 'emergency buffer',    color: '#16a34a', icon: TrendingUp },
              { label: 'Total Debt',   value: '$13,460', sub: 'court + medical',     color: '#ef4444', icon: AlertCircle },
              { label: 'Steps Done',   value: `${completedSteps}/8`, sub: 'toward independence', color: '#f5e000', icon: Star },
              { label: 'Health Score', value: `${healthScore}`,      sub: 'out of 100',           color: '#6366f1', icon: Activity },
            ].map(s => (
              <div key={s.label} className="glass-card !p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-medium">{s.label}</span>
                  <s.icon size={14} style={{ color: s.color }} />
                </div>
                <p className="font-mono font-bold text-xl text-gray-900">{s.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Financial tools — progressive disclosure */}
          <div>
            <button onClick={() => setShowAllTools(v => !v)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200 hover:border-yellow-300 transition-all">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-gray-600" />
                <span className="font-semibold text-gray-900 text-sm">Financial Tools</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{TOOLS.length} tools</span>
              </div>
              {showAllTools ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>

            {showAllTools && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-3">
                {TOOLS.map(t => (
                  <button key={t.tab} onClick={() => setTab(t.tab)}
                    className="glass-card !p-4 text-left hover:shadow-md transition-all border border-gray-100 hover:border-gray-200">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: t.bg }}>
                      <t.icon size={18} style={{ color: t.color }} />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 mb-3">{t.desc}</p>
                    <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-gray-900">{t.stat}</span>
                      <span className="text-[10px] text-gray-400">{t.statLabel}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Trust signal */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <Shield size={16} className="text-green-500 shrink-0" />
            <p className="text-xs text-gray-500">
              No judgment. You're not alone. Your data is encrypted and never shared. Redreemer is free and always will be.
            </p>
          </div>
        </div>
      )}

      {/* ── Inline wellness tools ── */}
      {['budget','emergency','debt','goals','risk','learn','insurance','networth','community'].includes(tab) && (
        <div className="w-full">
          <div className="flex items-center gap-2 mb-5">
            <button onClick={() => setTab('home')} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              My Journey
            </button>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-xs font-semibold text-gray-700 capitalize">
              {tab.replace('networth','Net Worth').replace('emergency','Emergency Fund').replace('insurance','Insurance')}
            </span>
          </div>
          <WellnessContent tool={tab} />
        </div>
      )}

      {/* ── SMS ── */}
      {tab === 'demo' && (
        <div className="max-w-sm">
          <div className="mb-4">
            <h2 className="font-heading font-bold text-xl text-gray-900">SMS Assistant</h2>
            <p className="text-gray-500 text-sm mt-1">Chat with Redreemer AI — same as texting the real number.</p>
          </div>
          <PhoneSimulator clientId={demoClientId} clientPhone={demoPhone} clientName={firstName} />
        </div>
      )}

      {/* ── Profile ── */}
      {tab === 'profile' && (
        <div className="space-y-5">
          <h1 className="font-heading font-bold text-2xl text-gray-900">Profile</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="glass-card">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-20 h-20 rounded-full bg-yellow-300 flex items-center justify-center text-gray-900 text-2xl font-bold">
                  {user?.name?.[0] || 'U'}
                </div>
                <div>
                  <p className="font-heading font-bold text-xl text-gray-900">{user?.name || firstName}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-gray-800 mt-1.5 inline-block font-medium">
                    {isReentry ? 'Reentry' : 'Homeless Support'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                {[
                  { label: 'Steps Done', value: String(completedSteps) },
                  { label: 'Health Score', value: String(healthScore) },
                  { label: 'Days Active', value: '14' },
                ].map(s => (
                  <div key={s.label} className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="font-mono font-bold text-2xl text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card space-y-4">
              <h3 className="font-semibold text-gray-900">Account Information</h3>
              {[{ label: 'Display Name', value: user?.name || '' }, { label: 'Email', value: user?.email || '' }].map(f => (
                <div key={f.label}>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">{f.label}</label>
                  <input defaultValue={f.value} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300" />
                </div>
              ))}
              <button className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-900 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings ── */}
      {tab === 'settings' && (
        <div className="space-y-5 max-w-2xl">
          <h1 className="font-heading font-bold text-2xl text-gray-900">Settings</h1>
          <div className="glass-card space-y-4">
            <h3 className="font-semibold text-gray-900">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Display Name', value: user?.name || '', placeholder: 'Your name' },
                { label: 'Email Address', value: user?.email || '', placeholder: 'your@email.com' },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">{f.label}</label>
                  <input defaultValue={f.value} placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all" />
                </div>
              ))}
            </div>
            <button className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-900 hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>
              Save Changes
            </button>
          </div>
          <div className="glass-card space-y-3">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <NotificationToggle label="Email notifications" defaultOn={true} />
            <NotificationToggle label="SMS alerts" defaultOn={true} />
            <NotificationToggle label="Weekly progress report" defaultOn={false} />
          </div>
          <div className="glass-card space-y-3">
            <h3 className="font-semibold text-gray-900">Privacy & Security</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your data is encrypted end-to-end and never sold or shared. Redreemer uses your information only to provide personalized guidance.
            </p>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
              <Shield size={14} className="text-green-600 shrink-0" />
              <span className="text-xs text-green-700 font-medium">Your account is secure</span>
            </div>
            <button className="text-sm text-red-500 hover:underline">Delete my account</button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
