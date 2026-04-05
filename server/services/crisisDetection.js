import { supabase } from './supabase.js'

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end it all', 'want to die', 'no reason to live',
  'being hurt', 'someone is hurting', 'abusing me', 'in danger', 'being abused',
  'not safe', 'help me please', 'someone is after me'
]

const MEDICAL_KEYWORDS = [
  'heart attack', 'cant breathe', 'chest pain', 'unconscious',
  'overdose', 'bleeding badly', 'stroke'
]

export function isCrisis(message) {
  const lower = message.toLowerCase()
  return CRISIS_KEYWORDS.some(kw => lower.includes(kw))
}

export function isMedicalEmergency(message) {
  const lower = message.toLowerCase()
  return MEDICAL_KEYWORDS.some(kw => lower.includes(kw))
}

export const CRISIS_RESPONSE = "I hear you and I am concerned about you right now. Please call or text 988 — it is the free Suicide and Crisis Lifeline, available 24 hours, confidential. If you are in immediate danger call 911. Are you somewhere safe right now?"

export const CRISIS_RESPONSE_ES = "Te escucho y estoy preocupado por ti ahora mismo. Por favor llama o envía un mensaje al 988 — es la Línea de Crisis gratuita, disponible las 24 horas. Si estás en peligro inmediato llama al 911. ¿Estás en un lugar seguro ahora mismo?"

export const MEDICAL_RESPONSE = "This sounds like a medical emergency. Call 911 immediately. Stay on the line with them. I will be here when you are safe."

export async function logCrisisAlert(phone, messageContent) {
  const { error } = await supabase
    .from('crisis_alerts')
    .insert({ phone, message_content: messageContent })
  if (error) console.error('[Crisis] Failed to log alert:', error.message)
}
