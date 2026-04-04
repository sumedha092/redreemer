import cron from 'node-cron'
import { getAllUsers, getConversationHistory } from '../services/supabase.js'
import { generateWeeklySummary } from '../services/gemini.js'
import { sendSMS } from '../services/twilio.js'

/**
 * Weekly Sunday 9am SMS — personalized progress update for every user.
 * Cron: 0 9 * * 0
 */
export function startWeeklySmsJob() {
  cron.schedule('0 9 * * 0', async () => {
    console.log('[WeeklySMS] Starting Sunday weekly update...')
    let sent = 0
    let failed = 0

    try {
      const users = await getAllUsers()
      for (const user of users) {
        if (!user.phone_number) continue
        try {
          const history = await getConversationHistory(user.id, 10)
          const message = await generateWeeklySummary(user, history)
          await sendSMS(user.phone_number, message)
          sent++
          // Rate limit: 1 second between sends
          await new Promise(r => setTimeout(r, 1000))
        } catch (err) {
          console.error(`[WeeklySMS] Failed for user ${user.id}:`, err.message)
          failed++
        }
      }
    } catch (err) {
      console.error('[WeeklySMS] Job error:', err)
    }

    console.log(`[WeeklySMS] Done. Sent: ${sent}, Failed: ${failed}`)
  })
}
