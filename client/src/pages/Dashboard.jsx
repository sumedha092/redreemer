import { useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/api.js'
import { MOCK_CLIENTS } from '../lib/mockData.js'
import Navbar from '../components/Navbar.jsx'
import ClientList from '../components/ClientList.jsx'
import ClientDetail from '../components/ClientDetail.jsx'
import SecurityPanel from '../components/SecurityPanel.jsx'
import Analytics from './Analytics.jsx'

const isMock = import.meta.env.VITE_MOCK_MODE === 'true'

export default function Dashboard() {
  const { getAccessTokenSilently } = useAuth0()
  const [selectedClient, setSelectedClient] = useState(null)
  const [showSecurity, setShowSecurity] = useState(false)
  const [view, setView] = useState('clients') // 'clients' | 'analytics'

  async function handleSelectClient(client) {
    if (isMock) {
      const full = MOCK_CLIENTS.find(c => c.id === client.id) || client
      setSelectedClient(full)
      return
    }
    try {
      const token = await getAccessTokenSilently()
      const api = createApiClient(token)
      const { data } = await api.get(`/api/clients/${client.id}`)
      setSelectedClient(data)
    } catch (err) {
      console.error('Load client detail error:', err)
      setSelectedClient(client)
    }
  }

  function handleStepUpdate(newStep) {
    if (selectedClient) {
      setSelectedClient(prev => ({ ...prev, current_step: newStep }))
    }
  }

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <Navbar activeView={view} onViewChange={setView} />

      {view === 'analytics' ? (
        <div className="max-w-6xl mx-auto w-full px-6 py-8">
          <Analytics />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <ClientList selectedId={selectedClient?.id} onSelect={handleSelectClient} />
          <div className="flex-1 flex flex-col overflow-hidden">
            {selectedClient ? (
              <ClientDetail client={selectedClient} onStepUpdate={handleStepUpdate} />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="text-6xl mb-4 opacity-20">↑</div>
                <h2 className="text-white text-lg font-semibold mb-2">Select a client</h2>
                <p className="text-navy-400 text-sm max-w-xs">
                  Choose a client from the list to view their progress, conversations, and milestones.
                </p>
                <button
                  onClick={() => setShowSecurity(!showSecurity)}
                  className="mt-8 text-amber-500 text-sm hover:text-amber-400 transition-colors"
                >
                  {showSecurity ? 'Hide' : 'View'} Security & Privacy
                </button>
                {showSecurity && (
                  <div className="mt-4 w-full max-w-md">
                    <SecurityPanel />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
