import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { hashPhone } from '../utils/privacy.js'
dotenv.config()

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function getUserByPhone(phone) {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('phone_number', phone)
    .single()
  return data
}

export async function createUser(phone) {
  const { data, error } = await supabase
    .from('users')
    .insert({ phone_number: phone, current_step: 1, phone_hash: hashPhone(phone) })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateUserType(userId, userType) {
  const { data, error } = await supabase
    .from('users')
    .update({ user_type: userType })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateUserName(userId, name) {
  const { data, error } = await supabase
    .from('users')
    .update({ name })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateUserCity(userId, city) {
  const { data, error } = await supabase
    .from('users')
    .update({ city })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateCurrentStep(userId, step) {
  const newStep = Math.min(step, 8)
  const { data, error } = await supabase
    .from('users')
    .update({ current_step: newStep })
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateLastActive(userId) {
  const { error } = await supabase
    .from('users')
    .update({ last_active: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw error
}

export async function getConversationHistory(userId, limit = 20) {
  const { data } = await supabase
    .from('conversations')
    .select('role, content, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  return (data || []).reverse()
}

export async function saveConversation(userId, role, content) {
  const { error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, role, content })
  if (error) throw error
}

export async function logStepCompletion(userId, stepNumber, notes = null) {
  const { error } = await supabase
    .from('step_logs')
    .insert({ user_id: userId, step_number: stepNumber, notes })
  if (error) throw error
}

export async function saveReminder(userId, reminderText, sendAt) {
  const { error } = await supabase
    .from('reminders')
    .insert({ user_id: userId, reminder_text: reminderText, send_at: sendAt, sent: false })
  if (error) throw error
}

export async function getDueReminders() {
  const { data, error } = await supabase
    .from('reminders')
    .select('*, users(phone_number, name)')
    .eq('sent', false)
    .lte('send_at', new Date().toISOString())
  if (error) throw error
  return data || []
}

export async function markReminderSent(reminderId) {
  const { error } = await supabase
    .from('reminders')
    .update({ sent: true })
    .eq('id', reminderId)
  if (error) throw error
}

export async function getInactiveUsers(dayThreshold = 5) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - dayThreshold)
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .lt('last_active', cutoff.toISOString())
    .not('phone_number', 'is', null)
  if (error) throw error
  return data || []
}

export async function getHomelessUsersByCity(city) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('city', city)
    .in('user_type', ['homeless', 'both'])
    .not('phone_number', 'is', null)
  if (error) throw error
  return data || []
}

export async function getAllUsers() {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('last_active', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getCaseworkerClients(caseworkerId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('caseworker_id', caseworkerId)
    .order('last_active', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getAllClients() {
  const { data, error } = await supabase
    .from('users')
    .select('*, caseworkers(name, organization)')
    .order('last_active', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getUserById(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*, caseworkers(name, organization)')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function getStepLogs(userId) {
  const { data, error } = await supabase
    .from('step_logs')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getCaseworkerByAuth0Id(auth0Id) {
  const { data } = await supabase
    .from('caseworkers')
    .select('*')
    .eq('auth0_id', auth0Id)
    .single()
  return data
}

export async function getDistinctHomelessCities() {
  const { data, error } = await supabase
    .from('users')
    .select('city')
    .in('user_type', ['homeless', 'both'])
    .not('city', 'is', null)
  if (error) throw error
  const cities = [...new Set((data || []).map(u => u.city))]
  return cities
}

// Feature 1: Crisis alerts
export async function getCrisisAlerts() {
  const { data, error } = await supabase
    .from('crisis_alerts')
    .select('*')
    .eq('resolved', false)
    .order('triggered_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function resolveCrisisAlert(id, resolvedBy) {
  const { data, error } = await supabase
    .from('crisis_alerts')
    .update({ resolved: true, resolved_at: new Date().toISOString(), resolved_by: resolvedBy })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// Feature 2: Opt-out
export async function setOptedOut(userId, value) {
  const update = { opted_out: value }
  if (value) update.opted_out_at = new Date().toISOString()
  const { error } = await supabase
    .from('users')
    .update(update)
    .eq('id', userId)
  if (error) throw error
}

// Feature 4: Language preference
export async function updatePreferredLanguage(userId, lang) {
  const { error } = await supabase
    .from('users')
    .update({ preferred_language: lang })
    .eq('id', userId)
  if (error) throw error
}

// ── user_meta JSONB helpers ───────────────────────────────────────────────────

/**
 * Merge new fields into user_meta JSONB without overwriting existing keys.
 */
export async function updateUserMeta(userId, metaUpdate) {
  // Fetch current meta first
  const { data: user } = await supabase
    .from('users')
    .select('user_meta')
    .eq('id', userId)
    .single()

  const current = user?.user_meta || {}
  const merged = { ...current, ...metaUpdate }

  const { error } = await supabase
    .from('users')
    .update({ user_meta: merged })
    .eq('id', userId)

  if (error) throw error
  return merged
}

/**
 * Get user_meta for a user.
 */
export async function getUserMeta(userId) {
  const { data } = await supabase
    .from('users')
    .select('user_meta')
    .eq('id', userId)
    .single()
  return data?.user_meta || {}
}

/**
 * Increment predatory_warnings counter.
 */
export async function incrementPredatoryWarnings(userId) {
  const { data: user } = await supabase
    .from('users')
    .select('predatory_warnings')
    .eq('id', userId)
    .single()
  const current = user?.predatory_warnings || 0
  await supabase
    .from('users')
    .update({ predatory_warnings: current + 1 })
    .eq('id', userId)
}

/**
 * Get silent clients — last_text_at older than given days.
 */
export async function getSilentClients(days = 7) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .lt('last_active', cutoff)
    .not('phone_number', 'is', null)
    .not('user_type', 'is', null)
    .neq('current_step', 8)
    .order('last_active', { ascending: true })
  if (error) throw error
  return data || []
}

/**
 * Compute engagement risk score for a client (0-10).
 * Higher = more at risk of dropping out.
 */
export function computeRiskScore(user) {
  let score = 0
  const now = Date.now()
  const lastActive = user.last_active ? new Date(user.last_active).getTime() : 0
  const daysSilent = (now - lastActive) / (1000 * 60 * 60 * 24)

  if (daysSilent >= 7) score += 3
  if (daysSilent >= 14) score += 2  // cumulative: +5
  if (daysSilent <= 2) score -= 1   // active recently

  // Stuck on same step
  const stepUpdatedAt = user.step_updated_at ? new Date(user.step_updated_at).getTime() : 0
  const daysOnStep = (now - stepUpdatedAt) / (1000 * 60 * 60 * 24)
  if (daysOnStep > 10) score += 2

  // Early steps are highest dropout risk
  const step = user.current_step || 1
  if (step <= 2) score += 2

  // Predatory warnings — being targeted
  if ((user.predatory_warnings || 0) > 0) score += 1

  // Advanced a step recently
  if (daysOnStep < 7 && step > 1) score -= 2

  return Math.max(0, Math.min(10, score))
}

/**
 * Get risk label and color for a score.
 */
export function getRiskLabel(score) {
  if (score <= 3) return { label: 'Low risk', color: 'green' }
  if (score <= 6) return { label: 'Medium risk', color: 'amber' }
  return { label: 'High risk', color: 'red' }
}
