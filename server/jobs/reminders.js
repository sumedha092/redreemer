import cron from 'node-cron'
import { getDueReminders, markReminderSent } from '../services/supabase.js'
import { sendSMS } from '../services/twilio.js'

/**
 * Reminder delivery — runs every 5 minutes.
 * Sends any reminders where sent=false and send_at <= NOW().
 * Cron: every 5 minutes
 */
export function startRemindersJob() {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const reminders = await getDueReminders()
      if (reminders.length === 0) return

      console.log(`[Reminders] Processing ${reminders.length} due reminders...`)

      for (const reminder of reminders) {
        try {
          const phone = reminder.users?.phone_number
          if (!phone) continue

          await sendSMS(phone, reminder.reminder_text)
          await markReminderSent(reminder.id)
          console.log(`[Reminders] Sent reminder ${reminder.id}`)
        } catch (err) {
          console.error(`[Reminders] Failed for reminder ${reminder.id}:`, err.message)
        }
      }
    } catch (err) {
      console.error('[Reminders] Job error:', err)
    }
  })
}
