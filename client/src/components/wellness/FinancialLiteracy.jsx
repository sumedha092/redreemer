import { useState } from 'react'

const MODULES = [
  {
    id: 'banking',
    icon: '🏦',
    title: 'How Bank Accounts Work',
    duration: '3 min',
    category: 'Banking',
    color: 'amber',
    intro: "A bank account is a safe place to store money, receive paychecks, and build financial history. Without one, you're paying fees to cash checks and carrying cash that can be stolen.",
    sections: [
      {
        heading: 'Types of accounts',
        content: `**Checking account** — For everyday spending. Use a debit card to pay for things. No interest earned.

**Savings account** — For money you're setting aside. Earns a small amount of interest. Harder to access (which is the point).

**Bank On accounts** — Special accounts with no minimum balance, no monthly fees, and no ChexSystems check. Designed for people rebuilding their financial life.`
      },
      {
        heading: 'What ChexSystems is',
        content: `ChexSystems is like a credit report for bank accounts. If you've had a bank account closed for overdrafts or fraud, you may be on ChexSystems — and most banks will reject you.

Bank On certified accounts don't use ChexSystems. That's why they're the right starting point.`
      },
      {
        heading: 'How to open a Bank On account',
        content: `1. Go to bankonsites.org and find a location near you
2. Bring your state ID and a mailing address (a shelter address works)
3. Takes about 20 minutes
4. No credit check, no minimum deposit, no monthly fees

Once you have an account, you can receive direct deposit, set up automatic savings, and start building a banking history.`
      },
      {
        heading: 'The financial literacy moment',
        content: `Opening a bank account is the single most important financial step you can take. It unlocks direct deposit (which means faster, safer paychecks), automatic savings, and eventually — credit history.

Every dollar in a bank account is protected by FDIC insurance up to $250,000. Cash in your pocket has zero protection.`
      }
    ]
  },
  {
    id: 'credit',
    icon: '📈',
    title: 'Understanding Credit Scores',
    duration: '4 min',
    category: 'Credit',
    color: 'blue',
    intro: "A credit score is a number between 300 and 850 that tells lenders how likely you are to repay debt. It affects whether you can rent an apartment, get a phone plan, or borrow money.",
    sections: [
      {
        heading: 'What makes up your score',
        content: `**Payment history (35%)** — Do you pay on time? This is the biggest factor.

**Credit utilization (30%)** — How much of your available credit are you using? Keep it under 30%.

**Length of credit history (15%)** — How long have you had credit? Older is better.

**Credit mix (10%)** — Do you have different types of credit (cards, loans)?

**New credit (10%)** — Have you applied for a lot of new credit recently?`
      },
      {
        heading: 'How to build credit from zero',
        content: `1. **Secured credit card** — You deposit $200, that becomes your credit limit. Use it for small purchases and pay it off every month. Capital One and Discover have good secured cards.

2. **Credit-builder loan** — A small loan where the money goes into a savings account. You make payments, build credit, then get the money. Self.inc offers these.

3. **Become an authorized user** — If someone with good credit adds you to their card, their history helps your score.

4. **Pay every bill on time** — Even phone bills and utilities can now be reported to credit bureaus.`
      },
      {
        heading: 'What a good score unlocks',
        content: `- **620+** — Most landlords will rent to you
- **650+** — Better phone plans, some credit cards
- **700+** — Good interest rates on loans
- **750+** — Best rates, premium credit cards

Going from no credit to 650 takes about 12–18 months of consistent on-time payments.`
      }
    ]
  },
  {
    id: 'snap',
    icon: '🍎',
    title: 'SNAP Benefits Explained',
    duration: '3 min',
    category: 'Benefits',
    color: 'green',
    intro: "SNAP (Supplemental Nutrition Assistance Program) provides monthly money for food. The average benefit is $200/month. If you qualify, this frees up cash for savings and other needs.",
    sections: [
      {
        heading: 'Do you qualify?',
        content: `You likely qualify for SNAP if:
- Your monthly income is under $1,580 (single person)
- You're experiencing homelessness
- You were recently released from prison (most states allow this)
- You're receiving other government assistance

People experiencing homelessness can apply even without a permanent address.`
      },
      {
        heading: 'How to apply',
        content: `1. Go to benefits.gov or your state's SNAP website
2. Apply online — takes about 20 minutes
3. You'll get an interview (usually by phone)
4. If approved, you receive an EBT card within 30 days
5. Emergency SNAP can be approved in 7 days if you have very low income

You can also apply in person at your local SNAP office. Bring your ID and any income information you have.`
      },
      {
        heading: 'What SNAP covers',
        content: `SNAP covers most food items at grocery stores and some farmers markets. It does NOT cover:
- Hot prepared food (restaurant meals)
- Alcohol or tobacco
- Non-food items (soap, paper products)

The average benefit is $200/month for a single person. That's $200 you can redirect toward savings.`
      }
    ]
  },
  {
    id: 'budgeting',
    icon: '💰',
    title: 'Budgeting When You Have Almost Nothing',
    duration: '4 min',
    category: 'Budgeting',
    color: 'purple',
    intro: "Budgeting feels impossible when you're surviving day to day. But even with $50, a budget helps you make intentional decisions instead of watching money disappear.",
    sections: [
      {
        heading: 'The zero-based budget',
        content: `Give every dollar a job. If you have $200 this week:
- $80 food
- $30 transport
- $50 phone
- $40 savings (even this small amount matters)

Total: $200. Every dollar has a purpose. Nothing is "leftover" — leftover money disappears.`
      },
      {
        heading: 'The envelope method',
        content: `Divide your cash into envelopes labeled by category. When the food envelope is empty, you're done spending on food until next week.

This works especially well with cash because you can physically see and feel the money leaving. Digital spending is abstract — cash is real.`
      },
      {
        heading: 'The 50/30/20 rule',
        content: `**50% needs** — Housing, food, transport, phone, healthcare
**30% wants** — Anything that isn't strictly necessary
**20% savings and debt** — Emergency fund, debt payoff

On $1,000/month: $500 needs, $300 wants, $200 savings.
On $500/month: $250 needs, $150 wants, $100 savings.

Even saving $25/month is better than saving nothing. The habit matters more than the amount.`
      },
      {
        heading: 'The one rule that changes everything',
        content: `**Pay yourself first.** Before you spend anything, move your savings amount to a separate account or envelope.

If you wait until the end of the month to save "whatever's left," there will never be anything left. Savings has to come first.

Even $5/week is $260/year. That's a real emergency fund.`
      }
    ]
  },
  {
    id: 'taxes',
    icon: '📄',
    title: 'Taxes for Low-Income Earners',
    duration: '3 min',
    category: 'Taxes',
    color: 'amber',
    intro: "If you earned any income last year, you may be owed a tax refund — even if you didn't pay taxes. The Earned Income Tax Credit (EITC) can put up to $7,000 back in your pocket.",
    sections: [
      {
        heading: 'The Earned Income Tax Credit (EITC)',
        content: `The EITC is a refundable tax credit for low-income workers. "Refundable" means you get money back even if you owe no taxes.

2025 EITC amounts:
- No children: up to $632
- 1 child: up to $4,213
- 2 children: up to $6,960
- 3+ children: up to $7,830

You must file a tax return to claim it — even if you don't owe taxes.`
      },
      {
        heading: 'Free tax filing',
        content: `**VITA (Volunteer Income Tax Assistance)** — Free tax preparation for people earning under $67,000. Find a location at irs.gov/vita.

**IRS Free File** — Free online filing at irs.gov/freefile if you earn under $79,000.

**GetYourRefund.org** — Upload your documents and a volunteer prepares your return for free.

Do NOT use paid tax preparers who charge a percentage of your refund. That's money you're owed — keep it.`
      },
      {
        heading: 'What you need to file',
        content: `- Your Social Security Number
- Any W-2s or 1099s from employers
- Your bank account number for direct deposit (fastest way to get your refund)

If you don't have a W-2, you can still file using your last pay stub. If you're self-employed or did gig work, keep track of what you earned.`
      }
    ]
  },
  {
    id: 'renters',
    icon: '🏠',
    title: 'Your Rights as a Renter',
    duration: '3 min',
    category: 'Housing',
    color: 'green',
    intro: "Knowing your rights as a renter protects you from illegal evictions, unsafe conditions, and landlord abuse. These rights apply even if you don't have a formal lease.",
    sections: [
      {
        heading: 'Basic renter rights',
        content: `**Habitability** — Your landlord must provide a safe, livable space. Heat, running water, and working locks are required by law in every state.

**Notice before entry** — Landlords must give 24–48 hours notice before entering your unit (except emergencies).

**Security deposit** — Must be returned within 14–30 days of moving out (varies by state) with an itemized list of any deductions.

**No retaliation** — Your landlord cannot evict you for complaining about unsafe conditions.`
      },
      {
        heading: 'Eviction process',
        content: `A landlord cannot just throw you out. The legal process is:
1. Written notice (3–30 days depending on reason)
2. If you don't leave, they must file in court
3. You have the right to appear in court and defend yourself
4. Only a sheriff can physically remove you — not the landlord

If a landlord changes your locks, removes your belongings, or shuts off utilities to force you out — that's illegal. Call legal aid immediately.`
      },
      {
        heading: 'Getting legal help',
        content: `**Legal aid organizations** provide free legal help for housing issues. Find yours at lawhelp.org.

**211** — Call or text 211 for local housing resources and legal aid referrals.

**Tenant unions** — Many cities have tenant unions that provide free advice and advocacy.

Document everything in writing. Text messages and emails are legal evidence.`
      }
    ]
  }
]

