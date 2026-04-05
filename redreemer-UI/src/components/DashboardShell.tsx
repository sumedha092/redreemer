import { useState, ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useAIAlerts } from '@/context/AIAlertContext';
import Logo from '@/components/Logo';
import LanguageMenu from '@/components/LanguageMenu';
import {
  Bell, Search, Settings, HelpCircle, LogOut, User,
  X, ChevronRight, Menu, Home, AlertTriangle
} from 'lucide-react';

const HELP_KEYS = ['start', 'tools', 'sms', 'journey', 'contact'] as const;

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
  const { t } = useTranslation();
  const { logout, userType } = useAuth();
  const { alerts, markRead, unreadCount } = useAIAlerts();
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const initials = userName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => {
      if (mq.matches) setMobileSidebar(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const accentBg = 'bg-yellow-300';
  const typeLabel =
    userType === 'caseworker' ? t('shell.roleCaseworker') : userType === 'reentry' ? t('shell.roleReentry') : t('shell.roleClient');

  // Filter nav items for search
  const searchResults = searchQuery
    ? navItems.filter(n => n.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="h-[100dvh] flex bg-background text-foreground overflow-hidden">
      {mobileSidebar && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'lg:w-16' : 'lg:w-60'
        } w-[min(100%,280px)] shrink-0 bg-card border-r border-border flex flex-col transition-all duration-200 h-full
        fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
        ${mobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-3 border-b border-border gap-2 shrink-0">
          {!collapsed && <Logo size="sm" />}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="ml-auto text-muted-foreground hover:text-foreground p-1 rounded transition-colors hidden lg:inline-flex"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu size={16} />
          </button>
          <button
            type="button"
            onClick={() => setMobileSidebar(false)}
            className="ml-auto lg:hidden text-muted-foreground hover:text-foreground p-1 rounded"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav — scrollable middle section */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto min-h-0">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setMobileSidebar(false);
              }}
              title={collapsed ? item.label : undefined}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-yellow-50 text-yellow-800 border border-yellow-300 font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <item.icon size={16} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom — fixed, never scrolls off screen */}
        <div className="shrink-0 border-t border-border px-2 py-2 space-y-0.5">
          <button
            onClick={() => {
              setHelpOpen(true);
              setMobileSidebar(false);
            }}
            title={collapsed ? t('shell.help') : undefined}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <HelpCircle size={16} className="shrink-0" />
            {!collapsed && <span>{t('shell.help')}</span>}
          </button>
          <button
            onClick={() => {
              onTabChange('settings');
              setMobileSidebar(false);
            }}
            title={collapsed ? t('shell.settings') : undefined}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Settings size={16} className="shrink-0" />
            {!collapsed && <span>{t('shell.settings')}</span>}
          </button>
          <button
            onClick={logout}
            title={collapsed ? t('shell.signOut') : undefined}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} className="shrink-0" />
            {!collapsed && <span>{t('shell.signOut')}</span>}
          </button>
        </div>

        {/* User profile — always visible */}
        <div className="shrink-0 border-t border-border p-2">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <div
              className={`w-7 h-7 rounded-full ${accentBg} flex items-center justify-center text-gray-900 text-xs font-bold shrink-0`}
            >
              {initials}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{userName || t('shell.userFallback')}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{typeLabel}</p>
                </div>
                <ChevronRight size={12} className="text-muted-foreground shrink-0" />
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden lg:pl-0">
        {/* Top bar */}
        <header className="h-14 bg-card border-b border-border flex items-center px-3 sm:px-4 gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            className="lg:hidden rounded-lg p-2 text-muted-foreground hover:text-foreground hover:bg-muted shrink-0"
            onClick={() => setMobileSidebar(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          {/* Search */}
          <div className="flex-1 min-w-0 sm:max-w-xs relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              placeholder={t('shell.searchPlaceholder')}
              className="w-full min-w-0 pl-8 pr-3 py-1.5 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-400/80 focus:bg-background transition-colors"
            />
            {searchOpen && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                {searchResults.map((r) => (
                  <button
                    key={r.id}
                    onMouseDown={() => {
                      onTabChange(r.id);
                      setSearchQuery('');
                      setSearchOpen(false);
                      setMobileSidebar(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-popover-foreground hover:bg-yellow-500/10 transition-colors"
                  >
                    <r.icon size={14} className="text-muted-foreground" />
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1.5 shrink-0">
            <LanguageMenu onOpen={() => { setNotifOpen(false); setProfileOpen(false); }} align="right" />

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative">
                <Bell size={16} />
                {unreadCount > 0
                  ? <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  : <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-yellow-400" />
                }
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-10 w-[min(20rem,calc(100vw-1rem))] bg-popover border border-border rounded-xl shadow-xl z-50 animate-fade-in overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <span className="font-semibold text-sm text-popover-foreground">{t('shell.notifications')} {unreadCount > 0 && <span className="ml-1 text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-bold">{unreadCount}</span>}</span>
                    <button type="button" onClick={() => setNotifOpen(false)}><X size={14} className="text-muted-foreground" /></button>
                  </div>
                  {/* AI risk alerts — shown first */}
                  {alerts.slice(0, 5).map(a => (
                    <div key={a.id} onClick={() => markRead(a.id)}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-border cursor-pointer hover:bg-muted/60 transition-colors ${!a.read ? (a.level === 'danger' ? 'bg-red-500/10' : 'bg-yellow-500/10') : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${a.level === 'danger' ? 'bg-red-500/15' : 'bg-yellow-500/15'}`}>
                        <AlertTriangle size={12} className={a.level === 'danger' ? 'text-red-500' : 'text-yellow-600'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold mb-0.5 ${a.level === 'danger' ? 'text-red-600' : 'text-yellow-700'}`}>
                          {a.level === 'danger' ? t('shell.aiLineRisk', { tool: a.tool }) : t('shell.aiLineInsight', { tool: a.tool })}
                        </p>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{a.message}</p>
                        <p className="text-[10px] text-muted-foreground/80 mt-1">{a.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      {!a.read && <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0 mt-1.5" />}
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                      {t('shell.noAlerts')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button type="button" onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
                className={`w-8 h-8 rounded-full ${accentBg} flex items-center justify-center text-gray-900 text-xs font-bold`}>
                {initials}
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-10 w-52 max-w-[calc(100vw-1rem)] bg-popover border border-border rounded-xl shadow-xl z-50 animate-fade-in overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-popover-foreground">{userName || t('shell.userFallback')}</p>
                    <p className="text-xs text-muted-foreground">{userEmail || ''}</p>
                    <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full text-gray-900 font-medium ${accentBg}`}>{typeLabel}</span>
                  </div>
                  {[
                    { icon: User, label: t('shell.profileMenuProfile'), action: () => { onTabChange('profile'); setProfileOpen(false); setMobileSidebar(false); } },
                    { icon: Settings, label: t('shell.profileMenuSettings'), action: () => { onTabChange('settings'); setProfileOpen(false); setMobileSidebar(false); } },
                    { icon: HelpCircle, label: t('shell.profileMenuHelp'), action: () => { setHelpOpen(true); setProfileOpen(false); } },
                  ].map(({ icon: Icon, label, action }) => (
                    <button key={label} type="button" onClick={action}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-popover-foreground hover:bg-muted transition-colors">
                      <Icon size={14} className="text-muted-foreground" />
                      {label}
                    </button>
                  ))}
                  <div className="border-t border-border">
                    <button type="button" onClick={logout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                      <LogOut size={14} />
                      {t('shell.signOut')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content — scrollable */}
        <main className="flex-1 overflow-y-auto min-h-0 bg-muted/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
            {children}
          </div>
        </main>
      </div>

      {/* Help modal */}
      {helpOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setHelpOpen(false)}>
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90dvh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-heading font-bold text-lg text-foreground">{t('shell.helpTitle')}</h2>
              <button type="button" onClick={() => setHelpOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-3">
              {HELP_KEYS.map((key) => (
                <div key={key} className="flex gap-3 p-3 rounded-xl bg-muted/50 border border-border hover:border-yellow-400/40 transition-colors cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t(`shell.helpItems.${key}.title`)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{t(`shell.helpItems.${key}.desc`)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 pb-5">
              <a href="mailto:support@redreemer.app"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-gray-900 transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #f5e000, #ffe44d)' }}>
                {t('shell.helpContact')}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
