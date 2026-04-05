import express from 'express'
import { sendSMS, sendMMS } from '../services/textbelt.js'
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
  getAllUsers,
  setOptedOut,
  updatePreferredLanguage
} from '../services/supabase.js'
import { isCrisis, isMedicalEmergency, CRISIS_RESPONSE, CRISIS_RESPONSE_ES, MEDICAL_RESPONSE, logCrisisAlert } from '../services/crisisDetection.js'
import { detectSpanish, BILINGUAL_GREETING } from '../services/languageDetection.js'
import { detectPredatoryLending, detectInsuranceKeyword, PREDATORY_WARNING, getInsuranceResponse, logInsuranceProgress } from '../services/insuranceEducation.js'
import { formatForSMS, splitIntoMessages } from '../utils/smsFormatter.js'
import { hashPhone } from '../utils/privacy.js'

const router = express.Router()

const OPT_OUT_KEYWORDS = ['stop', 'unsubscribe', 'quit', 'cancel', 'end', 'stopall', 'arret']
const OPT_IN_KEYWORDS = ['start', 'unstop', 'yes']

// In-memory store for pending profile recovery confirmations
const pendingRecovery = new Map()

// No webhook signature validation needed for Textbelt / demo mode

/**
 * Parse [STEP_COMPLETE] signal from AI response.
 */
function parseStepComplete(text) {
  return text.includes('[STEP_COMPLETE]')
}

/**
 * Parse [REMINDER: text | ISO_datetime] signal from AI response.
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
 * Send multiple SMS messages with 1 second delay between each.
 */
async function sendMultiSMS(phone, messages) {
  for (let i = 0; i < messages.length; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, 1000))
    await sendSMS(phone, messages[i])
  }
}

/**
 * POST /sms/incoming — Twilio webhook
 */
