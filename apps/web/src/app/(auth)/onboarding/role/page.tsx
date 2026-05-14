'use client'

import { useRouter }   from 'next/navigation'
import { useAuth }     from '@/context/auth-context'
import { api }         from '@/lib/api'
import { useState }    from 'react'
import {
  CropsIcon, BuyInputsIcon, MarketIcon, LoadingIcon,
} from '@/components/shared/icons'

const ROLES = [
  {
    value:       'farmer',
    label:       'Farmer',
    description: 'List produce, buy inputs, access BNPL and harvest pledges.',
    Icon:        CropsIcon,
    accent:      'border-sector-crops/40 hover:border-sector-crops bg-sector-crops-bg/40',
    active:      'border-sector-crops bg-sector-crops-bg ring-2 ring-sector-crops/30',
  },
  {
    value:       'dealer',
    label:       'Agro-Input Dealer',
    description: 'List seeds, fertilisers, equipment and receive bulk orders.',
    Icon:        BuyInputsIcon,
    accent:      'border-sector-inputs/40 hover:border-sector-inputs bg-sector-inputs-bg/40',
    active:      'border-sector-inputs bg-sector-inputs-bg ring-2 ring-sector-inputs/30',
  },
  {
    value:       'buyer',
    label:       'Buyer / Processor',
    description: 'Purchase produce and reserve future harvests in advance.',
    Icon:        MarketIcon,
    accent:      'border-forest/20 hover:border-forest bg-cream',
    active:      'border-forest bg-cream ring-2 ring-forest/20',
  },
  {
    value:       'consumer',
    label:       'Consumer',
    description: 'Order fresh produce directly from verified Ghanaian farms.',
    Icon:        MarketIcon,
    accent:      'border-sector-fisheries/30 hover:border-sector-fisheries bg-sector-fisheries-bg/30',
    active:      'border-sector-fisheries bg-sector-fisheries-bg ring-2 ring-sector-fisheries/30',
  },
] as const

type RoleValue = (typeof ROLES)[number]['value']

export default function SelectRolePage() {
  const { user, refresh } = useAuth()
  const router            = useRouter()
  const [selected, setSelected] = useState<RoleValue | null>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function proceed() {
    if (!selected) return
    setLoading(true)
    setError('')
    try {
      await api.put('/users/me/role', { role: selected })
      await refresh()
      router.push(`/onboarding/${selected}`)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Could not save role. Try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-forest rounded-2xl mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
                 strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-lime">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M8 12h8M12 8v8" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-forest">Welcome to AgroConnect</h1>
          <p className="text-muted-foreground text-sm mt-2">
            Tell us who you are so we can tailor your experience.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid sm:grid-cols-2 gap-3 mb-6">
          {ROLES.map(({ value, label, description, Icon, accent, active }) => {
            const isActive = selected === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setSelected(value)}
                className={`text-left p-4 rounded-2xl border-2 transition-all duration-200
                            ${isActive ? active : accent}`}
              >
                <Icon size={24} className="text-forest mb-2.5" />
                <p className="font-bold text-forest text-sm">{label}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{description}</p>
                {isActive && (
                  <div className="mt-2.5 w-4 h-4 rounded-full bg-forest flex items-center justify-center">
                    <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2"
                         strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl mb-4">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={!selected || loading}
          onClick={proceed}
          className="w-full py-3.5 bg-forest text-white font-bold text-sm rounded-2xl
                     hover:bg-forest-dark active:scale-[0.98] transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <LoadingIcon size={16} className="animate-spin" />
              Saving…
            </>
          ) : (
            'Continue'
          )}
        </button>
      </div>
    </div>
  )
}
