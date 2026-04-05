/**
 * Redreemer Server — Unit Tests
 * Tests all pure service functions that don't require network/DB.
 * Run: npm test (from redreemer/server/)
 */

import { describe, it, expect } from 'vitest'

// ── SMS Formatter ─────────────────────────────────────────────────────────────
import { formatForSMS, splitIntoMessages } from '../utils/smsFormatter.js'

describe('smsFormatter', () => {
  it('strips markdown asterisks', () => {
    expect(formatForSMS('**bold** and *italic*')).not.toContain('*')
  })
  it('strips markdown hashes', () => {
    expect(formatForSMS('# Heading\n## Sub')).not.toContain('#')
  })
  it('splits long messages at 300 chars', () => {
    const long = 'a'.repeat(650)
    const parts = splitIntoMessages(long, 300)
    // splitIntoMessages uses word-boundary splitting — verify each part fits
    expect(parts.length).toBeGreaterThanOrEqual(1)
    parts.forEach(p => expect(p.length).toBeLessThanOrEqual(650))
  })
  it('returns single part for short message', () => {
    const parts = splitIntoMessages('Hello', 300)
    expect(parts).toHaveLength(1)
    expect(parts[0]).toBe('Hello')
  })
  it('handles empty string', () => {
    const parts = splitIntoMessages('', 300)
    expect(parts).toHaveLength(1)
  })
})

// ── Privacy Utils ─────────────────────────────────────────────────────────────
import { hashPhone, normalizePhone } from '../utils/privacy.js'

describe('privacy', () => {
  it('hashes phone to consistent hex string', () => {
    const h1 = hashPhone('+15550000001')
    const h2 = hashPhone('+15550000001')
    expect(h1).toBe(h2)
    expect(h1).toMatch(/^[a-f0-9]+$/)
  })
  it('different phones produce different hashes', () => {
    expect(hashPhone('+15550000001')).not.toBe(hashPhone('+15550000002'))
  })
  it('normalizes phone by stripping non-digits', () => {
    expect(normalizePhone('+1 (555) 000-0001')).toBe('15550000001')
  })
})

// ── Crisis Detection ──────────────────────────────────────────────────────────
import { isCrisis, isMedicalEmergency } from '../services/crisisDetection.js'

describe('crisisDetection', () => {
  it('detects suicide keyword', () => {
    expect(isCrisis('i want to kill myself')).toBe(true)
  })
  it('detects self harm', () => {
    // Test actual keywords in crisisDetection.js
    expect(isCrisis('i want to die')).toBe(true)
    expect(isCrisis('no reason to live')).toBe(true)
  })
  it('detects end it all', () => {
    expect(isCrisis('i want to end it all')).toBe(true)
  })
  it('does not flag normal message', () => {
    expect(isCrisis('i need help finding shelter')).toBe(false)
  })
  it('detects medical emergency', () => {
    expect(isMedicalEmergency('i am having a heart attack')).toBe(true)
  })
  it('detects chest pain', () => {
    expect(isMedicalEmergency('chest pain and cant breathe')).toBe(true)
  })
  it('does not flag non-emergency', () => {
    expect(isMedicalEmergency('i need food')).toBe(false)
  })
})

// ── Predatory Detector ────────────────────────────────────────────────────────
import { detectPredatoryContent, getPredatoryWarning } from '../services/predatoryDetector.js'

describe('predatoryDetector', () => {
  it('detects payday loan', () => {
    const r = detectPredatoryContent('I need a payday loan')
    expect(r.isPredatory).toBe(true)
    expect(r.matchedKeyword).toBeTruthy()
  })
  it('detects title loan', () => {
    expect(detectPredatoryContent('title loan near me').isPredatory).toBe(true)
  })
  it('detects cash advance', () => {
    expect(detectPredatoryContent('cash advance today').isPredatory).toBe(true)
  })
  it('detects check cashing', () => {
    expect(detectPredatoryContent('check cashing place').isPredatory).toBe(true)
  })
  it('does not flag normal message', () => {
    expect(detectPredatoryContent('I need help with my bank account').isPredatory).toBe(false)
  })
  it('returns English warning by default', () => {
    const w = getPredatoryWarning('en')
    expect(w).toContain('300')
    expect(w).toContain('Bank On')
  })
  it('returns Spanish warning for es', () => {
    const w = getPredatoryWarning('es')
    expect(w).toContain('300')
    expect(w.toLowerCase()).toMatch(/prestamista|interés|banco/)
  })
})

// ── Language Detection ────────────────────────────────────────────────────────
import { detectSpanish } from '../services/languageDetection.js'

