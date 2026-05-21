'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuth } from '@/context/auth-context'
import type { Role } from '@/lib/types'

// Inline SVG icons — one per role
const ROLE_ICONS: Record<string, React.ReactNode> = {
  farmer: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 1 4 4c0 4-4 9-4 9S8 10 8 6a4 4 0 0 1 4-4Z"/>
      <path d="M6 22h12"/>
      <path d="M12 13v7"/>
    </svg>
  ),
  dealer: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2"/>
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
      <line x1="12" y1="12" x2="12" y2="16"/>
      <line x1="10" y1="14" x2="14" y2="14"/>
    </svg>
  ),
  buyer: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  ),
  consumer: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/>
      <circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  field_agent: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a4 4 0 0 1 4 4c0 4-4 9-4 9S8 10 8 6a4 4 0 0 1 4-4Z"/>
      <circle cx="12" cy="6" r="1" fill="currentColor" stroke="none"/>
      <path d="M5 20a7 7 0 0 1 14 0"/>
    </svg>
  ),
}

const ROLES: {
  id:    Role
  label: string
  desc:  string
  color: string
  bg:    string
  next:  string
}[] = [
  {
    id:    'farmer',
    label: 'Farmer',
    desc:  'Sell produce, pledge harvests, access BNPL credit',
    color: 'text-sector-crops',
    bg:    'bg-sector-crops-bg',
    next:  '/onboarding/farmer',
  },
  {
    id:    'dealer',
    label: 'Agro-Input Dealer',
    desc:  'List seeds, fertilizers and farm equipment',
    color: 'text-sector-inputs',
    bg:    'bg-sector-inputs-bg',
    next:  '/onboarding/dealer',
  },
  {
    id:    'buyer',
    label: 'Buyer / Processor',
    desc:  'Source produce and reserve future harvests in bulk',
    color: 'text-harvest-gold',
    bg:    'bg-harvest-gold-bg',
    next:  '/onboarding/buyer',
  },
  {
    id:    'consumer',
    label: 'Consumer',
    desc:  'Order fresh farm produce directly from verified farms',
    color: 'text-sector-fisheries',
    bg:    'bg-sector-fisheries-bg',
    next:  '/onboarding/consumer',
  },
  {
    id:    'field_agent',
    label: 'Field Agent',
    desc:  'Register farmers offline, verify farms with GPS, and earn per onboarded user.',
    color: 'text-blue-600',
    bg:    'bg-blue-50',
    next:  '/onboarding/field-agent',
  },
]

export default function OnboardingRolePage() {
  const [loading, setLoading] = useState<Role | null>(null)
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      router.replace('/admin/dashboard')
    }
  }, [user, authLoading, router])

  async function selectRole(role: Role, next: string) {
    setLoading(role)
    try {
      const res = await fetch('/api/v1/users/me', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ role }),
      })
      const data = await res.json() as { success: boolean; error?: string }
      if (!data.success) throw new Error(data.error ?? 'Failed to update role')
      router.push(next)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong. Try again.')
      setLoading(null)
    }
  }

  if (authLoading || user?.role === 'admin') {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <svg className="animate-spin text-forest" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"
                  strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round"/>
        </svg>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-[480px]">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-xl bg-forest flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
              <path d="M16 4C12 4 9 8 9 12c0 5 7 13 7 13s7-8 7-13c0-4-3-8-7-8Z" fill="oklch(0.88 0.22 120)" />
              <path d="M10 26h12" stroke="oklch(0.88 0.22 120)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M16 15v9" stroke="oklch(0.88 0.22 120)" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-forest text-lg leading-none tracking-tight">AgroConnect</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">From seed to sale.</p>
          </div>
        </div>

        <div className="mb-7">
          <h1 className="text-2xl font-extrabold text-forest mb-1">How will you use AgroConnect?</h1>
          <p className="text-sm text-muted-foreground">
            Choose your role. You can always change it later from your profile settings.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              disabled={loading !== null}
              onClick={() => selectRole(r.id, r.next)}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-border
                         hover:border-forest hover:shadow-sm transition-all duration-150
                         text-left group active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span className={`w-10 h-10 flex items-center justify-center rounded-xl ${r.bg} ${r.color} shrink-0`}>
                {loading === r.id ? (
                  <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" strokeLinecap="round"/>
                  </svg>
                ) : ROLE_ICONS[r.id]}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-forest text-sm">{r.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{r.desc}</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ml-auto text-muted-foreground/40 shrink-0 group-hover:text-forest transition-colors">
                <polyline points="9,18 15,12 9,6"/>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
