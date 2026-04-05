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
  updatePreferredLanguage,
  updateUserMeta,
  getUserMeta,
  incrementPredatoryWarnings
} from '../services/supabase.js'
import { isCrisis, isMedicalEmergency, CRISIS_RESPONSE, CRISIS_RESPONSE_ES, MEDICAL_RESPONSE, logCrisisAlert } from '../services/crisisDetection.js'
import { detectSpanish, BILINGUAL_GREETING } from '../services/languageDetection.js'
import { detectPredatoryContent, getPredatoryWarning } from '../services/predatoryDetector.js'
import { detectInsuranceKeyword, getInsuranceResponse, logInsuranceProgress } from '../services/insuranceEducation.js'
import { getQuizQuestion, isQuizAnswer, classifyMoneyPersonality, getPersonalityResult } from '../services/moneyQuiz.js'
import { detectJobKeywords, formatEmployersForSMS } from '../services/employerFinder.js'
import { detectBenefitsKeywords, BENEFITS_QUESTIONS_EN, BENEFITS_QUESTIONS_ES, parseYesNo, generateBenefitsList } from '../services/benefitsNavigator.js'
import { detectExpungementKeywords, isIneligibleOffense, calculateEligibility, getExpungementResponse, EXPUNGEMENT_QUESTIONS_EN, EXPUNGEMENT_QUESTIONS_ES } from '../services/expungementChecker.js'
import { formatForSMS, splitIntoMessages } from '../utils/smsFormatter.js'
import { hashPhone } from '../utils/privacy.js'

const router = express.Router()

const OPT_OUT_KEYWORDS = ['stop', 'unsubscribe', 'quit', 'cancel', 'end', 'stopall', 'arret']
const OPT_IN_KEYWORDS = ['start', 'unstop', 'yes']

// In-memory store for pending profile recovery confirmations
const pendingRecovery = new Map()

// In-memory store for money quiz state { phone → { step: 0-3, answers: [] } }
const quizState = new Map()

// In-memory store for benefits navigator state { phone → { step: 0-3, answers: [] } }
const benefitsState = new Map()

