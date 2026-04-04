import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/api.js'

export default function ExportButton({ client }) {
  const { getAccessTokenSilently } = useAuth0()
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
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
    } catch (err) {
      console.error('Export error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="text-navy-300 hover:text-white border border-navy-600 hover:border-navy-400 px-3 py-1.5 rounded-lg text-sm transition-colors disabled:opacity-50"
    >
      {loading ? 'Exporting...' : '↓ Export Report'}
    </button>
  )
}
