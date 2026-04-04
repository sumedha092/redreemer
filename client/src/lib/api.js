import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function createApiClient(token) {
  return axios.create({
    baseURL: BASE_URL,
    headers: { Authorization: `Bearer ${token}` }
  })
}
