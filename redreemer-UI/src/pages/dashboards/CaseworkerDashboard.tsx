import { useState } from 'react';
import DashboardShell from '@/components/DashboardShell';
import { useAuth } from '@/context/AuthContext';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Home, Users, BarChart2, MessageSquare, Settings, User,
  AlertTriangle, TrendingUp, CheckCircle, Clock, UserPlus
} from 'lucide-react';

const NAV = [
  { id: 'home',      icon: Home,         label: 'Overview' },
  { id: 'clients',   icon: Users,        label: 'Clients' },
  { id: 'analytics', icon: BarChart2,    label: 'Analytics' },
  { id: 'messages',  icon: MessageSquare,label: 'Messages' },
  { id: 'profile',   icon: User,         label: 'Profile' },
  { id: 'settings',  icon: Settings,     label: 'Settings' },
];

const MOCK_CLIENTS = [
  { name: 'Marcus T.', step: 4, score: 52, status: 'active', type: 'homeless', lastActive: '2h ago' },
  { name: 'James R.',  step: 3, score: 38, status: 'active', type: 'reentry',  lastActive: '1d ago' },
  { name: 'Darnell W.',step: 2, score: 21, status: 'at-risk',type: 'both',     lastActive: '6d ago' },
  { name: 'Alex M.',   step: 3, score: 45, status: 'active', type: 'both',     lastActive: '2d ago' },
];

export default function CaseworkerDashboard() {
  const [tab, setTab] = useState('home');
  const { user } = useAuth0();
  const { userType } = useAuth();

  const firstName = user?.given_name || user?.name?.split(' ')[0] || 'Caseworker';

  return (
    <DashboardShell
      activeTab={tab}
      onTabChange={setTab}
      navItems={NAV}
      userName={user?.name}
      userEmail={user?.email}
    >
      {tab === 'home' && (
        <div className="space-y-6 max-w-5xl">
          <div>
            <h1 className="font-heading font-bold text-2xl text-gray-900">Good morning, {firstName} 👋</h1>
            <p className="text-gray-500 text-sm mt-1">Here's what's happening with your clients today.</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Clients', value: '4', icon: Users, color: 'text-indigo-600' },
              { label: 'Active This Week', value: '3', icon: TrendingUp, color: 'text-green-600' },
              { label: 'Steps Completed', value: '8', icon: CheckCircle, color: 'text-yellow-600' },
              { label: 'Needs Attention', value: '1', icon: AlertTriangle, color: 'text-destructive' },
            ].map(s => (
              <div key={s.label} className="glass-card !p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500">{s.label}</span>
                  <s.icon size={16} className={s.color} />
                </div>
                <p className={`font-heading font-bold text-2xl ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* At-risk alert */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30">
            <AlertTriangle size={18} className="text-destructive shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">Darnell W. hasn't responded in 6 days</p>
              <p className="text-xs text-gray-500">May need immediate outreach</p>
            </div>
            <button className="px-3 py-1.5 rounded-lg bg-destructive text-white text-xs font-medium">Reach out</button>
          </div>

          {/* Client list */}
          <div className="glass-card !p-0 overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h3 className="font-heading font-semibold text-gray-900">Your Clients</h3>
              <button className="flex items-center gap-1.5 text-xs text-yellow-600 hover:underline">
                <UserPlus size={14} /> Add client
              </button>
            </div>
            <div className="divide-y divide-border">
              {MOCK_CLIENTS.map(c => (
                <div key={c.name} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
                    c.type === 'homeless' ? 'bg-emerald-600' : c.type === 'reentry' ? 'bg-amber-500' : 'bg-purple-600'
                  }`}>
                    {c.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">Step {c.step}/8 · {c.type}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end mb-1">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(c.step / 8) * 100}%` }} />
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 flex items-center gap-1 justify-end">
                      <Clock size={10} /> {c.lastActive}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    c.status === 'at-risk' ? 'bg-destructive/20 text-destructive' : 'bg-emerald-500/20 text-green-600'
                  }`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'profile' && (
        <div className="max-w-lg space-y-6">
          <h1 className="font-heading font-bold text-2xl text-gray-900">Profile</h1>
          <div className="glass-card space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                {user?.name?.[0] || 'U'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.name || 'Caseworker'}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-600/20 text-indigo-600 mt-1 inline-block">Caseworker</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'settings' && (
        <div className="max-w-lg space-y-6">
          <h1 className="font-heading font-bold text-2xl text-gray-900">Settings</h1>
          <div className="glass-card space-y-4">
            <p className="text-gray-500 text-sm">Account settings coming soon.</p>
          </div>
        </div>
      )}

      {(tab === 'analytics' || tab === 'clients' || tab === 'messages') && (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <p className="text-sm">Full {tab} view — coming soon</p>
        </div>
      )}
    </DashboardShell>
  );
}
