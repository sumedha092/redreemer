import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/api.js'
import { AlertTriangle } from 'lucide-react'

const CLIP_LABELS = {
  homeless_step_1: 'Marcus — Step 1: Welcome',
  homeless_step_4: 'Marcus — Step 4: First Bank Account',
  homeless_step_8: 'Marcus — Step 8: Front Door',
  reentry_step_1: 'James — Step 1: Welcome',
  reentry_step_2: 'James — Step 2: Parole Check-in',
  reentry_step_8: 'James — Step 8: $500 Saved'
}

export default function VoicePlayer({ client, stepLogs = [] }) {
  const { getAccessTokenSilently } = useAuth0()
  const [clips, setClips] = useState(null)
  const [playing, setPlaying] = useState(null)
  const [loading, setLoading] = useState(false)
  const [clipError, setClipError] = useState(null)

  const completedSteps = stepLogs.map(l => l.step_number)

  async function loadClips() {
    if (clips) return
    setLoading(true)
    try {
      const token = await getAccessTokenSilently()
      const api = createApiClient(token)
      const { data } = await api.get('/api/voice-clips')
      setClips(data)
    } catch {
      setClipError('Voice clips require admin access. Contact your administrator.')
    } finally {
      setLoading(false)
    }
  }

  function playClip(url, key) {
    if (playing) {
      playing.pause()
      playing.currentTime = 0
    }
    const audio = new Audio(url)
    audio.play()
    setPlaying(audio)
    audio.onended = () => setPlaying(null)
  }

  const relevantClips = Object.entries(CLIP_LABELS).filter(([key]) => {
    const [type, , stepStr] = key.split('_')
    const step = parseInt(stepStr)
    return type === client.user_type && completedSteps.includes(step)
  })

  if (relevantClips.length === 0) return null

  return (
    <div>
      <h3 className="text-[hsl(var(--foreground))] font-semibold text-sm mb-3">Milestone Voice Messages</h3>
      {!clips && !clipError && (
        <button
          onClick={loadClips}
          disabled={loading}
          className="text-[hsl(var(--primary))] text-sm hover:opacity-80 transition-opacity"
        >
          {loading ? 'Loading…' : '▶ Load voice clips'}
        </button>
      )}
      {clipError && (
        <div className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted)/0.4)] rounded-lg p-2.5">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
          {clipError}
        </div>
      )}
      {clips && (
        <div className="space-y-2">
          {relevantClips.map(([key, label]) => {
            const clip = clips.find(c => c.key === key)
            if (!clip) return null
            return (
              <div key={key} className="flex items-center gap-3 bg-[hsl(var(--card))] rounded-lg p-3">
                <button
                  onClick={() => playClip(clip.url, key)}
                  className="w-8 h-8 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center text-[hsl(var(--foreground))] font-bold text-sm transition-colors flex-shrink-0"
                >
                  ▶
                </button>
                <span className="text-[hsl(var(--foreground))] text-sm">{label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
