'use client'

import dynamic          from 'next/dynamic'
import Link             from 'next/link'
import { Suspense, useEffect, useState } from 'react'
import { useSearchParams }               from 'next/navigation'
import { api }          from '@/lib/api'
import { formatRelative } from '@/lib/format'
import type { MapFarmer, AgentLocation } from '@/components/field-agent/farm-map'

const FarmMap = dynamic(() => import('@/components/field-agent/farm-map'), { ssr: false })

interface Farmer {
  id:                      string
  userId:                  string
  farmName:                string | null
  gpsLat:                  number | null
  gpsLng:                  number | null
  fieldVerifiedAt:         string | null
  verificationRequestedAt: string | null
  createdAt:               string
  user: {
    id:                string
    fullName:          string
    phone:             string
    verificationLevel: string
    community:         string | null
    region:            { name: string } | null
    district:          { name: string } | null
  }
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R    = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLng = (lng2 - lng1) * (Math.PI / 180)
  const a    = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function MapPageInner() {
  const searchParams = useSearchParams()
  const targetId     = searchParams.get('farmerId')

  const [farmers,  setFarmers]  = useState<Farmer[]>([])
  const [selected, setSelected] = useState<Farmer | null>(null)
  const [agentLoc, setAgentLoc] = useState<AgentLocation | null>(null)
  const [loading,  setLoading]  = useState(true)
  const [locating, setLocating] = useState(false)

  useEffect(() => {
    api.get('/field-agent/farmers?filter=pending&page=1')
      .then(r => {
        const list: Farmer[] = r.data.data.farmers ?? []
        setFarmers(list)
        if (targetId) {
          const match = list.find(f => f.id === targetId || f.userId === targetId)
          if (match) setSelected(match)
        }
      })
      .finally(() => setLoading(false))
  }, [targetId])

  function locate() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      pos  => { setAgentLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false) },
      ()   => setLocating(false),
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    )
  }

  const distance =
    selected?.gpsLat != null && selected?.gpsLng != null && agentLoc
      ? haversineKm(agentLoc.lat, agentLoc.lng, selected.gpsLat, selected.gpsLng)
      : null

  const mapFarmers: MapFarmer[] = farmers.map(f => ({
    id:                     f.id,
    gpsLat:                 f.gpsLat,
    gpsLng:                 f.gpsLng,
    user:                   { fullName: f.user.fullName },
    verificationRequested:  f.verificationRequestedAt != null,
  }))

  const selectedMapFarmer: MapFarmer | null = selected
    ? {
        id:                    selected.id,
        gpsLat:                selected.gpsLat,
        gpsLng:                selected.gpsLng,
        user:                  { fullName: selected.user.fullName },
        verificationRequested: selected.verificationRequestedAt != null,
      }
    : null

  const gpsCount       = farmers.filter(f => f.gpsLat != null).length
  const requestedCount = farmers.filter(f => f.verificationRequestedAt != null).length

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Discovery Map</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {loading
              ? 'Loading farmers…'
              : `${requestedCount} requested · ${gpsCount} with GPS coordinates`}
          </p>
        </div>
        <button
          onClick={locate}
          disabled={locating}
          className="flex items-center gap-2 px-4 py-2 bg-forest text-white text-xs font-bold
                     rounded-xl hover:bg-forest-dark transition-colors disabled:opacity-60"
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
               className="w-3.5 h-3.5" strokeLinecap="round">
            <circle cx="8" cy="8" r="3" />
            <path d="M8 1v2M8 13v2M1 8h2M13 8h2" />
          </svg>
          {locating ? 'Locating…' : agentLoc ? 'Update location' : 'Get my location'}
        </button>
      </div>

      {/* Full-width map */}
      <div className="w-full h-[calc(100vh-12rem)] rounded-2xl border border-forest/10
                      overflow-hidden shadow-sm relative">
        {loading ? (
          <div className="w-full h-full bg-cream-dark animate-pulse" />
        ) : (
          <FarmMap farmers={mapFarmers} selected={selectedMapFarmer} agentLoc={agentLoc} />
        )}

        {/* Floating farmer count badge */}
        {!loading && farmers.length > 0 && (
          <div className="absolute bottom-4 right-4 z-[400] pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm border border-border rounded-xl
                            px-3 py-2 shadow-sm space-y-1">
              {requestedCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-white"
                       style={{ background: '#d97706' }} />
                  <span className="text-[10px] font-semibold text-forest">
                    {requestedCount} verification requested
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-forest border-2 border-white" />
                <span className="text-[10px] font-semibold text-forest">
                  {farmers.length} in queue
                </span>
              </div>
              {agentLoc && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
                  <span className="text-[10px] font-semibold text-forest">Your location</span>
                </div>
              )}
              {selected && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-lime border-2 border-white" />
                  <span className="text-[10px] font-semibold text-forest">Selected farm</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected farmer panel */}
      {selected && (
        <div className="bg-white rounded-2xl border border-forest/20 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-forest/10 flex items-center justify-center
                            flex-shrink-0 text-forest font-bold">
              {selected.user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-forest">{selected.user.fullName}</p>
                {selected.gpsLat != null && (
                  <span className="text-[10px] font-bold bg-lime/30 text-forest px-2 py-0.5 rounded-full">
                    GPS recorded
                  </span>
                )}
                {distance != null && (
                  <span className="text-[10px] font-bold bg-forest/10 text-forest px-2 py-0.5 rounded-full font-mono">
                    {distance < 1 ? `${Math.round(distance * 1000)} m away` : `${distance.toFixed(1)} km away`}
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-muted-foreground mt-0.5">{selected.user.phone}</p>
              {[selected.user.community, selected.user.district?.name, selected.user.region?.name]
                .filter(Boolean).join(', ') && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {[selected.user.community, selected.user.district?.name, selected.user.region?.name]
                    .filter(Boolean).join(', ')}
                </p>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">
                Registered {formatRelative(selected.createdAt)}
              </p>
            </div>
            <Link
              href={`/field-agent/verify-farm/${selected.userId}`}
              className="flex-shrink-0 px-5 py-2.5 bg-forest text-white text-xs font-bold
                         rounded-xl hover:bg-forest-dark transition-colors"
            >
              Verify farmer
            </Link>
          </div>
        </div>
      )}

      {/* Farmer list — click to select on map */}
      {!loading && farmers.length > 0 && (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="font-bold text-forest text-sm">All unverified farmers</h2>
            <span className="text-[10px] text-muted-foreground">Click a row to pin on map</span>
          </div>
          <div className="divide-y divide-border">
            {farmers.map(f => {
              const isActive = selected?.id === f.id
              const hasGps   = f.gpsLat != null
              return (
                <button
                  key={f.id}
                  onClick={() => setSelected(f)}
                  className={`w-full text-left flex items-center gap-3 px-5 py-3 transition-colors
                              ${isActive ? 'bg-forest/5 border-l-4 border-forest' : 'hover:bg-cream/50'}`}
                >
                  <p className={`text-sm font-semibold flex-1 min-w-0 truncate
                                  ${isActive ? 'text-forest' : 'text-forest'}`}>
                    {f.user.fullName}
                  </p>
                  <span className="text-xs text-muted-foreground font-mono flex-shrink-0 hidden sm:block">
                    {f.user.phone}
                  </span>
                  {hasGps ? (
                    <span className="text-[10px] font-bold bg-lime/30 text-forest px-2 py-0.5 rounded-full flex-shrink-0">
                      GPS
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">No GPS</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AgentMapPage() {
  return (
    <Suspense fallback={<div className="w-full h-[calc(100vh-12rem)] bg-cream-dark rounded-2xl animate-pulse" />}>
      <MapPageInner />
    </Suspense>
  )
}
