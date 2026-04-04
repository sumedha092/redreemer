import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) navigate('/')
  }, [isAuthenticated, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-amber-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center px-4">
      <div className="bg-navy-800 rounded-2xl p-10 w-full max-w-md shadow-2xl border border-navy-700">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Re<span className="text-amber-500">dreemer</span>
          </h1>
          <p className="text-navy-100 mt-2 text-sm opacity-70">
            Caseworker Dashboard
          </p>
        </div>

        {/* Tagline */}
        <p className="text-center text-navy-100 opacity-60 text-sm mb-8 leading-relaxed">
          Helping people redeem what was lost<br />and redream what's possible.
        </p>

        {/* Sign in button */}
        <button
          onClick={() => loginWithRedirect()}
          className="w-full bg-amber-500 hover:bg-amber-600 text-navy-900 font-semibold py-3 px-6 rounded-xl transition-colors duration-200 text-base"
        >
          Sign in with Auth0
        </button>

        {/* Security note */}
        <p className="text-center text-navy-100 opacity-40 text-xs mt-6">
          Secured by Auth0 · Role-based access control
        </p>
      </div>
    </div>
  )
}
