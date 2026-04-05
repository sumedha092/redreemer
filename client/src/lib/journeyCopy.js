/** Short, low-literacy labels for the 8-step journey (emotional framing). */
export const STEP_DONE = [
  'You reached out — that took courage.',
  'You started your ID path.',
  'You moved toward stable mail or shelter.',
  'You opened or started banking access.',
  'You looked into benefits.',
  'You’re working on income.',
  'You started saving.',
  'You’re building toward housing costs.',
]

export const STEP_NEXT = [
  'Tell us if you’re homeless, returning, or both — we’ll personalize.',
  'Next: get a free state ID (we’ll walk you through it).',
  'Next: shelter or a safe mailing address.',
  'Next: a safe bank account (Bank On style).',
  'Next: SNAP / Medicaid / benefits you qualify for.',
  'Next: income — job or benefits in a steady way.',
  'Next: first savings, even small amounts count.',
  'Next: housing deposit fund — little by little.',
]

export function emotionalProgress(step, stepCompleted) {
  const s = Math.min(Math.max(Number(step) || 1, 1), 8)
  const idx = s - 1
  const doneLine =
    s <= 1
      ? "You’re here — reaching out is a real step."
      : STEP_DONE[Math.min(idx - 1, STEP_DONE.length - 1)]
  const nextLine = STEP_NEXT[idx] || STEP_NEXT[STEP_NEXT.length - 1]
  return {
    doneLabel: stepCompleted ? STEP_DONE[Math.min(idx, STEP_DONE.length - 1)] : doneLine,
    nextLabel: nextLine,
    step: s,
  }
}
