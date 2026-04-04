import express from 'express'
import { checkJwt, getAuth0User } from '../middleware/auth.js'
import { sendSMS } from '../services/twilio.js'
import { getAllClipUrls } from '../services/elevenlabs.js'
import {
  getCaseworkerByAuth0Id,
  getCaseworkerClients,
  getAllClients,
  getUserById,
  createUser,
  updateCurrentStep,
  getConversationHistory,
  getStepLogs
} from '../services/supabase.js'
import { supabase } from '../services/supabase.js'

const router = express.Router()

// Apply JWT auth to all routes
router.use(checkJwt)

// Error handler for JWT failures
router.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid or missing token' })
  }
  next(err)
})

/**
 * GET /api/clients
 * Returns clients scoped by role (caseworker sees own, admin sees all)
 */
router.get('/clients', async (req, res) => {
  try {
    const authUser = getAuth0User(req)
    if (!authUser) return res.status(401).json({ error: 'Unauthorized' })

    if (authUser.role === 'admin') {
      const clients = await getAllClients()
      return res.json(clients)
    }

    const caseworker = await getCaseworkerByAuth0Id(authUser.auth0Id)
    if (!caseworker) return res.status(403).json({ error: 'Caseworker record not found' })

    const clients = await getCaseworkerClients(caseworker.id)
    res.json(clients)
  } catch (err) {
    console.error('GET /clients error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * GET /api/clients/:id
 * Returns single client with full detail
 */
router.get('/clients/:id', async (req, res) => {
  try {
    const authUser = getAuth0User(req)
    if (!authUser) return res.status(401).json({ error: 'Unauthorized' })

    const client = await getUserById(req.params.id)
    if (!client) return res.status(404).json({ error: 'Client not found' })

    // Caseworkers can only access their own clients
    if (authUser.role !== 'admin') {
      const caseworker = await getCaseworkerByAuth0Id(authUser.auth0Id)
      if (!caseworker || client.caseworker_id !== caseworker.id) {
        return res.status(403).json({ error: 'Access denied' })
      }
    }

    const [conversations, stepLogs] = await Promise.all([
      getConversationHistory(client.id, 20),
      getStepLogs(client.id)
    ])

    res.json({ ...client, conversations, stepLogs })
  } catch (err) {
    console.error('GET /clients/:id error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /api/clients
 * Add a new client manually and send welcome SMS
 */
router.post('/clients', async (req, res) => {
  try {
    const authUser = getAuth0User(req)
    if (!authUser) return res.status(401).json({ error: 'Unauthorized' })

    const { phone_number } = req.body
    if (!phone_number) return res.status(400).json({ error: 'phone_number is required' })

    const caseworker = authUser.role === 'admin'
      ? null
      : await getCaseworkerByAuth0Id(authUser.auth0Id)

    const { data: newClient, error } = await supabase
      .from('users')
      .insert({
        phone_number,
        current_step: 1,
        caseworker_id: caseworker?.id || null
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Phone number already exists' })
      throw error
    }

    await sendSMS(phone_number,
      `You've been added to Redreemer by your caseworker. We help people get back on their feet — banking, housing, benefits, jobs.\n\nAre you currently homeless, recently released from prison, or both?`
    )

    res.status(201).json(newClient)
  } catch (err) {
    console.error('POST /clients error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * PATCH /api/clients/:id/step
 * Update a client's current step
 */
router.patch('/clients/:id/step', async (req, res) => {
  try {
    const authUser = getAuth0User(req)
    if (!authUser) return res.status(401).json({ error: 'Unauthorized' })

    const step = parseInt(req.body.step)
    if (!step || step < 1 || step > 8) {
      return res.status(400).json({ error: 'step must be an integer between 1 and 8' })
    }

    const client = await getUserById(req.params.id)
    if (!client) return res.status(404).json({ error: 'Client not found' })

    if (authUser.role !== 'admin') {
      const caseworker = await getCaseworkerByAuth0Id(authUser.auth0Id)
      if (!caseworker || client.caseworker_id !== caseworker.id) {
        return res.status(403).json({ error: 'Access denied' })
      }
    }

    const updated = await updateCurrentStep(req.params.id, step)
    res.json(updated)
  } catch (err) {
    console.error('PATCH /clients/:id/step error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /api/clients/:id/message
 * Send a direct SMS to a client from the dashboard
 */
router.post('/clients/:id/message', async (req, res) => {
  try {
    const authUser = getAuth0User(req)
    if (!authUser) return res.status(401).json({ error: 'Unauthorized' })

    const { message } = req.body
    if (!message) return res.status(400).json({ error: 'message is required' })

    const client = await getUserById(req.params.id)
    if (!client) return res.status(404).json({ error: 'Client not found' })

    if (authUser.role !== 'admin') {
      const caseworker = await getCaseworkerByAuth0Id(authUser.auth0Id)
      if (!caseworker || client.caseworker_id !== caseworker.id) {
        return res.status(403).json({ error: 'Access denied' })
      }
    }

    await sendSMS(client.phone_number, message)
    res.json({ success: true, message: 'SMS sent' })
  } catch (err) {
    console.error('POST /clients/:id/message error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * GET /api/clients/:id/export
 * Export a client's full progress report as JSON
 */
router.get('/clients/:id/export', async (req, res) => {
  try {
    const authUser = getAuth0User(req)
    if (!authUser) return res.status(401).json({ error: 'Unauthorized' })

    const client = await getUserById(req.params.id)
    if (!client) return res.status(404).json({ error: 'Client not found' })

    if (authUser.role !== 'admin') {
      const caseworker = await getCaseworkerByAuth0Id(authUser.auth0Id)
      if (!caseworker || client.caseworker_id !== caseworker.id) {
        return res.status(403).json({ error: 'Access denied' })
      }
    }

    const [conversations, stepLogs] = await Promise.all([
      getConversationHistory(client.id, 100),
      getStepLogs(client.id)
    ])

    const report = {
      exportedAt: new Date().toISOString(),
      client: {
        name: client.name,
        userType: client.user_type,
        city: client.city,
        currentStep: client.current_step,
        createdAt: client.created_at,
        lastActive: client.last_active
      },
      stepProgress: stepLogs,
      conversationHistory: conversations
    }

    res.setHeader('Content-Disposition', `attachment; filename="redreemer-${client.name || client.id}-report.json"`)
    res.json(report)
  } catch (err) {
    console.error('GET /clients/:id/export error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * GET /api/voice-clips
 * Admin only — list all pre-generated voice clips
 */
router.get('/voice-clips', async (req, res) => {
  try {
    const authUser = getAuth0User(req)
    if (!authUser) return res.status(401).json({ error: 'Unauthorized' })
    if (authUser.role !== 'admin') return res.status(403).json({ error: 'Admin access required' })

    const clips = getAllClipUrls()
    res.json(clips)
  } catch (err) {
    console.error('GET /voice-clips error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * GET /api/analytics
 * Dashboard analytics — aggregated stats from Supabase
 */
router.get('/analytics', async (req, res) => {
  try {
    const authUser = getAuth0User(req)
    if (!authUser) return res.status(401).json({ error: 'Unauthorized' })

    const [
      { count: totalClients },
      { count: totalMessages },
      { count: totalStepsCompleted },
      { data: allUsers },
      { data: stepLogsData }
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('conversations').select('*', { count: 'exact', head: true }),
      supabase.from('step_logs').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('user_type, current_step, last_active, financial_health_score'),
      supabase.from('step_logs').select('step_number')
    ])

    const users = allUsers || []
    const stepLogs = stepLogsData || []

    // User type breakdown
    const typeBreakdown = {
      homeless: users.filter(u => u.user_type === 'homeless').length,
      reentry: users.filter(u => u.user_type === 'reentry').length,
      both: users.filter(u => u.user_type === 'both').length,
      unknown: users.filter(u => !u.user_type).length
    }

    // Steps funnel — how many users at each step
    const stepsFunnel = Array.from({ length: 8 }, (_, i) => ({
      step: i + 1,
      count: users.filter(u => u.current_step === i + 1).length
    }))

    // Active this week
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const activeThisWeek = users.filter(u => u.last_active && new Date(u.last_active) > weekAgo).length
    const inactiveUsers = users.length - activeThisWeek

    // Average health score
    const scores = users.filter(u => u.financial_health_score != null).map(u => u.financial_health_score)
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

    // Step completion distribution
    const stepCompletionCounts = {}
    stepLogs.forEach(log => {
      stepCompletionCounts[log.step_number] = (stepCompletionCounts[log.step_number] || 0) + 1
    })

    res.json({
      totalClients: totalClients || 0,
      totalMessages: totalMessages || 0,
      totalStepsCompleted: totalStepsCompleted || 0,
      avgHealthScore: avgScore,
      typeBreakdown,
      stepsFunnel,
      activeThisWeek,
      inactiveUsers,
      stepCompletionCounts
    })
  } catch (err) {
    console.error('GET /analytics error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * GET /api/clients/:id/health-score
 * Get real-time financial health score for a client
 */
router.get('/clients/:id/health-score', async (req, res) => {
  try {
    const authUser = getAuth0User(req)
    if (!authUser) return res.status(401).json({ error: 'Unauthorized' })

    const { updateHealthScore } = await import('../services/healthScore.js')
    const score = await updateHealthScore(req.params.id)
    res.json({ score })
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * POST /api/demo/run
 * Insert pre-scripted demo conversation for "Alex"
 */
router.post('/demo/run', async (req, res) => {
  try {
    const authUser = getAuth0User(req)
    if (!authUser) return res.status(401).json({ error: 'Unauthorized' })

    // Create or find Alex
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('phone_number', '+15550000099')
      .single()

    let alexId
    if (existing) {
      alexId = existing.id
      // Reset Alex
      await supabase.from('users').update({
        name: 'Alex', user_type: 'both', city: 'Phoenix', current_step: 3,
        financial_health_score: 45, last_active: new Date().toISOString()
      }).eq('id', alexId)
      await supabase.from('conversations').delete().eq('user_id', alexId)
      await supabase.from('step_logs').delete().eq('user_id', alexId)
    } else {
      const { data: newUser } = await supabase.from('users').insert({
        phone_number: '+15550000099', name: 'Alex', user_type: 'both',
        city: 'Phoenix', current_step: 3, financial_health_score: 45,
        last_active: new Date().toISOString()
      }).select().single()
      alexId = newUser.id
    }

    const now = Date.now()
    const day = 24 * 60 * 60 * 1000
    const week = 7 * day

    // Stage 1 — Survival (3 weeks ago)
    const stage1 = [
      { role: 'user', content: 'help', ts: now - 3 * week },
      { role: 'assistant', content: "Hey. I'm Redreemer. I'm here to help you get back on your feet — shelter, food, ID, banking, jobs. Do you have a safe place to sleep tonight?", ts: now - 3 * week + 30000 },
      { role: 'user', content: "no im on the street in phoenix az", ts: now - 3 * week + 2 * 60000 },
      { role: 'assistant', content: "Got you. Phoenix has beds available tonight:\n\n• Central Arizona Shelter Services\n  230 S 12th Ave, Phoenix\n  (602) 256-6945\n\n• Human Services Campus\n  1125 W Jackson St, Phoenix\n  (602) 595-8700\n\n• St. Vincent de Paul\n  420 W Watkins St, Phoenix\n  (602) 261-6886\n\nHead to any of these now — they're open. Do you have a state ID?", ts: now - 3 * week + 3 * 60000 },
      { role: 'user', content: "no i lost it", ts: now - 3 * week + 10 * 60000 },
      { role: 'assistant', content: "Getting your ID is Step 2 — it unlocks everything. Go to MVD at 1801 W Jefferson St, Phoenix. Ask for the homeless ID program — it's free. Bring any one document: birth certificate, SSN card, or a shelter letter. An ID is your financial passport — without it, no bank will open an account for you.", ts: now - 3 * week + 11 * 60000 },
    ]

    // Stage 2 — Stability (1 week ago)
    const stage2 = [
      { role: 'user', content: "i got a job at dollar general", ts: now - week },
      { role: 'assistant', content: "Alex. That's real. Dollar General is a solid start — steady hours, consistent pay. Here's what to do with your first paycheck: put $50 straight into savings before you spend anything else. Even $50 is the beginning of your emergency fund. How much is your first check going to be?", ts: now - week + 30000 },
      { role: 'user', content: "probably like 400", ts: now - week + 5 * 60000 },
      { role: 'assistant', content: "Perfect. Here's your first budget: $200 housing/shelter, $100 food, $50 transport, $50 savings. That $50 in savings is Step 6 starting. Once you hit $200 saved, you qualify for matched savings programs that can double it. You're building something real.", ts: now - week + 6 * 60000 },
    ]

    // Stage 3 — Empowerment (today)
    const stage3 = [
      { role: 'user', content: "someone offered me a payday loan for 300 dollars", ts: now - 2 * 60000 },
      { role: 'assistant', content: "Don't take it. Payday loans charge 300-400% APR — a $300 loan becomes $450 in two weeks. That's a trap designed for people in your exact situation.\n\nInstead: Arizona has emergency assistance programs. St. Mary's Food Bank (602-242-3663) can cover food costs. If you need cash fast, ask Dollar General about a paycheck advance — it's free.\n\nYour Bank On account at Chase (21 S Central Ave) can also give you a small credit-builder loan at normal rates once you've had the account 90 days. Predatory lenders profit from financial desperation — you're too close to stability to let them take it.", ts: now - 60000 },
    ]

    const allConversations = [...stage1, ...stage2, ...stage3].map(c => ({
      user_id: alexId,
      role: c.role,
      content: c.content,
      created_at: new Date(c.ts).toISOString()
    }))

    await supabase.from('conversations').insert(allConversations)

    // Add step logs
    await supabase.from('step_logs').insert([
      { user_id: alexId, step_number: 1, completed_at: new Date(now - 3 * week).toISOString(), notes: 'Connected to Redreemer' },
      { user_id: alexId, step_number: 2, completed_at: new Date(now - 2 * week).toISOString(), notes: 'Got free state ID at Phoenix MVD' },
    ])

    res.json({ success: true, userId: alexId, message: 'Demo user Alex created with full conversation history' })
  } catch (err) {
    console.error('POST /demo/run error:', err)
    res.status(500).json({ error: err.message })
  }
})

export default router
