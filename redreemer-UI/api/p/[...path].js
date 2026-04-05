/**
 * Same-origin proxy: browser → /api/p/... → API_UPSTREAM_ORIGIN/...
 * Used when Vercel "Root Directory" is `redreemer-UI`.
 * Repository-root deploy uses /api/p/[...path].js at repo root — keep both files in sync.
 *
 * Vercel: API_UPSTREAM_ORIGIN=https://YOUR.ngrok-free.dev (no trailing slash, no /api)
 * Build: VITE_API_URL=/api/p
 */

export const config = { runtime: 'edge' }

function upstreamPathAndSearch(url) {
  const u = new URL(url)
  let pathname = u.pathname.replace(/^\/api\/p/, '') || '/'
  if (pathname.startsWith('/api/')) {
    pathname = pathname.slice(4)
  }
  const pathOnly = pathname.split('?')[0]
  if (
    pathOnly !== '/' &&
    pathOnly !== '' &&
    !pathOnly.startsWith('/api') &&
    !pathOnly.startsWith('/sms') &&
    !pathOnly.startsWith('/clips') &&
    pathOnly !== '/health'
  ) {
    pathname = '/api' + (pathOnly.startsWith('/') ? pathOnly : '/' + pathOnly)
  }
  return pathname + (u.search || '')
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    const reqHdr = request.headers.get('Access-Control-Request-Headers') || ''
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,HEAD,POST,PUT,PATCH,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': reqHdr.toLowerCase().includes('authorization')
          ? 'Content-Type, Authorization, ngrok-skip-browser-warning'
          : 'Content-Type, ngrok-skip-browser-warning',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  const upstream = process.env.API_UPSTREAM_ORIGIN?.replace(/\/$/, '')
  if (!upstream) {
    return new Response(JSON.stringify({ error: 'API_UPSTREAM_ORIGIN is not set on Vercel' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const rest = upstreamPathAndSearch(request.url)
  const target = `${upstream}${rest}`

  const headers = new Headers()
  for (const [k, v] of request.headers.entries()) {
    const low = k.toLowerCase()
    if (low === 'host' || low === 'connection') continue
    headers.set(k, v)
  }
  headers.set('ngrok-skip-browser-warning', 'true')

  let body
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.arrayBuffer()
  }

  let upstreamRes
  try {
    upstreamRes = await fetch(target, {
      method: request.method,
      headers,
      body: body && body.byteLength > 0 ? body : undefined,
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Upstream fetch failed', detail: String(e) }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const outHeaders = new Headers()
  const hop = new Set(['connection', 'transfer-encoding'])
  upstreamRes.headers.forEach((value, key) => {
    if (!hop.has(key.toLowerCase())) outHeaders.set(key, value)
  })

  return new Response(upstreamRes.body, {
    status: upstreamRes.status,
    statusText: upstreamRes.statusText,
    headers: outHeaders,
  })
}
