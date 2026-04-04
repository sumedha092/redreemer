import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/api.js'

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

  const completedSteps = stepLogs.map(l => l.step_number)

  async function loadClips() {
    if (clips) return
    setLoading(true)
    try {
      const token = await getAccessTokenSilently()
      const api = createApiClient(token)
      const { data } = await api.get('/api/voice-clips')
      setClips(data)
    } catch (err) {
      console.error('Failed to load clips:', err)
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
      <h3 className="text-white font-semibold text-sm mb-3">Milestone Voice Messages</h3>
      {!clips && (
        <button
          onClick={loadClips}
          disabled={loading}
          className="text-amber-500 text-sm hover:text-amber-400 transition-colors"
        >
          {loading ? 'Loading...' : '▶ Load voice clips'}
        </button>
      )}
      {clips && (
        <div className="space-y-2">
          {relevantClips.map(([key, label]) => {
            const clip = clips.find(c => c.key === key)
            if (!clip) return null
            return (
              <div key={key} className="flex items-center gap-3 bg-navy-800 rounded-lg p-3">
                <button
                  onClick={() => playClip(clip.url, key)}
                  className="w-8 h-8 bg-amber-500 hover:bg-amber-600 rounded-full flex items-center justify-center text-navy-900 font-bold text-sm transition-colors flex-shrink-0"
                >
                  ▶
                </button>
                <span className="text-navy-100 text-sm">{label}</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
