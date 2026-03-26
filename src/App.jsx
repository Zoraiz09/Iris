import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Dashboard from './components/Dashboard'
import DetailedView from './components/DetailedView'
import Auth from './components/Auth'
import PendingApproval from './components/PendingApproval'

const ProtectedRoute = ({ children }) => {
  const { user, loading, approvalStatus } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-green-400 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-green-300">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (approvalStatus !== 'approved') {
    return <PendingApproval />
  }

  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<AuthRoute />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/detailed" element={<ProtectedRoute><DetailedView /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

const AuthRoute = () => {
  const { user, loading, approvalStatus } = useAuth()
  if (loading) return null
  if (user && approvalStatus === 'approved') return <Navigate to="/" replace />
  if (user && approvalStatus && approvalStatus !== 'approved') return <PendingApproval />
  return <Auth />
}

export default App
