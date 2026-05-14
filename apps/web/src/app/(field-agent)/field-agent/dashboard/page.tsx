'use client'

import { useEffect, useState }  from 'react'
import Link                      from 'next/link'
import { api }                   from '@/lib/api'
import { formatGHS }             from '@/lib/format'

interface Stats {
  totalVerified:      number
  verifiedThisMonth:  number
  pendingInRegion:    number
  earningsThisMonth:  number
  walletBalance:      number
}

interface Farmer {
  id: string
  farmName: string | null
  gpsLat:   number | null
  gpsLng:   number | null
  fieldVerifiedAt: string | null
  user: {
    id: string
    fullName: string
    phone:    string
    verificationLevel: string
    community: string | null
    region:   { name: string } | null
    district: { name: string } | null
  }
}

export default function FieldAgentDashboard() {
  const [stats, setStats]       = useState<Stats | null>(null)
  const [pending, setPending]   = useState<Farmer[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/field-agent/stats'),
      api.get('/field-agent/farmers?filter=pending&page=1'),
    ]).then(([statsRes, farmersRes]) => {
      setStats(statsRes.data.data)
      setPending(farmersRes.data.data.farmers ?? [])
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
    { label: 'Total verified',      value: stats.totalVerified,     color: 'bg-forest'     },
    { label: 'Verified this month', value: stats.verifiedThisMonth, color: 'bg-lime'       },
    { label: 'Pending in region',   value: stats.pendingInRegion,   color: 'bg-cream-dark' },
    { label: 'Wallet balance',      value: formatGHS(stats.walletBalance), color: 'bg-white', mono: true },
  ] : []

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-forest">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {stats ? `GHS 10 per farmer verified · GHS ${stats.earningsThisMonth} earned this month` : ''}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3">
        {kpis.map(k => (
          <div key={k.label} className={`${k.color} rounded-2xl p-4 border border-border`}>
            <p className="text-xs text-muted-foreground font-semibold">{k.label}</p>
            <p className={`text-2xl font-bold text-forest mt-1 ${k.mono ? 'font-mono' : ''}`}>
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* Pending farmers */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-forest text-sm">Farmers to verify</h2>
          <Link href="/field-agent/register-farmer"
            className="text-xs font-bold text-forest bg-lime px-3 py-1.5 rounded-xl">
            + Register new
          </Link>
        </div>

        {pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">All farmers in your region are verified.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pending.slice(0, 8).map(f => (
              <Link
                key={f.id}
                href={`/field-agent/verify-farm/${f.user.id}`}
                className="flex items-center justify-between bg-white rounded-2xl border border-border
                           p-4 hover:border-forest/30 transition-colors"
              >
                <div>
                  <p className="font-semibold text-sm text-forest">{f.user.fullName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {f.farmName ?? 'Farm not named'}
                    {f.user.community ? ` · ${f.user.community}` : ''}
                    {f.user.district ? ` · ${f.user.district.name}` : ''}
                  </p>
                </div>
                <span className="text-xs font-bold text-forest bg-lime px-2 py-1 rounded-lg">
                  Verify
                </span>
              </Link>
            ))}
            {pending.length > 8 && (
              <Link href="/field-agent/register-farmer?filter=pending"
                className="block text-center text-xs font-semibold text-forest py-3">
                View all {pending.length} pending farmers
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
