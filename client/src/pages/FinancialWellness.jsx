import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import BudgetTracker from '../components/wellness/BudgetTracker.jsx'
import NetWorth from '../components/wellness/NetWorth.jsx'
import EmergencyFund from '../components/wellness/EmergencyFund.jsx'
import DebtPayoff from '../components/wellness/DebtPayoff.jsx'
import InsuranceGuide from '../components/wellness/InsuranceGuide.jsx'
import SavingsGoals from '../components/wellness/SavingsGoals.jsx'
import RiskScore from '../components/wellness/RiskScore.jsx'
import FinancialLiteracy from '../components/wellness/FinancialLiteracy.jsx'
import { useTheme } from '../lib/useTheme.js'

const PRIMARY_TABS = [
  { id: 'budget',    label: 'Budget',         icon: '💰', blurb: 'See what you have and where it goes.' },
  { id: 'emergency', label: 'Emergency fund', icon: '🛡️', blurb: 'Start small — even $10 matters.' },
  { id: 'debt',      label: 'Debt',           icon: '📉', blurb: 'One clear plan, no shame.' },
]

const MORE_TABS = [
  { id: 'goals',     label: 'Savings goals',  icon: '🎯' },
  { id: 'networth',  label: 'Net worth',      icon: '📊' },
  { id: 'insurance', label: 'Insurance',      icon: '📋' },
  { id: 'risk',      label: 'Risk score',     icon: '⚡' },
  { id: 'learn',     label: 'Learn',          icon: '📚' },
]

const ALL_IDS = [...PRIMARY_TABS, ...MORE_TABS].map(t => t.id)

const STORAGE_KEY = 'redreemer_wellness_tab'

/**
 * `embedded` prop — when true, renders without its own full-page shell
 * (used when mounted inside the Dashboard sidebar layout).
 */
export default function FinancialWellness({ embedded = false }) {
  const { theme, toggle } = useTheme()
  const [activeTab, setActiveTab] = useState(() => {
    try {
      const s = localStorage.getItem(STORAGE_KEY)
      if (s && ALL_IDS.includes(s)) return s
    } catch { /* ignore */ }
    return 'budget'
  })
  const [showMoreTabs, setShowMoreTabs] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, activeTab)
    } catch { /* ignore */ }
  }, [activeTab])

  const isMore = MORE_TABS.some(t => t.id === activeTab)

  const guidedBanner = (
    <div className="rounded-2xl border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.06)] px-4 py-3 mb-6">
      <div className="flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-[hsl(var(--primary))] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-[hsl(var(--foreground))]">One thing at a time</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5 leading-relaxed">
            Pick one tool below. We’ll save where you left off on this device. Advanced tools stay under “More tools.”
          </p>
        </div>
      </div>
    </div>
  )

  const primaryRow = (
    <div className="flex flex-col gap-2 mb-3">
      <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Start here</p>
      <div className="flex flex-wrap gap-2">
        {PRIMARY_TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-start text-left px-4 py-3 rounded-xl border transition-all max-w-[200px] ${
              activeTab === tab.id
                ? 'border-[hsl(var(--primary)/0.5)] bg-[hsl(var(--primary)/0.12)] ring-1 ring-[hsl(var(--primary)/0.2)]'
                : 'border-[hsl(var(--border))] bg-[hsl(var(--card)/0.4)] hover:border-[hsl(var(--primary)/0.25)]'
            }`}
          >
            <span className="text-base mb-0.5">{tab.icon}</span>
            <span className="text-sm font-semibold text-[hsl(var(--foreground))]">{tab.label}</span>
            <span className="text-[11px] text-[hsl(var(--muted-foreground))] leading-snug mt-0.5">{tab.blurb}</span>
          </button>
        ))}
      </div>
    </div>
  )

  const moreSection = (
    <div className="mb-4">
      <button
        type="button"
        onClick={() => setShowMoreTabs(v => !v)}
        className="flex items-center gap-2 text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] py-2"
        aria-expanded={showMoreTabs}
      >
        {showMoreTabs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        More tools (net worth, insurance, lessons…)
      </button>
      {(showMoreTabs || isMore) && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {MORE_TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)]'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  const content = (
    <div className="max-w-6xl mx-auto px-6 py-8 text-[hsl(var(--foreground))]">
      {!embedded && guidedBanner}
      {primaryRow}
      {moreSection}
      {activeTab === 'budget'    && <BudgetTracker />}
      {activeTab === 'networth'  && <NetWorth />}
      {activeTab === 'emergency' && <EmergencyFund />}
      {activeTab === 'debt'      && <DebtPayoff />}
      {activeTab === 'insurance' && <InsuranceGuide />}
      {activeTab === 'goals'     && <SavingsGoals />}
      {activeTab === 'risk'      && <RiskScore />}
      {activeTab === 'learn'     && <FinancialLiteracy />}
    </div>
  )

  if (embedded) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-[hsl(var(--border))] px-6 py-3 bg-[hsl(var(--background))] shrink-0">
          <p className="text-[10px] uppercase text-[hsl(var(--muted-foreground))] mb-2">Financial wellness</p>
          {primaryRow}
          {moreSection}
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-6">
            {activeTab === 'budget'    && <BudgetTracker />}
            {activeTab === 'networth'  && <NetWorth />}
            {activeTab === 'emergency' && <EmergencyFund />}
            {activeTab === 'debt'      && <DebtPayoff />}
            {activeTab === 'insurance' && <InsuranceGuide />}
            {activeTab === 'goals'     && <SavingsGoals />}
            {activeTab === 'risk'      && <RiskScore />}
            {activeTab === 'learn'     && <FinancialLiteracy />}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <div className="border-b border-[hsl(var(--border))] px-6 py-5 bg-[hsl(var(--card)/0.5)] backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-heading font-bold text-[hsl(var(--foreground))]">
                Re<span className="text-[hsl(var(--primary))]">dreemer</span>
              </h1>
              <span className="text-[hsl(var(--muted-foreground))] text-sm">·</span>
              <span className="text-[hsl(var(--muted-foreground))] text-sm">Money tools</span>
            </div>
            <p className="text-[hsl(var(--muted-foreground))] text-sm">
              Calm steps — not a wall of numbers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/help"
              className="text-sm px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.4)]"
            >
              I need help now
            </Link>
            <button
              type="button"
              onClick={toggle}
              className="text-sm px-3 py-2 rounded-lg border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
            >
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
          </div>
        </div>
      </div>
      {content}
    </div>
  )
}
