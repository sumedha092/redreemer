import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import FinancialWellness from './pages/FinancialWellness.jsx'

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth0()
  if (isLoading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-amber-500 text-lg">Loading...</div>
      </div>
    )
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
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
