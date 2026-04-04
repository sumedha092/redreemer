const HOMELESS_STEPS = [
  'Connect to Redreemer',
  'Get a free state ID',
  'Get shelter address for mail',
  'Open Bank On account',
  'Enroll in benefits',
  'Find stable income source',
  'Save first $200',
  'Save $500 housing deposit'
]

const REENTRY_STEPS = [
  'Connect to Redreemer',
  'Complete first parole check-in',
  'Get free state ID',
  'Open Bank On account',
  'Enroll in benefits',
  'Find Ban the Box employer',
  'Start paying court debt with legal aid',
  'Save first $500 emergency fund'
]

export default function StepProgress({ client }) {
  const steps = client.user_type === 'reentry' ? REENTRY_STEPS : HOMELESS_STEPS
  const current = client.current_step || 1

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm">Progress</h3>
        <span className="text-amber-500 text-sm font-medium">Step {current} of 8</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-navy-700 rounded-full h-2 mb-4">
        <div
          className="bg-amber-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${((current - 1) / 7) * 100}%` }}
        />
      </div>

      {/* Step list */}
      <div className="space-y-2">
        {steps.map((step, i) => {
          const stepNum = i + 1
          const isCompleted = stepNum < current
          const isActive = stepNum === current
          const isLocked = stepNum > current

          return (
            <div
              key={i}
              className={`flex items-center gap-3 p-2 rounded-lg text-sm transition-colors ${
                isActive ? 'bg-amber-500/10 border border-amber-500/30' :
                isCompleted ? 'opacity-60' : 'opacity-30'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                isCompleted ? 'bg-green-500 text-white' :
                isActive ? 'bg-amber-500 text-navy-900' :
                'bg-navy-700 text-navy-400'
              }`}>
                {isCompleted ? '✓' : stepNum}
              </div>
              <span className={isActive ? 'text-amber-400 font-medium' : isCompleted ? 'text-green-400' : 'text-navy-400'}>
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
