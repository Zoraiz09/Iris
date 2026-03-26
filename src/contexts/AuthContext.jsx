import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [approvalStatus, setApprovalStatus] = useState(null)

  const checkApproval = async (userId) => {
    try {
      const res = await fetch('/api/approval-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      const data = await res.json()
      setApprovalStatus(data.status)
    } catch {
      setApprovalStatus('error')
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        checkApproval(currentUser.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) {
        checkApproval(currentUser.id)
      } else {
        setApprovalStatus(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (approvalStatus !== null) {
      setLoading(false)
    }
  }, [approvalStatus])

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (!error && data.user) {
      // Request admin approval
      try {
        await fetch('/api/request-approval', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id, email })
        })
        setApprovalStatus('pending')
      } catch (e) {
        console.error('Failed to request approval:', e)
      }
    }
    return { data, error }
  }

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    setApprovalStatus(null)
    return { error }
  }

  return (
    <AuthContext.Provider value={{ user, loading, approvalStatus, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
