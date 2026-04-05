/**
 * Redreemer Server — API Integration Tests
 * Tests all public HTTP endpoints against the running server.
 * Requires server to be running on localhost:3001.
 * Run: npm test (from redreemer/server/)
 */

import { describe, it, expect, beforeAll } from 'vitest'

const BASE = 'http://localhost:3001'

async function get(path) {
  const r = await fetch(`${BASE}${path}`)
  return { status: r.status, body: await r.json().catch(() => null) }
}

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return { status: r.status, body: await r.json().catch(() => null) }
}

async function postForm(path, params) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  })
  return { status: r.status, body: await r.text() }
}

// ── Health check ──────────────────────────────────────────────────────────────
describe('GET /health', () => {
  it('returns 200 with status', async () => {
    const { status, body } = await get('/health')
    expect(status).toBe(200)
    expect(body.status).toContain('running')
  })
})

// ── Impact metrics ────────────────────────────────────────────────────────────
describe('GET /api/impact', () => {
  it('returns 200 with impact fields', async () => {
    const { status, body } = await get('/api/impact')
    expect(status).toBe(200)
    expect(body).toHaveProperty('totalPeopleHelped')
    expect(body).toHaveProperty('totalMessages')
    expect(body).toHaveProperty('totalStepsCompleted')
    expect(body).toHaveProperty('typeBreakdown')
    expect(body).toHaveProperty('generatedAt')
  })
  it('totalPeopleHelped is a number', async () => {
    const { body } = await get('/api/impact')
    expect(typeof body.totalPeopleHelped).toBe('number')
  })
})

// ── SMS Simulate ──────────────────────────────────────────────────────────────
describe('POST /api/sms/simulate', () => {
  it('returns 200 with userId for new user', async () => {
    const { status, body } = await post('/api/sms/simulate', {
      phone: '+15559990001',
      message: 'I need help finding shelter',
    })
    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.userId).toBeTruthy()
  })

  it('returns 400 for missing phone', async () => {
    const { status } = await post('/api/sms/simulate', { message: 'hello' })
    expect(status).toBe(400)
  })

  it('returns 400 for missing message', async () => {
    const { status } = await post('/api/sms/simulate', { phone: '+15559990001' })
    expect(status).toBe(400)
  })
})

