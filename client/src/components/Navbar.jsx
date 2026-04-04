import { useAuth0 } from '@auth0/auth0-react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Navbar({ activeView, onViewChange }) {
  const { user, logout } = useAuth0()

  return (
    <nav className="bg-navy-900 border-b border-navy-700 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold text-white">
          Re<span className="text-amber-500">dreemer</span>
        </h1>
        <span className="text-navy-600">·</span>

        {onViewChange && (
          <>
            <button
              onClick={() => onViewChange('clients')}
              className={`text-sm transition-colors ${activeView === 'clients' ? 'text-white font-medium' : 'text-navy-400 hover:text-white'}`}
            >
              Clients
            </button>
            <button
              onClick={() => onViewChange('analytics')}
              className={`text-sm transition-colors ${activeView === 'analytics' ? 'text-amber-400 font-medium' : 'text-navy-400 hover:text-white'}`}
            >
              Analytics
            </button>
          </>
        )}

        <a
          href="/wellness"
          className="text-sm text-navy-400 hover:text-white transition-colors"
        >
          Financial Wellness
        </a>

        <span className="bg-navy-800 border border-amber-500/30 text-amber-400 text-xs px-3 py-1 rounded-full font-medium hidden md:inline">
          ✦ Powered by Gemini
        </span>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <span className="text-navy-100 opacity-60 text-sm hidden sm:block">
            {user.email}
          </span>
        )}
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin + '/login' } })}
          className="text-navy-100 opacity-60 hover:opacity-100 text-sm transition-opacity"
        >
          Sign out
        </button>
      </div>
    </nav>
  )
}
