import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
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

function NotificationToggle({ labelKey, defaultOn }: { labelKey: string; defaultOn: boolean }) {
  const { t } = useTranslation();
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-gray-700">{t(labelKey)}</span>
      <button type="button" onClick={() => setOn(v => !v)}
        className={`w-11 h-6 rounded-full relative transition-colors ${on ? 'bg-yellow-300' : 'bg-gray-200'}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${on ? 'right-0.5' : 'left-0.5'}`} />
      </button>
    </div>
  );
}

function HealthRing({ score, size = 120 }: { score: number; size?: number }) {
  const { t } = useTranslation();
  const r = (size / 2) - 10;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 70 ? '#16a34a' : score >= 40 ? '#f5e000' : '#ef4444';
  const label = score >= 70 ? t('client.health.strong') : score >= 40 ? t('client.health.building') : t('client.health.starting');
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

function QuickAction({ icon: Icon, label, color, bg, onClick }: {
  icon: typeof Home; label: string; color: string; bg: string; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      className="flex flex-col items-center gap-2 p-4 rounded-2xl border-2 border-gray-100 hover:border-gray-200 hover:shadow-md transition-all group bg-white">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
        <Icon size={22} style={{ color }} />
      </div>
      <span className="text-xs font-semibold text-gray-800 text-center leading-tight">{label}</span>
    </button>
  );
}

function ScamWarning({ onDismiss }: { onDismiss: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
      <AlertTriangle size={18} className="text-red-500 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-800">{t('client.scamTitle')}</p>
        <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
          {t('client.scamBody')}
        </p>
      </div>
      <button type="button" onClick={onDismiss} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
        <ChevronDown size={16} />
      </button>
    </div>
  );
}

const NAV_DEF_H = [
  { id: 'home', icon: Home },
  { id: 'budget', icon: Wallet },
  { id: 'emergency', icon: Shield },
  { id: 'networth', icon: BarChart2 },
  { id: 'goals', icon: Target },
  { id: 'learn', icon: BookOpen },
  { id: 'risk', icon: Activity },
  { id: 'insurance', icon: ShieldCheck },
  { id: 'community', icon: BarChart2 },
  { id: 'demo', icon: MessageSquare },
  { id: 'profile', icon: User },
  { id: 'settings', icon: Settings },
] as const;

const NAV_DEF_R = [
  { id: 'home', icon: Home },
  { id: 'debt', icon: TrendingDown },
  { id: 'budget', icon: Wallet },
  { id: 'emergency', icon: Shield },
  { id: 'networth', icon: BarChart2 },
  { id: 'goals', icon: Target },
  { id: 'learn', icon: BookOpen },
  { id: 'risk', icon: Activity },
  { id: 'insurance', icon: ShieldCheck },
  { id: 'community', icon: BarChart2 },
  { id: 'demo', icon: MessageSquare },
  { id: 'profile', icon: User },
  { id: 'settings', icon: Settings },
] as const;

const TOOL_DEFS = [
  { tab: 'budget', icon: Wallet, color: '#f5e000', bg: '#fefce8', stat: '$1,800/mo' },
  { tab: 'emergency', icon: Shield, color: '#16a34a', bg: '#f0fdf4', stat: '34%' },
  { tab: 'goals', icon: Target, color: '#16a34a', bg: '#f0fdf4', stat: '3' },
  { tab: 'debt', icon: TrendingDown, color: '#ef4444', bg: '#fef2f2', stat: '$13,460' },
  { tab: 'learn', icon: BookOpen, color: '#6366f1', bg: '#eef2ff', stat: '0/6' },
  { tab: 'risk', icon: Activity, color: '#f5e000', bg: '#fefce8', stat: '—' },
  { tab: 'networth', icon: BarChart2, color: '#6366f1', bg: '#eef2ff', stat: '-$12,840' },
  { tab: 'insurance', icon: ShieldCheck, color: '#16a34a', bg: '#f0fdf4', stat: 'Free' },
  { tab: 'community', icon: BarChart2, color: '#6366f1', bg: '#eef2ff', stat: '19%' },
] as const;

function tabBreadcrumbTitle(tabId: string, t: (k: string) => string) {
  const map: Record<string, string> = {
    budget: 'client.nav.budget',
    emergency: 'client.nav.emergency',
    debt: 'client.nav.debt',
    goals: 'client.nav.goals',
    learn: 'client.nav.learn',
    risk: 'client.nav.risk',
    networth: 'client.nav.networth',
    insurance: 'client.nav.insurance',
    community: 'client.nav.community',
  };
  const k = map[tabId];
  return k ? t(k) : tabId;
}

export default function ClientDashboard() {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState('home');
  const { user } = useAuth0();
  const { userType } = useAuth();
  const [showCrisis, setShowCrisis] = useState(false);
  const [showScamWarning, setShowScamWarning] = useState(true);
  const [showAllTools, setShowAllTools] = useState(false);

  const isReentry = userType === 'reentry';
  const firstName = user?.given_name || user?.name?.split(' ')[0] || 'Friend';
  const completedSteps = 2;
  const currentStep = completedSteps + 1;
  const healthScore = 38;
  const demoPhone = isReentry ? '+15550000002' : '+15550000001';
  const demoClientId = isReentry ? '2' : '1';

  const steps = useMemo(() => {
    const p = isReentry ? 'client.steps.r' : 'client.steps.h';
    return [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({
      label: t(`${p}.${i}.l`),
      hint: t(`${p}.${i}.h`),
    }));
  }, [isReentry, t, i18n.language]);

  const nav = useMemo(() => {
    const def = isReentry ? NAV_DEF_R : NAV_DEF_H;
    return def.map((item) => ({
      ...item,
      label: t(
        `client.nav.${
          item.id === 'demo' ? 'sms' : item.id === 'home' ? 'journey' : item.id
        }`
      ),
    }));
  }, [isReentry, t, i18n.language]);

  const tools = useMemo(() =>
    TOOL_DEFS.map((row) => ({
      ...row,
      label: t(`client.nav.${row.tab}`),
      desc: t(`client.tools.${row.tab}.d`),
      statLabel: t(`client.tools.${row.tab}.sl`),
    })),
  [t, i18n.language]);

  const doneLabels = steps.slice(0, completedSteps).map((s) => s.label);

  const quickActions = useMemo(() => [
    { icon: Building2, label: t('client.quickShelter'), color: '#6366f1', bg: '#eef2ff', action: () => setTab('demo') },
    { icon: Utensils, label: t('client.quickFood'), color: '#16a34a', bg: '#f0fdf4', action: () => setTab('demo') },
    { icon: DollarSign, label: t('client.quickMoney'), color: '#f5e000', bg: '#fefce8', action: () => setTab('budget') },
    { icon: Briefcase, label: t('client.quickJob'), color: '#6366f1', bg: '#eef2ff', action: () => setTab('learn') },
    { icon: ShieldCheck, label: t('client.quickBenefits'), color: '#16a34a', bg: '#f0fdf4', action: () => setTab('learn') },
    { icon: HelpCircle, label: t('client.quickUnknown'), color: '#9ca3af', bg: '#f9fafb', action: () => setTab('demo') },
  ], [t, i18n.language]);

  return (
    <DashboardShell activeTab={tab} onTabChange={setTab} navItems={nav} userName={user?.name} userEmail={user?.email}>
      {showCrisis && <CrisisModal onClose={() => setShowCrisis(false)} />}

      {tab === 'home' && (
        <div className="space-y-5">

          <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <Heart size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-800 font-medium">
                {t('client.crisisBanner')}
              </p>
            </div>
            <button type="button" onClick={() => setShowCrisis(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors">
              <Phone size={12} />
              {t('client.getHelpNow')}
            </button>
          </div>

          {showScamWarning && <ScamWarning onDismiss={() => setShowScamWarning(false)} />}

          <div className="glass-card">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{t('client.welcomeBack')}</p>
            <h1 className="font-heading font-extrabold text-2xl text-gray-900 mb-3">
              {t('client.greeting', { name: firstName })}
            </h1>
            {doneLabels.length > 0 && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-green-50 border border-green-100 mb-3">
                <CheckCircle size={16} className="text-green-600 shrink-0 mt-0.5" />
                <p className="text-sm text-green-800 leading-relaxed">
                  <span className="font-semibold">{t('client.donePrefix')}</span>
                  {doneLabels.join(` ${t('client.doneJoiner')} `)}.
                </p>
              </div>
            )}
            <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-50 border border-yellow-200">
              <Zap size={16} className="text-yellow-600 shrink-0 mt-0.5" />
              <p className="text-sm text-gray-800 leading-relaxed">
                <span className="font-semibold">{t('client.nextPrefix')}</span>
                {steps[completedSteps]?.label} — {steps[completedSteps]?.hint}.
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-heading font-bold text-lg text-gray-900 mb-3">{t('client.needNow')}</h2>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {quickActions.map((a) => (
                <QuickAction key={a.label} icon={a.icon} label={a.label} color={a.color} bg={a.bg} onClick={a.action} />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {t('client.needNowHint')}
            </p>
          </div>

          <div className="glass-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('client.journeyLabel')}</p>
                <p className="font-heading font-bold text-lg text-gray-900 mt-0.5">{t('client.stepOf', { current: currentStep })}</p>
              </div>
              <HealthRing score={healthScore} size={80} />
            </div>

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

            <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
              <div className="h-2 rounded-full transition-all duration-700"
                style={{ width: `${(completedSteps / 8) * 100}%`, background: 'linear-gradient(90deg, #f5e000, #16a34a)' }} />
            </div>
            <p className="text-xs text-gray-500 text-center">
              {t('client.progressLine', { done: completedSteps, left: 8 - completedSteps })}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { labelKey: 'client.statSaved', value: '$200', subKey: 'client.statSavedSub', color: '#16a34a', icon: TrendingUp },
              { labelKey: 'client.statDebt', value: '$13,460', subKey: 'client.statDebtSub', color: '#ef4444', icon: AlertCircle },
              { labelKey: 'client.statSteps', value: `${completedSteps}/8`, subKey: 'client.statStepsSub', color: '#f5e000', icon: Star },
              { labelKey: 'client.statHealth', value: `${healthScore}`, subKey: 'client.statHealthSub', color: '#6366f1', icon: Activity },
            ].map((s) => (
              <div key={s.labelKey} className="glass-card !p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 font-medium">{t(s.labelKey)}</span>
                  <s.icon size={14} style={{ color: s.color }} />
                </div>
                <p className="font-mono font-bold text-xl text-gray-900">{s.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{t(s.subKey)}</p>
              </div>
            ))}
          </div>

          <div>
            <button type="button" onClick={() => setShowAllTools(v => !v)}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-white border border-gray-200 hover:border-yellow-300 transition-all">
              <div className="flex items-center gap-2">
                <Wallet size={16} className="text-gray-600" />
                <span className="font-semibold text-gray-900 text-sm">{t('client.financialTools')}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{t('client.toolsCount', { count: tools.length })}</span>
              </div>
              {showAllTools ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
            </button>

            {showAllTools && (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 mt-3">
                {tools.map((row) => (
                  <button type="button" key={row.tab} onClick={() => setTab(row.tab)}
                    className="glass-card !p-4 text-left hover:shadow-md transition-all border border-gray-100 hover:border-gray-200">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: row.bg }}>
                      <row.icon size={18} style={{ color: row.color }} />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{row.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 mb-3">{row.desc}</p>
                    <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-gray-900">{row.stat}</span>
                      <span className="text-[10px] text-gray-400">{row.statLabel}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <Shield size={16} className="text-green-500 shrink-0" />
            <p className="text-xs text-gray-500">
              {t('client.trustFooter')}
            </p>
          </div>
        </div>
      )}

      {['budget','emergency','debt','goals','risk','learn','insurance','networth','community'].includes(tab) && (
        <div className="w-full">
          <div className="flex items-center gap-2 mb-5">
            <button type="button" onClick={() => setTab('home')} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              {t('client.breadcrumbJourney')}
            </button>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-xs font-semibold text-gray-700">
              {tabBreadcrumbTitle(tab, t)}
            </span>
          </div>
          <WellnessContent tool={tab} />
        </div>
      )}

      {tab === 'demo' && (
        <div className="max-w-sm">
          <div className="mb-4">
            <h2 className="font-heading font-bold text-xl text-gray-900">{t('client.smsTitle')}</h2>
            <p className="text-gray-500 text-sm mt-1">{t('client.smsSub')}</p>
          </div>
          <PhoneSimulator clientId={demoClientId} clientPhone={demoPhone} clientName={firstName} />
        </div>
      )}

      {tab === 'profile' && (
        <div className="space-y-5">
          <h1 className="font-heading font-bold text-2xl text-gray-900">{t('client.profileTitle')}</h1>
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
                    {isReentry ? t('client.badgeReentry') : t('client.badgeHomeless')}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                {[
                  { labelKey: 'client.profileStatSteps', value: String(completedSteps) },
                  { labelKey: 'client.profileStatHealth', value: String(healthScore) },
                  { labelKey: 'client.profileStatDays', value: '14' },
                ].map((s) => (
                  <div key={s.labelKey} className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="font-mono font-bold text-2xl text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{t(s.labelKey)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card space-y-4">
              <h3 className="font-semibold text-gray-900">{t('client.accountInfo')}</h3>
              {[{ labelKey: 'client.displayName', value: user?.name || '' }, { labelKey: 'client.email', value: user?.email || '' }].map((f) => (
                <div key={f.labelKey}>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">{t(f.labelKey)}</label>
                  <input defaultValue={f.value} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300" />
                </div>
              ))}
              <button type="button" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-900 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>
                {t('client.saveChanges')}
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="space-y-5 max-w-2xl">
          <h1 className="font-heading font-bold text-2xl text-gray-900">{t('client.settingsTitle')}</h1>
          <div className="glass-card space-y-4">
            <h3 className="font-semibold text-gray-900">{t('client.accountInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { labelKey: 'client.displayName', value: user?.name || '', placeholderKey: 'client.placeholderName' },
                { labelKey: 'client.emailAddress', value: user?.email || '', placeholderKey: 'client.placeholderEmail' },
              ].map((f) => (
                <div key={f.labelKey}>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">{t(f.labelKey)}</label>
                  <input defaultValue={f.value} placeholder={t(f.placeholderKey)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 transition-all" />
                </div>
              ))}
            </div>
            <button type="button" className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-900 hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>
              {t('client.saveChanges')}
            </button>
          </div>
          <div className="glass-card space-y-3">
            <h3 className="font-semibold text-gray-900">{t('client.notifications')}</h3>
            <NotificationToggle labelKey="client.notifEmail" defaultOn={true} />
            <NotificationToggle labelKey="client.notifSms" defaultOn={true} />
            <NotificationToggle labelKey="client.notifWeekly" defaultOn={false} />
          </div>
          <div className="glass-card space-y-3">
            <h3 className="font-semibold text-gray-900">{t('client.privacyTitle')}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              {t('client.privacyBody')}
            </p>
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
              <Shield size={14} className="text-green-600 shrink-0" />
              <span className="text-xs text-green-700 font-medium">{t('client.secureBadge')}</span>
            </div>
            <button type="button" className="text-sm text-red-500 hover:underline">{t('client.deleteAccount')}</button>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