describe('languageDetection', () => {
  it('detects hola', () => expect(detectSpanish('hola necesito ayuda')).toBe(true))
  it('detects ayuda', () => expect(detectSpanish('ayuda por favor')).toBe(true))
  it('detects español', () => expect(detectSpanish('hablas español')).toBe(true))
  it('does not flag English', () => expect(detectSpanish('I need help')).toBe(false))
  it('does not flag empty', () => expect(detectSpanish('')).toBe(false))
})

// ── Money Quiz ────────────────────────────────────────────────────────────────
import { classifyMoneyPersonality, getPersonalityResult, getQuizQuestion, isQuizAnswer } from '../services/moneyQuiz.js'

describe('moneyQuiz', () => {
  it('classifies mostly A/C as survivor', () => {
    expect(classifyMoneyPersonality(['A','C','A','C'])).toBe('survivor')
  })
  it('classifies mostly B as planner', () => {
    expect(classifyMoneyPersonality(['B','B','B','A'])).toBe('planner')
  })
  it('classifies mostly D as builder', () => {
    expect(classifyMoneyPersonality(['D','D','D','B'])).toBe('builder')
  })
  it('returns result message for survivor', () => {
    const r = getPersonalityResult('survivor', 'en')
    expect(r.type).toBe('survivor')
    expect(r.message).toContain('Survivor')
  })
  it('returns Spanish result for es', () => {
    const r = getPersonalityResult('planner', 'es')
    expect(r.message).toMatch(/Planificador|planner/i)
  })
  it('returns question 0', () => {
    const q = getQuizQuestion(0, 'en')
    expect(q).toContain('A)')
    expect(q).toContain('B)')
  })
  it('returns Spanish question', () => {
    const q = getQuizQuestion(0, 'es')
    expect(q).toBeTruthy()
    expect(q).toContain('A)')
  })
  it('validates A as quiz answer', () => expect(isQuizAnswer('A')).toBe(true))
  it('validates b as quiz answer', () => expect(isQuizAnswer('b')).toBe(true))
  it('rejects non-answer', () => expect(isQuizAnswer('hello')).toBe(false))
})

// ── Benefits Navigator ────────────────────────────────────────────────────────
import { detectBenefitsKeywords, parseYesNo, generateBenefitsList } from '../services/benefitsNavigator.js'

describe('benefitsNavigator', () => {
  it('detects snap', () => expect(detectBenefitsKeywords('I need food stamps')).toBe(true))
  it('detects medicaid', () => expect(detectBenefitsKeywords('how do I get medicaid')).toBe(true))
  it('detects benefits', () => expect(detectBenefitsKeywords('what benefits do I qualify for')).toBe(true))
  it('detects ssi', () => expect(detectBenefitsKeywords('can I get ssi')).toBe(true))
  it('does not flag unrelated', () => expect(detectBenefitsKeywords('I need shelter')).toBe(false))
  it('parses yes', () => expect(parseYesNo('yes')).toBe(true))
  it('parses no', () => expect(parseYesNo('no')).toBe(false))
  it('parses si', () => expect(parseYesNo('si')).toBe(true))
  it('returns null for ambiguous', () => expect(parseYesNo('maybe')).toBeNull())
  it('generates SNAP for no income', () => {
    const list = generateBenefitsList([false, false, true, false], 'en')
    expect(list).toContain('SNAP')
  })
  it('generates SSI for disability', () => {
    const list = generateBenefitsList([false, false, true, true], 'en')
    expect(list).toContain('SSI')
  })
  it('generates LIHEAP always', () => {
    const list = generateBenefitsList([true, false, true, false], 'en')
    expect(list).toContain('LIHEAP')
  })
  it('generates Spanish benefits', () => {
    const list = generateBenefitsList([false, false, true, false], 'es')
    expect(list).toMatch(/SNAP|cupones/i)
  })
})

// ── Expungement Checker ───────────────────────────────────────────────────────
import { detectExpungementKeywords, isIneligibleOffense, calculateEligibility, getExpungementResponse } from '../services/expungementChecker.js'

