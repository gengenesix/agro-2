'use client'

import { useEffect }         from 'react'
import { useRouter }         from 'next/navigation'
import { useAuth }           from '@/context/auth-context'
import FarmerDashboard       from './_content'

const ROLE_HOME: Record<string, string> = {
  dealer:      '/dealer/dashboard',
  buyer:       '/buyer/dashboard',
  consumer:    '/consumer',
  field_agent: '/field-agent/dashboard',
  admin:       '/admin/dashboard',
}

export default function DashboardPage() {
  const router            = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user) { router.replace('/login'); return }
    const redirect = ROLE_HOME[user.role]
    if (redirect) router.replace(redirect)
  }, [user, loading, router])

  if (loading || !user || ROLE_HOME[user.role]) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-forest border-t-transparent animate-spin" />
      </div>
    )
  }

  return <FarmerDashboard />
}
