'use client'

import { useEffect, useState, useRef } from 'react'
import { useAuth }    from '@/context/auth-context'
import { api }        from '@/lib/api'
import Image          from 'next/image'
import { AgroScoreBar } from '@/components/shared/agro-score-bar'
import { VerifiedBlueIcon, PremiumGreenIcon, LoadingIcon, LogoutIcon, PlusIcon } from '@/components/shared/icons'
import { formatPhoneGhana } from '@/lib/format'
import { GHANA_REGIONS }    from '@agroconnect/types'

export default function ProfilePage() {
  const { user, refresh, logout } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)

  const [saving, setSaving]   = useState(false)
  const [success, setSuccess] = useState(false)
  const [name, setName]       = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.fullName ?? '')
      setAvatarUrl(user.avatarUrl ?? '')
    }
  }, [user])

  async function handleAvatarUpload(file: File) {
    setUploading(true)
    const form = new FormData()
    form.append('avatar', file)
    try {
      const { data } = await api.post('/uploads/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setAvatarUrl(data.data.url)
    } finally {
      setUploading(false)
    }
  }

  async function saveProfile() {
    setSaving(true)
    try {
      await api.put('/users/me', { fullName: name, avatarUrl })
      await refresh()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  const isPremium  = user.verificationLevel === 'premium'
  const isVerified = ['field_verified', 'premium'].includes(user.verificationLevel ?? '')
  const farmer     = (user as any).farmerProfile

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="font-bold text-forest text-lg">Profile</h1>
          <button onClick={logout}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground
                       hover:text-red-500 transition-colors">
            <LogoutIcon size={15} />
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Avatar + basic */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-start gap-4 mb-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="relative w-20 h-20 rounded-2xl overflow-hidden bg-cream-dark
                           border-2 border-border hover:border-forest transition-colors group">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="" fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-forest text-lime font-bold text-2xl">
                    {user.fullName?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100
                                transition-opacity flex items-center justify-center">
                  {uploading
                    ? <LoadingIcon size={20} className="text-white animate-spin" />
                    : <PlusIcon size={20} className="text-white" />}
                </div>
              </button>
              {isVerified && (
                <div className="absolute -bottom-1 -right-1">
                  {isPremium ? <PremiumGreenIcon size={20} /> : <VerifiedBlueIcon size={20} />}
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground mb-1">Verification status</p>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full
                              bg-sector-fisheries-bg text-sector-fisheries border border-sector-fisheries/20 capitalize">
                {isVerified && <VerifiedBlueIcon size={12} />}
                {user.verificationLevel ?? 'Unverified'}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Phone: <span className="font-mono font-semibold text-forest">
                  {formatPhoneGhana(user.phone)}
                </span>
              </p>
            </div>
          </div>

          {/* Name field */}
          <div>
            <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2">Full name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-cream border border-border rounded-xl text-sm text-forest
                         focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/10"
            />
          </div>

          {success && (
            <p className="text-xs text-forest bg-lime/20 px-3 py-2 rounded-xl mt-3">
              Profile saved successfully.
            </p>
          )}

          <button onClick={saveProfile} disabled={saving}
            className="mt-4 w-full py-3 bg-forest text-white text-sm font-bold rounded-xl
                       hover:bg-forest-dark active:scale-[0.98] transition-all
                       disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><LoadingIcon size={15} className="animate-spin" /> Saving…</> : 'Save changes'}
          </button>
        </div>

        {/* AgroScore */}
        {farmer && (
          <div className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-forest text-sm">AgroScore</h2>
              <span className="font-mono text-lg font-bold text-forest">{farmer.agroScore ?? 0}/110</span>
            </div>
            <AgroScoreBar score={farmer.agroScore ?? 0} animate />
            <div className="grid grid-cols-2 gap-2 mt-4">
              {[
                { label: 'Farm name',    value: farmer.farmName },
                { label: 'Farm size',    value: farmer.farmSizeHectares ? `${farmer.farmSizeHectares} ha` : null },
                { label: 'Region',       value: GHANA_REGIONS.find(r => r.id === farmer.regionId)?.name },
                { label: 'District',     value: farmer.district },
              ].filter(s => s.value).map(s => (
                <div key={s.label} className="bg-cream rounded-xl p-3">
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  <p className="text-xs font-semibold text-forest mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Danger zone */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-bold text-red-600 text-sm mb-3">Account</h2>
          <button onClick={logout}
            className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-700 transition-colors">
            <LogoutIcon size={15} />
            Sign out of all devices
          </button>
        </div>
      </div>
    </main>
  )
}