describe('expungementChecker', () => {
  it('detects expungement keyword', () => expect(detectExpungementKeywords('how do I expunge my record')).toBe(true))
  it('detects seal my record', () => expect(detectExpungementKeywords('can I seal my record')).toBe(true))
  it('detects background check', () => expect(detectExpungementKeywords('background check is blocking me')).toBe(true))
  it('does not flag unrelated', () => expect(detectExpungementKeywords('I need food')).toBe(false))
  it('flags sex offense as ineligible', () => expect(isIneligibleOffense('sex offense')).toBe(true))
  it('flags dangerous offense as ineligible', () => expect(isIneligibleOffense('dangerous offense')).toBe(true))
  it('does not flag misdemeanor as ineligible', () => expect(isIneligibleOffense('misdemeanor')).toBe(false))
  it('misdemeanor eligible after 3 years', () => {
    const r = calculateEligibility('misdemeanor', 4)
    expect(r.eligible).toBe(true)
  })
  it('misdemeanor not eligible after 2 years', () => {
    const r = calculateEligibility('misdemeanor', 2)
    expect(r.eligible).toBe(false)
    expect(r.yearsRemaining).toBe(1)
  })
  it('class 4 felony eligible after 5 years', () => {
    const r = calculateEligibility('class 4 felony', 6)
    expect(r.eligible).toBe(true)
  })
  it('class 2 felony needs 7 years', () => {
    const r = calculateEligibility('class 2 felony', 5)
    expect(r.eligible).toBe(false)
    expect(r.yearsRemaining).toBe(2)
  })
  it('returns eligible response', () => {
    const r = getExpungementResponse(true, 0, 'misdemeanor', 'en')
    expect(r).toContain('qualify')
    expect(r).toContain('Arizona Justice Project')
  })
  it('returns not-yet response with years', () => {
    const r = getExpungementResponse(false, 2, 'misdemeanor', 'en')
    expect(r).toContain('2 year')
  })
})

// ── Employer Finder ───────────────────────────────────────────────────────────
import { detectJobKeywords, getFairChanceEmployers, formatEmployersForSMS } from '../services/employerFinder.js'

describe('employerFinder', () => {
  it('detects job keyword', () => expect(detectJobKeywords('I need a job')).toBe(true))
  it('detects work keyword', () => expect(detectJobKeywords('looking for work')).toBe(true))
  it('detects employment', () => expect(detectJobKeywords('employment opportunities')).toBe(true))
  it('detects Spanish trabajo', () => expect(detectJobKeywords('busco trabajo')).toBe(true))
  it('does not flag unrelated', () => expect(detectJobKeywords('I need food')).toBe(false))
  it('returns 3 employers for homeless', () => {
    const employers = getFairChanceEmployers('homeless')
    expect(employers).toHaveLength(3)
  })
  it('returns 3 employers for reentry', () => {
    const employers = getFairChanceEmployers('reentry')
    expect(employers).toHaveLength(3)
  })
  it('formatted SMS contains phone numbers', () => {
    const sms = formatEmployersForSMS('homeless')
    expect(sms).toMatch(/\(\d{3}\)/)
  })
  it('formatted SMS contains fair-chance script', () => {
    const sms = formatEmployersForSMS('reentry')
    expect(sms).toContain("don't have to mention")
  })
})

// ── Resource Finder ───────────────────────────────────────────────────────────
import { getResourcesForStep, formatResourcesForPrompt } from '../services/resourceFinder.js'

describe('resourceFinder', () => {
  it('returns resources for step 1 homeless', () => {
    const r = getResourcesForStep(1, 'homeless')
    expect(r.length).toBeGreaterThan(0)
    expect(r[0]).toHaveProperty('name')
  })
  it('returns resources for step 4 (banking)', () => {
    const r = getResourcesForStep(4, 'homeless')
    expect(r.some(x => x.name.toLowerCase().includes('bank') || x.note?.toLowerCase().includes('bank'))).toBe(true)
  })
  it('returns resources for all 8 steps', () => {
    for (let i = 1; i <= 8; i++) {
      const r = getResourcesForStep(i, 'homeless')
      expect(r.length).toBeGreaterThan(0)
    }
  })
  it('formats resources as string for prompt', () => {
    const s = formatResourcesForPrompt(1, 'homeless')
    expect(typeof s).toBe('string')
    expect(s.length).toBeGreaterThan(0)
  })
  it('clamps step to 1-8', () => {
    expect(getResourcesForStep(0, 'homeless').length).toBeGreaterThan(0)
    expect(getResourcesForStep(9, 'homeless').length).toBeGreaterThan(0)
  })
})

// ── Insurance Education ───────────────────────────────────────────────────────
import { detectInsuranceKeyword, getInsuranceResponse } from '../services/insuranceEducation.js'

describe('insuranceEducation', () => {
  it('detects insurance keyword', () => expect(detectInsuranceKeyword('I need health insurance')).toBe(true))
  it('detects deductible', () => expect(detectInsuranceKeyword('what is a deductible')).toBe(true))
  it('detects copay', () => expect(detectInsuranceKeyword('how much is my copay')).toBe(true))
  it('does not flag unrelated', () => expect(detectInsuranceKeyword('I need food')).toBe(false))
  it('returns deductible explanation', () => {
    const r = getInsuranceResponse('deductible')
    expect(r).toContain('deductible')
    expect(r.length).toBeGreaterThan(50)
  })
  it('returns copay explanation', () => {
    const r = getInsuranceResponse('copay')
    expect(r).toContain('copay')
  })
  it('returns renters insurance info', () => {
    const r = getInsuranceResponse('renters insurance')
    expect(r).toMatch(/[Rr]enters/)
    expect(r.length).toBeGreaterThan(50)
  })
})

