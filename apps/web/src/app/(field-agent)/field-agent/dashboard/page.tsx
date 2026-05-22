'use client'

import Link    from 'next/link'
import { useEffect, useState } from 'react'
import { api }             from '@/lib/api'
import { formatGHS, formatRelative } from '@/lib/format'

interface Stats {
  totalVerified:     number
  verifiedThisMonth: number
  pendingInRegion:   number
  earningsThisMonth: number
  walletBalance:     number
}

interface Farmer {
  id:              string
  userId:          string
  farmName:        string | null
  gpsLat:          number | null
  gpsLng:          number | null
  fieldVerifiedAt: string | null
  createdAt:       string
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

export default function FieldAgentDashboard() {
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [pending, setPending] = useState<Farmer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/field-agent/stats'),
      api.get('/field-agent/farmers?filter=pending&page=1'),
    ]).then(([sr, fr]) => {
      setStats(sr.data.data)
      setPending(fr.data.data.farmers ?? [])
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-cream-dark rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  const kpis = stats ? [
    { label: 'Total verified',    value: String(stats.totalVerified),     bg: 'bg-forest',  text: 'text-white'            },
    { label: 'This month',        value: String(stats.verifiedThisMonth), bg: 'bg-lime/30', text: 'text-forest'           },
    { label: 'Pending in region', value: String(stats.pendingInRegion),   bg: 'bg-white',   text: 'text-forest'           },
    { label: 'Wallet balance',    value: formatGHS(stats.walletBalance),  bg: 'bg-white',   text: 'text-forest font-mono' },
  ] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {stats
              ? `GHS 10 per farmer verified · ${formatGHS(stats.earningsThisMonth)} earned this month`
              : 'Loading…'}
          </p>
        </div>
        <Link
          href="/field-agent/register-farmer"
          className="flex-shrink-0 px-4 py-2 bg-lime text-forest text-xs font-bold rounded-xl
                     hover:bg-lime-dark transition-colors"
        >
          + Register new
        </Link>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map(k => (
          <div key={k.label} className={`${k.bg} rounded-2xl p-4 border border-border`}>
            <p className="text-xs text-muted-foreground font-semibold">{k.label}</p>
            <p className={`text-xl font-bold mt-1 ${k.text}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Farmer queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-forest text-sm">
            Farmers awaiting verification
            {pending.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-forest/10 text-forest text-[10px] rounded-full">
                {pending.length}
              </span>
            )}
          </h2>
          {pending.length > 0 && (
            <Link
              href="/field-agent/map"
              className="text-xs font-semibold text-forest hover:underline"
            >
              View all on map
            </Link>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center">
            <p className="text-sm font-semibold text-forest">All farmers in your region are verified.</p>
            <p className="text-xs text-muted-foreground mt-1">Check back later or register new farmers.</p>
          </div>
        ) : (
          pending.map(farmer => {
            const hasGps      = farmer.gpsLat != null && farmer.gpsLng != null
            const locationLine = [
              farmer.user.community,
              farmer.user.district?.name,
              farmer.user.region?.name,
            ].filter(Boolean).join(', ')

            return (
              <div
                key={farmer.id}
                className="bg-white rounded-2xl border border-border p-4 hover:border-forest/20 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center
                                  flex-shrink-0 text-forest font-bold text-sm">
                    {farmer.user.fullName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-sm text-forest truncate">{farmer.user.fullName}</p>
                      {hasGps && (
                        <span className="text-[10px] font-bold text-forest bg-lime/30 px-2 py-0.5
                                         rounded-full flex-shrink-0">
                          GPS
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-1">
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
                           className="w-3 h-3 text-muted-foreground flex-shrink-0">
                        <path d="M2 3a1 1 0 0 1 1-1h2.5a1 1 0 0 1 .97.757L7.1 5.5a1 1 0 0 1-.24.98l-.9.9a8.05 8.05 0 0 0 3.66 3.66l.9-.9a1 1 0 0 1 .98-.24l2.743.63A1 1 0 0 1 15 11.5V14a1 1 0 0 1-1 1C6.268 15 1 9.732 1 3a1 1 0 0 1 1-1Z"
                          strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-xs font-mono text-muted-foreground">{farmer.user.phone}</span>
                    </div>

                    {locationLine && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{locationLine}</p>
                    )}

                    <div className="flex items-center gap-3 mt-1.5">
                      {farmer.farmName && (
                        <span className="text-xs text-muted-foreground">{farmer.farmName}</span>
                      )}
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        Registered {formatRelative(farmer.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/field-agent/map?farmerId=${farmer.id}`}
                    className="flex-1 py-2 bg-forest text-white text-xs font-bold rounded-xl
                               hover:bg-forest-dark transition-colors
                               flex items-center justify-center gap-1.5"
                  >
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                         className="w-3.5 h-3.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5Z" />
                      <circle cx="8" cy="6" r="1.5" />
                    </svg>
                    View on Map
                  </Link>

                  <Link
                    href={`/field-agent/verify-farm/${farmer.userId}`}
                    className="px-4 py-2 border border-border text-forest text-xs font-bold rounded-xl
                               hover:bg-cream transition-colors"
                  >
                    Verify
                  </Link>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
