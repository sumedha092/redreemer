import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CLIPS_DIR = path.join(__dirname, '../public/clips')

// Voice clip scripts — keyed by user_type_step_number
export const VOICE_CLIP_SCRIPTS = {
  homeless_step_1: "Welcome to Redreemer, Marcus. You just took the first step. We're going to figure this out together, one day at a time.",
  homeless_step_4: "Marcus. You just opened your first bank account. Your money is safe now. Nobody can take that from you. Step 4 done.",
  homeless_step_8: "Marcus. Five hundred dollars. You saved five hundred dollars. That's your front door. You did this.",
  reentry_step_1: "Welcome to Redreemer, James. First day out. We've got you. Let's take this one step at a time.",
  reentry_step_2: "James. Parole check-in done. You showed up. That matters more than you know. Step 2 done.",
  reentry_step_8: "James. Five hundred dollars saved. A year ago you had fifty. Look at what you built. Step 8 done."
}

// In-memory URL store after generation
const clipUrls = {}

/**
 * Pre-generate all 6 voice clips using ElevenLabs REST API directly.
 */
export async function generateVoiceClips(baseUrl = process.env.SERVER_BASE_URL || 'http://localhost:3001') {
  if (!fs.existsSync(CLIPS_DIR)) {
    fs.mkdirSync(CLIPS_DIR, { recursive: true })
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM' // Rachel default

  if (!apiKey || apiKey === 'your_elevenlabs_api_key') {
    console.log('ElevenLabs API key not set — skipping voice clip generation')
    return
  }

  for (const [key, script] of Object.entries(VOICE_CLIP_SCRIPTS)) {
    const filePath = path.join(CLIPS_DIR, `${key}.mp3`)

    if (fs.existsSync(filePath)) {
      clipUrls[key] = `${baseUrl}/clips/${key}.mp3`
      console.log(`Voice clip already exists: ${key}`)
      continue
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg'
          },
          body: JSON.stringify({
            text: script,
            model_id: 'eleven_turbo_v2_5',
            voice_settings: { stability: 0.5, similarity_boost: 0.75 }
          })
        }
      )

      if (!response.ok) {
        const errText = await response.text()
        console.error(`Failed to generate voice clip ${key}: ${response.status} ${errText}`)
        continue
      }

      const arrayBuffer = await response.arrayBuffer()
      fs.writeFileSync(filePath, Buffer.from(arrayBuffer))
      clipUrls[key] = `${baseUrl}/clips/${key}.mp3`
      console.log(`Generated voice clip: ${key}`)
    } catch (err) {
      console.error(`Failed to generate voice clip ${key}:`, err.message)
    }
  }
}

export function getClipUrl(userType, stepNumber) {
  const key = `${userType}_step_${stepNumber}`
  return clipUrls[key] || null
}

export function getAllClipUrls() {
  return Object.entries(clipUrls).map(([key, url]) => ({
    key,
    script: VOICE_CLIP_SCRIPTS[key],
    url
  }))
}

/** ElevenLabs character limit per request (conservative for most plans). */
export const MAX_TTS_CHARS = 2500

/**
 * Convert plain text to MP3 bytes via ElevenLabs REST API.
 * Server-side only — never expose the API key to clients.
 * Used by POST /api/tts for on-demand speech in the chat UI.
 *
 * @param {string} text
 * @param {{ voiceId?: string, modelId?: string, stability?: number, similarityBoost?: number }} [options]
 * @returns {Promise<Buffer>}
 */
export async function synthesizeSpeech(text, options = {}) {
  const apiKey = process.env.ELEVENLABS_API_KEY
  const voiceId = options.voiceId || process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM'

  if (!apiKey || apiKey === 'your_elevenlabs_api_key') {
    throw new Error('ELEVENLABS_API_KEY is not configured on the server')
  }

  const trimmed = String(text ?? '').trim()
  if (!trimmed) throw new Error('text is required')
  if (trimmed.length > MAX_TTS_CHARS) {
    throw new Error(`text must be at most ${MAX_TTS_CHARS} characters`)
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: trimmed,
        model_id: options.modelId || 'eleven_turbo_v2_5',
        voice_settings: {
          stability: options.stability ?? 0.5,
          similarity_boost: options.similarityBoost ?? 0.75,
        },
      }),
    }
  )

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(`ElevenLabs error ${response.status}: ${errText.slice(0, 300)}`)
  }

  return Buffer.from(await response.arrayBuffer())
}
