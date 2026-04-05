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

// Middleware — reflect Origin (Vercel + localhost) and allow ngrok’s skip header on preflight
app.use(
  cors({
    origin: true,
    credentials: false,
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  })
)
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

// POST /api/tts is handled by routes/api.js (rate-limited) so there is a single code path.

// Routes — Twilio webhook (production): POST /sms/incoming (POST /api/sms/incoming is on api router)
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
