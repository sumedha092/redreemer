import twilio from 'twilio'
import dotenv from 'dotenv'
dotenv.config()

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

/**
 * Send an outbound SMS message.
 */
export async function sendSMS(to, body) {
  // Split messages longer than 1600 characters
  const chunks = body.match(/.{1,1600}/gs) || [body]
  for (const chunk of chunks) {
    await client.messages.create({
      body: chunk,
      from: process.env.TWILIO_PHONE_NUMBER,
      to
    })
    if (chunks.length > 1) {
      await new Promise(r => setTimeout(r, 500))
    }
  }
}

/**
 * Send an MMS with a media URL (used for ElevenLabs voice clips).
 */
export async function sendMMS(to, mediaUrl, body = '') {
  await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
    mediaUrl: [mediaUrl]
  })
}
