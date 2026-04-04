import express from 'express'
import { sendSMS, sendMMS } from '../services/twilio.js'
import { classifyUserType, generateResponse, generateRecoveryQuestion } from '../services/gemini.js'
import { getClipUrl } from '../services/elevenlabs.js'
import { getShelterForCity } from '../services/weather.js'
import {
  getUserByPhone,
  createUser,
  updateUserType,
  updateCurrentStep,
  updateLastActive,
  getConversationHistory,
  saveConversation,
  logStepCompletion,
  saveReminder,
  getAllUsers
} from '../services/supabase.js'

const router = express.Router()

// In-memory store for pending profile recovery confirmations
// Maps phone_number -> { existingUserId, expiresAt }
const pendingRecovery = new Map()

/**
 * Parse [STEP_COMPLETE] signal from AI response.
 */
function parseStepComplete(text) {
  return text.includes('[STEP_COMPLETE]')
}

/**
 * Parse [REMINDER: text | ISO_datetime] signal from AI response.
 * Returns { text, sendAt } or null.
 */
function parseReminder(text) {
  const match = text.match(/\[REMINDER:\s*(.+?)\s*\|\s*(.+?)\]/i)
  if (!match) return null
  try {
    const sendAt = new Date(match[2].trim())
    if (isNaN(sendAt.getTime())) return null
    return { text: match[1].trim(), sendAt: sendAt.toISOString() }
  } catch {
    return null
  }
}

/**
 * Strip all signals from outbound message.
 */
function stripSignals(text) {
  return text
    .replace(/\[STEP_COMPLETE\]/gi, '')
    .replace(/\[REMINDER:[^\]]*\]/gi, '')
    .trim()
}

/**
 * POST /sms/incoming — Twilio webhook
 */
router.post('/incoming', async (req, res) => {
  // Respond to Twilio immediately to avoid timeout
  res.set('Content-Type', 'text/xml')
  res.send('<Response></Response>')

  const phone = req.body.From
  const message = (req.body.Body || '').trim()

  if (!phone || !message) return

  try {
    // Check for pending profile recovery confirmation
    const recovery = pendingRecovery.get(phone)
    if (recovery) {
      if (Date.now() < recovery.expiresAt) {
        if (message.toUpperCase().includes('YES')) {
          // Reconnect profile
          const { supabase } = await import('../services/supabase.js')
          await supabase.from('users').update({ phone_number: phone }).eq('id', recovery.existingUserId)
          pendingRecovery.delete(phone)
          await sendSMS(phone, `Welcome back. Your Redreemer profile is restored. You're on Step ${recovery.currentStep}. What do you need right now?`)
          return
        } else {
          pendingRecovery.delete(phone)
        }
      } else {
        pendingRecovery.delete(phone)
      }
    }

    let user = await getUserByPhone(phone)

    // --- NEW USER ---
    if (!user) {
      // Check if message contains a name matching an existing profile (profile recovery)
      const { data: allUsers } = await import('../services/supabase.js').then(m =>
        m.supabase.from('users').select('id, name, city, current_step').not('name', 'is', null)
      )
      const matchedUser = (allUsers || []).find(u =>
        u.name && message.toLowerCase().includes(u.name.toLowerCase())
      )

      if (matchedUser) {
        // Store pending recovery and ask confirmation
        pendingRecovery.set(phone, {
          existingUserId: matchedUser.id,
          currentStep: matchedUser.current_step,
          expiresAt: Date.now() + 10 * 60 * 1000 // 10 min window
        })
        const question = await generateRecoveryQuestion(matchedUser)
        await sendSMS(phone, question)
        return
      }

      // Brand new user
      user = await createUser(phone)
      await sendSMS(phone,
        `You reached Redreemer. We help people get back on their feet — banking, housing, benefits, jobs.\n\nOne question: Are you currently homeless, recently released from prison, or both?`
      )
      return
    }

    // --- USER EXISTS BUT NO user_type YET ---
    if (!user.user_type) {
      let userType
      try {
        userType = await classifyUserType(message)
      } catch (err) {
        console.error('Classification error:', err)
        userType = 'homeless'
      }

      user = await updateUserType(user.id, userType)

      const welcomeMessages = {
        homeless: `Got it. I'm here to help you find shelter, food, ID, banking, and a path to housing — step by step.\n\nYou're on Step 1 of 8. What do you need most right now — food, shelter, or something else?`,
        reentry: `Got it. First 90 days after release are critical. I'll help you with parole check-in, ID, banking, jobs, and benefits — one step at a time.\n\nYou're on Step 1 of 8. Do you have your parole check-in address and time?`,
        both: `Got it. You're dealing with a lot right now. I'll help with both — parole, shelter, ID, banking, benefits, and housing.\n\nYou're on Step 1 of 8. What's most urgent right now?`
      }

      await sendSMS(phone, welcomeMessages[userType] || welcomeMessages.homeless)
      return
    }

    // --- EXISTING USER WITH user_type ---

    // Handle SHELTER keyword
    if (message.toUpperCase() === 'SHELTER' && user.city) {
      const shelter = await getShelterForCity(user.city)
      await sendSMS(phone, `${shelter.name}\n${shelter.address}\nPhone: ${shelter.phone}\n\nText me if you need bus directions or anything else.`)
      return
    }

    // Update last active
    await updateLastActive(user.id)

    // Fetch conversation history
    const history = await getConversationHistory(user.id, 20)

    // Generate AI response
    let aiResponse
    try {
      aiResponse = await generateResponse(user, history, message)
    } catch (err) {
      console.error('Gemini error:', err)
      await sendSMS(phone, `I'm having trouble right now. Text me again in a moment. If urgent: call 988 or text HOME to 741741.`)
      return
    }

    // Parse signals
    const stepComplete = parseStepComplete(aiResponse)
    const reminder = parseReminder(aiResponse)

    // Handle step completion
    if (stepComplete) {
      const completedStep = user.current_step
      const newStep = Math.min(completedStep + 1, 8)
      try {
        await updateCurrentStep(user.id, newStep)
        await logStepCompletion(user.id, completedStep)
        // Update financial health score
        const { updateHealthScore } = await import('../services/healthScore.js')
        await updateHealthScore(user.id)
        // Send voice clip if defined
        const clipUrl = getClipUrl(user.user_type, completedStep)
        if (clipUrl) {
          await sendMMS(phone, clipUrl, '')
        }
      } catch (err) {
        console.error('Step completion error:', err)
      }
    }

    // Handle reminder extraction
    if (reminder) {
      try {
        await saveReminder(user.id, reminder.text, reminder.sendAt)
      } catch (err) {
        console.error('Reminder save error (non-fatal):', err.message)
      }
    }

    // Strip signals from outbound message
    const outbound = stripSignals(aiResponse)

    // Persist conversation
    try {
      await saveConversation(user.id, 'user', message)
      await saveConversation(user.id, 'assistant', outbound)
    } catch (err) {
      console.error('Conversation save error:', err)
    }

    // Send reply
    await sendSMS(phone, outbound)

  } catch (err) {
    console.error('SMS controller error:', err)
    try {
      await sendSMS(phone, `Something went wrong on my end. Try again in a moment. If urgent: call 988 or text HOME to 741741.`)
    } catch (sendErr) {
      console.error('Failed to send error SMS:', sendErr)
    }
  }
})

export default router
