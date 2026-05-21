'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { api } from '@/lib/api'
import { formatPhoneGhana } from '@/lib/format'
import { LoadingIcon } from '@/components/shared/icons'

const SECTORS = [
  { value: 'inputs',    label: 'Agro-Inputs'  },
  { value: 'crops',     label: 'Crops'        },
  { value: 'livestock', label: 'Livestock'    },
  { value: 'poultry',   label: 'Poultry'      },
  { value: 'fisheries', label: 'Fisheries'    },
]

const MOMO_NETWORKS = [
  { value: 'mtn',        label: 'MTN Mobile Money'   },
  { value: 'vodafone',   label: 'Vodafone Cash'       },
  { value: 'airteltigo', label: 'AirtelTigo Money'    },
]

interface DealerForm {
  businessName:       string
  registrationNumber: string
  physicalAddress:    string
  mobileMoneyNumber:  string
  mobileMoneyNetwork: string
  deliveryRadiusKm:   number
  sectorsServed:      string[]
}

function DealerProfileContent() {
  const { user, refresh } = useAuth()
  const searchParams      = useSearchParams()
  const isSetupFlow       = searchParams.get('setup') === '1'

  const [form, setForm]   = useState<DealerForm>({
    businessName:       '',
    registrationNumber: '',
    physicalAddress:    '',
    mobileMoneyNumber:  '',
    mobileMoneyNetwork: 'mtn',
    deliveryRadiusKm:   20,
    sectorsServed:      ['inputs'],
  })
  const loadedForm            = useRef<DealerForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const isDirty = loadedForm.current !== null
    && JSON.stringify(form) !== JSON.stringify(loadedForm.current)

  useEffect(() => {
    api.get('/users/me/dealer-profile')
      .then(r => {
        const d = r.data?.data
        const loaded: DealerForm = {
          businessName:       d?.businessName       || user?.fullName  || '',
          registrationNumber: d?.registrationNumber ?? '',
          physicalAddress:    d?.physicalAddress    ?? '',
          mobileMoneyNumber:  d?.mobileMoneyNumber  ?? '',
          mobileMoneyNetwork: d?.mobileMoneyNetwork ?? 'mtn',
          deliveryRadiusKm:   d?.deliveryRadiusKm   ?? 20,
          sectorsServed:      d?.sectorsServed       ?? ['inputs'],
        }
        setForm(loaded)
        loadedForm.current = loaded
      })
      .catch(() => {
        const fallback: DealerForm = {
          businessName:       user?.fullName ?? '',
          registrationNumber: '',
          physicalAddress:    '',
          mobileMoneyNumber:  '',
          mobileMoneyNetwork: 'mtn',
          deliveryRadiusKm:   20,
          sectorsServed:      ['inputs'],
        }
        setForm(fallback)
        loadedForm.current = fallback
      })
      .finally(() => setLoading(false))
  }, [user?.fullName])

  function toggleSector(value: string) {
    setForm(f => ({
      ...f,
      sectorsServed: f.sectorsServed.includes(value)
        ? f.sectorsServed.filter(s => s !== value)
        : [...f.sectorsServed, value],
    }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await api.patch('/users/me/dealer-profile', form)
      await refresh()
      sessionStorage.setItem('dealerProfileStatus', 'complete')
      loadedForm.current = { ...form }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-forest border-t-transparent animate-spin" />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="font-bold text-forest text-lg">Dealer Profile</h1>
          <div className="flex items-center gap-2 mt-0.5">
            {user?.fullName && (
              <span className="text-xs font-medium text-muted-foreground">{user.fullName}</span>
            )}
            {user?.fullName && user?.phone && (
              <span className="text-muted-foreground/40 text-xs">·</span>
            )}
            {user?.phone && (
              <span className="text-xs text-muted-foreground font-mono">{formatPhoneGhana(user.phone)}</span>
            )}
          </div>
        </div>
      </div>

      {isSetupFlow && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-amber-800">Account activation pending</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Please complete your business information profile to unlock dashboard actions.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Business info */}
        <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
          <h2 className="font-bold text-forest text-sm">Business information</h2>

          <div>
            <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2">
              Business name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.businessName}
              onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
              placeholder="e.g. Agro Solutions Ltd"
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-cream
                         focus:border-forest focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2">
              Business registration number
            </label>
            <input
              value={form.registrationNumber}
              onChange={e => setForm(f => ({ ...f, registrationNumber: e.target.value }))}
              placeholder="e.g. CS000123456"
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-cream
                         focus:border-forest focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2">
              Physical address
            </label>
            <input
              value={form.physicalAddress}
              onChange={e => setForm(f => ({ ...f, physicalAddress: e.target.value }))}
              placeholder="e.g. Kumasi Central Market, Ashanti Region"
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-cream
                         focus:border-forest focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2">
              Delivery radius (km)
            </label>
            <input
              type="number"
              min={1}
              max={500}
              value={form.deliveryRadiusKm}
              onChange={e => setForm(f => ({ ...f, deliveryRadiusKm: parseInt(e.target.value, 10) || 20 }))}
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-cream
                         focus:border-forest focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Sectors served */}
        <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
          <h2 className="font-bold text-forest text-sm">Sectors served</h2>
          <div className="flex flex-wrap gap-2">
            {SECTORS.map(s => (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleSector(s.value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-colors
                  ${form.sectorsServed.includes(s.value)
                    ? 'bg-forest text-white border-forest'
                    : 'bg-white text-muted-foreground border-border hover:border-forest hover:text-forest'
                  }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile money */}
        <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
          <h2 className="font-bold text-forest text-sm">Payment settlement</h2>

          <div>
            <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2">
              Mobile Money network
            </label>
            <select
              value={form.mobileMoneyNetwork}
              onChange={e => setForm(f => ({ ...f, mobileMoneyNetwork: e.target.value }))}
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-cream
                         focus:border-forest focus:outline-none"
            >
              {MOMO_NETWORKS.map(n => (
                <option key={n.value} value={n.value}>{n.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2">
              Mobile Money number <span className="text-red-500">*</span>
            </label>
            <input
              required
              type="tel"
              value={form.mobileMoneyNumber}
              onChange={e => setForm(f => ({ ...f, mobileMoneyNumber: e.target.value }))}
              placeholder="e.g. 0244000000"
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-cream
                         focus:border-forest focus:outline-none font-mono"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!isDirty || saving}
          className={`w-full py-3 text-sm font-bold rounded-xl transition-colors
                      flex items-center justify-center gap-2
                      ${!isDirty || saving
                        ? 'bg-cream-dark text-muted-foreground cursor-default'
                        : 'bg-forest text-white hover:bg-forest-dark'}`}
        >
          {saving
            ? <><LoadingIcon size={16} className="animate-spin" /> Saving…</>
            : saved
            ? 'Saved!'
            : 'Save profile'
          }
        </button>
      </form>
    </main>
  )
}

export default function DealerProfilePage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-forest border-t-transparent animate-spin" />
      </main>
    }>
      <DealerProfileContent />
    </Suspense>
  )
}
