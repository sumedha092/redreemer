const HOMELESS_STEPS = [
  'Connect to Redreemer',
  'Get a free state ID',
  'Get shelter address for mail',
  'Open Bank On account',
  'Enroll in benefits',
  'Find stable income source',
  'Save first $200',
  'Save $500 housing deposit',
]

const REENTRY_STEPS = [
  'Connect to Redreemer',
  'Complete first parole check-in',
  'Get free state ID',
  'Open Bank On account',
  'Enroll in benefits',
  'Find Ban the Box employer',
  'Start paying court debt with legal aid',
  'Save first $500 emergency fund',
]

export default function StepProgress({ client }) {
  const steps = client.user_type === 'reentry' ? REENTRY_STEPS : HOMELESS_STEPS
  const current = client.current_step || 1
  const pct = Math.round(((current - 1) / 7) * 100)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">Journey Progress</h3>
        <span className="text-xs font-medium text-[hsl(var(--primary))]">{pct}% complete</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[hsl(var(--muted))] rounded-full h-1.5 mb-4">
        <div
          className="bg-[hsl(var(--primary))] h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Step list */}
      <div className="space-y-1.5">
        {steps.map((step, i) => {
          const stepNum = i + 1
          const isCompleted = stepNum < current
          const isActive = stepNum === current
          const isLocked = stepNum > current

          return (
            <div
              key={i}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                isActive
                  ? 'bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.25)]'
                  : isCompleted
                  ? 'opacity-70'
                  : 'opacity-30'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                isCompleted
                  ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                  : isActive
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                  : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]'
              }`}>
                {isCompleted ? '✓' : stepNum}
              </div>
              <span className={`text-xs leading-snug ${
                isActive
                  ? 'text-[hsl(var(--primary))] font-medium'
                  : isCompleted
                  ? 'text-green-400'
                  : 'text-[hsl(var(--muted-foreground))]'
              }`}>
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
