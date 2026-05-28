'use client'

import Link    from 'next/link'
import { useEffect, useState } from 'react'
import { api }             from '@/lib/api'
import { formatGHS, formatRelative } from '@/lib/format'
import { ChevronRightIcon } from '@/components/shared/icons'

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

  const today = new Date().toLocaleDateString('en-GH', { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <div className="space-y-6">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.14em] mb-1">
            Field Agent
          </p>
          <h1
            className="font-display font-bold text-forest leading-tight"
            style={{ fontSize: 'clamp(1.35rem, 4vw, 1.75rem)', letterSpacing: '-0.03em' }}
          >
            Dashboard
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">{today}</p>
        </div>
        <Link
          href="/field-agent/register-farmer"
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-white text-xs font-bold
                     transition-all hover:opacity-90 active:scale-[0.97]"
          style={{
            backgroundColor: 'var(--forest)',
            clipPath: 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))',
          }}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"
               strokeLinecap="round" strokeLinejoin="round" width="12" height="12">
            <path d="M8 2v12M2 8h12" />
          </svg>
          Register Farmer
        </Link>
      </div>

      {/* ── KPI Cards ────────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label:   'Total Verified',
              value:   stats.totalVerified,
              mono:    false,
              top:     'var(--sector-crops)',
              dark:    true,
            },
            {
              label:   'This Month',
              value:   stats.verifiedThisMonth,
              mono:    false,
              top:     'var(--lime)',
              dark:    false,
            },
            {
              label:   'Pending in Region',
              value:   stats.pendingInRegion,
              mono:    false,
              top:     'var(--harvest-gold)',
              dark:    false,
            },
            {
              label:   'Wallet Balance',
              value:   formatGHS(stats.walletBalance),
              mono:    true,
              top:     'var(--sector-fisheries)',
              dark:    false,
            },
          ].map(k => (
            <div
              key={k.label}
              className="rounded-2xl border border-border overflow-hidden"
              style={{ backgroundColor: k.dark ? 'var(--forest)' : 'white' }}
            >
              <div className="h-[3px]" style={{ backgroundColor: k.top }} />
              <div className="p-4">
                <p className={`text-[11px] font-medium ${k.dark ? 'text-white/50' : 'text-muted-foreground'}`}>
                  {k.label}
                </p>
                <p
                  className={`font-extrabold leading-none mt-1.5
                              ${k.mono ? 'font-mono text-base' : 'text-2xl'}
                              ${k.dark ? 'text-white' : 'text-forest'}`}
                >
                  {k.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Earnings banner ────────────────────────────────────── */}
      {stats && stats.earningsThisMonth > 0 && (
        <div
          className="p-4 flex items-center justify-between gap-4 border-l-[3px]"
          style={{
            backgroundColor: 'var(--sector-crops-bg)',
            borderLeftColor: 'var(--sector-crops)',
            borderRadius: '1rem',
          }}
        >
          <div>
            <p className="text-xs font-bold text-forest">Earnings this month</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              GHS 10 per verified farmer
            </p>
          </div>
          <p className="font-mono font-extrabold text-forest text-xl flex-shrink-0">
            {formatGHS(stats.earningsThisMonth)}
          </p>
        </div>
      )}

      {/* ── Farmer Queue ─────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2
            className="font-display font-bold text-forest text-sm flex items-center gap-2"
            style={{ letterSpacing: '-0.01em' }}
          >
            Awaiting Verification
            {pending.length > 0 && (
              <span
                className="text-[10px] font-bold text-white px-2 py-0.5"
                style={{
                  backgroundColor: 'var(--harvest-gold)',
                  clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
                }}
              >
                {pending.length}
              </span>
            )}
          </h2>
          {pending.length > 0 && (
            <Link
              href="/field-agent/map"
              className="text-xs font-semibold text-muted-foreground hover:text-forest
                         flex items-center gap-0.5 transition-colors"
            >
              View on map <ChevronRightIcon size={13} />
            </Link>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center">
            <div
              className="w-12 h-12 mx-auto mb-3 flex items-center justify-center"
              style={{
                backgroundColor: 'var(--sector-crops-bg)',
                clipPath: 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))',
              }}
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                   strokeLinecap="round" strokeLinejoin="round" width="20" height="20"
                   style={{ color: 'var(--sector-crops)' }}>
                <path d="M10 3.5C7 3.5 5 6 5 8.5c0 4 5 8 5 8s5-4 5-8c0-2.5-2-5-5-5Z" />
                <circle cx="10" cy="8.5" r="1.5" />
              </svg>
            </div>
            <p className="text-sm font-bold text-forest">All caught up</p>
            <p className="text-xs text-muted-foreground mt-1">No farmers pending verification in your region.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(farmer => {
              const hasGps      = farmer.gpsLat != null && farmer.gpsLng != null
              const locationLine = [
                farmer.user.community,
                farmer.user.district?.name,
                farmer.user.region?.name,
              ].filter(Boolean).join(', ')

              return (
                <div
                  key={farmer.id}
                  className="bg-white rounded-2xl border border-border p-4 hover:shadow-sm
                             transition-shadow overflow-hidden"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 flex items-center justify-center flex-shrink-0
                                 bg-forest text-white font-display font-bold text-sm"
                      style={{ clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))' }}
                    >
                      {farmer.user.fullName.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-sm text-forest truncate">{farmer.user.fullName}</p>
                        {hasGps && (
                          <span
                            className="text-[9px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5
                                       text-forest flex-shrink-0"
                            style={{
                              backgroundColor: 'var(--lime)',
                              clipPath: 'polygon(0 0, calc(100% - 3px) 0, 100% 3px, 100% 100%, 3px 100%, 0 calc(100% - 3px))',
                            }}
                          >
                            GPS
                          </span>
                        )}
                      </div>

                      <p className="font-mono text-xs text-muted-foreground mt-0.5">{farmer.user.phone}</p>
                      {locationLine && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{locationLine}</p>
                      )}
                      {farmer.farmName && (
                        <p className="text-[11px] text-forest/60 mt-0.5 truncate">{farmer.farmName}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Registered {formatRelative(farmer.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/field-agent/map?farmerId=${farmer.id}`}
                      className="flex-1 py-2 text-white text-xs font-bold transition-colors
                                 flex items-center justify-center gap-1.5"
                      style={{
                        backgroundColor: 'var(--forest)',
                        clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                      }}
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"
                           strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                        <path d="M8 1C5.24 1 3 3.24 3 6c0 3.75 5 9 5 9s5-5.25 5-9c0-2.76-2.24-5-5-5Z" />
                        <circle cx="8" cy="6" r="1.5" />
                      </svg>
                      View on Map
                    </Link>
                    <Link
                      href={`/field-agent/verify-farm/${farmer.userId}`}
                      className="px-4 py-2 border border-border text-forest text-xs font-bold
                                 rounded-xl hover:bg-cream transition-colors"
                    >
                      Verify
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
