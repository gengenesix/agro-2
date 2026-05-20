'use client'

import { useEffect, useState, useRef } from 'react'
import Link          from 'next/link'
import { useAuth }   from '@/context/auth-context'
import { api }       from '@/lib/api'
import Image         from 'next/image'
import { AgroScoreBar } from '@/components/shared/agro-score-bar'
import {
  VerifiedBlueIcon, PremiumGreenIcon, LoadingIcon, LogoutIcon,
  PlusIcon, ChevronRightIcon, AgroScoreIcon, MapPinIcon,
} from '@/components/shared/icons'
import { formatPhoneGhana }   from '@/lib/format'
import { GHANA_REGIONS }      from '@/lib/types'
import { FarmLocationMap }    from '@/components/shared/farm-location-map'

interface FarmerProfile {
  farmName:          string | null
  farmSizeAcres:     number | null
  gpsLat:            number | null
  gpsLng:            number | null
  sectors:           string[]
  farmPhotos:        string[]
  mobileMoneyNumber: string | null
  nationalId:        string | null
}

const SECTORS = [
  { value: 'crops',     label: 'Crops'     },
  { value: 'livestock', label: 'Livestock' },
  { value: 'poultry',   label: 'Poultry'   },
  { value: 'fisheries', label: 'Fisheries' },
]

const LEVEL_ORDER = ['unverified', 'self_declared', 'field_verified', 'premium']

const LEVEL_BADGE: Record<string, string> = {
  unverified:     'bg-cream-dark text-muted-foreground border-border',
  self_declared:  'bg-lime/15 text-forest border-lime/30',
  field_verified: 'bg-sector-fisheries-bg text-sector-fisheries border-sector-fisheries/30',
  premium:        'bg-sector-crops-bg text-sector-crops border-sector-crops/30',
}
const LEVEL_LABEL: Record<string, string> = {
  unverified:     'Unverified',
  self_declared:  'Self-Declared',
  field_verified: 'Field Verified',
  premium:        'Premium Verified',
}

