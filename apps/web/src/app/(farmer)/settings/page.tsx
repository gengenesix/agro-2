'use client'

import { useState, useEffect } from 'react'
import { useAuth }  from '@/context/auth-context'
import { api }      from '@/lib/api'
import { GHANA_REGIONS } from '@/lib/types'

type Section = 'profile' | 'momo' | 'notifications'

const NOTIF_KEY = 'agro_notif_prefs'

interface NotifPrefs {
  orders:    boolean
  prices:    boolean
  weather:   boolean
  marketing: boolean
}

function loadNotifPrefs(): NotifPrefs {
  if (typeof window === 'undefined') {
    return { orders: true, prices: true, weather: true, marketing: false }
  }
  try {
    const raw = localStorage.getItem(NOTIF_KEY)
    if (raw) return JSON.parse(raw) as NotifPrefs
  } catch { /* ignore */ }
  return { orders: true, prices: true, weather: true, marketing: false }
}

export default function SettingsPage() {
  const { user, refresh } = useAuth()
  const [section, setSection] = useState<Section>('profile')
  const [saving, setSaving]   = useState(false)
  const [saved,  setSaved]    = useState(false)
  const [error,  setError]    = useState<string | null>(null)

  // Profile fields
  const [fullName,  setFullName]  = useState('')
  const [regionId,  setRegionId]  = useState('')
  const [community, setCommunity] = useState('')

  // MoMo
  const [momoNumber,  setMomoNumber]  = useState('')
  const [momoNetwork, setMomoNetwork] = useState('')

  // Notifications — stored in localStorage, not the server
  const [notif, setNotif] = useState<NotifPrefs>(loadNotifPrefs)

  // Sync profile fields when user loads (may be null on first render)
  useEffect(() => {
    if (!user) return
    setFullName(user.fullName ?? '')
    setRegionId(user.regionId?.toString() ?? '')
    setCommunity(user.community ?? '')
  }, [user])

  // Load MoMo from farmer profile
  useEffect(() => {
    api.get('/users/me/farmer-profile').then(r => {
      const d = r.data?.data
      if (!d) return
      setMomoNumber(d.mobileMoneyNumber ?? '')
      setMomoNetwork(d.mobileMoneyNetwork ?? '')
    }).catch(() => {})
  }, [])

  function toggleNotif(key: keyof NotifPrefs) {
    const next = { ...notif, [key]: !notif[key] }
    setNotif(next)
    try { localStorage.setItem(NOTIF_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }

  const currentRegionName = GHANA_REGIONS.find(r => r.id.toString() === regionId)?.name

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      if (section === 'profile') {
        await api.patch('/users/me', {
          fullName:  fullName || undefined,
          regionId:  regionId ? Number(regionId) : undefined,
          community: community || undefined,
        })
        await refresh()
      } else if (section === 'momo') {
        await api.put('/users/me/farmer-profile', {
          mobileMoneyNumber:  momoNumber  || null,
          mobileMoneyNetwork: momoNetwork || null,
        })
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const tabs: { key: Section; label: string }[] = [
    { key: 'profile',       label: 'Profile'       },
    { key: 'momo',          label: 'Mobile Money'  },
    { key: 'notifications', label: 'Notifications' },
  ]

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-forest">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your account preferences</p>
      </div>

      {/* Tab strip */}
      <div className="flex gap-1 bg-cream-dark rounded-xl p-1 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setSection(t.key); setError(null); setSaved(false) }}
            className={`flex-1 min-w-max px-3 py-2 rounded-lg text-xs font-semibold transition-colors
                        whitespace-nowrap ${
              section === t.key
                ? 'bg-white text-forest shadow-sm'
                : 'text-muted-foreground hover:text-forest'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border p-5 space-y-4">

        {/* ── Profile ──────────────────────────────────────────────────── */}
        {section === 'profile' && (
          <>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Profile details
            </h2>
            <div>
              <label className="block text-sm font-semibold text-forest mb-1.5">Full name</label>
              <input
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Your full name"
                className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                           focus:ring-2 focus:ring-lime text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-forest mb-1.5">Region</label>
              <select
                value={regionId}
                onChange={e => setRegionId(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                           focus:ring-2 focus:ring-lime text-sm"
              >
                <option value="">
                  {currentRegionName ? `Current: ${currentRegionName}` : 'Select region'}
                </option>
                {GHANA_REGIONS.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-forest mb-1.5">Community</label>
              <input
                value={community}
                onChange={e => setCommunity(e.target.value)}
                placeholder="e.g. Nsawam"
                className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                           focus:ring-2 focus:ring-lime text-sm"
              />
            </div>
          </>
        )}

        {/* ── Mobile Money ──────────────────────────────────────────────── */}
        {section === 'momo' && (
          <>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Mobile Money
            </h2>
            <p className="text-xs text-muted-foreground">
              This number receives your sale proceeds and is used for BNPL repayments.
            </p>
            <div>
              <label className="block text-sm font-semibold text-forest mb-1.5">MoMo number</label>
              <input
                value={momoNumber}
                onChange={e => setMomoNumber(e.target.value)}
                placeholder="0241234567"
                type="tel"
                className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                           focus:ring-2 focus:ring-lime text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-forest mb-1.5">Network</label>
              <select
                value={momoNetwork}
                onChange={e => setMomoNetwork(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                           focus:ring-2 focus:ring-lime text-sm"
              >
                <option value="">Select network</option>
                <option value="mtn">MTN Mobile Money</option>
                <option value="vodafone">Vodafone Cash</option>
                <option value="airteltigo">AirtelTigo Money</option>
              </select>
            </div>
          </>
        )}

        {/* ── Notifications ─────────────────────────────────────────────── */}
        {section === 'notifications' && (
          <>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              SMS notifications
            </h2>
            {([
              { key: 'orders'    as const, label: 'Order updates',  desc: 'When orders are confirmed, dispatched, or delivered'  },
              { key: 'prices'    as const, label: 'Price alerts',   desc: 'When market prices hit your set targets'              },
              { key: 'weather'   as const, label: 'Weather alerts', desc: 'Critical weather warnings for your region'            },
              { key: 'marketing' as const, label: 'Promotions',     desc: 'New features, tips, and AgroConnect news'            },
            ] as const).map(item => (
              <div key={item.key} className="flex items-center justify-between py-2.5
                                             border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-semibold text-forest">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notif[item.key]}
                  onClick={() => toggleNotif(item.key)}
                  className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${
                    notif[item.key] ? 'bg-forest' : 'bg-border'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm
                                transition-transform duration-200 ${
                      notif[item.key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-1">
              Notification preferences are saved on this device.
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl">{error}</div>
      )}
      {saved && (
        <div className="bg-lime/20 border border-lime/40 text-forest text-sm font-semibold
                        px-4 py-3 rounded-xl">
          Settings saved.
        </div>
      )}

      {section !== 'notifications' && (
        <button
          onClick={save}
          disabled={saving}
          className="w-full h-12 bg-forest text-white rounded-xl font-bold text-sm
                     hover:bg-forest-dark transition-colors disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      )}
    </div>
  )
}
