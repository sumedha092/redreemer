import { supabase } from './supabase.js'

/**
 * Calculate Financial Health Score (0-100) for a user.
 * Based on their profile, step progress, and activity.
 */
export function calculateScore(user, stepLogs = []) {
  let score = 0

  // Step progress: +1 per completed step (max 8)
  const completedSteps = stepLogs.length
  score += Math.min(completedSteps, 8)

  // Current step milestones
  const step = user.current_step || 1

  // Has ID (step 2+ for homeless, step 3+ for reentry)
  const idStep = user.user_type === 'reentry' ? 3 : 2
  if (step >= idStep) score += 10

  // Has mailing address / stable housing (step 3+ homeless, step 2+ reentry)
  if (step >= 3) score += 10

  // Has bank account (step 4+)
  if (step >= 4) score += 10

  // Enrolled in benefits (step 5+)
  if (step >= 5) score += 10

  // Has income (step 6+)
  if (step >= 6) score += 15

  // Has emergency fund started (step 7+)
  if (step >= 7) score += 10

  // Deposit ready / full independence (step 8)
  if (step >= 8) score += 10

  // Activity bonus: active in last 7 days
  if (user.last_active) {
    const daysSince = (Date.now() - new Date(user.last_active)) / (1000 * 60 * 60 * 24)
    if (daysSince <= 7) score += 5
    if (daysSince <= 2) score += 2 // extra for very recent activity
  }

  return Math.min(score, 100)
}

/**
 * Get score color based on value.
 */
export function getScoreColor(score) {
  if (score >= 71) return '#22c55e' // green
  if (score >= 41) return '#f59e0b' // amber
  return '#ef4444' // red
}

/**
 * Get score label.
 */
export function getScoreLabel(score) {
  if (score >= 71) return 'Strong'
  if (score >= 41) return 'Building'
  return 'Critical'
}

/**
 * Update financial health score in Supabase for a user.
 */
export async function updateHealthScore(userId) {
  try {
    // Fetch user and step logs
    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single()
    const { data: stepLogs } = await supabase.from('step_logs').select('*').eq('user_id', userId)

    if (!user) return null

    const score = calculateScore(user, stepLogs || [])

    await supabase
      .from('users')
      .update({ financial_health_score: score })
      .eq('id', userId)

    return score
  } catch (err) {
    console.error('updateHealthScore error:', err.message)
    return null
  }
}