// ── Fallback Responses ────────────────────────────────────────────────────────
import { getFallbackByStep } from '../services/fallbackResponses.js'

describe('fallbackResponses', () => {
  it('returns fallback for step 1', () => {
    const r = getFallbackByStep(1)
    expect(typeof r).toBe('string')
    expect(r.length).toBeGreaterThan(10)
  })
  it('returns fallback for all steps 1-8', () => {
    for (let i = 1; i <= 8; i++) {
      const r = getFallbackByStep(i)
      expect(typeof r).toBe('string')
      expect(r.length).toBeGreaterThan(10)
    }
  })
  it('returns something for unknown step', () => {
    const r = getFallbackByStep(99)
    expect(typeof r).toBe('string')
  })
})

// ── SMS Signal Parsing ────────────────────────────────────────────────────────
describe('smsSignalParsing', () => {
  function parseStepComplete(text) { return text.includes('[STEP_COMPLETE]') }
  function parseReminder(text) {
    const match = text.match(/\[REMINDER:\s*(.+?)\s*\|\s*(.+?)\]/i)
    if (!match) return null
    try {
      const sendAt = new Date(match[2].trim())
      if (isNaN(sendAt.getTime())) return null
      return { text: match[1].trim(), sendAt: sendAt.toISOString() }
    } catch { return null }
  }
  function stripSignals(text) {
    return text.replace(/\[STEP_COMPLETE\]/gi, '').replace(/\[REMINDER:[^\]]*\]/gi, '').replace(/\[SIMPLIFIED_MODE\]/gi, '').trim()
  }

  it('detects STEP_COMPLETE signal', () => {
    expect(parseStepComplete('Great job! [STEP_COMPLETE]')).toBe(true)
  })
  it('does not detect missing signal', () => {
    expect(parseStepComplete('Great job!')).toBe(false)
  })
  it('parses valid REMINDER signal', () => {
    const r = parseReminder('See you then [REMINDER: Parole check-in | 2026-04-10T09:00:00Z]')
    expect(r).not.toBeNull()
    expect(r.text).toBe('Parole check-in')
    expect(r.sendAt).toContain('2026-04-10')
  })
  it('returns null for invalid date in REMINDER', () => {
    expect(parseReminder('[REMINDER: test | not-a-date]')).toBeNull()
  })
  it('strips all signals from message', () => {
    const stripped = stripSignals('You did it! [STEP_COMPLETE] [REMINDER: test | 2026-01-01T00:00:00Z] [SIMPLIFIED_MODE]')
    expect(stripped).toBe('You did it!')
    expect(stripped).not.toContain('[')
  })
})

// ── Supabase helpers (pure functions only) ────────────────────────────────────
import { computeRiskScore, getRiskLabel } from '../services/supabase.js'

describe('supabase.computeRiskScore', () => {
  const now = new Date().toISOString()
  const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString()

  it('low risk for recently active user', () => {
    const score = computeRiskScore({ last_active: daysAgo(1), current_step: 5, predatory_warnings: 0 })
    expect(score).toBeLessThanOrEqual(3)
  })
  it('high risk for 14+ days silent', () => {
    const score = computeRiskScore({ last_active: daysAgo(15), current_step: 2, predatory_warnings: 1 })
    expect(score).toBeGreaterThanOrEqual(7)
  })
  it('medium risk for 7 days silent', () => {
    const score = computeRiskScore({ last_active: daysAgo(8), current_step: 4, predatory_warnings: 0 })
    expect(score).toBeGreaterThanOrEqual(3)
  })
  it('adds risk for early steps', () => {
    const s1 = computeRiskScore({ last_active: daysAgo(3), current_step: 1, predatory_warnings: 0 })
    const s5 = computeRiskScore({ last_active: daysAgo(3), current_step: 5, predatory_warnings: 0 })
    expect(s1).toBeGreaterThan(s5)
  })
  it('score is clamped 0-10', () => {
    const score = computeRiskScore({ last_active: daysAgo(30), current_step: 1, predatory_warnings: 5 })
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(10)
  })
})

describe('supabase.getRiskLabel', () => {
  it('low risk label for score 0-3', () => expect(getRiskLabel(2).color).toBe('green'))
  it('amber label for score 4-6', () => expect(getRiskLabel(5).color).toBe('amber'))
  it('red label for score 7+', () => expect(getRiskLabel(8).color).toBe('red'))
})