async function handleIncoming(req, res) {
  // Twilio expects a 200 response immediately
  res.sendStatus(200)

  // Twilio sends From and Body in POST body
  const phone = req.body.From
  const message = (req.body.Body || '').trim()

  if (!phone || !message) return

  console.log(`[SMS] Incoming from ${phone}: "${message.slice(0, 60)}"`)

  try {
    // ── FEATURE 1: CRISIS CHECK (must be FIRST) ──────────────────────────────
    if (isMedicalEmergency(message)) {
      console.log(`[SMS] Branch: MEDICAL_EMERGENCY`)
      await logCrisisAlert(phone, message)
      await sendSMS(phone, MEDICAL_RESPONSE)
      return
    }

    if (isCrisis(message)) {
      console.log(`[SMS] Branch: CRISIS`)
      await logCrisisAlert(phone, message)
      const user = await getUserByPhone(phone)
      const usesSpanish = user?.preferred_language === 'es' || detectSpanish(message)
      await sendSMS(phone, usesSpanish ? CRISIS_RESPONSE_ES : CRISIS_RESPONSE)
      return
    }

    // ── FEATURE 2: OPT-OUT CHECK (must be SECOND) ────────────────────────────
    const msgLower = message.trim().toLowerCase()

    let user = await getUserByPhone(phone)
    console.log(`[SMS] User lookup: ${user ? `id=${user.id} type=${user.user_type} step=${user.current_step} opted_out=${user.opted_out}` : 'NEW USER'}`)

    if (OPT_OUT_KEYWORDS.includes(msgLower)) {
      console.log(`[SMS] Branch: OPT_OUT`)
      if (user) {
        await setOptedOut(user.id, true)
        console.log(`[OptOut] User opted out: ${hashPhone(phone)}`)
      }
      return
    }

    if (user?.opted_out === true) {
      console.log(`[SMS] Branch: SILENTLY_IGNORED (opted out)`)
      return
    }

    // ── PROFILE RECOVERY ─────────────────────────────────────────────────────
    const recovery = pendingRecovery.get(phone)
    if (recovery) {
      console.log(`[SMS] Branch: PROFILE_RECOVERY`)
      if (Date.now() < recovery.expiresAt) {
        if (message.toUpperCase().includes('YES')) {
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

    // ── NEW USER ──────────────────────────────────────────────────────────────
    if (!user) {
      console.log(`[SMS] Branch: NEW_USER — creating user then falling through to Gemini`)
      const { data: allUsers } = await import('../services/supabase.js').then(m =>
        m.supabase.from('users').select('id, name, city, current_step').not('name', 'is', null)
      )
      const matchedUser = (allUsers || []).find(u =>
        u.name && message.toLowerCase().includes(u.name.toLowerCase())
      )

      if (matchedUser) {
        pendingRecovery.set(phone, {
          existingUserId: matchedUser.id,
          currentStep: matchedUser.current_step,
          expiresAt: Date.now() + 10 * 60 * 1000
        })
        const question = await generateRecoveryQuestion(matchedUser)
        await sendSMS(phone, question)
        return
      }

      user = await createUser(phone)
      // Fall through to Gemini — let it handle the first message naturally
    }

    // ── USER EXISTS BUT NO user_type YET ─────────────────────────────────────
    if (!user.user_type) {
      console.log(`[SMS] Branch: CLASSIFY_USER_TYPE — classifying then falling through to Gemini`)

      if (['español', 'es', 'spanish'].includes(msgLower)) {
        await updatePreferredLanguage(user.id, 'es')
      }
      if (['english', 'en', 'inglés'].includes(msgLower)) {
        await updatePreferredLanguage(user.id, 'en')
      }

      let userType
      try {
        userType = await classifyUserType(message)
        console.log(`[SMS] Classified as: ${userType}`)
      } catch (err) {
        console.error('Classification error:', err)
        userType = 'homeless'
      }

      user = await updateUserType(user.id, userType)
      if (!user) {
        user = await getUserByPhone(phone)
      }
      // Fall through to Gemini — don't return here
    }

    // ── EXISTING USER WITH user_type — ALWAYS GOES TO GEMINI ─────────────────
    console.log(`[SMS] Branch: GEMINI_RESPONSE (type=${user.user_type} step=${user.current_step})`)

    // Language preference update mid-conversation
    if (['español', 'es', 'spanish'].includes(msgLower) && user.preferred_language !== 'es') {
      await updatePreferredLanguage(user.id, 'es')
      user.preferred_language = 'es'
    }

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

    // ── FEATURE 5: PREDATORY LENDING CHECK (before Gemini) ───────────────────
    if (detectPredatoryLending(message)) {
      const formatted = formatForSMS(PREDATORY_WARNING)
      const parts = splitIntoMessages(formatted)
      await sendMultiSMS(phone, parts)
      await saveConversation(user.id, 'user', message)
      await saveConversation(user.id, 'assistant', formatted)
      return
    }

    // ── FEATURE 5: INSURANCE KEYWORD CHECK ───────────────────────────────────
    if (detectInsuranceKeyword(message)) {
      const keyword = message.toLowerCase()
      const insuranceResp = getInsuranceResponse(keyword)
      await logInsuranceProgress(user.id, 1)
      const formatted = formatForSMS(insuranceResp)
      const parts = splitIntoMessages(formatted)
      await sendMultiSMS(phone, parts)
      await saveConversation(user.id, 'user', message)
      await saveConversation(user.id, 'assistant', formatted)
      return
    }

    // ── GENERATE AI RESPONSE ──────────────────────────────────────────────────
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
    let newStep = user.current_step
    if (stepComplete) {
      const completedStep = user.current_step
      newStep = Math.min(completedStep + 1, 8)
      try {
        await updateCurrentStep(user.id, newStep)
        await logStepCompletion(user.id, completedStep)
        const { updateHealthScore } = await import('../services/healthScore.js')
        await updateHealthScore(user.id)
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

    // Strip signals and format for SMS
    const stripped = stripSignals(aiResponse)
    const outbound = formatForSMS(stripped)

    // Persist conversation
    try {
      await saveConversation(user.id, 'user', message)
      await saveConversation(user.id, 'assistant', outbound)
    } catch (err) {
      console.error('Conversation save error:', err)
    }

    // ── FEATURE 7: Split and send ─────────────────────────────────────────────
    const parts = splitIntoMessages(outbound)
    await sendMultiSMS(phone, parts)

    // ── FEATURE 8: MILESTONE CELEBRATIONS ────────────────────────────────────
    if (stepComplete && [2, 4, 6, 8].includes(newStep)) {
      const milestones = {
        2: "You did it — you have safe shelter. That took courage. This is a real milestone. What do you need to work on next?",
        4: "Stable housing. This is huge. Most people in your situation never make it this far. You should be proud. Ready to focus on income?",
        6: "A bank account. You are building real financial stability now. This is Step 6 of 8 — you are almost there. What feels hardest right now?",
        8: "You made it to full independence. I am genuinely proud of what you have accomplished. You can always text this number if you ever need help again. You have got this."
      }
      await new Promise(r => setTimeout(r, 1500))
      await sendSMS(phone, milestones[newStep])
    }

  } catch (err) {
    console.error('SMS controller error:', err)
    try {
      await sendSMS(phone, `Something went wrong on my end. Try again in a moment. If urgent: call 988 or text HOME to 741741.`)
    } catch (sendErr) {
      console.error('Failed to send error SMS:', sendErr)
    }
  }
}

// Twilio sends POST to the webhook
router.post('/incoming', handleIncoming)

export default router
