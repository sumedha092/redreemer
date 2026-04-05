import twilio from 'twilio'

let _client = null
function getClient() {
  if (!_client) _client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  return _client
}

const WHATSAPP_FROM = 'whatsapp:+14155238886'

export async function sendSMS(to, message) {
  const isWhatsApp = to.startsWith('whatsapp:')
  // Read env at call time, not module load time
  const params = isWhatsApp
    ? { from: WHATSAPP_FROM, to, body: message }
    : { messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID, to, body: message }

  const msg = await getClient().messages.create(params)
  console.log(`[Twilio/${isWhatsApp ? 'WhatsApp' : 'SMS'}] Sent to ${to} | sid: ${msg.sid} | status: ${msg.status}`)
  return msg
}

export async function sendMMS(to, mediaUrl, body = '') {
  const isWhatsApp = to.startsWith('whatsapp:')
  const params = isWhatsApp
    ? { from: WHATSAPP_FROM, to, body: body || mediaUrl }
    : { messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID, to, body, mediaUrl: [mediaUrl] }

  const msg = await getClient().messages.create(params)
  console.log(`[Twilio/${isWhatsApp ? 'WhatsApp' : 'MMS'}] Sent to ${to} | sid: ${msg.sid}`)
  return msg
}

export async function checkQuota() { return null }
