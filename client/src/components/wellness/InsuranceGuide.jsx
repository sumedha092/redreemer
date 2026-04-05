import { useState } from 'react'

const INSURANCE_TYPES = [
  {
    id: 'renters',
    icon: '🏠',
    name: "Renters Insurance",
    tagline: "$11/month. Covers everything you own.",
    color: 'amber',
    why: "If your apartment floods, burns, or gets broken into — renters insurance replaces your stuff. Your landlord's insurance covers the building, not your belongings.",
    whoNeeds: "Anyone renting an apartment or room. Required by many landlords.",
    whatCovers: [
      "Personal property (clothes, electronics, furniture)",
      "Liability if someone gets hurt in your home",
      "Temporary housing if your place becomes uninhabitable",
      "Theft — even outside your home"
    ],
    whatDoesnt: ["Floods (need separate flood insurance)", "Earthquakes", "Your car"],
    avgCost: "$11–$20/month",
    howToGet: "Go to lemonade.com or progressive.com. Takes 5 minutes. No credit check required.",
    forUs: "Once you have a mailing address, get renters insurance before you move in. It's often required and protects the savings you've worked hard to build.",
    costCalc: { base: 11, perThousand: 0.5 }
  },
  {
    id: 'health',
    icon: '💊',
    name: "Health Insurance",
    tagline: "Medicaid is free if you qualify. You probably do.",
    color: 'green',
    why: "One ER visit without insurance can cost $3,000–$10,000. Health insurance means you pay $0–$50 instead.",
    whoNeeds: "Everyone. If your income is low, Medicaid covers you for free.",
    whatCovers: [
      "Doctor visits and checkups",
      "Emergency room visits",
      "Prescriptions",
      "Mental health and substance use treatment",
      "Dental and vision (with some plans)"
    ],
    whatDoesnt: ["Cosmetic procedures", "Some experimental treatments"],
    avgCost: "$0/month on Medicaid · $0–$50/month on ACA marketplace plans",
    howToGet: "Text your state name to Redreemer and we'll find your local Medicaid office. Or go to healthcare.gov. You can enroll anytime if you're newly released from prison or newly homeless.",
    forUs: "If you were recently released from prison or are experiencing homelessness, you qualify for a Special Enrollment Period — you can sign up right now, not just during open enrollment.",
    costCalc: null
  },
  {
    id: 'life',
    icon: '👨‍👩‍👧',
    name: "Life Insurance",
    tagline: "Protects your family if something happens to you.",
    color: 'blue',
    why: "If you have children or someone who depends on your income, life insurance makes sure they're not left with nothing.",
    whoNeeds: "People with dependents (children, elderly parents). Less urgent if you're single with no dependents.",
    whatCovers: [
      "Pays a lump sum to your beneficiary when you die",
      "Term life: covers you for 10–30 years",
      "Whole life: covers you forever, builds cash value"
    ],
    whatDoesnt: ["Suicide in first 2 years", "Death from illegal activities"],
    avgCost: "$15–$30/month for a healthy 30-year-old (term life)",
    howToGet: "Start with term life — it's cheaper and simpler. Try policygenius.com to compare quotes.",
    forUs: "If you have kids, even a $50,000 policy at $15/month gives them a safety net. Get this after you have a bank account and stable income.",
    costCalc: null
  },
  {
    id: 'auto',
    icon: '🚗',
    name: "Auto Insurance",
    tagline: "Required by law in 49 states.",
    color: 'purple',
    why: "Driving without insurance can result in license suspension, fines, and personal liability for accidents.",
    whoNeeds: "Anyone who drives a car, even occasionally.",
    whatCovers: [
      "Liability: damage you cause to others",
      "Collision: damage to your car in an accident",
      "Comprehensive: theft, weather, fire",
      "Uninsured motorist: if someone hits you with no insurance"
    ],
    whatDoesnt: ["Mechanical breakdowns", "Personal belongings in the car"],
    avgCost: "$80–$150/month (varies by state, driving record, car)",
    howToGet: "Compare at thegeneral.com or progressive.com — both work with people who have imperfect records.",
    forUs: "If you have a DUI or criminal record, The General and Progressive specialize in high-risk drivers. Your rate will be higher but you can still get covered.",
    costCalc: null
  }
]

