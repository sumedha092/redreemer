import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import rateLimit from 'express-rate-limit'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
// Load .env relative to this file, regardless of where the server is started from
dotenv.config({ path: path.resolve(__dirname, '.env') })

// Prevent crashes from unhandled errors — log and keep running
process.on('uncaughtException', err => console.error('[CRASH] Uncaught exception:', err))
process.on('unhandledRejection', reason => console.error('[CRASH] Unhandled rejection:', reason))

import smsRoutes from './routes/sms.js'
import apiRoutes from './routes/api.js'
import { generateVoiceClips } from './services/elevenlabs.js'
import { startWeeklySmsJob } from './jobs/weeklySms.js'
import { startRemindersJob } from './jobs/reminders.js'
import { startCheckinJob } from './jobs/checkin.js'
import { startWeatherJob } from './jobs/weather.js'

const app = express()

// Trust proxy headers from ngrok
app.set('trust proxy', 1)

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static voice clips
app.use('/clips', express.static(path.join(__dirname, 'public/clips')))

// Feature 10: Rate limiting for SMS endpoint
const smsLimiter = rateLimit({
  windowMs: 60000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests'
})

// Public API routes that bypass JWT (mounted BEFORE apiRoutes to avoid JWT error handler)
app.post('/api/tts', async (req, res) => {
  const { synthesizeSpeech } = await import('./services/elevenlabs.js')
  try {
    const { text } = req.body || {}
    const audio = await synthesizeSpeech(text)
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Cache-Control', 'no-store')
    res.send(audio)
  } catch (err) {
    const msg = err.message || 'TTS failed'
    if (msg.includes('required') || msg.includes('at most') || msg.includes('not configured')) {
      return res.status(400).json({ error: msg })
    }
    res.status(502).json({ error: msg })
  }
})

// Routes
app.use('/sms', smsLimiter, smsRoutes)
app.use('/api', apiRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Redreemer is running', timestamp: new Date().toISOString() })
})

// Start server
const PORT = process.env.PORT || 3001
app.listen(PORT, async () => {
  console.log(`Redreemer server running on port ${PORT}`)

  // Pre-generate ElevenLabs voice clips
  try {
    const baseUrl = process.env.SERVER_BASE_URL || `http://localhost:${PORT}`
    await generateVoiceClips(baseUrl)
    console.log('Voice clips ready')
  } catch (err) {
    console.error('Voice clip generation failed (non-fatal):', err.message)
  }

  // Start cron jobs
  startWeeklySmsJob()
  startRemindersJob()
  startCheckinJob()
  startWeatherJob()
  console.log('Cron jobs started')
})

export default app
