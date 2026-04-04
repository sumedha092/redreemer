import cron from 'node-cron'
import { getInactiveUsers, updateLastActive } from '../services/supabase.js'
import { sendSMS } from '../services/twilio.js'

/**
 * 5-day inactivity check-in — runs daily at 10am.
 * Sends a gentle check-in to users who haven't texted in 5+ days.
 * Cron: 0 10 * * *
 */
export function startCheckinJob() {
  cron.schedule('0 10 * * *', async () => {
    console.log('[Checkin] Running 5-day inactivity check...')
    let sent = 0

    try {
      const inactiveUsers = await getInactiveUsers(5)

      for (const user of inactiveUsers) {
        if (!user.phone_number) continue
        try {
          const name = user.name || 'there'
          const message = `Hey ${name}. Just checking in. You're on Step ${user.current_step} of 8. One small thing this week could move you forward. What's going on?`
          await sendSMS(user.phone_number, message)
          // Update last_active to prevent duplicate check-ins tomorrow
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
