import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'

import {
  Users, BarChart2, Wallet, LogOut,
  Sun, Moon, Smartphone, ChevronRight, Radio, Home,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { createApiClient } from '../lib/api.js'
import { MOCK_CLIENTS } from '../lib/mockData.js'
import { useTheme } from '../lib/useTheme.js'
import ClientList from '../components/ClientList.jsx'
import ClientDetail from '../components/ClientDetail.jsx'
import Analytics from './Analytics.jsx'
import SmsSim from '../components/SmsSim.jsx'
import FinancialWellness from './FinancialWellness.jsx'
import BroadcastModal from '../components/BroadcastModal.jsx'

const isMock = import.meta.env.VITE_MOCK_MODE === 'true'

const NAV_ITEMS = [
  { id: 'clients',   icon: Users,          label: 'Clients' },
  { id: 'analytics', icon: BarChart2,       label: 'Analytics' },
  { id: 'simulator', icon: Smartphone,      label: 'SMS Simulator' },
  { id: 'wellness',  icon: Wallet,          label: 'Financial Wellness' },
]

export default function Dashboard() {
  const { user, logout, getAccessTokenSilently } = useAuth0()
  const { theme, toggle } = useTheme()
  const [view, setView] = useState('clients')
  const [selectedClient, setSelectedClient] = useState(null)
  const [clients, setClients] = useState(isMock ? MOCK_CLIENTS : [])
  const [showBroadcast, setShowBroadcast] = useState(false)

  // Auto-register caseworker on first login
  useEffect(() => {
    if (isMock) return
    async function autoRegister() {
      try {
        const token = await getAccessTokenSilently()
        const api = createApiClient(token)
        await api.post('/api/caseworker/register', {
          name: user?.name || user?.email || 'Caseworker',
          organization: 'Redreemer'
        })
      } catch {
        // silently ignore — already registered or network error
      }
    }
    if (user) autoRegister()
  }, [user, getAccessTokenSilently])

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
    } catch {
      setSelectedClient(client)
    }
  }

  function handleStepUpdate(newStep) {
    setSelectedClient(prev => prev ? { ...prev, current_step: newStep } : prev)
  }

  function handleLogout() {
    logout({ logoutParams: { returnTo: window.location.origin + '/' } })
  }

  return (
    <div className="flex h-screen bg-[hsl(var(--background))] overflow-hidden">

      {/* ── Sidebar ── */}
      <aside className="w-[240px] bg-[hsl(var(--card)/0.85)] backdrop-blur-xl border-r border-[hsl(var(--border))] flex flex-col shrink-0">
        {/* Amber top bar */}
        <div className="h-[3px] bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--primary))] to-transparent" />

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center font-heading font-bold text-[hsl(var(--primary-foreground))] text-lg">R</div>
          <span className="font-heading font-bold text-[hsl(var(--foreground))] text-base">Redreemer</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                view === item.id
                  ? 'bg-[hsl(var(--primary)/0.12)] text-[hsl(var(--primary))] border-l-[3px] border-[hsl(var(--primary))]'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted)/0.5)] border-l-[3px] border-transparent'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Powered by Gemini */}
        <div className="px-4 py-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] text-[hsl(var(--muted-foreground))] px-2.5 py-1.5 rounded-full border border-[hsl(var(--primary)/0.25)] bg-[hsl(var(--primary)/0.06)]">
            <svg className="w-2.5 h-2.5 text-[hsl(var(--primary))]" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span className="text-[hsl(var(--primary))]">Powered by Gemini</span>
          </span>
        </div>

        {/* User footer */}
        <div className="p-4 border-t border-[hsl(var(--border))]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--primary)/0.2)] flex items-center justify-center text-[hsl(var(--primary))] text-xs font-bold shrink-0">
              {user?.name?.[0] || user?.email?.[0] || 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-[hsl(var(--foreground))] font-medium truncate">{user?.email || 'caseworker'}</div>
              <div className="text-[10px] text-[hsl(var(--muted-foreground))]">Caseworker</div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggle}
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={handleLogout}
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="h-14 border-b border-[hsl(var(--border))] flex items-center justify-between px-6 shrink-0 bg-[hsl(var(--background))]">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="font-heading font-bold text-[hsl(var(--foreground))] text-base truncate">
              {NAV_ITEMS.find(n => n.id === view)?.label || 'Dashboard'}
            </h1>
            <span className="text-[hsl(var(--muted-foreground))] text-xs hidden sm:inline">·</span>
            <Link
              to="/help"
              className="text-xs text-[hsl(var(--primary))] hover:underline hidden sm:inline shrink-0"
            >
              User help view
            </Link>
          </div>
          {view === 'clients' && (
            <div className="flex items-center gap-2">
              {isMock && (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-[10px] font-medium">
                  Demo mode
                </span>
              )}
              {clients.length > 0 && (
                <button
                  onClick={() => setShowBroadcast(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[hsl(var(--muted))] border border-[hsl(var(--border))] text-xs font-medium text-[hsl(var(--foreground)/0.8)] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary)/0.4)] transition-all"
                >
                  <Radio className="w-3.5 h-3.5 text-[hsl(var(--primary))]" />
                  Broadcast
                </button>
              )}
            </div>
          )}
        </header>

        {/* View content */}
        {view === 'clients' && (
          <div className="flex-1 flex overflow-hidden">
            {/* Client list panel */}
            <div className="w-[260px] border-r border-[hsl(var(--border))] flex flex-col shrink-0 overflow-hidden bg-[hsl(var(--background))]">
              <ClientList
                selectedId={selectedClient?.id}
                onSelect={handleSelectClient}
                onClientsLoaded={setClients}
              />
            </div>

            {/* Client detail panel */}
            <div className="flex-1 overflow-y-auto bg-[hsl(var(--background))]">
              {selectedClient ? (
                <ClientDetail client={selectedClient} onStepUpdate={handleStepUpdate} />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center px-8">
                  <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center mb-4">
                    <Users className="w-7 h-7 text-[hsl(var(--primary)/0.5)]" />
                  </div>
                  <h2 className="text-[hsl(var(--foreground))] text-base font-semibold mb-1">Select a client</h2>
                  <p className="text-[hsl(var(--muted-foreground))] text-sm max-w-xs">
                    Search the list on the left, then open notes, reminders, and conversation in the tabs above.
                  </p>
                  <Link
                    to="/"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    <Home className="w-3 h-3" /> Back to site
                  </Link>
                  <div className="mt-6 flex flex-col items-center gap-2">
                    <button
                      onClick={() => setView('simulator')}
                      className="flex items-center gap-2 text-sm text-[hsl(var(--primary))] hover:underline"
                    >
                      <Smartphone className="w-4 h-4" /> Try the SMS Simulator
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'analytics' && (
          <div className="flex-1 overflow-y-auto p-6 bg-[hsl(var(--background))]">
            <div className="max-w-5xl mx-auto">
              <Analytics />
            </div>
          </div>
        )}

        {view === 'simulator' && (
          <div className="flex-1 overflow-y-auto p-6 bg-[hsl(var(--background))]">
            <div className="max-w-6xl mx-auto h-full">
              <SmsSim />
            </div>
          </div>
        )}

        {view === 'wellness' && (
          <div className="flex-1 overflow-y-auto bg-[hsl(var(--background))]">
            <FinancialWellness embedded />
          </div>
        )}
      </div>

      {showBroadcast && (
        <BroadcastModal clients={clients} onClose={() => setShowBroadcast(false)} />
      )}
    </div>
  )
}
