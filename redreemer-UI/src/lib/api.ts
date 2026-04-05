import axios from 'axios'
import { API_BASE, getNgrokSkipHeaders } from '@/lib/apiBase'

/** Same-origin Vercel proxy: browser hits /api/p/… → upstream /api/… (no double /api). */
const SAME_ORIGIN_API_PROXY = '/api/p'

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'ngrok-skip-browser-warning': 'true',
    ...getNgrokSkipHeaders(),
  },
})

api.interceptors.request.use((config) => {
  const base = String(config.baseURL ?? '')
  if (base === SAME_ORIGIN_API_PROXY || base.endsWith(SAME_ORIGIN_API_PROXY)) {
    const u = config.url
    if (typeof u === 'string' && u.startsWith('/api/')) {
      config.url = u.slice(4)
    }
  }
  return config
})

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}