export default function ProfilePage() {
  const { user, refresh, logout } = useAuth()
  const avatarRef  = useRef<HTMLInputElement>(null)
  const photosRef  = useRef<HTMLInputElement>(null)

  const [saving, setSaving]         = useState(false)
  const [savingFarm, setSavingFarm] = useState(false)
  const [success, setSuccess]       = useState(false)
  const [farmSuccess, setFarmSuccess] = useState(false)
  const [saveError, setSaveError]     = useState('')
  const [farmSaveError, setFarmSaveError] = useState('')

  // Basic profile
  const [name, setName]         = useState('')
  const [regionId, setRegionId] = useState<number | ''>('')
  const [district, setDistrict] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  // Farm profile
  const [fp, setFp]                       = useState<FarmerProfile | null>(null)
  const [farmName, setFarmName]           = useState('')
  const [farmSizeHa, setFarmSizeHa]       = useState('')
  const [sectors, setSectors]             = useState<string[]>([])
  const [gps, setGps]                     = useState<{ lat: number; lng: number } | null>(null)
  const [gpsLoading, setGpsLoading]       = useState(false)
  const [farmPhotos, setFarmPhotos]       = useState<string[]>([])
  const [photosUploading, setPhotosUploading] = useState(false)
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState('')
  const [nationalId, setNationalId]       = useState('')
  const [kycSection, setKycSection]       = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.fullName ?? '')
      setAvatarUrl(user.avatarUrl ?? '')
      setRegionId(user.regionId ?? '')
      setDistrict(user.community ?? '')
    }
  }, [user])

  useEffect(() => {
    api.get('/users/me/farmer-profile').then(r => {
      const d: FarmerProfile | null = r.data.data
      if (d) {
        setFp(d)
        setFarmName(d.farmName ?? '')
        setFarmSizeHa(d.farmSizeAcres ? (d.farmSizeAcres / 2.47105).toFixed(2) : '')
        setSectors(d.sectors ?? [])
        if (d.gpsLat && d.gpsLng) setGps({ lat: d.gpsLat, lng: d.gpsLng })
        setFarmPhotos(d.farmPhotos ?? [])
        setMobileMoneyNumber(d.mobileMoneyNumber ?? '')
        setNationalId(d.nationalId ?? '')
      }
    }).catch(() => {})
  }, [])

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

  async function handleFarmPhotos(files: FileList) {
    setPhotosUploading(true)
    const uploaded: string[] = []
    for (const file of Array.from(files)) {
      const form = new FormData()
      form.append('avatar', file)
      try {
        const { data } = await api.post('/uploads/avatar', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        uploaded.push(data.data.url)
      } catch { /* skip failed uploads */ }
    }
    setFarmPhotos(prev => [...prev, ...uploaded])
    setPhotosUploading(false)
  }

  function captureGPS() {
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGpsLoading(false)
      },
      () => setGpsLoading(false),
      { timeout: 10_000 },
    )
  }

  function toggleSector(v: string) {
    setSectors(prev => prev.includes(v) ? prev.filter(s => s !== v) : [...prev, v])
  }

  async function saveProfile() {
    setSaving(true)
    setSaveError('')
    try {
      const body: Record<string, unknown> = {
        avatarUrl: avatarUrl || null,
        regionId:  regionId || null,
        community: district || null,
      }
      if (name.trim().length >= 2) body.fullName = name.trim()
      await api.put('/users/me', body)
      await refresh()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setSaveError('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function saveFarmProfile() {
    setSavingFarm(true)
    setFarmSaveError('')
    try {
      await api.put('/users/me/farmer-profile', {
        farmName:          farmName || null,
        farmSizeHectares:  farmSizeHa ? Number(farmSizeHa) : null,
        sectors,
        gpsLat:            gps?.lat ?? null,
        gpsLng:            gps?.lng ?? null,
        mobileMoneyNumber: mobileMoneyNumber || null,
        nationalId:        nationalId || null,
        ...(farmPhotos.length > 0 && { farmPhotos }),
      })
      await refresh()
      setFarmSuccess(true)
      setTimeout(() => setFarmSuccess(false), 3000)
    } catch {
      setFarmSaveError('Failed to save farm profile. Please try again.')
    } finally {
      setSavingFarm(false)
    }
  }

    if (!user) return null

    const verificationLevel  = user.verificationLevel ?? 'unverified'
    const currentLevelIndex  = LEVEL_ORDER.indexOf(verificationLevel)

    // Completeness checklist for self-declared verification
    const completeness = [
      { label: 'Full name set',         done: !!(user.fullName && user.fullName.length > 1) },
      { label: 'Farm name set',         done: !!farmName },
      { label: 'Region selected',       done: !!regionId },
      { label: 'GPS location captured', done: !!gps },
      { label: 'Mobile Money linked',   done: !!mobileMoneyNumber },
      { label: '2+ farm photos',        done: farmPhotos.length >= 2 },
    ]
    const completenessScore = completeness.filter(c => c.done).length
    const allDoneForSelfDeclared = completenessScore >= 4

  return (
    <main className="min-h-screen bg-cream pb-24">
      <div className="bg-white border-b border-border sticky top-0 z-30">
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

        {/* ── Avatar + basic info ── */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-start gap-4 mb-5">
            <div className="relative flex-shrink-0">
              <button onClick={() => avatarRef.current?.click()} disabled={uploading}
                className="relative w-20 h-20 rounded-2xl overflow-hidden bg-cream-dark
                           border-2 border-border hover:border-forest transition-colors group">
                {avatarUrl ? (
                  <Image src={avatarUrl} alt="" fill sizes="80px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-forest text-lime font-bold text-2xl">
                    {user.fullName?.charAt(0)?.toUpperCase() || user.phone?.charAt(4) || '?'}
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100
                                transition-opacity flex items-center justify-center">
                  {uploading
                    ? <LoadingIcon size={20} className="text-white animate-spin" />
                    : <PlusIcon size={20} className="text-white" />}
                </div>
              </button>
              {verificationLevel !== 'unverified' && (
                <div className="absolute -bottom-1 -right-1">
                  {verificationLevel === 'premium'
                    ? <PremiumGreenIcon size={20} />
                    : <VerifiedBlueIcon size={20} />}
                </div>
              )}
              <input ref={avatarRef} type="file" accept="image/*" className="hidden"
                onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <div>
                <p className="font-bold text-forest text-base leading-tight">
                  {user.fullName || 'No name set'}
                </p>
                <p className="text-xs text-muted-foreground font-mono mt-0.5">
                  {formatPhoneGhana(user.phone)}
                </p>
              </div>
              <div className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1
                              rounded-full border capitalize self-start ${LEVEL_BADGE[verificationLevel]}`}>
                {verificationLevel !== 'unverified' && <VerifiedBlueIcon size={11} />}
                {LEVEL_LABEL[verificationLevel]}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-1.5">
                Full name
              </label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-2.5 bg-cream border border-border rounded-xl text-sm
                           text-forest focus:border-forest focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-1.5">
                  Region
                </label>
                <select
                  value={regionId}
                  onChange={e => setRegionId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2.5 bg-cream border border-border rounded-xl text-sm
                             text-forest focus:border-forest focus:outline-none"
                >
                  <option value="">Select region</option>
                  {GHANA_REGIONS.map(r => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-1.5">
                  District / Community
                </label>
                <input
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  placeholder="e.g. Kumasi Metro"
                  className="w-full px-3 py-2.5 bg-cream border border-border rounded-xl text-sm
                             text-forest focus:border-forest focus:outline-none"
                />
              </div>
            </div>
          </div>

          {success && (
            <p className="text-xs text-forest bg-lime/20 px-3 py-2 rounded-xl mt-3">
              Profile saved.
            </p>
          )}
          {saveError && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl mt-3">
              {saveError}
            </p>
          )}

          <button onClick={saveProfile} disabled={saving}
            className="mt-4 w-full py-3 bg-forest text-white text-sm font-bold rounded-xl
                       hover:bg-forest-dark active:scale-[0.98] transition-all
                       disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <><LoadingIcon size={15} className="animate-spin" /> Saving…</> : 'Save profile'}
          </button>
        </div>

        {/* ── Farm Profile ── */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-bold text-forest text-sm mb-4">Farm Details</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-1.5">
                  Farm name
                </label>
                <input
                  value={farmName}
                  onChange={e => setFarmName(e.target.value)}
                  placeholder="e.g. Asante Family Farm"
                  className="w-full px-3 py-2.5 bg-cream border border-border rounded-xl text-sm
                             text-forest focus:border-forest focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-1.5">
                  Size (hectares)
                </label>
                <input
                  type="number" step="0.1" min="0"
                  value={farmSizeHa}
                  onChange={e => setFarmSizeHa(e.target.value)}
                  placeholder="e.g. 2.5"
                  className="w-full px-3 py-2.5 bg-cream border border-border rounded-xl text-sm
                             font-mono text-forest focus:border-forest focus:outline-none"
                />
              </div>
            </div>

            {/* Sectors */}
            <div>
              <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2">
                Farming sectors
              </label>
              <div className="flex flex-wrap gap-2">
                {SECTORS.map(s => {
                  const active = sectors.includes(s.value)
                  return (
                    <button key={s.value} type="button" onClick={() => toggleSector(s.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors
                        ${active
                          ? 'bg-forest text-white border-forest'
                          : 'bg-cream text-muted-foreground border-border hover:border-forest hover:text-forest'}`}>
                      {s.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* GPS */}
            <div>
              <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2">
                Farm GPS location
              </label>
              {gps ? (
                <div className="space-y-2">
                  <FarmLocationMap
                    lat={gps.lat}
                    lng={gps.lng}
                    onMove={(lat, lng) => setGps({ lat, lng })}
                    height="200px"
                  />
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-muted-foreground">
                      {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
                    </span>
                    <button type="button" onClick={() => setGps(null)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors font-semibold">
                      Remove location
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={captureGPS} disabled={gpsLoading}
                  className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm
                             font-semibold text-forest hover:bg-cream transition-colors disabled:opacity-50 w-full justify-center">
                  {gpsLoading
                    ? <><LoadingIcon size={14} className="animate-spin" /> Locating your farm…</>
                    : <><MapPinIcon size={14} /> Capture GPS location</>}
                </button>
              )}
              <p className="text-[11px] text-muted-foreground mt-1.5">
                GPS improves your AgroScore and helps buyers find your farm. Drag the pin to adjust.
              </p>
            </div>

            {/* Mobile Money */}
            <div>
              <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-1.5">
                Mobile Money number
              </label>
              <input
                value={mobileMoneyNumber}
                onChange={e => setMobileMoneyNumber(e.target.value)}
                placeholder="+233XXXXXXXXX"
                className="w-full px-3 py-2.5 bg-cream border border-border rounded-xl text-sm
                           font-mono text-forest focus:border-forest focus:outline-none"
              />
            </div>

            {/* Farm Photos */}
            <div>
              <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2">
                Farm photos <span className="text-muted-foreground font-normal normal-case">({farmPhotos.length}/6)</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {farmPhotos.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                    <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setFarmPhotos(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full text-white
                                 flex items-center justify-center text-[10px] font-bold hover:bg-black/80">
                      ×
                    </button>
                  </div>
                ))}
                {farmPhotos.length < 6 && (
                  <button type="button" onClick={() => photosRef.current?.click()}
                    disabled={photosUploading}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex flex-col
                               items-center justify-center gap-1 text-muted-foreground hover:border-forest
                               hover:text-forest transition-colors disabled:opacity-50">
                    {photosUploading
                      ? <LoadingIcon size={16} className="animate-spin" />
                      : <><PlusIcon size={16} /><span className="text-[9px] font-semibold">Add photo</span></>}
                  </button>
                )}
              </div>
              <input ref={photosRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => e.target.files && handleFarmPhotos(e.target.files)} />
              <p className="text-[11px] text-muted-foreground">
                At least 2 photos required for Field Verification.
              </p>
            </div>
          </div>

          {farmSuccess && (
            <p className="text-xs text-forest bg-lime/20 px-3 py-2 rounded-xl mt-3">
              Farm profile saved.
            </p>
          )}
          {farmSaveError && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-xl mt-3">
              {farmSaveError}
            </p>
          )}

          <button onClick={saveFarmProfile} disabled={savingFarm}
            className="mt-4 w-full py-3 bg-forest text-white text-sm font-bold rounded-xl
                       hover:bg-forest-dark active:scale-[0.98] transition-all
                       disabled:opacity-50 flex items-center justify-center gap-2">
            {savingFarm ? <><LoadingIcon size={15} className="animate-spin" /> Saving…</> : 'Save farm profile'}
          </button>
        </div>

        {/* ── AgroScore ── */}
        <Link href="/score"
          className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4
                     hover:bg-cream transition-colors group">
          <div className="p-3 bg-lime/15 rounded-xl">
            <AgroScoreIcon size={22} className="text-forest" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-forest">AgroScore</p>
              <span className="font-mono text-lg font-extrabold text-forest">
                {user.agroScore ?? 0}<span className="text-xs text-muted-foreground font-sans font-normal">/110</span>
              </span>
            </div>
            <AgroScoreBar score={user.agroScore ?? 0} size="sm" />
          </div>
          <ChevronRightIcon size={16} className="text-muted-foreground/40 shrink-0" />
        </Link>

        {/* ── Verification ── */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-bold text-forest text-sm mb-1">Verification</h2>
          <p className="text-xs text-muted-foreground mb-4">
            Complete each level to earn AgroScore points and build buyer trust.
          </p>

          {/* Self-Declared */}
          <div className={`rounded-xl border p-4 mb-3 transition-colors
            ${currentLevelIndex >= 1
              ? 'bg-lime/15 border-lime/30 text-forest'
              : 'bg-cream-dark border-border text-muted-foreground'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {currentLevelIndex >= 1
                  ? <VerifiedBlueIcon size={14} />
                  : <span className="w-3.5 h-3.5 rounded-full border-2 border-current opacity-40" />}
                <span className="text-xs font-bold">Self-Declared</span>
                {verificationLevel === 'self_declared' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white/60 rounded-full">Current</span>
                )}
              </div>
              <span className="text-[10px] font-bold opacity-70">+10 AgroScore</span>
            </div>
            <div className="space-y-2">
              {completeness.map(item => (
                <div key={item.label} className="flex items-center gap-2 text-[11px]">
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0
                    ${item.done
                      ? 'bg-forest text-white'
                      : 'border border-current opacity-50 bg-white/50'}`}>
                    {item.done ? '✓' : ''}
                  </span>
                  <span className={item.done ? 'opacity-60 line-through' : ''}>{item.label}</span>
                </div>
              ))}
            </div>
            {currentLevelIndex < 1 && (
              <div className="mt-3 pt-3 border-t border-current/10">
                <p className="text-[11px] font-semibold mb-1">
                  {completenessScore}/6 complete — {6 - completenessScore} more field{6 - completenessScore !== 1 ? 's' : ''} needed
                </p>
                <div className="w-full bg-current/10 rounded-full h-1.5">
                  <div
                    className="bg-forest h-1.5 rounded-full transition-all"
                    style={{ width: `${(completenessScore / 6) * 100}%` }}
                  />
                </div>
                {allDoneForSelfDeclared && (
                  <p className="text-[11px] mt-2 font-semibold text-forest">
                    Profile complete — status will update within 24 hours.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Field Verified */}
          <div className={`rounded-xl border p-4 mb-3 transition-colors
            ${currentLevelIndex >= 2
              ? 'bg-sector-fisheries-bg border-sector-fisheries/30 text-sector-fisheries'
              : 'bg-cream-dark border-border text-muted-foreground'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {currentLevelIndex >= 2
                  ? <VerifiedBlueIcon size={14} />
                  : <span className="w-3.5 h-3.5 rounded-full border-2 border-current opacity-40" />}
                <span className="text-xs font-bold">Field Verified</span>
                {verificationLevel === 'field_verified' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white/60 rounded-full">Current</span>
                )}
              </div>
              <span className="text-[10px] font-bold opacity-70">+20 AgroScore</span>
            </div>
            {currentLevelIndex < 2 && (
              <div className="space-y-2 mb-3">
                {[
                  { label: 'Ghana Card number', done: !!fp?.nationalId },
                  { label: '2+ farm photos uploaded', done: farmPhotos.length >= 2 },
                  { label: 'GPS location set',  done: !!gps },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2 text-[11px]">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0
                      ${item.done ? 'bg-sector-fisheries text-white' : 'border border-current opacity-50 bg-white/50'}`}>
                      {item.done ? '✓' : ''}
                    </span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            )}
            {/* KYC link */}
            {currentLevelIndex < 2 && (
              <Link href="/kyc"
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold
                           text-sector-fisheries hover:underline underline-offset-2">
                Submit Ghana Card &amp; selfie for KYC
                <ChevronRightIcon size={11} />
              </Link>
            )}
          </div>

          {/* Premium Verified */}
          <div className={`rounded-xl border p-4 transition-colors
            ${currentLevelIndex >= 3
              ? 'bg-sector-crops-bg border-sector-crops/30 text-sector-crops'
              : 'bg-cream-dark border-border text-muted-foreground'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {currentLevelIndex >= 3
                  ? <PremiumGreenIcon size={14} />
                  : <span className="w-3.5 h-3.5 rounded-full border-2 border-current opacity-40" />}
                <span className="text-xs font-bold">Premium Verified</span>
                {verificationLevel === 'premium' && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-white/60 rounded-full">Current</span>
                )}
              </div>
              <span className="text-[10px] font-bold opacity-70">+30 AgroScore</span>
            </div>
            <ul className="space-y-1">
              {['Complete Field Verification first', 'Lab-test your produce quality', 'Submit test certificates', 'Annual renewal required'].map(s => (
                <li key={s} className="text-[11px] opacity-70 flex items-start gap-1.5">
                  <span className="mt-0.5 shrink-0">{currentLevelIndex >= 3 ? '✓' : '·'}</span>{s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Quick links ── */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {[
            { href: '/settings',  label: 'Account settings'       },
            { href: '/kyc',       label: 'Identity verification (KYC)' },
            { href: '/bnpl',      label: 'BNPL credit'             },
            { href: '/score',     label: 'Full AgroScore breakdown'},
          ].map(({ href, label }) => (
            <Link key={href} href={href}
              className="flex items-center justify-between px-5 py-3.5 border-b border-border last:border-0
                         hover:bg-cream transition-colors">
              <span className="text-sm font-semibold text-forest">{label}</span>
              <ChevronRightIcon size={14} className="text-muted-foreground/40" />
            </Link>
          ))}
        </div>

        {/* ── Sign out ── */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <button onClick={logout}
            className="flex items-center gap-2 text-sm font-semibold text-red-500
                       hover:text-red-700 transition-colors">
            <LogoutIcon size={15} />
            Sign out
          </button>
        </div>
      </div>
    </main>
  )
}
