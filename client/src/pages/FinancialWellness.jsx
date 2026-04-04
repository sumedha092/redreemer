import { useState } from 'react'
import BudgetTracker from '../components/wellness/BudgetTracker.jsx'
import NetWorth from '../components/wellness/NetWorth.jsx'
import EmergencyFund from '../components/wellness/EmergencyFund.jsx'
import DebtPayoff from '../components/wellness/DebtPayoff.jsx'
import InsuranceGuide from '../components/wellness/InsuranceGuide.jsx'
import SavingsGoals from '../components/wellness/SavingsGoals.jsx'
import RiskScore from '../components/wellness/RiskScore.jsx'
import FinancialLiteracy from '../components/wellness/FinancialLiteracy.jsx'

const TABS = [
  { id: 'budget',    label: 'Budget',         icon: '💰' },
  { id: 'networth',  label: 'Net Worth',       icon: '📊' },
  { id: 'emergency', label: 'Emergency Fund',  icon: '🛡️' },
  { id: 'debt',      label: 'Debt Payoff',     icon: '📉' },
  { id: 'insurance', label: 'Insurance',       icon: '📋' },
  { id: 'goals',     label: 'Savings Goals',   icon: '🎯' },
  { id: 'risk',      label: 'Risk Score',      icon: '⚡' },
  { id: 'learn',     label: 'Learn',           icon: '📚' },
]

export default function FinancialWellness() {
  const [activeTab, setActiveTab] = useState('budget')

  return (
    <div className="min-h-screen bg-navy-950 text-white">
      {/* Header */}
      <div className="bg-navy-900 border-b border-navy-700 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-white">
              Re<span className="text-amber-500">dreemer</span>
            </h1>
            <span className="text-navy-400 text-sm">·</span>
            <span className="text-navy-300 text-sm">Financial Wellness</span>
          </div>
          <p className="text-navy-400 text-sm">
            Tools to build financial stability — one step at a time.
          </p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="bg-navy-900 border-b border-navy-700 overflow-x-auto">
        <div className="max-w-6xl mx-auto px-6 flex gap-1 py-2">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-navy-900'
                  : 'text-navy-300 hover:text-white hover:bg-navy-800'
              }`}
            >
              <span>{tab.icon}</span>
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
        {activeTab === 'insurance' && <InsuranceGuide />}
        {activeTab === 'goals'     && <SavingsGoals />}
        {activeTab === 'risk'      && <RiskScore />}
        {activeTab === 'learn'     && <FinancialLiteracy />}
      </div>
    </div>
  )
}
