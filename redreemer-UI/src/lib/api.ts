import axios from 'axios'
import { API_BASE } from '@/lib/apiBase'

export const api = axios.create({ baseURL: API_BASE })

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}