function CostEstimator({ insurance }) {
  const [propertyValue, setPropertyValue] = useState(2000)
  if (!insurance.costCalc) return null
  const estimated = insurance.costCalc.base + (propertyValue / 1000) * insurance.costCalc.perThousand
  return (
    <div className="bg-[hsl(var(--muted)/0.5)] rounded-xl p-4 mt-4">
      <h4 className="text-[hsl(var(--foreground))] font-medium text-sm mb-3">Cost Estimator</h4>
      <div className="flex items-center gap-3 mb-2">
        <label className="text-[hsl(var(--foreground)/0.7)] text-xs whitespace-nowrap">Property value: ${propertyValue.toLocaleString()}</label>
        <input
          type="range" min="500" max="10000" step="500"
          value={propertyValue}
          onChange={e => setPropertyValue(Number(e.target.value))}
          className="flex-1 accent-amber-500"
        />
      </div>
      <p className="text-amber-400 font-bold">Estimated: ~${estimated.toFixed(0)}/month</p>
    </div>
  )
}

export default function InsuranceGuide() {
  const [selected, setSelected] = useState('renters')
  const ins = INSURANCE_TYPES.find(i => i.id === selected)

  const colorMap = {
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', btn: 'bg-amber-500 text-[hsl(var(--primary-foreground))]' },
    green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', btn: 'bg-green-600 text-[hsl(var(--foreground))]' },
    blue:  { bg: 'bg-blue-500/10',  border: 'border-blue-500/30',  text: 'text-blue-400',  btn: 'bg-blue-600 text-[hsl(var(--foreground))]' },
    purple:{ bg: 'bg-purple-500/10',border: 'border-purple-500/30',text: 'text-purple-400',btn: 'bg-purple-600 text-[hsl(var(--foreground))]' },
  }
  const c = colorMap[ins.color]

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Insurance Education</h2>
      <p className="text-[hsl(var(--muted-foreground))] text-sm">Insurance explained in plain English — no jargon, no sales pitch.</p>

      {/* Type selector */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {INSURANCE_TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => setSelected(type.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selected === type.id
                ? `${colorMap[type.color].bg} ${colorMap[type.color].border}`
                : 'glass-card border-[hsl(var(--border))] hover:border-[hsl(var(--border))]'
            }`}
          >
            <div className="text-2xl mb-2">{type.icon}</div>
            <p className="text-[hsl(var(--foreground))] font-medium text-sm">{type.name}</p>
            <p className="text-[hsl(var(--muted-foreground))] text-xs mt-1">{type.avgCost}</p>
          </button>
        ))}
      </div>

      {/* Detail panel */}
      <div className="glass-card rounded-2xl p-6 space-y-5">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{ins.icon}</span>
          <div>
            <h3 className="text-[hsl(var(--foreground))] text-xl font-bold">{ins.name}</h3>
            <p className={`${c.text} font-medium`}>{ins.tagline}</p>
          </div>
        </div>

        {/* Why you need it */}
        <div>
          <h4 className="text-[hsl(var(--foreground))] font-semibold text-sm mb-2">Why you need it</h4>
          <p className="text-[hsl(var(--foreground)/0.8)] text-sm leading-relaxed">{ins.why}</p>
        </div>

        {/* Who needs it */}
        <div className={`${c.bg} border ${c.border} rounded-xl p-4`}>
          <h4 className={`${c.text} font-semibold text-sm mb-1`}>Who needs it</h4>
          <p className="text-[hsl(var(--foreground)/0.8)] text-sm">{ins.whoNeeds}</p>
        </div>

        {/* What it covers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-green-400 font-semibold text-sm mb-2">✓ What it covers</h4>
            <ul className="space-y-1">
              {ins.whatCovers.map((item, i) => (
                <li key={i} className="text-[hsl(var(--foreground)/0.8)] text-sm flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">•</span>{item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-red-400 font-semibold text-sm mb-2">✗ What it doesn't cover</h4>
            <ul className="space-y-1">
              {ins.whatDoesnt.map((item, i) => (
                <li key={i} className="text-[hsl(var(--foreground)/0.8)] text-sm flex items-start gap-2">
                  <span className="text-red-400 mt-0.5">•</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Cost */}
        <div className="bg-[hsl(var(--muted)/0.5)] rounded-xl p-4">
          <h4 className="text-[hsl(var(--foreground))] font-semibold text-sm mb-1">Average cost</h4>
          <p className={`${c.text} font-bold text-lg`}>{ins.avgCost}</p>
        </div>

        {/* Cost estimator */}
        <CostEstimator insurance={ins} />

        {/* For our users */}
        <div className={`${c.bg} border ${c.border} rounded-xl p-4`}>
          <h4 className={`${c.text} font-semibold text-sm mb-2`}>For people using Redreemer</h4>
          <p className="text-[hsl(var(--foreground)/0.8)] text-sm leading-relaxed">{ins.forUs}</p>
        </div>

        {/* How to get it */}
        <div>
          <h4 className="text-[hsl(var(--foreground))] font-semibold text-sm mb-2">How to get it</h4>
          <p className="text-[hsl(var(--foreground)/0.8)] text-sm leading-relaxed">{ins.howToGet}</p>
        </div>
      </div>
    </div>
  )
}