// In-memory store for expungement checker state { phone → { step: 0-2, answers: [] } }
const expungementState = new Map()

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
    .replace(/\[SIMPLIFIED_MODE\]/gi, '')
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

    // ── KEYWORD SHORTCUTS — instant structured responses ─────────────────────
    const KEYWORD_RESPONSES = {
      'BUDGET': `Budget basics: 50% needs (housing, food, transport), 30% wants, 20% savings. On $1,500/month: $750 needs, $450 wants, $300 savings. Text me your income and I'll make a plan for you.`,
      'DEBT': `For court debt: call legal aid in your city — they help for free and can reduce or restructure what you owe. For medical debt: hospitals have charity care programs. Text your city and I'll find the number.`,
      'BENEFITS': `You may qualify for SNAP (food), Medicaid (health), and SSI (income). Apply at benefits.gov or call 211. Text your city and I'll find your local office.`,
      'JOB': `Ban the Box employers hire people with records. Text your city and I'll find employers near you. Also try workforce.gov for job training programs — many are free.`,
      'FOOD': `Call 211 or text your city to me and I'll find the nearest food bank open today. Most are free, no ID required.`,
      'BANK': `Bank On accounts have no minimum balance, no monthly fees, and no ChexSystems check. Go to bankonsites.org to find one near you. Takes 20 minutes to open.`,
      'SHELTER': `Text your city to me and I'll find shelters open tonight. Most require no ID. Call 211 for immediate help.`,
      'ID': `A free state ID unlocks banking, housing, and benefits. Go to your local DMV and ask for the homeless ID program. Bring any one document: birth certificate, SSN card, or shelter letter.`,
      'HELP': `I can help with: FOOD, SHELTER, BANK, ID, BENEFITS, JOB, DEBT, BUDGET. Text any of these words for instant info, or just tell me what you need.`,
    }

    const upperMsg = message.trim().toUpperCase()
    if (KEYWORD_RESPONSES[upperMsg]) {
      console.log(`[SMS] Branch: KEYWORD_SHORTCUT (${upperMsg})`)
      await updateLastActive(user.id)
      await saveConversation(user.id, 'user', message)
      await saveConversation(user.id, 'assistant', KEYWORD_RESPONSES[upperMsg])
      await sendSMS(phone, KEYWORD_RESPONSES[upperMsg])
      return
    }

    // ── FEATURE 1: PREDATORY LENDING CHECK (before Gemini) ───────────────────
    const { isPredatory, matchedKeyword } = detectPredatoryContent(message)
    if (isPredatory) {
      console.log(`[SMS] Branch: PREDATORY_LENDING (keyword: ${matchedKeyword})`)
      const lang = user?.preferred_language || (detectSpanish(message) ? 'es' : 'en')
      const warning = getPredatoryWarning(lang)
      const formatted = formatForSMS(warning)
      const parts = splitIntoMessages(formatted)
      await sendMultiSMS(phone, parts)
      if (user) {
        await saveConversation(user.id, 'user', message)
        await saveConversation(user.id, 'assistant', formatted)
        await incrementPredatoryWarnings(user.id)
      }
      return
    }

    // ── MONEY PERSONALITY QUIZ STATE ─────────────────────────────────────────
    const quiz = quizState.get(phone)
    if (quiz) {
      const lang = user?.preferred_language || 'en'
      if (isQuizAnswer(message)) {
        quiz.answers.push(message.trim().toUpperCase().charAt(0))
        if (quiz.answers.length < 4) {
          // Send next question
          const nextQ = getQuizQuestion(quiz.answers.length, lang)
          quizState.set(phone, quiz)
          await sendSMS(phone, nextQ)
          await saveConversation(user.id, 'user', message)
          await saveConversation(user.id, 'assistant', nextQ)
          return
        } else {
          // Quiz complete — classify
          quizState.delete(phone)
          const type = classifyMoneyPersonality(quiz.answers)
          const result = getPersonalityResult(type, lang)
          await updateUserMeta(user.id, { money_personality_type: type, quiz_completed_at: new Date().toISOString() })
          const formatted = formatForSMS(result.message)
          await sendSMS(phone, formatted)
          await saveConversation(user.id, 'user', message)
          await saveConversation(user.id, 'assistant', formatted)
          return
        }
      }
      // Non-answer during quiz — cancel quiz and fall through to Gemini
      quizState.delete(phone)
    }

    // ── TRIGGER MONEY QUIZ (Step 2+, first time) ──────────────────────────────
    if (user && (user.current_step || 1) >= 2) {
      const meta = await getUserMeta(user.id).catch(() => ({}))
      const moneyKeywords = ['money', 'budget', 'save', 'saving', 'spend', 'dinero', 'ahorrar', 'presupuesto']
      const isFirstMoneyQuestion = !meta.quiz_completed_at && !meta.quiz_started_at &&
        moneyKeywords.some(kw => message.toLowerCase().includes(kw))

      if (isFirstMoneyQuestion) {
        const lang = user.preferred_language || (detectSpanish(message) ? 'es' : 'en')
        await updateUserMeta(user.id, { quiz_started_at: new Date().toISOString() })
        quizState.set(phone, { step: 0, answers: [] })
        const firstQ = getQuizQuestion(0, lang)
        await sendSMS(phone, firstQ)
        await saveConversation(user.id, 'user', message)
        await saveConversation(user.id, 'assistant', firstQ)
        return
      }
    }

    // ── INSURANCE KEYWORD CHECK ───────────────────────────────────────────────
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

    // ── FEATURE 9: FAIR-CHANCE EMPLOYER FINDER ────────────────────────────────
    if (detectJobKeywords(message) && (user.current_step || 1) >= 4) {
      console.log(`[SMS] Branch: EMPLOYER_FINDER`)
      const employers = formatEmployersForSMS(user.user_type || 'homeless')
      const formatted = formatForSMS(employers)
      const parts = splitIntoMessages(formatted)
      await sendMultiSMS(phone, parts)
      await saveConversation(user.id, 'user', message)
      await saveConversation(user.id, 'assistant', formatted)
      return
    }

    // ── FEATURE 10: BENEFITS NAVIGATOR ───────────────────────────────────────
    const bState = benefitsState.get(phone)
    if (bState) {
      const lang = user?.preferred_language || 'en'
      const answer = parseYesNo(message)
      if (answer !== null) {
        bState.answers.push(answer)
        if (bState.answers.length < 4) {
          const questions = lang === 'es' ? BENEFITS_QUESTIONS_ES : BENEFITS_QUESTIONS_EN
          const nextQ = questions[bState.answers.length]
          benefitsState.set(phone, bState)
          await sendSMS(phone, nextQ)
          await saveConversation(user.id, 'user', message)
          await saveConversation(user.id, 'assistant', nextQ)
          return
        } else {
          benefitsState.delete(phone)
          const benefitsList = generateBenefitsList(bState.answers, lang)
          const formatted = formatForSMS(benefitsList)
          const parts = splitIntoMessages(formatted)
          await sendMultiSMS(phone, parts)
          await saveConversation(user.id, 'user', message)
          await saveConversation(user.id, 'assistant', formatted)
          return
        }
      }
      benefitsState.delete(phone) // non-yes/no answer — cancel and fall through
    }

    if (detectBenefitsKeywords(message) && !bState) {
      console.log(`[SMS] Branch: BENEFITS_NAVIGATOR`)
      const lang = user?.preferred_language || (detectSpanish(message) ? 'es' : 'en')
      benefitsState.set(phone, { answers: [] })
      const firstQ = lang === 'es' ? BENEFITS_QUESTIONS_ES[0] : BENEFITS_QUESTIONS_EN[0]
      await sendSMS(phone, firstQ)
      await saveConversation(user.id, 'user', message)
      await saveConversation(user.id, 'assistant', firstQ)
      return
    }

    // ── FEATURE 16: EXPUNGEMENT CHECKER ──────────────────────────────────────
    const expState = expungementState.get(phone)
    if (expState) {
      const lang = user?.preferred_language || 'en'
      expState.answers.push(message.trim())

      if (expState.answers.length === 1) {
        // Got state — check if AZ
        const isAZ = message.toLowerCase().includes('arizona') || message.toLowerCase().includes('az')
        if (!isAZ) {
          expungementState.delete(phone)
          const resp = lang === 'es'
            ? `Para estados fuera de Arizona, te recomiendo llamar a Legal Aid en tu estado. Puedes encontrar ayuda gratuita en lawhelp.org. ¿Hay algo más en lo que pueda ayudarte?`
            : `For states outside Arizona, I'd recommend calling Legal Aid in your state. You can find free help at lawhelp.org. Is there anything else I can help with?`
          await sendSMS(phone, resp)
          await saveConversation(user.id, 'user', message)
          await saveConversation(user.id, 'assistant', resp)
          return
        }
        const q2 = lang === 'es' ? EXPUNGEMENT_QUESTIONS_ES[1] : EXPUNGEMENT_QUESTIONS_EN[1]
        await sendSMS(phone, q2)
        await saveConversation(user.id, 'user', message)
        await saveConversation(user.id, 'assistant', q2)
        return
      }

      if (expState.answers.length === 2) {
        // Got offense type — check ineligible
        if (isIneligibleOffense(message)) {
          expungementState.delete(phone)
          const resp = lang === 'es'
            ? `Lamentablemente, ese tipo de delito no es elegible para set aside en Arizona. Sin embargo, Community Legal Services puede revisar tu caso: (602) 258-3434 — es gratis.`
            : `Unfortunately, that type of offense is not eligible for set aside in Arizona. However, Community Legal Services can review your case: (602) 258-3434 — it's free.`
          await sendSMS(phone, resp)
          await saveConversation(user.id, 'user', message)
          await saveConversation(user.id, 'assistant', resp)
          return
        }
        const q3 = lang === 'es' ? EXPUNGEMENT_QUESTIONS_ES[2] : EXPUNGEMENT_QUESTIONS_EN[2]
        await sendSMS(phone, q3)
        await saveConversation(user.id, 'user', message)
        await saveConversation(user.id, 'assistant', q3)
        return
      }

      if (expState.answers.length === 3) {
        // Got years — calculate eligibility
        expungementState.delete(phone)
        const offenseType = expState.answers[1].toLowerCase()
        const yearsMatch = message.match(/\d+/)
        const yearsSince = yearsMatch ? parseInt(yearsMatch[0]) : 0
        const { eligible, yearsRemaining, offenseLabel } = calculateEligibility(offenseType, yearsSince)

        // Store in user_meta if not yet eligible — for future reminder
        if (!eligible) {
          const eligibleYear = new Date().getFullYear() + yearsRemaining
          await updateUserMeta(user.id, {
            expungement_eligible_year: eligibleYear,
            expungement_offense: offenseLabel,
          }).catch(() => {})
        }

        const resp = getExpungementResponse(eligible, yearsRemaining, offenseLabel, lang)
        const formatted = formatForSMS(resp)
        const parts = splitIntoMessages(formatted)
        await sendMultiSMS(phone, parts)
        await saveConversation(user.id, 'user', message)
        await saveConversation(user.id, 'assistant', formatted)
        return
      }
    }

    if (detectExpungementKeywords(message) && !expState) {
      console.log(`[SMS] Branch: EXPUNGEMENT_CHECKER`)
      const lang = user?.preferred_language || (detectSpanish(message) ? 'es' : 'en')
      expungementState.set(phone, { answers: [] })
      const firstQ = lang === 'es' ? EXPUNGEMENT_QUESTIONS_ES[0] : EXPUNGEMENT_QUESTIONS_EN[0]
      await sendSMS(phone, firstQ)
      await saveConversation(user.id, 'user', message)
      await saveConversation(user.id, 'assistant', firstQ)
      return
    }

    // ── FEATURE 20: LITERACY-AWARE SIMPLIFIED MODE DETECTION ─────────────────
    // Check last 5 user messages — if 3+ are under 5 words, enable simplified mode
    if (user && !user.user_meta?.simplified_mode) {
      const recentUserMsgs = history.filter(m => m.role === 'user').slice(-5)
      if (recentUserMsgs.length >= 3) {
        const shortCount = recentUserMsgs.filter(m => m.content.trim().split(/\s+/).length < 5).length
        if (shortCount >= 3) {
          await updateUserMeta(user.id, { simplified_mode: true }).catch(() => {})
          user.user_meta = { ...(user.user_meta || {}), simplified_mode: true }
          console.log(`[SMS] Simplified mode enabled for user ${user.id}`)
        }
      }
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
    const simplifiedMode = aiResponse.includes('[SIMPLIFIED_MODE]')

    // Handle simplified mode detection
    if (simplifiedMode && user) {
      try {
        await updateUserMeta(user.id, { simplified_mode: true })
      } catch (err) {
        console.error('Simplified mode update error (non-fatal):', err.message)
      }
    }

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

        // ── FEATURE 4: Auto-trigger voice clip via MMS ────────────────────────
        const clipMap = { 1: 'step1_welcome.mp3', 2: 'step2_id.mp3', 4: 'step4_bank.mp3', 5: 'step5_job.mp3', 7: 'step7_savings.mp3', 8: 'step8_independence.mp3' }
        const clipFile = clipMap[newStep]
        if (clipFile) {
          const clipUrl = getClipUrl(user.user_type, newStep)
          let mmsSent = false
          if (clipUrl) {
            try {
              await sendMMS(phone, clipUrl, '')
              mmsSent = true
            } catch (mmsErr) {
              console.warn('[SMS] MMS failed, falling back to text:', mmsErr.message)
            }
          }
          await new Promise(r => setTimeout(r, 800))
          if (mmsSent) {
            await sendSMS(phone, `You just hit a milestone. Listen to that. You earned it.`)
          } else {
            await sendSMS(phone, `You just completed Step ${newStep}. That is not a small thing. Keep going.`)
          }
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
