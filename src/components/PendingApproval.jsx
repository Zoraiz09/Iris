import { useAuth } from '../contexts/AuthContext'
import { Clock, Leaf, LogOut, ShieldCheck } from 'lucide-react'

const PendingApproval = () => {
  const { signOut, user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md text-center relative z-10 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-500/15 backdrop-blur-md rounded-2xl mb-6 border border-amber-400/20 shadow-lg">
          <Clock className="w-10 h-10 text-amber-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">Pending Approval</h1>
        <p className="text-green-200/80 mb-2">
          Your account <span className="text-white font-medium">{user?.email}</span> has been created successfully.
        </p>
        <p className="text-green-300/50 text-sm mb-8">
          An admin has been notified and will review your access request. You'll be able to sign in once approved.
        </p>

        <div className="bg-white/[0.07] backdrop-blur-xl rounded-xl p-4 border border-white/10 mb-6">
          <div className="flex items-center gap-3 justify-center text-amber-400">
            <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
            <ShieldCheck className="w-4 h-4" />
            <span className="text-sm font-medium">Awaiting admin approval</span>
          </div>
        </div>

        <button
          onClick={signOut}
          className="inline-flex items-center gap-2 text-green-400/70 hover:text-white text-sm transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out and try again later
        </button>
      </div>
    </div>
  )
}

export default PendingApproval
