import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/api.js'

const isMock = import.meta.env.VITE_MOCK_MODE === 'true'

function getColor(score) {
  if (score >= 71) return '#22c55e'
  if (score >= 41) return '#f59e0b'
  return '#ef4444'
}

function getLabel(score) {
  if (score >= 71) return 'Strong'
  if (score >= 41) return 'Building'
  return 'Critical'
}

function ScoreRing({ score }) {
  const radius = 52
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = getColor(score)

  return (
    <div className="relative w-36 h-36 flex-shrink-0">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#1e2d6b" strokeWidth="10" />
        <circle
          cx="60" cy="60" r={radius} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-xs font-medium" style={{ color }}>{getLabel(score)}</span>
      </div>
    </div>
  )
}

export default function HealthScore({ clientId, initialScore }) {
  const { getAccessTokenSilently } = useAuth0()
  const [score, setScore] = useState(initialScore || 0)

  // Poll every 10 seconds for real-time updates
  useEffect(() => {
    if (isMock || !clientId) return

    async function fetchScore() {
      try {
        const token = await getAccessTokenSilently()
        const api = createApiClient(token)
        const { data } = await api.get(`/api/clients/${clientId}/health-score`)
        if (data.score != null) setScore(data.score)
      } catch (err) {
        // silent fail
      }
    }

    fetchScore()
    const interval = setInterval(fetchScore, 10000)
    return () => clearInterval(interval)
  }, [clientId])

  const color = getColor(score)

  return (
    <div className="bg-navy-800 rounded-xl p-5">
      <h3 className="text-white font-semibold text-sm mb-4">Financial Health Score</h3>
      <div className="flex items-center gap-6">
        <ScoreRing score={score} />
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-navy-300 text-xs">0–40 Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-navy-300 text-xs">41–70 Building</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-navy-300 text-xs">71–100 Strong</span>
          </div>
          <p className="text-navy-400 text-xs mt-2">Updates every 10s</p>
        </div>
      </div>
    </div>
  )
}
