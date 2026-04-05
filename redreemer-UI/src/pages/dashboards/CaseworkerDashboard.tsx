import { useState, useMemo } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { useAuth0 } from '@auth0/auth0-react';
import { api } from '@/lib/api';
import { useToast } from '@/components/Toast';
import {
  Home, Users, BarChart2, MessageSquare, Settings, User,
  AlertTriangle, TrendingUp, Clock, UserPlus,
  Send, ChevronRight, Search, Sparkles,
  Shield, Activity, X,
  ArrowUp, ArrowDown, Minus, Bell
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const NAV = [
  { id: 'home',      icon: Home,          label: 'Overview' },
  { id: 'clients',   icon: Users,         label: 'Clients' },
  { id: 'analytics', icon: BarChart2,     label: 'Analytics' },
  { id: 'messages',  icon: MessageSquare, label: 'Messages' },
  { id: 'profile',   icon: User,          label: 'Profile' },
  { id: 'settings',  icon: Settings,      label: 'Settings' },
];

interface Client {
  id: string; name: string; step: number; score: number;
  status: 'active' | 'at-risk' | 'inactive';
  type: 'homeless' | 'reentry' | 'both';
  lastActive: string; phone: string; city: string;
  conversations: { role: string; content: string; time: string }[];
  notes: string;
}

const INITIAL_CLIENTS: Client[] = [
  { id: '1', name: 'Marcus T.', step: 4, score: 52, status: 'active',  type: 'homeless', lastActive: '2h ago',  phone: '+15550000001', city: 'Phoenix, AZ', conversations: [
    { role: 'user', content: 'I got my ID today', time: '2h ago' },
    { role: 'assistant', content: "That's huge! Your ID unlocks everything. You're on Step 4 now.", time: '2h ago' },
  ], notes: '' },
  { id: '2', name: 'James R.',  step: 3, score: 38, status: 'active',  type: 'reentry',  lastActive: '1d ago',  phone: '+15550000002', city: 'Phoenix, AZ', conversations: [
    { role: 'user', content: 'just got out yesterday', time: '7d ago' },
    { role: 'assistant', content: 'Welcome. The first 90 days are critical. Do you have your parole check-in address?', time: '7d ago' },
  ], notes: '' },
  { id: '3', name: 'Darnell W.',step: 2, score: 21, status: 'at-risk', type: 'both',     lastActive: '6d ago',  phone: '+15550000003', city: 'Phoenix, AZ', conversations: [], notes: '' },
  { id: '4', name: 'Alex M.',   step: 3, score: 45, status: 'active',  type: 'both',     lastActive: '2d ago',  phone: '+15550000099', city: 'Phoenix, AZ', conversations: [], notes: '' },
];

const TYPE_COLORS: Record<string, string> = {
  homeless: 'bg-emerald-100 text-emerald-700',
  reentry: 'bg-amber-100 text-amber-700',
  both: 'bg-purple-100 text-purple-700',
};

const STEP_LABELS = [
  'Connect', 'Get ID', 'Shelter Address', 'Bank Account',
  'Benefits', 'Income', 'Save $200', 'Save $500'
];

function ScoreRing({ score, size = 48 }: { score: number; size?: number }) {
  const r = size / 2 - 4;
  const circ = 2 * Math.PI * r;
  const color = score >= 70 ? '#16a34a' : score >= 40 ? '#d97706' : '#ef4444';
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth="4" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={circ} strokeDashoffset={circ - (score / 100) * circ}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono font-bold text-xs text-gray-900">{score}</span>
      </div>
    </div>
  );
}

