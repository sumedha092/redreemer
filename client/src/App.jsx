import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import FinancialWellness from './pages/FinancialWellness.jsx'
import HelpNow from './pages/HelpNow.jsx'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth0()
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex flex-col items-center justify-center gap-4 px-6">
        <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--primary)/0.2)] animate-pulse" aria-hidden />
        <p className="text-[hsl(var(--muted-foreground))] text-sm">Signing you in…</p>
      </div>
    )
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/help" element={<HelpNow />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/wellness" element={<FinancialWellness />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