// ── Client messages ───────────────────────────────────────────────────────────
describe('GET /api/clients/:id/messages', () => {
  it('returns empty array for unknown phone', async () => {
    const { status, body } = await get('/api/clients/%2B15559000000/messages')
    expect(status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
  })

  it('returns messages for known demo phone', async () => {
    // First simulate a message to create the user
    await post('/api/sms/simulate', { phone: '+15559990002', message: 'hello' })
    await new Promise(r => setTimeout(r, 3000)) // wait for async AI processing

    const { status, body } = await get('/api/clients/%2B15559990002/messages')
    expect(status).toBe(200)
    expect(Array.isArray(body)).toBe(true)
  }, 15000)
})

// ── AI Insights ───────────────────────────────────────────────────────────────
describe('POST /api/ai/insights', () => {
  it('returns insights for emergency tool', async () => {
    const { status, body } = await post('/api/ai/insights', {
      tool: 'emergency',
      data: {
        monthlyExpenses: 1500,
        currentSaved: 200,
        monthlySavings: 50,
        target: 4500,
        targetMonths: 3,
        pct: 4,
        categories: [],
      },
    })
    expect(status).toBe(200)
    expect(body.insights).toBeTruthy()
    expect(body.insights).toHaveProperty('riskLevel')
    expect(body.insights).toHaveProperty('recommendation')
  }, 30000)

  it('returns insights for budget tool', async () => {
    const { status, body } = await post('/api/ai/insights', {
      tool: 'budget',
      data: {
        income: 1800,
        totalSpent: 1600,
        remaining: 200,
        categories: [{ name: 'Housing', budget: 800, spent: 800 }],
      },
    })
    expect(status).toBe(200)
    expect(body.insights).toHaveProperty('topIssue')
    expect(body.insights).toHaveProperty('score')
  }, 30000)

  it('returns 400 for missing tool', async () => {
    const { status } = await post('/api/ai/insights', { data: {} })
    expect(status).toBe(400)
  })

  it('returns 400 for unknown tool', async () => {
    const { status } = await post('/api/ai/insights', { tool: 'unknown', data: {} })
    expect(status).toBe(400)
  })
})

// ── TTS endpoint ──────────────────────────────────────────────────────────────
describe('POST /api/tts', () => {
  it('returns 400 for empty text', async () => {
    const { status, body } = await post('/api/tts', { text: '' })
    expect(status).toBe(400)
    expect(body.error).toContain('required')
  })

  it('returns 400 for missing text', async () => {
    const { status, body } = await post('/api/tts', {})
    expect(status).toBe(400)
    expect(body.error).toContain('required')
  })

  it('returns 400 for text over limit', async () => {
    const { status } = await post('/api/tts', { text: 'a'.repeat(2600) })
    expect(status).toBe(400)
  })

  it('returns audio or error for valid text (depends on API key)', async () => {
    const r = await fetch(`${BASE}/api/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'Hello, this is a test.' }),
    })
    // 200 = audio returned, 400 = not configured, 502 = ElevenLabs error
    expect([200, 400, 502]).toContain(r.status)
  })
})

// ── SMS Incoming webhook ──────────────────────────────────────────────────────
describe('POST /sms/incoming', () => {
  // Use timestamp-based unique phones to avoid rate limiting across test runs
  const ts = Date.now().toString().slice(-6)

  it('returns 200 immediately (Twilio expects fast response)', async () => {
    const { status } = await postForm('/sms/incoming', {
      From: `+1555${ts}0`, Body: 'hello', To: '+14155238886',
    })
    expect(status).toBe(200)
  })

  it('handles STOP opt-out', async () => {
    const { status } = await postForm('/sms/incoming', {
      From: `+1555${ts}1`, Body: 'STOP', To: '+14155238886',
    })
    expect(status).toBe(200)
  })

  it('handles crisis message without crashing', async () => {
    const { status } = await postForm('/sms/incoming', {
      From: `+1555${ts}2`, Body: 'I want to die', To: '+14155238886',
    })
    expect(status).toBe(200)
  })

  it('handles predatory lending message', async () => {
    const { status } = await postForm('/sms/incoming', {
      From: `+1555${ts}3`, Body: 'I need a payday loan', To: '+14155238886',
    })
    expect(status).toBe(200)
  })

  it('handles HELP keyword', async () => {
    const { status } = await postForm('/sms/incoming', {
      From: `+1555${ts}4`, Body: 'HELP', To: '+14155238886',
    })
    expect(status).toBe(200)
  })

  it('handles FOOD keyword', async () => {
    const { status } = await postForm('/sms/incoming', {
      From: `+1555${ts}5`, Body: 'FOOD', To: '+14155238886',
    })
    expect(status).toBe(200)
  })

  it('handles empty body gracefully', async () => {
    const { status } = await postForm('/sms/incoming', {
      From: `+1555${ts}6`, Body: '', To: '+14155238886',
    })
    expect(status).toBe(200)
  })

  it('handles missing From gracefully', async () => {
    const { status } = await postForm('/sms/incoming', {
      Body: 'hello', To: '+14155238886',
    })
    expect(status).toBe(200)
  })
})

// ── Protected endpoints return 401 without token ──────────────────────────────
describe('Protected endpoints (no auth)', () => {
  it('GET /api/clients returns 401', async () => {
    const { status } = await get('/api/clients')
    expect(status).toBe(401)
  })

  it('GET /api/analytics returns 401', async () => {
    const { status } = await get('/api/analytics')
    expect(status).toBe(401)
  })

  it('POST /api/clients returns 401', async () => {
    const { status } = await post('/api/clients', { phone_number: '+15550000099' })
    expect(status).toBe(401)
  })

  it('PATCH /api/clients/1/step returns 401', async () => {
    const { status } = await post('/api/clients/1/step', { step: 2 })
    // POST to PATCH endpoint returns 404 or 401
    expect([401, 404]).toContain(status)
  })
})

// ── Rate limiting ─────────────────────────────────────────────────────────────
describe('Rate limiting', () => {
  it('SMS endpoint allows first 10 requests', async () => {
    // Just verify it doesn't immediately 429 on first request
    const { status } = await postForm('/sms/incoming', {
      From: '+15559990020',
      Body: 'test',
      To: '+14155238886',
    })
    expect(status).toBe(200)
  })
})
