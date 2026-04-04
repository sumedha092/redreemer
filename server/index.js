import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

import smsRoutes from './routes/sms.js'
import apiRoutes from './routes/api.js'
import { generateVoiceClips } from './services/elevenlabs.js'
import { startWeeklySmsJob } from './jobs/weeklySms.js'
import { startRemindersJob } from './jobs/reminders.js'
import { startCheckinJob } from './jobs/checkin.js'
import { startWeatherJob } from './jobs/weather.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve static voice clips
app.use('/clips', express.static(path.join(__dirname, 'public/clips')))

// Routes
app.use('/sms', smsRoutes)
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
