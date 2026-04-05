import { useState, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useAIAlerts } from '@/context/AIAlertContext';
import Logo from '@/components/Logo';
import {
  Bell, Search, Settings, HelpCircle, LogOut, User,
  X, ChevronRight, Menu, Home, AlertTriangle, Globe
} from 'lucide-react';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'zh', label: '中文' },
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'ar', label: 'العربية' },
  { code: 'so', label: 'Soomaali' },
  { code: 'ht', label: 'Kreyòl' },
];

interface NavItem { icon: typeof Home; label: string; id: string; }

interface Props {
  children: ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  navItems: NavItem[];
  userName?: string;
  userEmail?: string;
}

export default function DashboardShell({ children, activeTab, onTabChange, navItems, userName, userEmail }: Props) {
  const { logout, userType } = useAuth();
  const { alerts, markRead, unreadCount } = useAIAlerts();
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en');
  const initials = userName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  const accentBg = 'bg-yellow-300';
  const typeLabel = userType === 'caseworker' ? 'Caseworker' : userType === 'reentry' ? 'Reentry' : 'Client';

  // Filter nav items for search
  const searchResults = searchQuery
    ? navItems.filter(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="h-screen flex bg-gray-50 text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${collapsed ? 'w-16' : 'w-60'} shrink-0 bg-white border-r border-gray-200 flex flex-col transition-all duration-200 h-full`}>
        {/* Logo */}
        <div className="h-14 flex items-center px-3 border-b border-gray-200 gap-2 shrink-0">
          {!collapsed && <Logo size="sm" />}
          <button onClick={() => setCollapsed(v => !v)} className="ml-auto text-gray-400 hover:text-gray-700 p-1 rounded transition-colors">
            <Menu size={16} />
          </button>
        </div>

        {/* Nav — scrollable middle section */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto min-h-0">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-yellow-50 text-yellow-600 border border-yellow-300 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <item.icon size={16} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom — fixed, never scrolls off screen */}
        <div className="shrink-0 border-t border-gray-200 px-2 py-2 space-y-0.5">
          <button onClick={() => setHelpOpen(true)}
            title={collapsed ? 'Help' : undefined}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <HelpCircle size={16} className="shrink-0" />
            {!collapsed && <span>Help</span>}
          </button>
          <button onClick={() => onTabChange('settings')}
            title={collapsed ? 'Settings' : undefined}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
            <Settings size={16} className="shrink-0" />
            {!collapsed && <span>Settings</span>}
          </button>
          <button onClick={logout}
            title={collapsed ? 'Sign out' : undefined}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>

        {/* User profile — always visible */}
        <div className="shrink-0 border-t border-gray-200 p-2">
          <button onClick={() => setProfileOpen(v => !v)}
            className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <div className={`w-7 h-7 rounded-full ${accentBg} flex items-center justify-center text-gray-900 text-xs font-bold shrink-0`}>
              {initials}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{userName || 'User'}</p>
                  <p className="text-[10px] text-gray-500 truncate">{typeLabel}</p>
                </div>
                <ChevronRight size={12} className="text-gray-400 shrink-0" />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0">
          {/* Search */}
          <div className="flex-1 max-w-xs relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              placeholder="Search features..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-colors"
            />
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                {searchResults.map(r => (
                  <button key={r.id} onMouseDown={() => { onTabChange(r.id); setSearchQuery(''); setSearchOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 hover:bg-yellow-50 transition-colors">
                    <r.icon size={14} className="text-gray-400" />
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Language selector */}
            <div className="relative">
              <button onClick={() => { setLangOpen(v => !v); setNotifOpen(false); setProfileOpen(false); }}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors text-xs font-medium">
                <Globe size={14} />
                <span className="hidden sm:inline">{LANGUAGES.find(l => l.code === selectedLang)?.label}</span>
              </button>
              {langOpen && (
                <div className="absolute right-0 top-10 w-40 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => { setSelectedLang(l.code); setLangOpen(false); }}
                      className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
                        selectedLang === l.code ? 'bg-yellow-50 text-gray-900 font-semibold' : 'text-gray-700 hover:bg-gray-50'
                      }`}>
                      {l.label}
                      {selectedLang === l.code && <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors relative">
                <Bell size={16} />
                {unreadCount > 0
                  ? <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  : <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-yellow-300" />
                }
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 animate-fade-in overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <span className="font-semibold text-sm text-gray-900">Notifications {unreadCount > 0 && <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>}</span>
                    <button onClick={() => setNotifOpen(false)}><X size={14} className="text-gray-400" /></button>
                  </div>
                  {/* AI risk alerts — shown first */}
                  {alerts.slice(0, 5).map(a => (
                    <div key={a.id} onClick={() => markRead(a.id)}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!a.read ? (a.level === 'danger' ? 'bg-red-50/60' : 'bg-yellow-50/60') : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${a.level === 'danger' ? 'bg-red-100' : 'bg-yellow-100'}`}>
                        <AlertTriangle size={12} className={a.level === 'danger' ? 'text-red-500' : 'text-yellow-600'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold mb-0.5 ${a.level === 'danger' ? 'text-red-700' : 'text-yellow-700'}`}>
                          AI {a.level === 'danger' ? 'Risk Alert' : 'Insight'} · {a.tool}
                        </p>
                        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{a.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{a.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      {!a.read && <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />}
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="px-4 py-6 text-center text-xs text-gray-400">
                      No alerts yet. AI monitors your finances in real time.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
                className={`w-8 h-8 rounded-full ${accentBg} flex items-center justify-center text-gray-900 text-xs font-bold`}>
                {initials}
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-10 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 animate-fade-in overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{userName || 'User'}</p>
                    <p className="text-xs text-gray-500">{userEmail || ''}</p>
                    <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full text-gray-900 font-medium ${accentBg}`}>{typeLabel}</span>
                  </div>
                  {[
                    { icon: User, label: 'Profile', action: () => { onTabChange('profile'); setProfileOpen(false); } },
                    { icon: Settings, label: 'Settings', action: () => { onTabChange('settings'); setProfileOpen(false); } },
                    { icon: HelpCircle, label: 'Help', action: () => { setHelpOpen(true); setProfileOpen(false); } },
                  ].map(({ icon: Icon, label, action }) => (
                    <button key={label} onClick={action}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <Icon size={14} className="text-gray-400" />
                      {label}
                    </button>
                  ))}
                  <div className="border-t border-gray-100">
                    <button onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors">
                      <LogOut size={14} />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content — scrollable */}
        <main className="flex-1 overflow-y-auto min-h-0 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-5">
            {children}
          </div>
        </main>
      </div>

      {/* Help modal */}
      {helpOpen && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4" onClick={() => setHelpOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-heading font-bold text-lg text-gray-900">Help & Support</h2>
              <button onClick={() => setHelpOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { title: 'Getting Started', desc: 'Complete your profile and start your 8-step journey toward financial independence.' },
                { title: 'Financial Tools', desc: 'Use Budget Tracker, Emergency Fund, Debt Payoff, and more — all free, all in one place.' },
                { title: 'SMS Feature', desc: 'The SMS tab lets you chat with our AI assistant just like texting. It gives real local resources.' },
                { title: 'Your Journey Steps', desc: 'Each step builds on the last. Complete them in order for the best results.' },
                { title: 'Contact Support', desc: 'Email us at support@redreemer.app — we respond within 24 hours.' },
              ].map(h => (
                <div key={h.title} className="flex gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-yellow-200 transition-colors cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{h.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{h.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 pb-5">
              <a href="mailto:support@redreemer.app"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-gray-900 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>
                Contact Support
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
