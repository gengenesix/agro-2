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
    {
      href:  '/buyer/marketplace',
      Icon:  MarketIcon,
      label: 'Browse Produce',
      sub:   'Find fresh listings',
      iconBg:    'var(--sector-crops-bg)',
      iconColor: 'var(--sector-crops)',
      accent:    'var(--sector-crops)',
    },
    {
      href:  '/buyer/pledges',
      Icon:  PledgeIcon,
      label: 'Harvest Pledges',
      sub:   'Reserve future harvests',
      iconBg:    'var(--harvest-gold-bg)',
      iconColor: 'var(--harvest-gold)',
      accent:    'var(--harvest-gold)',
    },
    {
      href:  '/buyer/orders',
      Icon:  OrdersIcon,
      label: 'My Orders',
      sub:   `${stats?.activeOrders ?? 0} active`,
      iconBg:    'var(--sector-fisheries-bg)',
      iconColor: 'var(--sector-fisheries)',
      accent:    'var(--sector-fisheries)',
    },
    {
      href:  '/buyer/alerts',
      Icon:  BellIcon,
      label: 'Price Alerts',
      sub:   'Get notified on drops',
      iconBg:    'var(--sector-inputs-bg)',
      iconColor: 'var(--sector-inputs)',
      accent:    'var(--sector-inputs)',
    },
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
            <div
              className="w-11 h-11 flex-shrink-0 items-center justify-center bg-forest
                         text-white font-display font-bold text-sm hidden sm:flex"
              style={{ clipPath: 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))' }}
            >
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
              {
                label:  'Total Orders',
                value:  stats.totalOrders ?? 0,
                mono:   false,
                top:    'var(--sector-fisheries)',
              },
              {
                label:  'Active Pledges',
                value:  stats.activePledges ?? 0,
                mono:   false,
                top:    'var(--harvest-gold)',
              },
              {
                label:  'Total Spent',
                value:  formatGHS(stats.totalSpent ?? 0),
                mono:   true,
                top:    'var(--sector-crops)',
              },
              {
                label:  'Saved Searches',
                value:  stats.savedSearches ?? 0,
                mono:   false,
                top:    'var(--sector-inputs)',
              },
            ].map(s => (
              <div key={s.label}
                className="bg-white rounded-2xl border border-border overflow-hidden">
                <div className="h-[3px]" style={{ backgroundColor: s.top }} />
                <div className="p-4">
                  <p className="text-[11px] font-medium text-muted-foreground">{s.label}</p>
                  <p className={`font-extrabold text-forest mt-1.5 leading-none
                                 ${s.mono ? 'font-mono text-base' : 'text-2xl'}`}>
                    {s.value}
                  </p>
                </div>
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
            {ACTIONS.map(({ href, Icon, label, sub, iconBg, iconColor, accent }) => (
              <Link
                key={href}
                href={href}
                className="bg-white rounded-2xl border border-border p-4 overflow-hidden relative
                           hover:shadow-sm transition-shadow group"
              >
                <div
                  className="absolute bottom-0 left-0 right-0 h-[3px]"
                  style={{ backgroundColor: accent }}
                />
                <span
                  className="mb-3 w-10 h-10 flex items-center justify-center"
                  style={{
                    backgroundColor: iconBg,
                    clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))',
                  }}
                >
                  <Icon size={19} style={{ color: iconColor }} />
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
                                 px-1.5 py-0.5 rounded-full bg-sector-crops-bg text-sector-crops"
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
          <div className="bg-white rounded-2xl border border-border p-8 text-center">
            <div
              className="w-14 h-14 mx-auto mb-4 flex items-center justify-center"
              style={{
                backgroundColor: 'var(--sector-crops-bg)',
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
              }}
            >
              <MarketIcon size={24} style={{ color: 'var(--sector-crops)' }} />
            </div>
            <p className="font-display font-bold text-forest text-base mb-1"
               style={{ letterSpacing: '-0.02em' }}>
              Start sourcing produce
            </p>
            <p className="text-muted-foreground text-sm mb-4">
              Browse verified farm listings or reserve a future harvest.
            </p>
            <Link
              href="/buyer/marketplace"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold
                         transition-all active:scale-[0.98] hover:opacity-90"
              style={{
                backgroundColor: 'var(--forest)',
                clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
              }}
            >
              Browse Marketplace
            </Link>
          </div>
        )}

      </div>
    </main>
  )
}
