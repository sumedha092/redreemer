import { useAuth0 } from '@auth0/auth0-react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../lib/useTheme.js'

export default function Navbar({ activeView, onViewChange }) {
  const { user, logout } = useAuth0()
  const { theme, toggle } = useTheme()

  return (
    <nav className="bg-[hsl(var(--navy-900))] border-b border-[hsl(var(--border))] px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-[hsl(var(--foreground))]">
          Re<span className="text-amber-500">dreemer</span>
        </h1>
        <span className="text-[hsl(var(--muted-foreground))]">·</span>

        {onViewChange && (
          <>
            <button
              onClick={() => onViewChange('clients')}
              className={`text-sm transition-colors ${activeView === 'clients' ? 'text-[hsl(var(--foreground))] font-medium' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
            >
              Clients
            </button>
            <button
              onClick={() => onViewChange('analytics')}
              className={`text-sm transition-colors ${activeView === 'analytics' ? 'text-amber-400 font-medium' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
            >
              Analytics
            </button>
            <button
              onClick={() => onViewChange('simulator')}
              className={`text-sm transition-colors flex items-center gap-1.5 ${activeView === 'simulator' ? 'text-green-400 font-medium' : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block"></span>
              SMS Sim
            </button>
          </>
        )}

        <a
          href="/wellness"
          className="text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
        >
          Financial Wellness
        </a>

        <span className="bg-[hsl(var(--card))] border border-amber-500/30 text-amber-400 text-xs px-3 py-1 rounded-full font-medium hidden md:inline">
          ✦ Powered by Gemini
        </span>
      </div>

      <div className="flex items-center gap-3">
        {user && (
          <span className="text-[hsl(var(--foreground))] opacity-60 text-sm hidden sm:block">
            {user.email}
          </span>
        )}
        <button
          onClick={toggle}
          className="w-8 h-8 rounded-lg bg-[hsl(var(--card))] border border-[hsl(var(--border))] flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin + '/login' } })}
          className="text-[hsl(var(--foreground))] opacity-60 hover:opacity-100 text-sm transition-opacity"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
