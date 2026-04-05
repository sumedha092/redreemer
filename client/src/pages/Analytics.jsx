import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/api.js'
import { Users, MessageSquare, TrendingUp, Heart, Activity, AlertTriangle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

const isMock = import.meta.env.VITE_MOCK_MODE === 'true'

const MOCK_ANALYTICS = {
  totalClients: 3,
  totalMessages: 24,
  totalStepsCompleted: 7,
  avgHealthScore: 52,
  typeBreakdown: { homeless: 1, reentry: 1, both: 1, unknown: 0 },
  stepsFunnel: [
    { step: 1, count: 0 }, { step: 2, count: 0 }, { step: 3, count: 1 },
    { step: 4, count: 1 }, { step: 5, count: 0 }, { step: 6, count: 0 },
    { step: 7, count: 0 }, { step: 8, count: 0 },
  ],
  activeThisWeek: 2,
  inactiveUsers: 1,
}

const PIE_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', '#8b5cf6', '#94a3b8']
const STEP_LABELS = ['Connect', 'Get ID', 'Address', 'Bank', 'Benefits', 'Income', 'Save $200', 'Deposit']

function StatCard({ label, value, sub, icon: Icon, accent = 'text-[hsl(var(--primary))]' }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-[hsl(var(--muted-foreground))]">{label}</p>
        {Icon && <Icon className={`w-4 h-4 ${accent} opacity-70`} />}
      </div>
      <p className={`text-3xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="text-[hsl(var(--muted-foreground))] text-xs mt-1">{sub}</p>}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass rounded-lg px-3 py-2 text-xs border border-[hsl(var(--border))]">
      <p className="font-medium text-[hsl(var(--foreground))]">{label}</p>
      <p className="text-[hsl(var(--primary))]">{payload[0].value} users</p>
    </div>
  )
}

export default function Analytics() {
  const { getAccessTokenSilently } = useAuth0()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [demoRunning, setDemoRunning] = useState(false)
  const [demoResult, setDemoResult] = useState(null)

  useEffect(() => {
    async function load() {
      if (isMock) { setData(MOCK_ANALYTICS); setLoading(false); return }
      try {
        const token = await getAccessTokenSilently()
        const api = createApiClient(token)
        const { data: res } = await api.get('/api/analytics')
        setData(res)
      } catch {
        setData(MOCK_ANALYTICS)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function runDemo() {
    setDemoRunning(true)
    setDemoResult(null)
    try {
      const token = await getAccessTokenSilently()
      const api = createApiClient(token)
      await api.post('/api/demo/run')
      setDemoResult({ success: true, message: 'Demo user Alex created. Refresh the client list.' })
    } catch (err) {
      setDemoResult({ success: false, message: 'Demo failed: ' + err.message })
    } finally {
      setDemoRunning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent animate-spin" />
      </div>
    )
  }

  const pieData = [
    { name: 'Homeless', value: data.typeBreakdown.homeless },
    { name: 'Reentry',  value: data.typeBreakdown.reentry },
    { name: 'Both',     value: data.typeBreakdown.both },
    { name: 'Unknown',  value: data.typeBreakdown.unknown },
  ].filter(d => d.value > 0)

  const funnelData = data.stepsFunnel.map((s, i) => ({ name: STEP_LABELS[i], users: s.count }))

  const scoreColor = data.avgHealthScore >= 71
    ? 'text-green-400' : data.avgHealthScore >= 41
    ? 'text-[hsl(var(--primary))]' : 'text-red-400'

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-[hsl(var(--foreground))]">Analytics</h2>
        <div className="flex items-center gap-3">
          {demoResult && (
            <span className={`text-xs ${demoResult.success ? 'text-green-400' : 'text-red-400'}`}>
              {demoResult.message}
            </span>
          )}
          {!isMock && (
            <button
              onClick={runDemo}
              disabled={demoRunning}
              className="bg-[hsl(var(--primary))] hover:glow-amber disabled:opacity-50 text-[hsl(var(--primary-foreground))] font-semibold px-4 py-2 rounded-lg text-sm transition-all"
            >
              {demoRunning ? 'Running…' : '▶ Run Demo'}
            </button>
          )}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Clients" value={data.totalClients} icon={Users} accent="text-[hsl(var(--primary))]" />
        <StatCard label="SMS Messages" value={data.totalMessages} icon={MessageSquare} accent="text-[hsl(var(--secondary))]" />
        <StatCard label="Steps Completed" value={data.totalStepsCompleted} icon={TrendingUp} accent="text-green-400" />
        <StatCard label="Avg Health Score" value={data.avgHealthScore} sub="out of 100" icon={Heart} accent={scoreColor} />
      </div>

      {/* Activity cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 bg-green-500/15 border border-green-500/30 rounded-xl flex items-center justify-center shrink-0">
            <Activity className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400">{data.activeThisWeek}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Active this week</p>
          </div>
        </div>
        <div className="glass-card rounded-xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 bg-red-500/15 border border-red-500/30 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400">{data.inactiveUsers}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Inactive 7+ days</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pie */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-4">Client Types</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={72} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                >
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  return (
                    <div className="glass rounded-lg px-3 py-2 text-xs border border-[hsl(var(--border))]">
                      <p className="font-medium text-[hsl(var(--foreground))]">{payload[0].name}</p>
                      <p className="text-[hsl(var(--primary))]">{payload[0].value} clients</p>
                    </div>
                  )
                }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-[hsl(var(--muted-foreground))] text-sm">No data yet</div>
          )}
        </div>

        {/* Bar chart */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[hsl(var(--foreground))] mb-4">Users per Step</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={funnelData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }} />
              <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gemini badge */}
      <div className="glass-card border border-[hsl(var(--primary)/0.2)] rounded-xl p-4 flex items-start gap-3">
        <span className="text-[hsl(var(--primary))] text-lg mt-0.5">✦</span>
        <div>
          <p className="text-sm font-semibold text-[hsl(var(--foreground))]">Powered by Gemini</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))] mt-1 leading-relaxed">
            Every SMS response, routing decision, resource match, and proactive message runs through Gemini's agentic workflow —
            reading context, reasoning about each user's situation, and deciding when to reach out.
          </p>
        </div>
      </div>
    </div>
  )
}
