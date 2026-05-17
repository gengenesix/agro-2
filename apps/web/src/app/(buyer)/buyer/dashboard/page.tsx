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

  if (loading) return (
    <main className="min-h-screen bg-cream p-4 sm:p-6 space-y-5">
      <DashboardStatsSkeleton />
    </main>
  )

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <p className="text-sm text-muted-foreground">Welcome back,</p>
          <h1 className="text-xl font-bold text-forest">{buyer?.organizationName ?? user?.fullName}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total orders',    value: stats.totalOrders ?? 0 },
              { label: 'Active pledges',  value: stats.activePledges ?? 0 },
              { label: 'Total spent',     value: formatGHS(stats.totalSpent ?? 0), mono: true },
              { label: 'Saved searches',  value: stats.savedSearches ?? 0 },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-border p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-xl font-bold text-forest mt-1 ${s.mono ? 'font-mono text-base' : ''}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/produce',         Icon: MarketIcon,  label: 'Browse produce', sub: 'Find fresh listings' },
            { href: '/pledges',         Icon: PledgeIcon,  label: 'Harvest pledges',sub: 'Reserve future harvests' },
            { href: '/buyer/orders',    Icon: OrdersIcon,  label: 'My orders',      sub: `${stats?.activeOrders ?? 0} active` },
            { href: '/buyer/alerts',    Icon: BellIcon,    label: 'Price alerts',   sub: 'Get notified on price drops' },
          ].map(({ href, Icon, label, sub }) => (
            <Link key={href} href={href}
              className="bg-white rounded-2xl border border-border p-4 hover:shadow-md transition-shadow">
              <Icon size={22} className="text-forest mb-2" />
              <p className="font-bold text-forest text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </Link>
          ))}
        </div>

        {/* Active pledges */}
        {pledges.length > 0 && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-forest text-sm">Active pledges</h2>
              <Link href="/pledges" className="text-xs font-semibold text-forest hover:underline flex items-center gap-0.5">
                All <ChevronRightIcon size={12} />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {pledges.map((p: any) => (
                <Link key={p.id} href={`/orders/${p.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-cream/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      {p.listing?.sector && (
                        <SectorChip
                          sector={p.listing.sector}
                          label={p.listing.category?.name ?? p.listing.sector}
                          size="sm"
                        />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-forest truncate">{p.listing?.title ?? 'Pledge'}</p>
                    <p className="text-xs text-muted-foreground">{formatRelative(p.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-harvest-gold">{formatGHS(p.totalAmount)}</p>
                    <p className="text-[10px] text-muted-foreground capitalize">{p.pledgeStatus ?? p.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recent orders */}
        {orders.length > 0 && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-forest text-sm">Recent orders</h2>
              <Link href="/buyer/orders" className="text-xs font-semibold text-forest hover:underline flex items-center gap-0.5">
                All <ChevronRightIcon size={12} />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {orders.map((order: any) => (
                <Link key={order.id} href={`/orders/${order.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-cream/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-forest truncate">{order.listing?.title ?? 'Order'}</p>
                    <p className="text-xs text-muted-foreground">{formatRelative(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-bold text-forest">{formatGHS(order.totalAmount)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{(order as any).trackingStatus}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
