import crypto from 'crypto'

export function hashPhone(phone) {
  const normalized = phone.replace(/\D/g, '')
  const salt = process.env.PHONE_SALT || 'redreemer-default-salt'
  return crypto.createHmac('sha256', salt).update(normalized).digest('hex')
}

export function normalizePhone(phone) {
  return phone.replace(/\D/g, '')
}
