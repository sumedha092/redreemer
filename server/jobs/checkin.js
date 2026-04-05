import cron from 'node-cron'
import { supabase } from '../services/supabase.js'
import { updateLastActive } from '../services/supabase.js'
import { sendSMS } from '../services/twilio.js'

/**
 * Returns the inactivity threshold (days) and check-in message for a given step.
 */
function getCheckinConfig(step) {
  if (step <= 2) {
    return {
      days: 2,
      message: (name, step) => `Hey ${name}. Just checking in. You're on Step ${step} of 8 — finding shelter and ID. Have you been able to find a safe place to sleep? Text me what's going on.`
    }
  }
  if (step <= 4) {
    return {
      days: 5,
      message: (name, step) => `Hey ${name}. It's been a few days. You're on Step ${step} of 8 — working on stability. How is the housing situation going? One small thing this week could move you forward.`
    }
  }
  if (step <= 6) {
    return {
      days: 7,
      message: (name, step) => `Hey ${name}. Checking in on Step ${step} of 8 — employment and income. Have you been able to connect with any employers? I can help with Ban the Box jobs or benefits if you need it.`
    }
  }
  return {
    days: 14,
    message: (name, step) => `Hey ${name}. You're on Step ${step} of 8 — building toward full independence. How is the savings goal going? You're close. What's the biggest obstacle right now?`
  }
}

/**
 * Enhanced check-in job — runs daily at 10am.
 * Uses step-based inactivity thresholds.
 * Cron: 0 10 * * *
 */
export function startCheckinJob() {
  cron.schedule('0 10 * * *', async () => {
    console.log('[Checkin] Running step-based inactivity check...')
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

        const config = getCheckinConfig(user.current_step || 1)
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - config.days)

        const lastActive = user.last_active ? new Date(user.last_active) : new Date(0)
        if (lastActive > cutoff) continue

        try {
          const name = user.name || 'there'
          const msg = config.message(name, user.current_step || 1)
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
