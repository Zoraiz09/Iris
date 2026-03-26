import { useAuth } from '../contexts/AuthContext'

const PendingApproval = () => {
  const { signOut, user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-emerald-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-500/20 backdrop-blur-sm rounded-2xl mb-6">
          <svg className="w-12 h-12 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">Pending Approval</h1>
        <p className="text-green-200 mb-2">
          Your account <span className="text-white font-medium">{user?.email}</span> has been created successfully.
        </p>
        <p className="text-green-300/70 text-sm mb-8">
          An admin has been notified and will review your access request. You'll be able to sign in once approved.
        </p>

        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-6">
          <div className="flex items-center gap-3 justify-center text-yellow-300">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Awaiting admin approval</span>
          </div>
        </div>

        <button
          onClick={signOut}
          className="text-green-300 hover:text-white text-sm transition"
        >
          Sign out and try again later
        </button>
      </div>
    </div>
  )
}

export default PendingApproval
