'use client'

import { useEffect, useState } from 'react'
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

export default function DealerProfilePage() {
  const { user, refresh } = useAuth()
  const [form, setForm]   = useState<DealerForm>({
    businessName:       '',
    registrationNumber: '',
    physicalAddress:    '',
    mobileMoneyNumber:  '',
    mobileMoneyNetwork: 'mtn',
    deliveryRadiusKm:   20,
    sectorsServed:      ['inputs'],
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    api.get('/users/me/dealer-profile')
      .then(r => {
        const d = r.data?.data
        if (d) {
          setForm({
            businessName:       d.businessName       ?? '',
            registrationNumber: d.registrationNumber ?? '',
            physicalAddress:    d.physicalAddress    ?? '',
            mobileMoneyNumber:  d.mobileMoneyNumber  ?? '',
            mobileMoneyNetwork: d.mobileMoneyNetwork ?? 'mtn',
            deliveryRadiusKm:   d.deliveryRadiusKm   ?? 20,
            sectorsServed:      d.sectorsServed       ?? ['inputs'],
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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
          <p className="text-xs text-muted-foreground">
            {user?.fullName} · {user?.phone ? formatPhoneGhana(user.phone) : ''}
          </p>
        </div>
      </div>

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
          disabled={saving}
          className="w-full py-3 bg-forest text-white text-sm font-bold rounded-xl
                     hover:bg-forest-dark transition-colors disabled:opacity-60
                     flex items-center justify-center gap-2"
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
