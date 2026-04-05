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
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = getColor(score)

  return (
    <div className="relative w-28 h-28 shrink-0">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[hsl(var(--foreground))]">{score}</span>
        <span className="text-[10px] font-semibold" style={{ color }}>{getLabel(score)}</span>
      </div>
    </div>
  )
}

export default function HealthScore({ clientId, initialScore }) {
  const { getAccessTokenSilently } = useAuth0()
  const [score, setScore] = useState(initialScore || 0)

  useEffect(() => {
    if (isMock || !clientId) return
    async function fetchScore() {
      try {
        const token = await getAccessTokenSilently()
        const api = createApiClient(token)
        const { data } = await api.get(`/api/clients/${clientId}/health-score`)
        if (data.score != null) setScore(data.score)
      } catch { /* silent */ }
    }
    fetchScore()
    const interval = setInterval(fetchScore, 10000)
    return () => clearInterval(interval)
  }, [clientId])

  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-4">Financial Health Score</h3>
      <div className="flex items-center gap-5">
        <ScoreRing score={score} />
        <div className="space-y-2 flex-1">
          {[
            { color: '#ef4444', label: '0–40', badge: 'Critical' },
            { color: '#f59e0b', label: '41–70', badge: 'Building' },
            { color: '#22c55e', label: '71–100', badge: 'Strong' },
          ].map(({ color, label, badge }) => (
            <div key={badge} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-xs text-[hsl(var(--muted-foreground))]">{label}</span>
              <span className="text-xs font-medium text-[hsl(var(--foreground))]">{badge}</span>
            </div>
          ))}
          <p className="text-[10px] text-[hsl(var(--muted-foreground))] pt-1">Auto-refreshes every 10s</p>
        </div>
      </div>
    </div>
  )
}