function ModuleCard({ module, isCompleted, onClick }) {
  const colorMap = {
    amber:  'border-amber-500/30 bg-amber-500/5',
    blue:   'border-blue-500/30 bg-blue-500/5',
    green:  'border-green-500/30 bg-green-500/5',
    purple: 'border-purple-500/30 bg-purple-500/5',
  }
  const textMap = {
    amber: 'text-amber-400', blue: 'text-blue-400', green: 'text-green-400', purple: 'text-purple-400'
  }

  return (
    <button
      onClick={onClick}
      className={`text-left p-5 rounded-xl border transition-all hover:scale-[1.01] ${
        isCompleted ? 'border-green-500/30 bg-green-500/5' : colorMap[module.color]
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-3xl">{module.icon}</span>
        {isCompleted && <span className="text-green-400 text-xs bg-green-500/20 px-2 py-1 rounded-full">✓ Done</span>}
      </div>
      <p className="text-white font-semibold mb-1">{module.title}</p>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium ${textMap[module.color]}`}>{module.category}</span>
        <span className="text-navy-500 text-xs">·</span>
        <span className="text-navy-400 text-xs">{module.duration} read</span>
      </div>
    </button>
  )
}

function ModuleReader({ module, onComplete, onBack }) {
  const [section, setSection] = useState(0)
  const total = module.sections.length

  function renderContent(text) {
    return text.split('\n\n').map((para, i) => {
      const formatted = para.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
      return <p key={i} className="text-navy-200 text-sm leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: formatted }} />
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-navy-400 hover:text-white transition-colors text-sm">← Back</button>
        <span className="text-navy-600">·</span>
        <span className="text-navy-400 text-sm">{module.category}</span>
      </div>

      <div className="bg-navy-800 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-4xl">{module.icon}</span>
          <div>
            <h2 className="text-white text-xl font-bold">{module.title}</h2>
            <p className="text-navy-400 text-sm">{module.duration} read</p>
          </div>
        </div>
        <p className="text-navy-200 text-sm leading-relaxed italic border-l-2 border-amber-500 pl-4">
          {module.intro}
        </p>
      </div>

      {/* Section progress */}
      <div className="flex gap-2">
        {module.sections.map((_, i) => (
          <button
            key={i}
            onClick={() => setSection(i)}
            className={`flex-1 h-1.5 rounded-full transition-colors ${i <= section ? 'bg-amber-500' : 'bg-navy-700'}`}
          />
        ))}
      </div>

      {/* Current section */}
      <div className="bg-navy-800 rounded-xl p-6">
        <h3 className="text-amber-400 font-semibold mb-4">{module.sections[section].heading}</h3>
        {renderContent(module.sections[section].content)}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {section > 0 && (
          <button
            onClick={() => setSection(s => s - 1)}
            className="flex-1 bg-navy-800 hover:bg-navy-700 text-white py-3 rounded-xl text-sm transition-colors"
          >
            ← Previous
          </button>
        )}
        {section < total - 1 ? (
          <button
            onClick={() => setSection(s => s + 1)}
            className="flex-1 bg-amber-500 hover:bg-amber-600 text-navy-900 font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            Next →
          </button>
        ) : (
          <button
            onClick={onComplete}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
          >
            ✓ Mark Complete
          </button>
        )}
      </div>
    </div>
  )
}

export default function FinancialLiteracy() {
  const [activeModule, setActiveModule] = useState(null)
  const [completed, setCompleted] = useState(new Set())
  const [filter, setFilter] = useState('All')

  const categories = ['All', ...new Set(MODULES.map(m => m.category))]
  const filtered = filter === 'All' ? MODULES : MODULES.filter(m => m.category === filter)

  if (activeModule) {
    return (
      <ModuleReader
        module={activeModule}
        onBack={() => setActiveModule(null)}
        onComplete={() => {
          setCompleted(p => new Set([...p, activeModule.id]))
          setActiveModule(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Financial Literacy</h2>
        <span className="text-navy-400 text-sm">{completed.size}/{MODULES.length} completed</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-navy-700 rounded-full h-2">
        <div
          className="h-2 rounded-full bg-amber-500 transition-all duration-700"
          style={{ width: `${(completed.size / MODULES.length) * 100}%` }}
        />
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filter === cat ? 'bg-amber-500 text-navy-900 font-medium' : 'bg-navy-800 text-navy-300 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(module => (
          <ModuleCard
            key={module.id}
            module={module}
            isCompleted={completed.has(module.id)}
            onClick={() => setActiveModule(module)}
          />
        ))}
      </div>
    </div>
  )
}
