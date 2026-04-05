import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Smartphone, Clock, Sun, Moon } from 'lucide-react'
import { useTheme } from '../lib/useTheme.js'

export default function Login() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0()
  const navigate = useNavigate()
  const { theme, toggle } = useTheme()

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard')
  }, [isAuthenticated, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[hsl(var(--primary))] border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center px-4 relative overflow-hidden dot-grid grain">
      {/* Aurora blobs */}
      <div className="absolute top-10 right-10 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'rgba(245,158,11,0.12)', filter: 'blur(100px)', animation: 'aurora-1 20s ease-in-out infinite alternate' }} />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'rgba(99,102,241,0.12)', filter: 'blur(100px)', animation: 'aurora-2 20s ease-in-out infinite alternate' }} />

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className="absolute top-5 right-5 w-9 h-9 rounded-lg glass flex items-center justify-center text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors z-10"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-3xl p-10 border border-[hsl(var(--glass-border))] shadow-2xl">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--primary))] flex items-center justify-center font-heading font-bold text-[hsl(var(--primary-foreground))] text-2xl">R</div>
            <h1 className="font-heading font-extrabold text-3xl text-[hsl(var(--foreground))]">
              Re<span className="text-gradient-amber">dreemer</span>
            </h1>
          </div>
          <p className="text-center text-[hsl(var(--muted-foreground))] text-sm mb-8">
            Caseworker Dashboard
          </p>

          {/* Tagline */}
          <p className="text-center text-[hsl(var(--foreground)/0.6)] text-sm mb-8 leading-relaxed italic">
            "Helping people redeem what was lost<br />and redream what's possible."
          </p>

          {/* Sign in */}
          <button
            onClick={() => loginWithRedirect()}
            className="w-full bg-[hsl(var(--primary))] hover:glow-amber text-[hsl(var(--primary-foreground))] font-heading font-semibold py-3.5 px-6 rounded-xl transition-all text-base mb-4"
          >
            Sign in with Auth0
          </button>

          <a
            href="/"
            className="block w-full text-center glass py-3 rounded-xl text-[hsl(var(--foreground)/0.7)] hover:text-[hsl(var(--foreground))] text-sm transition-colors"
          >
            ← Back to Home
          </a>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-4 text-[10px] text-[hsl(var(--muted-foreground))] mt-6 pt-6 border-t border-[hsl(var(--border))]">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-[hsl(var(--accent))]" /> Auth0 secured</span>
            <span className="flex items-center gap-1"><Smartphone className="w-3 h-3" /> Role-based access</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> SOC 2 ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}