/** Compute engagement risk score (0-10) for a client card. */
function computeClientRisk(client: Client): { score: number; color: string; reason: string } {
  let score = 0;
  const lastActiveStr = client.lastActive;
  // Parse relative time strings like "2h ago", "6d ago", "1d ago"
  const daysMatch = lastActiveStr.match(/(\d+)d ago/);
  const hoursMatch = lastActiveStr.match(/(\d+)h ago/);
  const daysSilent = daysMatch ? parseInt(daysMatch[1]) : hoursMatch ? 0 : 30;

  if (daysSilent >= 7) score += 3;
  if (daysSilent >= 14) score += 2;
  if (daysSilent <= 0) score -= 1;
  if (client.step <= 2) score += 2;
  if (client.status === 'at-risk') score += 2;
  if (client.score < 30) score += 1;

  score = Math.max(0, Math.min(10, score));
  const color = score <= 3 ? 'bg-green-400' : score <= 6 ? 'bg-amber-400' : 'bg-red-500';
  const reason = score <= 3 ? 'Engaged' : score <= 6 ? `${daysSilent}d silent` : `High risk — ${daysSilent}d silent`;
  return { score, color, reason };
}

/** Get silent badge label for a client. */
function getSilentBadge(lastActive: string): { label: string; color: string } | null {
  const daysMatch = lastActive.match(/(\d+)d ago/);
  if (!daysMatch) return null;
  const days = parseInt(daysMatch[1]);
  if (days >= 21) return { label: 'Lost contact', color: 'bg-red-500 text-white' };
  if (days >= 14) return { label: 'At risk — 14d', color: 'bg-red-100 text-red-700' };
  if (days >= 7) return { label: 'Silent 7+ days', color: 'bg-amber-100 text-amber-700' };
  return null;
}

