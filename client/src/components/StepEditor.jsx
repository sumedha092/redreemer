import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/api.js'
import { CheckCircle2, Loader2 } from 'lucide-react'

const isMock = import.meta.env.VITE_MOCK_MODE === 'true'

export default function StepEditor({ client, onUpdate }) {
  const { getAccessTokenSilently } = useAuth0()
  const [step, setStep] = useState(client.current_step || 1)
  const [status, setStatus] = useState(null)

  async function handleClick(newStep) {
    if (newStep === step || isMock) { setStep(newStep); return }
    setStep(newStep)
    setStatus('saving')
    try {
      const token = await getAccessTokenSilently()
      const api = createApiClient(token)
      await api.patch(`/api/clients/${client.id}/step`, { step: newStep })
      setStatus('saved')
      if (onUpdate) onUpdate(newStep)
      setTimeout(() => setStatus(null), 2000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus(null), 2000)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-[hsl(var(--foreground))]">Set Current Step</span>
        {status === 'saving' && <Loader2 className="w-3.5 h-3.5 text-[hsl(var(--primary))] animate-spin" />}
        {status === 'saved' && <span className="flex items-center gap-1 text-xs text-green-400"><CheckCircle2 className="w-3 h-3" />Saved</span>}
        {status === 'error' && <span className="text-xs text-red-400">Error saving</span>}
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {[1,2,3,4,5,6,7,8].map(n => (
          <button
            key={n}
            onClick={() => handleClick(n)}
            className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
              n === step
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                : n < step
                ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted)/0.7)] border border-[hsl(var(--border))]'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
