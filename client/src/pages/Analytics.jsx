import { useState, useEffect } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { createApiClient } from '../lib/api.js'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
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
    { step: 7, count: 0 }, { step: 8, count: 0 }
  ],
  activeThisWeek: 2,
  inactiveUsers: 1
}

const PIE_COLORS = ['#f59e0b', '#6366f1', '#8b5cf6', '#94a3b8']

const STEP_LABELS = [
  'Connect', 'Get ID', 'Address', 'Bank', 'Benefits', 'Income', 'Save $200', 'Deposit'
]

function StatCard({ label, value, sub, color = 'text-white' }) {
  return (
    <div className="bg-navy-800 rounded-xl p-5">
      <p className="text-navy-400 text-xs mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-navy-500 text-xs mt-1">{sub}</p>}
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
      if (isMock) {
        setData(MOCK_ANALYTICS)
        setLoading(false)
        return
      }
      try {
        const token = await getAccessTokenSilently()
        const api = createApiClient(token)
        const { data: res } = await api.get('/api/analytics')
        setData(res)
      } catch (err) {
        console.error('Analytics load error:', err)
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
      setDemoResult({ success: true, message: 'Demo user Alex created. Refresh the client list to see them.' })
    } catch (err) {
      setDemoResult({ success: false, message: 'Demo failed: ' + err.message })
    } finally {
      setDemoRunning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-navy-400">Loading analytics...</div>
      </div>
    )
  }

  const pieData = [
    { name: 'Homeless', value: data.typeBreakdown.homeless },
    { name: 'Reentry', value: data.typeBreakdown.reentry },
    { name: 'Both', value: data.typeBreakdown.both },
    { name: 'Unknown', value: data.typeBreakdown.unknown },
  ].filter(d => d.value > 0)

  const funnelData = data.stepsFunnel.map((s, i) => ({
    name: STEP_LABELS[i],
    users: s.count
  }))

  const activityData = [
    { name: 'Active (7d)', value: data.activeThisWeek, color: '#22c55e' },
    { name: 'Inactive', value: data.inactiveUsers, color: '#ef4444' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Analytics</h2>
        <div className="flex items-center gap-3">
          {demoResult && (
            <span className={`text-xs ${demoResult.success ? 'text-green-400' : 'text-red-400'}`}>
              {demoResult.message}
            </span>
          )}
          <button
            onClick={runDemo}
            disabled={demoRunning}
            className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-navy-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {demoRunning ? 'Running...' : '▶ Run Demo'}
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Clients" value={data.totalClients} color="text-amber-400" />
        <StatCard label="SMS Messages" value={data.totalMessages} color="text-blue-400" />
        <StatCard label="Steps Completed" value={data.totalStepsCompleted} color="text-green-400" />
        <StatCard
          label="Avg Health Score"
          value={data.avgHealthScore}
          color={data.avgHealthScore >= 71 ? 'text-green-400' : data.avgHealthScore >= 41 ? 'text-amber-400' : 'text-red-400'}
          sub="out of 100"
        />
      </div>

      {/* Activity */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-navy-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
            <span className="text-green-400 font-bold">{data.activeThisWeek}</span>
          </div>
          <div>
            <p className="text-white font-medium text-sm">Active this week</p>
            <p className="text-navy-400 text-xs">Texted in last 7 days</p>
          </div>
        </div>
        <div className="bg-navy-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <span className="text-red-400 font-bold">{data.inactiveUsers}</span>
          </div>
          <div>
            <p className="text-white font-medium text-sm">Inactive</p>
            <p className="text-navy-400 text-xs">No contact in 7+ days</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User type pie */}
        <div className="bg-navy-800 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">User Types</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e2d6b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-navy-400 text-sm">No data yet</div>
          )}
        </div>

        {/* Steps funnel bar chart */}
        <div className="bg-navy-800 rounded-xl p-5">
          <h3 className="text-white font-semibold text-sm mb-4">Users per Step</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={funnelData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fill: '#818cf8', fontSize: 10 }} />
              <YAxis tick={{ fill: '#818cf8', fontSize: 10 }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#1e2d6b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Bar dataKey="users" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Powered by Gemini note */}
      <div className="bg-navy-800 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3">
        <span className="text-amber-500 text-lg">✦</span>
        <div>
          <p className="text-white text-sm font-medium">Powered by Gemini</p>
          <p className="text-navy-400 text-xs">Every SMS response, routing decision, resource match, and proactive message runs through Gemini's agentic workflow — reading context, reasoning about each user's situation, and deciding when to reach out.</p>
        </div>
      </div>
    </div>
  )
}
