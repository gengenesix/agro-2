'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import type { Profile } from '@/lib/types'
import { api } from '@/lib/api'
import { createClient } from '@/lib/supabase'

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
      if (data.success && data.data) {
        setUser(data.data)
        localStorage.setItem('agroconnect_profile', JSON.stringify(data.data))
      } else {
        setUser(null)
      }
    } catch (err: unknown) {
      // Only treat an explicit HTTP 401 as "session expired" — network errors
      // (ECONNREFUSED, timeout, offline) must NOT trigger logout, as the cookie
      // is still valid and we'd wipe it unnecessarily.
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      if (status === 401) {
        await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
        localStorage.removeItem('agroconnect_token')
        localStorage.removeItem('agroconnect_profile')
      }
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Always check session on mount — the HttpOnly cookie is sent automatically.
    // Don't gate on localStorage; the cookie may still be valid after a page reload.
    refresh()
  }, [refresh])

  async function logout() {
    // 1. Clear Supabase client session (localStorage sb-* keys)
    const supabase = createClient()
    await supabase.auth.signOut()

    // 2. Clear platform localStorage + sessionStorage
    localStorage.removeItem('agroconnect_token')
    localStorage.removeItem('agroconnect_profile')
    sessionStorage.clear()

    // 3. Clear readable cookies
    document.cookie = 'agro_role=; path=/; max-age=0'

    // 4. Zero out local user state immediately
    setUser(null)

    // 5. Expire the HttpOnly agro_access_token cookie server-side, then hard-navigate
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    window.location.href = '/'
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
