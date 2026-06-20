'use client'

import Link              from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth }       from '@/context/auth-context'
import { api }           from '@/lib/api'
import { DashboardStatsSkeleton } from '@/components/shared/skeleton'
import { formatGHS, formatRelative } from '@/lib/format'
import { SectorChip }    from '@/components/shared/sector-chip'
import {
  MarketIcon, PledgeIcon, OrdersIcon, BellIcon, ChevronRightIcon,
} from '@/components/shared/icons'

export default function BuyerDashboardPage() {
  const { user }   = useAuth()
  const [stats, setStats]       = useState<any>(null)
  const [pledges, setPledges]   = useState<any[]>([])
  const [orders, setOrders]     = useState<any[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.get('/buyer/stats'),
      api.get('/orders/mine?limit=3'),
      api.get('/pledges/mine?limit=3'),
    ]).then(([s, o, p]) => {
      if (s.status === 'fulfilled') setStats(s.value.data.data)
      if (o.status === 'fulfilled') setOrders(o.value.data.data.orders ?? [])
      if (p.status === 'fulfilled') setPledges(p.value.data.data.pledges ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const buyer = (user as any)?.buyerProfile
  const hour  = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const today = new Date().toLocaleDateString('en-GH', { weekday: 'long', month: 'short', day: 'numeric' })
  const initials = (buyer?.organizationName ?? user?.fullName ?? 'BU')
    .split(' ')
    .map((w: string) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (loading) return (
    <main className="min-h-screen bg-cream p-4 sm:p-6 space-y-5">
      <DashboardStatsSkeleton />
    </main>
  )

  const ACTIONS = [
    { href: '/buyer/marketplace', Icon: MarketIcon, label: 'Browse Produce',  sub: 'Find fresh listings',        primary: true  },
    { href: '/buyer/pledges',     Icon: PledgeIcon, label: 'Harvest Pledges', sub: 'Reserve future harvests',    primary: false },
    { href: '/buyer/orders',      Icon: OrdersIcon, label: 'My Orders',       sub: `${stats?.activeOrders ?? 0} active`, primary: false },
    { href: '/buyer/alerts',      Icon: BellIcon,   label: 'Price Alerts',    sub: 'Get notified on drops',      primary: false },
  ]

  return (
    <main className="min-h-screen bg-cream pb-16">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.14em] mb-1">
                {greeting}
              </p>
              <h1
                className="font-display font-bold text-forest leading-tight"
                style={{ fontSize: 'clamp(1.25rem, 3vw, 1.6rem)', letterSpacing: '-0.025em' }}
              >
                {buyer?.organizationName ?? user?.fullName}
              </h1>
              <p className="text-muted-foreground text-xs mt-0.5">{today}</p>
            </div>
            <div className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-forest font-bold text-sm text-white sm:flex">
              {initials}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-5">

        {/* ── Stat Cards ───────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Orders',   value: stats.totalOrders ?? 0,            mono: false },
              { label: 'Active Pledges', value: stats.activePledges ?? 0,          mono: false },
              { label: 'Total Spent',    value: formatGHS(stats.totalSpent ?? 0),  mono: true  },
              { label: 'Saved Searches', value: stats.savedSearches ?? 0,          mono: false },
            ].map(s => (
              <div key={s.label} className="card-surface p-4">
                <p className="label-eyebrow text-muted-foreground">{s.label}</p>
                <p className={`font-extrabold text-forest mt-2 leading-none
                               ${s.mono ? 'font-mono text-xl' : 'text-2xl font-mono'}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Quick Actions ────────────────────────────────────── */}
        <div>
          <h2
            className="font-display font-bold text-forest text-sm mb-3"
            style={{ letterSpacing: '-0.01em' }}
          >
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {ACTIONS.map(({ href, Icon, label, sub, primary }) => (
              <Link
                key={href}
                href={href}
                className="card-surface card-lift group p-4"
              >
                <span
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-colors
                    ${primary ? 'bg-lime text-forest' : 'bg-cream-dark text-forest group-hover:bg-lime'}`}
                >
                  <Icon size={19} />
                </span>
                <p className="font-bold text-forest text-sm leading-tight">{label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Active Pledges ───────────────────────────────────── */}
        {pledges.length > 0 && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2
                className="font-display font-bold text-forest text-sm"
                style={{ letterSpacing: '-0.01em' }}
              >
                Active Pledges
              </h2>
              <Link
                href="/buyer/pledges"
                className="text-xs font-semibold text-muted-foreground hover:text-forest
                           flex items-center gap-0.5 transition-colors"
              >
                View all <ChevronRightIcon size={13} />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {pledges.map((p: any) => (
                <Link
                  key={p.id}
                  href={`/buyer/orders/${p.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-cream/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    {p.listing?.sector && (
                      <div className="mb-1">
                        <SectorChip
                          sector={p.listing.sector}
                          label={p.listing.category?.name ?? p.listing.sector}
                          size="sm"
                        />
                      </div>
                    )}
                    <p className="text-sm font-semibold text-forest truncate">
                      {p.listing?.title ?? 'Pledge'}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {formatRelative(p.createdAt)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono text-sm font-bold text-harvest-gold">
                      {formatGHS(p.totalAmount)}
                    </p>
                    <p className="text-[10px] text-muted-foreground capitalize mt-0.5">
                      {p.pledgeStatus ?? p.status}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Recent Orders ────────────────────────────────────── */}
        {orders.length > 0 && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2
                className="font-display font-bold text-forest text-sm"
                style={{ letterSpacing: '-0.01em' }}
              >
                Recent Orders
              </h2>
              <Link
                href="/buyer/orders"
                className="text-xs font-semibold text-muted-foreground hover:text-forest
                           flex items-center gap-0.5 transition-colors"
              >
                View all <ChevronRightIcon size={13} />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {orders.map((order: any) => (
                <Link
                  key={order.id}
                  href={`/buyer/orders/${order.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-cream/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-forest truncate">
                      {order.listing?.title ?? 'Order'}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {formatRelative(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-mono text-sm font-bold text-forest">
                      {formatGHS(order.totalAmount)}
                    </p>
                    <span
                      className="text-[10px] font-semibold capitalize mt-0.5 inline-block
                                 px-2 py-0.5 rounded-full bg-cream-dark text-forest"
                    >
                      {(order as any).trackingStatus}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty state ──────────────────────────────────────── */}
        {pledges.length === 0 && orders.length === 0 && (
          <div className="card-surface p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cream-dark text-forest">
              <MarketIcon size={24} />
            </div>
            <p className="font-display font-bold text-forest text-base mb-1 tracking-tight">
              Start sourcing produce
            </p>
            <p className="text-muted-foreground text-sm mb-4">
              Browse verified farm listings or reserve a future harvest.
            </p>
            <Link href="/buyer/marketplace" className="btn btn-forest btn-sm">
              Browse Marketplace
            </Link>
          </div>
        )}

      </div>
    </main>
  )
}
