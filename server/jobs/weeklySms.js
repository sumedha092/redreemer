import cron from 'node-cron'
import { supabase } from '../services/supabase.js'
import { getConversationHistory } from '../services/supabase.js'
import { generateProgressSMS, generateWeeklyWins } from '../services/gemini.js'
import { sendSMS } from '../services/twilio.js'

/**
 * Weekly Sunday 9am SMS — personalized progress update + weekly wins.
 * Skips users who texted in last 24 hours (already engaged).
 * Skips users with unresolved crisis alerts.
 * Cron: 0 9 * * 0
 */
export function startWeeklySmsJob() {
  cron.schedule('0 9 * * 0', async () => {
    console.log('[WeeklySMS] Starting Sunday progress update...')
    let sent = 0, failed = 0, skipped = 0

    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .not('phone_number', 'is', null)
        .eq('opted_out', false)
        .not('user_type', 'is', null)
        .gte('last_active', thirtyDaysAgo)

      if (error) throw error

      const { data: crisisAlerts } = await supabase
        .from('crisis_alerts')
        .select('phone')
        .eq('resolved', false)

      const crisisPhones = new Set((crisisAlerts || []).map(a => a.phone))

      for (const user of (users || [])) {
        if (!user.phone_number) continue
        if (crisisPhones.has(user.phone_number)) { skipped++; continue }
        if (user.last_active && user.last_active > oneDayAgo) { skipped++; continue }

        try {
          const history = await getConversationHistory(user.id, 20)

          // Feature 19: Gather this week's activity for wins summary
          const weekHistory = history.filter(m => m.created_at && m.created_at > oneWeekAgo)
          const { data: weekSteps } = await supabase
            .from('step_logs')
            .select('step_number, completed_at')
            .eq('user_id', user.id)
            .gte('completed_at', oneWeekAgo)

          const weekSummary = {
            messageCount: weekHistory.filter(m => m.role === 'user').length,
            stepsAdvanced: (weekSteps || []).length,
            topics: [...new Set(weekHistory
              .filter(m => m.role === 'user')
              .map(m => m.content.toLowerCase())
              .flatMap(c => {
                const topics = []
                if (c.includes('bank') || c.includes('account')) topics.push('banking')
                if (c.includes('job') || c.includes('work')) topics.push('employment')
                if (c.includes('id') || c.includes('license')) topics.push('ID documents')
                if (c.includes('benefit') || c.includes('snap') || c.includes('medicaid')) topics.push('benefits')
                if (c.includes('shelter') || c.includes('housing')) topics.push('housing')
                if (c.includes('save') || c.includes('budget')) topics.push('savings')
                return topics
              })
            )],
          }

          // Generate progress SMS
          const progressMsg = await generateProgressSMS(user, history)
          await sendSMS(user.phone_number, progressMsg)

          // Feature 19: Send weekly wins if there's something to celebrate
          if (weekSummary.messageCount > 0 || weekSummary.stepsAdvanced > 0) {
            await new Promise(r => setTimeout(r, 2000))
            const winsMsg = await generateWeeklyWins(user, weekSummary)
            if (winsMsg) await sendSMS(user.phone_number, winsMsg)
          }

          sent++
          await new Promise(r => setTimeout(r, 1000))
        } catch (err) {
          console.error(`[WeeklySMS] Failed for user ${user.id}:`, err.message)
          failed++
        }
      }
    } catch (err) {
      console.error('[WeeklySMS] Job error:', err)
    }

    console.log(`[WeeklySMS] Done. Sent: ${sent}, Failed: ${failed}, Skipped: ${skipped}`)
  })
}
