import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Leaf, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react'

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    if (isLogin) {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
    } else {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
      } else {
        setMessage('Account created! Your access request has been sent to the admin for approval.')
        setPassword('')
        setConfirmPassword('')
      }
    }

    setLoading(false)
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    setError('')
    setMessage('')
    setPassword('')
    setConfirmPassword('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-emerald-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-400/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl mb-4 border border-white/10 shadow-lg">
            <Leaf className="w-10 h-10 text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">IRIS</h1>
          <p className="text-green-400/80 mt-1 text-sm font-medium">Agricultural Monitoring System</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white/[0.07] backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/10">
          <h2 className="text-xl font-semibold text-white mb-6">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>

          {error && (
            <div className="bg-red-500/15 border border-red-400/20 text-red-200 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2 animate-scale-in">
              <div className="w-1.5 h-1.5 bg-red-400 rounded-full flex-shrink-0" />
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-500/15 border border-green-400/20 text-green-200 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2 animate-scale-in">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-green-200/80 text-sm font-medium mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.07] border border-white/10 rounded-xl text-white placeholder-green-300/30 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-green-200/80 text-sm font-medium mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400/50" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-white/[0.07] border border-white/10 rounded-xl text-white placeholder-green-300/30 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-400/50 hover:text-green-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="animate-slide-down">
                <label className="block text-green-200/80 text-sm font-medium mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400/50" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.07] border border-white/10 rounded-xl text-white placeholder-green-300/30 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:from-green-500/50 disabled:to-emerald-500/50 text-white font-semibold rounded-xl transition-all duration-200 mt-2 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Sign Up'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={switchMode}
              className="text-green-400/70 hover:text-white text-sm transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        <p className="text-center text-green-500/30 text-xs mt-6">Powered by AI-driven soil analytics</p>
      </div>
    </div>
  )
}

export default Auth
