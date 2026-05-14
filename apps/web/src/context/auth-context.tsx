'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { Profile } from '@agroconnect/types'
import { api } from '@/lib/api'

interface AuthContextValue {
  user:     Profile | null
  loading:  boolean
  logout:   () => void
  refresh:  () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user:    null,
  loading: true,
  logout:  () => {},
  refresh: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUser]    = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get<{ success: boolean; data: Profile }>('/auth/me')
      setUser(data.data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('agroconnect_token')
    if (!token) { setLoading(false); return }
    refresh()
  }, [refresh])

  function logout() {
    localStorage.removeItem('agroconnect_token')
    document.cookie = 'agro_role=; path=/; max-age=0'
    setUser(null)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
