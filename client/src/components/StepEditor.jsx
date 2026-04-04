import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/api.js'

export default function StepEditor({ client, onUpdate }) {
  const { getAccessTokenSilently } = useAuth0()
  const [step, setStep] = useState(client.current_step || 1)
  const [status, setStatus] = useState(null)

  async function handleChange(e) {
    const newStep = parseInt(e.target.value)
    setStep(newStep)
    setStatus('saving')
    try {
      const token = await getAccessTokenSilently()
      const api = createApiClient(token)
      await api.patch(`/api/clients/${client.id}/step`, { step: newStep })
      setStatus('saved')
      if (onUpdate) onUpdate(newStep)
      setTimeout(() => setStatus(null), 2000)
    } catch (err) {
      console.error('Step update error:', err)
      setStatus('error')
      setTimeout(() => setStatus(null), 2000)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <label className="text-white font-semibold text-sm">Current Step:</label>
      <select
        value={step}
        onChange={handleChange}
        className="bg-navy-800 border border-navy-600 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-amber-500"
      >
        {[1,2,3,4,5,6,7,8].map(n => (
          <option key={n} value={n}>Step {n}</option>
        ))}
      </select>
      {status === 'saving' && <span className="text-amber-400 text-xs">Saving...</span>}
      {status === 'saved' && <span className="text-green-400 text-xs">Saved</span>}
      {status === 'error' && <span className="text-red-400 text-xs">Error</span>}
    </div>
  )
}