export default function CaseworkerDashboard() {
  const [tab, setTab] = useState('home');
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', type: 'homeless', city: '' });
  const [aiSummary, setAiSummary] = useState<Record<string, string>>({});
  const [loadingAI, setLoadingAI] = useState<Record<string, boolean>>({});
  const [analyticsAI, setAnalyticsAI] = useState<Record<string, string> | null>(null);
  const [loadingAnalyticsAI, setLoadingAnalyticsAI] = useState(false);
  const [broadcastSending, setBroadcastSending] = useState(false);
  const [showSilentOnly, setShowSilentOnly] = useState(false);
  const [reachOutClient, setReachOutClient] = useState<Client | null>(null);
  const [reachOutMsg, setReachOutMsg] = useState('');
  const { user } = useAuth0();
  const { toast } = useToast();
  const firstName = user?.given_name || user?.name?.split(' ')[0] || 'Caseworker';

  const filtered = useMemo(() =>
    clients.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.type.includes(search.toLowerCase());
      if (showSilentOnly) {
        const badge = getSilentBadge(c.lastActive);
        return matchesSearch && badge !== null;
      }
      return matchesSearch;
    }),
    [clients, search, showSilentOnly]
  );

  const silentClients = useMemo(() => clients.filter(c => getSilentBadge(c.lastActive) !== null), [clients]);
  const atRisk = clients.filter(c => c.status === 'at-risk');
  const avgScore = Math.round(clients.reduce((s, c) => s + c.score, 0) / clients.length);

  async function sendMessage(clientId: string) {
    if (!message.trim()) return;
    setSending(true);
    try {
      await api.post('/api/sms/simulate', { phone: clients.find(c => c.id === clientId)?.phone, message });
      setClients(prev => prev.map(c => c.id === clientId
        ? { ...c, conversations: [...c.conversations, { role: 'caseworker', content: message, time: 'Just now' }] }
        : c
      ));
      setMessage('');
      toast('Message sent', 'success');
    } catch { toast('Failed to send', 'error'); }
    setSending(false);
  }

  async function getAISummary(client: Client) {
    setLoadingAI(p => ({ ...p, [client.id]: true }));
    try {
      const { data } = await api.post('/api/ai/insights', {
        tool: 'risk',
        data: { score: client.score, answers: { housing: client.status === 'at-risk' ? 'Shelter or transitional housing' : 'Stable housing', income: client.step >= 5 ? 'Steady job' : 'No income currently', savings: client.score >= 50 ? '$200+' : 'Nothing saved' } }
      });
      setAiSummary(p => ({ ...p, [client.id]: data.insights?.summary || data.insights?.nextStep || 'Analysis complete.' }));
    } catch { setAiSummary(p => ({ ...p, [client.id]: 'AI analysis unavailable.' })); }
    setLoadingAI(p => ({ ...p, [client.id]: false }));
  }

  async function sendDailyTip() {
    setBroadcastSending(true);
    try {
      const tips = [
        "Tip: Even $5/week saved adds up to $260/year. Start your emergency fund today — text BANK to find a free account.",
        "Tip: Text BENEFITS to learn what you qualify for. SNAP, Medicaid, and housing assistance are free and you may already be eligible.",
        "Tip: Text FOOD if you need food today. Text SHELTER if you need a place to sleep. We're here 24/7.",
        "Tip: A free state ID unlocks banking, housing, and jobs. Text ID to learn how to get one for free.",
        "Tip: Payday loans charge 300-400% interest. Text DEBT for free alternatives that won't trap you.",
      ];
      const tip = tips[Math.floor(Math.random() * tips.length)];
      const phones = clients.filter(c => c.status === 'active').map(c => c.phone);
      await api.post('/api/sms/broadcast', { message: tip, phones });
      toast(`Daily tip sent to ${phones.length} active clients`, 'success');
    } catch { toast('Failed to send broadcast', 'error'); }
    setBroadcastSending(false);
  }

  async function getAnalyticsAI() {
    setLoadingAnalyticsAI(true);
    try {
      const { data } = await api.post('/api/ai/insights', {
        tool: 'analytics',
        data: {
          totalClients: clients.length,
          atRiskCount: clients.filter(c => c.status === 'at-risk').length,
          activeCount: clients.filter(c => c.status === 'active').length,
          avgScore,
          avgStep: Math.round(clients.reduce((s, c) => s + c.step, 0) / clients.length),
          clients: clients.map(c => ({ name: c.name, step: c.step, score: c.score, status: c.status, type: c.type, lastActive: c.lastActive }))
        }
      });
      setAnalyticsAI(data.insights);
    } catch { setAnalyticsAI({ headline: 'AI analysis unavailable.', topPriority: '', atRiskInsight: '', progressHighlight: '', recommendation: '' }); }
    setLoadingAnalyticsAI(false);
  }

  function advanceStep(clientId: string) {
    setClients(prev => prev.map(c => c.id === clientId && c.step < 8
      ? { ...c, step: c.step + 1, score: Math.min(c.score + 8, 100) }
      : c
    ));
    toast('Step advanced', 'success');
  }

  async function sendReachOut() {
    if (!reachOutClient || !reachOutMsg.trim()) return;
    try {
      await api.post('/api/sms/simulate', { phone: reachOutClient.phone, message: reachOutMsg });
      toast(`Message sent to ${reachOutClient.name}`, 'success');
      setReachOutClient(null);
      setReachOutMsg('');
    } catch { toast('Failed to send', 'error'); }
  }

  function addClient() {
    if (!newClient.name || !newClient.phone) return;
    const c: Client = { id: Date.now().toString(), name: newClient.name, step: 1, score: 0, status: 'active', type: newClient.type as any, lastActive: 'Just now', phone: newClient.phone, city: newClient.city || 'Unknown', conversations: [], notes: '' };
    setClients(p => [c, ...p]);
    setShowAddModal(false);
    setNewClient({ name: '', phone: '', type: 'homeless', city: '' });
    toast('Client added', 'success');
  }

  const stepFunnel = STEP_LABELS.map((label, i) => ({ step: `S${i+1}`, label, count: clients.filter(c => c.step === i + 1).length }));
  const typePie = [
    { name: 'Homeless', value: clients.filter(c => c.type === 'homeless').length, color: '#10b981' },
    { name: 'Reentry', value: clients.filter(c => c.type === 'reentry').length, color: '#f59e0b' },
    { name: 'Both', value: clients.filter(c => c.type === 'both').length, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  return (
    <DashboardShell activeTab={tab} onTabChange={setTab} navItems={NAV} userName={user?.name} userEmail={user?.email}>

      {/* ── Reach Out Modal ── */}
      {reachOutClient && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4" onClick={() => setReachOutClient(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-heading font-bold text-lg text-gray-900">Reach Out to {reachOutClient.name}</h2>
              <button onClick={() => setReachOutClient(null)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="p-6 space-y-3">
              <textarea value={reachOutMsg} onChange={e => setReachOutMsg(e.target.value)} rows={4}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300 resize-none"
                placeholder="Type your message..." />
              <button onClick={() => setReachOutMsg(`Hey ${reachOutClient.name}, just checking in — we haven't heard from you in a bit. No pressure, just wanted you to know we're still here. Text back anytime.`)}
                className="text-xs text-yellow-700 hover:underline">Use suggested message</button>
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <button onClick={() => setReachOutClient(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={sendReachOut} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-900 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>
                <Send size={14} className="inline mr-1.5" />Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Overview ── */}
      {tab === 'home' && (
        <div className="space-y-5">
          <div>
            <h1 className="font-heading font-bold text-2xl text-gray-900">Good morning, {firstName}</h1>
            <p className="text-gray-500 text-sm mt-1">Here's what's happening with your clients today.</p>
          </div>

          {/* Silent clients attention banner */}
          {silentClients.length > 0 && (
            <button onClick={() => { setTab('clients'); setShowSilentOnly(true); }}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 hover:border-amber-300 transition-colors text-left">
              <Bell size={16} className="text-amber-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">
                  {silentClients.length} client{silentClients.length > 1 ? 's' : ''} need{silentClients.length === 1 ? 's' : ''} attention
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  {silentClients.map(c => c.name).join(', ')} — haven't texted in 7+ days
                </p>
              </div>
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">View all</span>
            </button>
          )}

          <button onClick={sendDailyTip} disabled={broadcastSending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-900 disabled:opacity-60 hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>
            <MessageSquare size={14} />
            {broadcastSending ? 'Sending...' : 'Send Daily Tip'}
          </button>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Clients', value: String(clients.length), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Active This Week', value: String(clients.filter(c => c.status === 'active').length), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
              { label: 'Avg Health Score', value: String(avgScore), icon: Activity, color: 'text-yellow-600', bg: 'bg-yellow-50' },
              { label: 'Needs Attention', value: String(atRisk.length), icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
            ].map(s => (
              <div key={s.label} className="glass-card !p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-500 font-medium">{s.label}</span>
                  <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                    <s.icon size={14} className={s.color} />
                  </div>
                </div>
                <p className={`font-mono font-bold text-2xl ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* SMS Commands reference */}
          <div className="glass-card !p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare size={14} className="text-yellow-600" />
              <h3 className="font-heading font-semibold text-gray-900 text-sm">SMS Keyword Commands</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 font-medium ml-1">Multilingual</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">Clients can text any of these keywords in any language for instant help:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { cmd: 'FOOD', desc: 'Nearest food bank' },
                { cmd: 'SHELTER', desc: 'Open shelters tonight' },
                { cmd: 'BANK', desc: 'Free Bank On account' },
                { cmd: 'ID', desc: 'Free state ID guide' },
                { cmd: 'BENEFITS', desc: 'SNAP, Medicaid, SSI' },
                { cmd: 'JOB', desc: 'Ban the Box employers' },
                { cmd: 'DEBT', desc: 'Free debt help' },
                { cmd: 'HELP', desc: 'All commands' },
              ].map(k => (
                <div key={k.cmd} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="font-mono text-xs font-bold text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded">{k.cmd}</span>
                  <span className="text-[10px] text-gray-500">{k.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {atRisk.map(c => (
            <div key={c.id} className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
              <AlertTriangle size={16} className="text-red-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{c.name} hasn't responded recently</p>
                <p className="text-xs text-gray-500">Last active: {c.lastActive} — may need immediate outreach</p>
              </div>
              <button onClick={() => { setSelectedClient(c); setTab('clients'); }}
                className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors">
                View Client
              </button>
            </div>
          ))}

          {/* Client list with silent filter toggle */}
          <div className="glass-card !p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-heading font-semibold text-gray-900">Your Clients</h3>
              <div className="flex items-center gap-2">
                {silentClients.length > 0 && (
                  <button onClick={() => { setTab('clients'); setShowSilentOnly(true); }}
                    className="text-xs text-amber-700 bg-amber-100 px-2 py-1 rounded-full font-medium hover:bg-amber-200 transition-colors">
                    {silentClients.length} need attention
                  </button>
                )}
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-1.5 text-xs text-yellow-600 hover:underline font-medium">
                  <UserPlus size={13} /> Add client
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {clients.map(c => {
                const risk = computeClientRisk(c);
                const silentBadge = getSilentBadge(c.lastActive);
                return (
                  <button key={c.id} onClick={() => { setSelectedClient(c); setTab('clients'); }}
                    className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-sm font-bold shrink-0">
                      {c.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                        {silentBadge && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${silentBadge.color}`}>
                            {silentBadge.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Step {c.step}/8 · {c.city}</p>
                    </div>
                    {/* Risk dot with tooltip */}
                    <div className="relative group">
                      <div className={`w-2.5 h-2.5 rounded-full ${risk.color}`} />
                      <div className="absolute right-0 bottom-5 w-36 bg-gray-900 text-white text-[10px] rounded-lg px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                        {risk.reason}
                      </div>
                    </div>
                    <ScoreRing score={c.score} size={40} />
                    <div className="w-20 hidden md:block">
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-yellow-400 transition-all" style={{ width: `${(c.step/8)*100}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1"><Clock size={9} /> {c.lastActive}</p>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Clients ── */}
      {tab === 'clients' && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <h1 className="font-heading font-bold text-2xl text-gray-900 flex-1">Clients</h1>
            {silentClients.length > 0 && (
              <button onClick={() => setShowSilentOnly(v => !v)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${showSilentOnly ? 'bg-amber-400 text-gray-900' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'}`}>
                <Bell size={12} />
                {showSilentOnly ? 'Show all' : `${silentClients.length} need attention`}
              </button>
            )}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..."
                className="pl-8 pr-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-300 w-48" />
            </div>
            <button onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-900 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>
              <UserPlus size={14} /> Add
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Client list */}
            <div className="glass-card !p-0 overflow-hidden lg:col-span-1">
              <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto">
                {filtered.map(c => {
                  const risk = computeClientRisk(c);
                  const silentBadge = getSilentBadge(c.lastActive);
                  return (
                    <div key={c.id} className={`flex items-center gap-2 px-3 py-2.5 border-l-2 transition-colors ${selectedClient?.id === c.id ? 'bg-yellow-50 border-yellow-400' : 'hover:bg-gray-50 border-transparent'}`}>
                      <button onClick={() => setSelectedClient(c)} className="flex items-center gap-2 flex-1 text-left min-w-0">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xs font-bold shrink-0">{c.name[0]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                            <div className={`w-2 h-2 rounded-full shrink-0 ${risk.color}`} title={risk.reason} />
                          </div>
                          <p className="text-xs text-gray-500">Step {c.step}/8</p>
                          {silentBadge && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${silentBadge.color}`}>{silentBadge.label}</span>
                          )}
                        </div>
                      </button>
                      {silentBadge && (
                        <button onClick={() => {
                          setReachOutClient(c);
                          setReachOutMsg(`Hey ${c.name}, just checking in — we haven't heard from you in a bit. No pressure, just wanted you to know we're still here. Text back anytime.`);
                        }}
                          className="shrink-0 px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-[10px] font-semibold hover:bg-amber-200 transition-colors">
                          Reach Out
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Client detail */}
            {selectedClient ? (
              <div className="lg:col-span-2 space-y-4">
                {/* Header */}
                <div className="glass-card !p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 text-xl font-bold shrink-0">
                      {selectedClient.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-heading font-bold text-xl text-gray-900">{selectedClient.name}</h2>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[selectedClient.type]}`}>{selectedClient.type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedClient.status === 'at-risk' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>{selectedClient.status}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{selectedClient.phone} · {selectedClient.city}</p>
                    </div>
                    <ScoreRing score={selectedClient.score} size={56} />
                  </div>

                  {/* Step progress */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">Journey Progress</span>
                      <span className="font-mono text-xs font-bold text-gray-700">{selectedClient.step}/8</span>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {STEP_LABELS.map((label, i) => (
                        <div key={i} className="flex-1 group relative">
                          <div className={`h-2 rounded-sm transition-colors ${i < selectedClient.step ? 'bg-yellow-400' : 'bg-gray-100'}`} />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
                            {label}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Current: {STEP_LABELS[selectedClient.step - 1]}</p>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button onClick={() => advanceStep(selectedClient.id)}
                      disabled={selectedClient.step >= 8}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-gray-900 disabled:opacity-40 hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>
                      <ArrowUp size={12} /> Advance Step
                    </button>
                    <button onClick={() => getAISummary(selectedClient)}
                      disabled={loadingAI[selectedClient.id]}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                      <Sparkles size={12} className="text-yellow-600" />
                      {loadingAI[selectedClient.id] ? 'Analyzing...' : 'AI Summary'}
                    </button>
                  </div>

                  {aiSummary[selectedClient.id] && (
                    <div className="mt-3 p-3 rounded-xl bg-yellow-50 border border-yellow-200 flex items-start gap-2">
                      <Sparkles size={13} className="text-yellow-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-700 leading-relaxed">{aiSummary[selectedClient.id]}</p>
                    </div>
                  )}
                </div>

                {/* Conversation */}
                <div className="glass-card !p-0 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                    <MessageSquare size={14} className="text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">Conversation</span>
                  </div>
                  <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
                    {selectedClient.conversations.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-4">No messages yet</p>
                    ) : selectedClient.conversations.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs ${
                          m.role === 'user'
                            ? 'bg-gray-100 text-gray-800'
                            : m.role === 'caseworker'
                            ? 'bg-yellow-100 text-gray-900'
                            : 'bg-gray-900 text-white'
                        }`}>
                          {m.role === 'caseworker' && <p className="text-[10px] font-semibold text-yellow-700 mb-0.5">You</p>}
                          {m.role === 'assistant' && <p className="text-[10px] font-semibold text-gray-400 mb-0.5">Redreemer AI</p>}
                          {m.content}
                          <p className="text-[9px] opacity-50 mt-0.5">{m.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pb-4 flex gap-2">
                    <input value={message} onChange={e => setMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMessage(selectedClient.id)}
                      placeholder="Send a message via SMS..."
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300" />
                    <button onClick={() => sendMessage(selectedClient.id)} disabled={sending || !message.trim()}
                      className="px-3 py-2 rounded-lg bg-gray-900 text-white text-sm disabled:opacity-40 hover:bg-gray-800 transition-colors">
                      <Send size={14} />
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div className="glass-card !p-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Caseworker Notes</p>
                  <textarea value={selectedClient.notes}
                    onChange={e => setClients(p => p.map(c => c.id === selectedClient.id ? { ...c, notes: e.target.value } : c))}
                    placeholder="Add private notes about this client..."
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-300" />
                </div>
              </div>
            ) : (
              <div className="lg:col-span-2 flex items-center justify-center h-64 text-gray-400">
                <div className="text-center">
                  <Users size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Select a client to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Analytics ── */}
      {tab === 'analytics' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="font-heading font-bold text-2xl text-gray-900">Analytics</h1>
            <button onClick={getAnalyticsAI} disabled={loadingAnalyticsAI}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-900 disabled:opacity-60 hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>
              <Sparkles size={14} />
              {loadingAnalyticsAI ? 'Analyzing...' : 'AI Caseload Analysis'}
            </button>
          </div>

          {/* AI Analytics Panel */}
          {(analyticsAI || loadingAnalyticsAI) && (
            <div className="rounded-2xl border border-yellow-200 bg-yellow-50 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-yellow-200" style={{ background: 'linear-gradient(135deg, #fefce8, #fff9e6)' }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>
                  <Sparkles size={12} className="text-gray-900" />
                </div>
                <span className="font-heading font-bold text-sm text-gray-900">AI Caseload Intelligence</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-200 text-yellow-800 font-semibold ml-1">Gemini</span>
              </div>
              {loadingAnalyticsAI ? (
                <div className="flex items-center gap-3 px-5 py-4">
                  {[0,1,2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
                  <span className="text-sm text-gray-500">Analyzing your caseload...</span>
                </div>
              ) : analyticsAI && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-yellow-200">
                  {[
                    { key: 'headline', label: 'Summary', icon: BarChart2, color: 'text-indigo-600' },
                    { key: 'topPriority', label: 'Top Priority Today', icon: AlertTriangle, color: 'text-red-500' },
                    { key: 'atRiskInsight', label: 'At-Risk Insight', icon: Shield, color: 'text-orange-500' },
                    { key: 'progressHighlight', label: 'Progress Highlight', icon: TrendingUp, color: 'text-green-600' },
                    { key: 'recommendation', label: 'Strategic Recommendation', icon: Sparkles, color: 'text-purple-600' },
                  ].filter(f => analyticsAI[f.key]).map(f => (
                    <div key={f.key} className="px-5 py-4">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <f.icon size={12} className={f.color} />
                        <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">{f.label}</span>
                      </div>
                      <p className="text-sm text-gray-800 leading-relaxed">{analyticsAI[f.key]}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Step funnel */}
            <div className="glass-card">
              <h3 className="font-heading font-semibold text-gray-900 mb-4 text-sm">Client Journey Funnel</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stepFunnel} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="step" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} allowDecimals={false} />
                  <Tooltip formatter={(v) => [v, 'Clients']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#f5e000" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Type breakdown */}
            <div className="glass-card">
              <h3 className="font-heading font-semibold text-gray-900 mb-4 text-sm">Client Types</h3>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie data={typePie} cx={65} cy={65} innerRadius={40} outerRadius={60} dataKey="value">
                      {typePie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {typePie.map(t => (
                    <div key={t.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                      <span className="text-sm text-gray-700">{t.name}</span>
                      <span className="font-mono font-bold text-sm text-gray-900 ml-auto">{t.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Health scores */}
            <div className="glass-card md:col-span-2">
              <h3 className="font-heading font-semibold text-gray-900 mb-4 text-sm">Client Health Scores</h3>
              <div className="space-y-3">
                {clients.sort((a,b) => b.score - a.score).map(c => (
                  <div key={c.id} className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 w-24 truncate">{c.name}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${c.score}%`, backgroundColor: c.score >= 70 ? '#16a34a' : c.score >= 40 ? '#f5e000' : '#ef4444' }} />
                    </div>
                    <span className="font-mono text-sm font-bold text-gray-900 w-8 text-right">{c.score}</span>
                    {c.score >= 70 ? <ArrowUp size={12} className="text-green-500" /> : c.score >= 40 ? <Minus size={12} className="text-yellow-500" /> : <ArrowDown size={12} className="text-red-500" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Messages ── */}
      {tab === 'messages' && (
        <div className="space-y-5">
          <h1 className="font-heading font-bold text-2xl text-gray-900">Messages</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="glass-card !p-0 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">Clients</p>
              </div>
              <div className="divide-y divide-gray-50">
                {clients.map(c => (
                  <button key={c.id} onClick={() => setSelectedClient(c)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${selectedClient?.id === c.id ? 'bg-yellow-50' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">{c.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-400 truncate">{c.conversations[c.conversations.length-1]?.content || 'No messages'}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="lg:col-span-2">
              {selectedClient ? (
                <div className="glass-card !p-0 overflow-hidden h-full flex flex-col">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-700">{selectedClient.name[0]}</div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{selectedClient.name}</p>
                      <p className="text-xs text-gray-400">{selectedClient.phone}</p>
                    </div>
                  </div>
                  <div className="flex-1 p-4 space-y-2 overflow-y-auto min-h-[300px]">
                    {selectedClient.conversations.map((m, i) => (
                      <div key={i} className={`flex ${m.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[75%] px-3 py-2 rounded-xl text-xs ${
                          m.role === 'user'
                            ? 'bg-gray-100 text-gray-800'
                            : m.role === 'caseworker'
                            ? 'bg-yellow-100 text-gray-900'
                            : 'bg-gray-900 text-white'
                        }`}>
                          {m.role === 'caseworker' && <p className="text-[10px] font-semibold text-yellow-700 mb-0.5">You</p>}
                          {m.role === 'assistant' && <p className="text-[10px] font-semibold text-gray-400 mb-0.5">Redreemer AI</p>}
                          {m.content}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 pb-4 flex gap-2 border-t border-gray-100 pt-3">
                    <input value={message} onChange={e => setMessage(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMessage(selectedClient.id)}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300" />
                    <button onClick={() => sendMessage(selectedClient.id)} disabled={sending || !message.trim()}
                      className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm disabled:opacity-40 flex items-center gap-1.5">
                      <Send size={13} /> Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 text-gray-400">
                  <p className="text-sm">Select a client to message</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Profile ── */}
      {tab === 'profile' && (
        <div className="space-y-5">
          <h1 className="font-heading font-bold text-2xl text-gray-900">Profile</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Identity card */}
            <div className="glass-card space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-2xl font-bold shrink-0">
                  {user?.name?.[0] || 'C'}
                </div>
                <div>
                  <p className="font-heading font-bold text-xl text-gray-900">{user?.name || 'Caseworker'}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 mt-1.5 inline-block font-medium">Caseworker</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                {[{ label: 'Clients', value: String(clients.length) }, { label: 'Active', value: String(clients.filter(c=>c.status==='active').length) }, { label: 'Avg Score', value: String(avgScore) }].map(s => (
                  <div key={s.label} className="text-center p-4 bg-gray-50 rounded-xl">
                    <p className="font-mono font-bold text-2xl text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit info */}
            <div className="glass-card space-y-4">
              <h3 className="font-semibold text-gray-900">Account Information</h3>
              {[{ label: 'Display Name', value: user?.name || '' }, { label: 'Email Address', value: user?.email || '' }, { label: 'Organization', value: 'Redreemer' }].map(f => (
                <div key={f.label}>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">{f.label}</label>
                  <input defaultValue={f.value} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300" />
                </div>
              ))}
              <button className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-900 hover:opacity-90" style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings ── */}
      {tab === 'settings' && (
        <div className="space-y-5">
          <h1 className="font-heading font-bold text-2xl text-gray-900">Settings</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="glass-card space-y-4">
              <h3 className="font-semibold text-gray-900">Account</h3>
              {[{ label: 'Display Name', value: user?.name || '' }, { label: 'Email', value: user?.email || '' }].map(f => (
                <div key={f.label}>
                  <label className="text-xs font-medium text-gray-600 mb-1.5 block">{f.label}</label>
                  <input defaultValue={f.value} className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300" />
                </div>
              ))}
              <button className="px-5 py-2.5 rounded-lg text-sm font-semibold text-gray-900 hover:opacity-90" style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>Save Changes</button>
            </div>
            <div className="glass-card space-y-4">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {['Email notifications', 'Client activity alerts', 'At-risk client warnings', 'Weekly summary report'].map(n => (
                <div key={n} className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-700">{n}</span>
                  <div className="w-11 h-6 rounded-full bg-yellow-300 relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Add Client Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading font-bold text-lg text-gray-900">Add New Client</h2>
              <button onClick={() => setShowAddModal(false)}><X size={18} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              {[{ label: 'Full Name', key: 'name', placeholder: 'Client name' }, { label: 'Phone Number', key: 'phone', placeholder: '+1 555 000 0000' }, { label: 'City', key: 'city', placeholder: 'Phoenix, AZ' }].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">{f.label}</label>
                  <input value={(newClient as any)[f.key]} onChange={e => setNewClient(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300" />
                </div>
              ))}
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Type</label>
                <select value={newClient.type} onChange={e => setNewClient(p => ({ ...p, type: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300">
                  <option value="homeless">Homeless</option>
                  <option value="reentry">Reentry</option>
                  <option value="both">Both</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={addClient}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-gray-900 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>
                Add Client
              </button>
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
