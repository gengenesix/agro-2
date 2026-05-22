'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/auth-context'

type Section = 'momo' | 'notifications'

const NOTIF_KEY = 'agro_notif_prefs'
const MOMO_KEY  = 'agent_momo_prefs'

interface NotifPrefs {
  orders:    boolean
  prices:    boolean
  weather:   boolean
  marketing: boolean
}

interface MomoPrefs {
  number:  string
  network: string
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

function loadMomoPrefs(): MomoPrefs {
  if (typeof window === 'undefined') return { number: '', network: '' }
  try {
    const raw = localStorage.getItem(MOMO_KEY)
    if (raw) return JSON.parse(raw) as MomoPrefs
  } catch { /* ignore */ }
  return { number: '', network: '' }
}

export default function AgentSettingsPage() {
  const { user }                          = useAuth()
  const [section, setSection]             = useState<Section>('momo')
  const [saved,  setSaved]                = useState(false)

  const [momoNumber,  setMomoNumber]      = useState('')
  const [momoNetwork, setMomoNetwork]     = useState('')
  const [notif, setNotif]                 = useState<NotifPrefs>(loadNotifPrefs)

  useEffect(() => {
    const prefs = loadMomoPrefs()
    setMomoNumber(prefs.number)
    setMomoNetwork(prefs.network)
  }, [])

  function toggleNotif(key: keyof NotifPrefs) {
    const next = { ...notif, [key]: !notif[key] }
    setNotif(next)
    try { localStorage.setItem(NOTIF_KEY, JSON.stringify(next)) } catch { /* ignore */ }
  }

  function saveMomo() {
    try {
      localStorage.setItem(MOMO_KEY, JSON.stringify({ number: momoNumber, network: momoNetwork }))
    } catch { /* ignore */ }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (!user) return null

  const tabs: { key: Section; label: string }[] = [
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
      <div className="flex gap-1 bg-cream-dark rounded-xl p-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setSection(t.key); setSaved(false) }}
            className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
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

        {/* ── Mobile Money ──────────────────────────────────────────────── */}
        {section === 'momo' && (
          <>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Payout Account
            </h2>
            <p className="text-xs text-muted-foreground">
              Commission earnings will be sent to this Mobile Money number when you withdraw.
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
            <p className="text-xs text-muted-foreground">Saved on this device.</p>
          </>
        )}

        {/* ── Notifications ─────────────────────────────────────────────── */}
        {section === 'notifications' && (
          <>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              SMS notifications
            </h2>
            {([
              { key: 'orders'    as const, label: 'Registration updates', desc: 'When farmer registrations are approved or reviewed'   },
              { key: 'prices'    as const, label: 'Price alerts',         desc: 'When market prices hit significant changes'           },
              { key: 'weather'   as const, label: 'Weather alerts',       desc: 'Critical weather warnings for your active region'     },
              { key: 'marketing' as const, label: 'Promotions',           desc: 'New features, tips, and AgroConnect news'             },
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
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full items-center transition-colors duration-200 ease-in-out focus:outline-none ${
                    notif[item.key] ? 'bg-forest' : 'bg-border'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notif[item.key] ? 'translate-x-5' : 'translate-x-1'
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

      {saved && (
        <div className="bg-lime/20 border border-lime/40 text-forest text-sm font-semibold
                        px-4 py-3 rounded-xl">
          Settings saved.
        </div>
      )}

      {section === 'momo' && (
        <button
          onClick={saveMomo}
          className="w-full h-12 bg-forest text-white rounded-xl font-bold text-sm
                     hover:bg-forest-dark transition-colors"
        >
          Save changes
        </button>
      )}
    </div>
  )
}
