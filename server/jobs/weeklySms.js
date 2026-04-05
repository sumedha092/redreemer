import cron from 'node-cron'
import { supabase } from '../services/supabase.js'
import { getConversationHistory } from '../services/supabase.js'
import { generateWeeklySnapshot } from '../services/gemini.js'
import { sendSMS } from '../services/twilio.js'

/**
 * Weekly Sunday 9am SMS — personalized 3-part progress update.
 * Only sends to: active in last 30 days, opted_out=false, no unresolved crisis alerts.
 * Cron: 0 9 * * 0
 */
export function startWeeklySmsJob() {
  cron.schedule('0 9 * * 0', async () => {
    console.log('[WeeklySMS] Starting Sunday weekly update...')
    let sent = 0
    let failed = 0
    let skipped = 0

    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

      // Get eligible users: active in last 30 days, not opted out, have user_type
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .not('phone_number', 'is', null)
        .eq('opted_out', false)
        .not('user_type', 'is', null)
        .gte('last_active', thirtyDaysAgo)

      if (error) throw error

      // Get all unresolved crisis alert phones
      const { data: crisisAlerts } = await supabase
        .from('crisis_alerts')
        .select('phone')
        .eq('resolved', false)

      const crisisPhones = new Set((crisisAlerts || []).map(a => a.phone))

      for (const user of (users || [])) {
        if (!user.phone_number) continue

        // Skip users with unresolved crisis alerts
        if (crisisPhones.has(user.phone_number)) {
          skipped++
          continue
        }

        try {
          const history = await getConversationHistory(user.id, 10)
          const snapshot = await generateWeeklySnapshot(user, history)

          // Send 3 parts with 2 second delays
          await sendSMS(user.phone_number, snapshot.part1)
          await new Promise(r => setTimeout(r, 2000))
          await sendSMS(user.phone_number, snapshot.part2)
          await new Promise(r => setTimeout(r, 2000))
          await sendSMS(user.phone_number, snapshot.part3)

          sent++
          // Rate limit between users
          await new Promise(r => setTimeout(r, 1000))
        } catch (err) {
          console.error(`[WeeklySMS] Failed for user ${user.id}:`, err.message)
          failed++
        }
      }
    } catch (err) {
      console.error('[WeeklySMS] Job error:', err)
    }

    console.log(`[WeeklySMS] Done. Sent: ${sent}, Failed: ${failed}, Skipped (crisis): ${skipped}`)
  })
}
