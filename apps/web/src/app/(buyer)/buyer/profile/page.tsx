'use client'

import { useEffect, useState }       from 'react'
import Image                          from 'next/image'
import { useAuth }                    from '@/context/auth-context'
import { api }                        from '@/lib/api'
import { LogoutIcon, ProfileIcon }    from '@/components/shared/icons'
import { formatPhoneGhana }           from '@/lib/format'

const BUYER_TYPE_OPTIONS = [
  { value: 'hotel',       label: 'Hotel' },
  { value: 'restaurant',  label: 'Restaurant' },
  { value: 'processor',   label: 'Food Processor / Agro-Processor' },
  { value: 'retailer',    label: 'Retailer / Wholesaler' },
  { value: 'exporter',    label: 'Exporter' },
  { value: 'individual',  label: 'Individual Buyer' },
]

const COMMODITY_OPTIONS = [
  'Maize', 'Rice', 'Sorghum', 'Millet',
  'Cassava', 'Yam', 'Cocoyam', 'Sweet Potato',
  'Tomato', 'Pepper', 'Onion', 'Cabbage', 'Okra',
  'Mango', 'Pineapple', 'Banana', 'Plantain', 'Watermelon',
  'Cocoa', 'Cashew', 'Shea', 'Palm Oil',
  'Broiler Chicken', 'Eggs', 'Turkey', 'Guinea Fowl',
  'Tilapia', 'Catfish',
  'Cattle', 'Goat', 'Sheep',
  'NPK Fertilizer', 'Seeds',
]

interface BuyerProfileData {
  organizationName:    string
  buyerType:           string
  contactPerson:       string
  email:               string
  deliveryAddress:     string
  preferredCategories: string[]
}

export default function BuyerProfilePage() {
  const { user, logout } = useAuth()
  const [form, setForm]     = useState<BuyerProfileData>({
    organizationName:    '',
    buyerType:           'individual',
    contactPerson:       '',
    email:               '',
    deliveryAddress:     '',
    preferredCategories: [],
  })
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState<string | null>(null)

  useEffect(() => {
    api.get('/users/me/buyer-profile')
      .then(r => {
        const d = r.data?.data
        if (d) {
          setForm({
            organizationName:    d.organizationName    ?? '',
            buyerType:           d.buyerType           ?? 'individual',
            contactPerson:       d.contactPerson       ?? '',
            email:               d.email               ?? '',
            deliveryAddress:     d.deliveryAddress     ?? '',
            preferredCategories: d.preferredCategories ?? [],
          })
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function toggleCategory(cat: string) {
    setForm(f => ({
      ...f,
      preferredCategories: f.preferredCategories.includes(cat)
        ? f.preferredCategories.filter(c => c !== cat)
        : [...f.preferredCategories, cat],
    }))
  }

  async function handleSave() {
    setSaving(true)
    setError(null)
    try {
      await api.put('/users/me/buyer-profile', form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="font-bold text-forest text-lg">Profile</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your account and organisation details</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Identity card */}
        <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-cream-dark flex-shrink-0 border border-border">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt="" width={64} height={64} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ProfileIcon size={28} className="text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-forest text-lg leading-tight truncate">{user.fullName}</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {user.email ?? formatPhoneGhana(user.phone)}
            </p>
            <span className="inline-block mt-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full
                             bg-sector-fisheries-bg text-sector-fisheries border border-sector-fisheries/20 uppercase tracking-wide">
              Buyer Account
            </span>
          </div>
        </div>

        {/* Editable form */}
        {!loading && (
          <div className="bg-white rounded-2xl border border-border p-5 space-y-5">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Organisation details
            </h2>

            {/* Organisation name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-forest">
                Business / Organisation name
              </label>
              <input
                type="text"
                value={form.organizationName}
                onChange={e => setForm(f => ({ ...f, organizationName: e.target.value }))}
                placeholder="e.g. Accra Fresh Markets Ltd"
                className="w-full h-11 px-3.5 text-sm rounded-xl border border-border bg-cream
                           focus:outline-none focus:ring-2 focus:ring-lime/40 placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Buyer type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-forest">Buyer type</label>
              <select
                value={form.buyerType}
                onChange={e => setForm(f => ({ ...f, buyerType: e.target.value }))}
                className="w-full h-11 px-3.5 text-sm rounded-xl border border-border bg-cream
                           focus:outline-none focus:ring-2 focus:ring-lime/40"
              >
                {BUYER_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Contact person */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-forest">Contact person</label>
              <input
                type="text"
                value={form.contactPerson}
                onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))}
                placeholder="Full name of primary contact"
                className="w-full h-11 px-3.5 text-sm rounded-xl border border-border bg-cream
                           focus:outline-none focus:ring-2 focus:ring-lime/40 placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-forest">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="procurement@example.com"
                className="w-full h-11 px-3.5 text-sm rounded-xl border border-border bg-cream
                           focus:outline-none focus:ring-2 focus:ring-lime/40 placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Delivery address */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-forest">Delivery address</label>
              <textarea
                value={form.deliveryAddress}
                onChange={e => setForm(f => ({ ...f, deliveryAddress: e.target.value }))}
                rows={3}
                placeholder="Street address, district, region"
                className="w-full px-3.5 py-3 text-sm rounded-xl border border-border bg-cream resize-none
                           focus:outline-none focus:ring-2 focus:ring-lime/40 placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Preferred commodities */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-forest">
                Preferred commodities
                <span className="ml-1.5 text-muted-foreground font-normal">
                  ({form.preferredCategories.length} selected)
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {COMMODITY_OPTIONS.map(cat => {
                  const selected = form.preferredCategories.includes(cat)
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={`text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-colors
                        ${selected
                          ? 'bg-forest text-white border-forest'
                          : 'bg-cream text-muted-foreground border-border hover:border-forest/40 hover:text-forest'}`}
                    >
                      {cat}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-600 font-medium">{error}</p>
            )}

            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full h-11 rounded-xl text-sm font-bold transition-colors
                ${saved
                  ? 'bg-lime/20 text-forest border border-lime/40'
                  : 'bg-forest text-white hover:bg-forest-dark'}`}
            >
              {saving ? 'Saving…' : saved ? 'Saved!' : 'Save changes'}
            </button>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-border
                     text-sm font-semibold text-muted-foreground hover:text-red-600 hover:border-red-200
                     hover:bg-red-50 transition-colors"
        >
          <LogoutIcon size={16} />
          Sign out
        </button>
      </div>
    </main>
  )
}
