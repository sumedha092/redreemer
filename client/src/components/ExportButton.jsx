import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/api.js'
import { Download, CheckCircle2, AlertTriangle } from 'lucide-react'

const isMock = import.meta.env.VITE_MOCK_MODE === 'true'

export default function ExportButton({ client }) {
  const { getAccessTokenSilently } = useAuth0()
  const [status, setStatus] = useState(null) // null | 'loading' | 'done' | 'error'

  async function handleExport() {
    if (isMock) {
      // Export mock data directly
      const blob = new Blob([JSON.stringify(client, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `redreemer-${client.name || client.id}-report.json`
      a.click()
      URL.revokeObjectURL(url)
      setStatus('done')
      setTimeout(() => setStatus(null), 3000)
      return
    }

    setStatus('loading')
    try {
      const token = await getAccessTokenSilently()
      const api = createApiClient(token)
      const { data } = await api.get(`/api/clients/${client.id}/export`)
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `redreemer-${client.name || client.id}-report.json`
      a.click()
      URL.revokeObjectURL(url)
      setStatus('done')
      setTimeout(() => setStatus(null), 3000)
    } catch {
      setStatus('error')
      setTimeout(() => setStatus(null), 4000)
    }
  }

  const icon = status === 'loading'
    ? <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
    : status === 'done'
    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
    : status === 'error'
    ? <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
    : <Download className="w-3.5 h-3.5" />

  const label = status === 'loading' ? 'Exporting…'
    : status === 'done' ? 'Downloaded!'
    : status === 'error' ? 'Export failed'
    : 'Export'

  return (
    <button
      onClick={handleExport}
      disabled={status === 'loading'}
      className={`flex items-center gap-1.5 border px-3 py-1.5 rounded-lg text-xs transition-all disabled:opacity-50 ${
        status === 'done'
          ? 'border-green-500/40 text-green-400'
          : status === 'error'
          ? 'border-red-500/40 text-red-400'
          : 'border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--foreground)/0.3)]'
      }`}
    >
      {icon}
      {label}
    </button>
  )
}
