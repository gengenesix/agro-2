'use client'

import { useState }        from 'react'
import { useAuth }         from '@/context/auth-context'
import { api }             from '@/lib/api'
import { GHANA_REGIONS }   from '@agroconnect/types'

type Section = 'profile' | 'phone' | 'momo' | 'notifications'

export default function SettingsPage() {
  const { user }      = useAuth()
  const [section, setSection] = useState<Section>('profile')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState<string | null>(null)

  // Profile fields
  const [fullName, setFullName]   = useState(user?.fullName ?? '')
  const [regionId, setRegionId]   = useState('')
  const [community, setCommunity] = useState('')

  // Phone change
  const [newPhone, setNewPhone]   = useState('')
  const [otp, setOtp]             = useState('')
  const [otpSent, setOtpSent]     = useState(false)

  // MoMo
  const [momoNumber, setMomoNumber]   = useState('')
  const [momoNetwork, setMomoNetwork] = useState('')

  // Notifications
  const [smsOrders, setSmsOrders]     = useState(true)
  const [smsPrices, setSmsPrices]     = useState(true)
  const [smsWeather, setSmsWeather]   = useState(true)
  const [smsMarketing, setSmsMarketing] = useState(false)

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      if (section === 'profile') {
        await api.patch('/users/me', {
          fullName: fullName || undefined,
          regionId: regionId ? Number(regionId) : undefined,
          community: community || undefined,
        })
      } else if (section === 'notifications') {
        await api.patch('/users/me/notification-prefs', {
          smsOrders, smsPrices, smsWeather, smsMarketing,
        })
      } else if (section === 'momo') {
        await api.patch('/users/me', {
          mobileMoneyNumber:  momoNumber || undefined,
          mobileMoneyNetwork: momoNetwork || undefined,
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

  const sendOTP = async () => {
    if (!newPhone.match(/^0[235]\d{8}$/)) {
      setError('Enter a valid Ghana phone number')
      return
    }
    setError(null)
    try {
      await api.post('/auth/request-otp', { phone: newPhone })
      setOtpSent(true)
    } catch {
      setError('Failed to send OTP')
    }
  }

  const confirmPhoneChange = async () => {
    setError(null)
    setSaving(true)
    try {
      await api.post('/auth/verify-otp', { phone: newPhone, otp })
      setSaved(true)
      setOtpSent(false)
      setNewPhone('')
      setOtp('')
      setTimeout(() => setSaved(false), 2500)
    } catch {
      setError('Invalid OTP. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const tabs: { key: Section; label: string }[] = [
    { key: 'profile',       label: 'Profile'       },
    { key: 'phone',         label: 'Phone'         },
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
            className={`flex-1 min-w-max px-3 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
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

        {/* Profile section */}
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
                <option value="">Current: {user?.regionId ? `Region ${user.regionId}` : 'Not set'}</option>
                {GHANA_REGIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
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

        {/* Phone section */}
        {section === 'phone' && (
          <>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Change phone</h2>
            <div className="bg-cream-dark rounded-xl px-4 py-3">
              <p className="text-xs text-muted-foreground">Current number</p>
              <p className="font-mono text-sm font-bold text-forest mt-0.5">{user?.phone ?? '—'}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-forest mb-1.5">New phone number</label>
              <div className="flex gap-2">
                <input
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="0241234567"
                  type="tel"
                  className="flex-1 h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                             focus:ring-2 focus:ring-lime text-sm font-mono"
                />
                <button
                  type="button"
                  onClick={sendOTP}
                  disabled={otpSent}
                  className="h-11 px-4 bg-forest text-white rounded-xl text-xs font-bold
                             hover:bg-forest-dark disabled:opacity-60 whitespace-nowrap"
                >
                  {otpSent ? 'OTP sent' : 'Send OTP'}
                </button>
              </div>
            </div>
            {otpSent && (
              <div>
                <label className="block text-sm font-semibold text-forest mb-1.5">Enter OTP</label>
                <input
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                             focus:ring-2 focus:ring-lime text-sm font-mono text-center tracking-widest"
                />
              </div>
            )}
            {otpSent && (
              <button
                onClick={confirmPhoneChange}
                disabled={saving || otp.length < 4}
                className="w-full h-11 bg-forest text-white rounded-xl font-bold text-sm
                           hover:bg-forest-dark disabled:opacity-60"
              >
                {saving ? 'Confirming…' : 'Confirm new number'}
              </button>
            )}
          </>
        )}

        {/* MoMo section */}
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

        {/* Notifications section */}
        {section === 'notifications' && (
          <>
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              SMS notifications
            </h2>
            {[
              { label: 'Order updates', desc: 'When orders are confirmed, dispatched, delivered', value: smsOrders, set: setSmsOrders },
              { label: 'Price alerts', desc: 'When market prices hit your set targets', value: smsPrices, set: setSmsPrices },
              { label: 'Weather alerts', desc: 'Critical weather warnings for your region', value: smsWeather, set: setSmsWeather },
              { label: 'Promotions', desc: 'New features, tips, and AgroConnect news', value: smsMarketing, set: setSmsMarketing },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-semibold text-forest">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => item.set(!item.value)}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${
                    item.value ? 'bg-forest' : 'bg-border'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    item.value ? 'translate-x-5' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
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

      {section !== 'phone' && (
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
