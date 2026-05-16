import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export type SubscriptionPlan = 'free' | 'annual' | 'premium'

interface AuthContextValue {
  token: string | null
  email: string | null
  plan: SubscriptionPlan
  login: (token: string, email: string) => void
  logout: () => void
  setPlan: (plan: SubscriptionPlan) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'nutricare_auth'

function parseStorage() {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as { token: string; email: string; plan?: SubscriptionPlan }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [plan, setPlanState] = useState<SubscriptionPlan>('free')

  useEffect(() => {
    const saved = parseStorage()
    if (saved) {
      setToken(saved.token)
      setEmail(saved.email)
      setPlanState(saved.plan ?? 'free')
    }
  }, [])

  const login = useCallback((newToken: string, newEmail: string) => {
    setToken(newToken)
    setEmail(newEmail)
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: newToken, email: newEmail, plan: 'free' }),
    )
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setEmail(null)
    setPlanState('free')
    window.localStorage.removeItem(STORAGE_KEY)
  }, [])

  const setPlan = useCallback((newPlan: SubscriptionPlan) => {
    setPlanState(newPlan)
    const saved = parseStorage()
    if (saved) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...saved, plan: newPlan }),
      )
    }
  }, [])

  const value = useMemo(
    () => ({ token, email, plan, login, logout, setPlan }),
    [token, email, plan, login, logout, setPlan],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }
  return context
}
