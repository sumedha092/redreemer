import cron from 'node-cron'
import { supabase } from '../services/supabase.js'
import { updateLastActive, getConversationHistory } from '../services/supabase.js'
import { sendSMS } from '../services/twilio.js'
import { generateContextualCheckin } from '../services/gemini.js'

/**
 * Returns the inactivity threshold (days) for a given step.
 */
function getInactivityDays(step) {
  if (step <= 2) return 2
  if (step <= 4) return 5
  if (step <= 6) return 7
  return 14
}

/**
 * Contextual check-in job — runs daily at 10am.
 * Uses Gemini to generate personalized messages referencing prior conversation.
 * Cron: 0 10 * * *
 */
export function startCheckinJob() {
  cron.schedule('0 10 * * *', async () => {
    console.log('[Checkin] Running contextual check-in...')
    let sent = 0

    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .not('phone_number', 'is', null)
        .eq('opted_out', false)
        .not('user_type', 'is', null)

      if (error) throw error

      for (const user of (users || [])) {
        if (!user.phone_number) continue

        const inactivityDays = getInactivityDays(user.current_step || 1)
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - inactivityDays)

        const lastActive = user.last_active ? new Date(user.last_active) : new Date(0)
        if (lastActive > cutoff) continue

        try {
          // Fetch last 3 messages for context
          const history = await getConversationHistory(user.id, 6)
          const msg = await generateContextualCheckin(user, history)
          await sendSMS(user.phone_number, msg)
          await updateLastActive(user.id)
          sent++
          await new Promise(r => setTimeout(r, 500))
        } catch (err) {
          console.error(`[Checkin] Failed for user ${user.id}:`, err.message)
        }
      }
    } catch (err) {
      console.error('[Checkin] Job error:', err)
    }

    console.log(`[Checkin] Done. Sent ${sent} check-ins.`)
  })
}
