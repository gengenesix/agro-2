'use client'

import { useEffect, useState }   from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { api }                   from '@/lib/api'

interface FarmerDetail {
  farmName:  string | null
  gpsLat:    number | null
  gpsLng:    number | null
  farmPhotos: string[]
  fieldVerifiedAt: string | null
  user: {
    fullName:          string
    phone:             string
    community:         string | null
    verificationLevel: string
    region:   { name: string } | null
    district: { name: string } | null
  }
}

export default function VerifyFarmPage() {
  const params          = useParams<{ id: string }>()
  const searchParams    = useSearchParams()
  const router          = useRouter()
  const justRegistered  = searchParams.get('registered') === '1'

  const [farmer, setFarmer]         = useState<FarmerDetail | null>(null)
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [success, setSuccess]       = useState(false)

  const [gpsLat, setGpsLat]         = useState<number | null>(null)
  const [gpsLng, setGpsLng]         = useState<number | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)
  const [notes, setNotes]           = useState('')
  const [photoUrls, setPhotoUrls]   = useState<string[]>([])

  useEffect(() => {
    api.get(`/field-agent/farmers`).then(res => {
      const all: FarmerDetail[] = res.data.data.farmers ?? []
      // Find by user.id — we stored as user.id in the list
      const match = (all as unknown as (FarmerDetail & { user: { id: string } })[])
        .find(f => f.user.id === params.id)
      if (match) setFarmer(match)
    }).finally(() => setLoading(false))
  }, [params.id])

  const captureGPS = () => {
    if (!navigator.geolocation) return
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGpsLat(pos.coords.latitude)
        setGpsLng(pos.coords.longitude)
        setGpsLoading(false)
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  const handleVerify = async () => {
    if (!gpsLat || !gpsLng) {
      setError('GPS coordinates are required to verify the farm.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await api.post(`/field-agent/verify-farm/${params.id}`, {
        gpsLat,
        gpsLng,
        farmPhotos:        photoUrls.length > 0 ? photoUrls : undefined,
        verificationNotes: notes || undefined,
      })
      setSuccess(true)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Verification failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-lg space-y-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-cream-dark rounded-2xl animate-pulse" />)}
      </div>
    )
  }

  if (success) {
    return (
      <div className="max-w-lg">
        <div className="bg-white rounded-2xl border border-border p-8 text-center">
          <div className="w-16 h-16 bg-lime rounded-full flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-forest fill-current">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-forest mb-2">Farm verified!</h2>
          <p className="text-sm text-muted-foreground mb-1">
            {farmer?.user.fullName} is now field-verified.
          </p>
          <p className="font-mono text-sm font-bold text-forest">+GHS 10.00 credited to your wallet</p>
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => router.push('/field-agent/register-farmer')}
              className="flex-1 h-11 bg-forest text-white rounded-xl font-bold text-sm hover:bg-forest-dark"
            >
              Register another
            </button>
            <button
              onClick={() => router.push('/field-agent/dashboard')}
              className="flex-1 h-11 border border-border rounded-xl font-semibold text-sm text-forest"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-forest">Verify farm</h1>
        {justRegistered && (
          <div className="mt-2 bg-lime/20 border border-lime/40 rounded-xl px-4 py-2.5">
            <p className="text-xs font-semibold text-forest">
              Farmer registered. Now capture GPS and verify the farm to earn GHS 10.
            </p>
          </div>
        )}
      </div>

      {/* Farmer info */}
      {farmer && (
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Farmer</h2>
          <p className="font-semibold text-forest">{farmer.user.fullName}</p>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">{farmer.user.phone}</p>
          <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
            {farmer.farmName && <span>{farmer.farmName}</span>}
            {farmer.user.community && <span>· {farmer.user.community}</span>}
            {farmer.user.district && <span>· {farmer.user.district.name}</span>}
          </div>
          {farmer.fieldVerifiedAt && (
            <p className="text-xs text-muted-foreground mt-2 italic">
              Already field-verified on {new Date(farmer.fieldVerifiedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* GPS capture */}
      <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Farm GPS <span className="text-destructive">*</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          Stand at the farm and capture GPS. This pins the exact farm location on the map.
        </p>
        {gpsLat && gpsLng ? (
          <div className="flex items-center gap-2 bg-lime/20 border border-lime/40 rounded-xl px-4 py-3">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-forest fill-current flex-shrink-0">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span className="font-mono text-xs text-forest">
              {gpsLat.toFixed(6)}, {gpsLng.toFixed(6)}
            </span>
            <button type="button" onClick={captureGPS}
              className="ml-auto text-xs text-muted-foreground underline">
              Recapture
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={captureGPS}
            disabled={gpsLoading}
            className="w-full h-12 border-2 border-dashed border-border rounded-xl text-sm
                       font-semibold text-muted-foreground hover:border-forest/30 transition-colors
                       disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
            </svg>
            {gpsLoading ? 'Getting GPS…' : 'Capture GPS coordinates'}
          </button>
        )}
      </div>

      {/* Notes */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
          Verification notes <span className="text-muted-foreground font-normal">(optional)</span>
        </h2>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="e.g. Farm is 4 acres of maize, irrigation in place, healthy crops"
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-border bg-cream text-sm
                     focus:outline-none focus:ring-2 focus:ring-lime resize-none"
        />
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl">{error}</div>
      )}

      <button
        onClick={handleVerify}
        disabled={submitting || !gpsLat || !gpsLng}
        className="w-full h-12 bg-forest text-white rounded-xl font-bold text-sm
                   hover:bg-forest-dark transition-colors disabled:opacity-60"
      >
        {submitting ? 'Verifying…' : 'Verify farm — earn GHS 10'}
      </button>
    </div>
  )
}
