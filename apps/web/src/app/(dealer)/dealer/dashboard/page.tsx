'use client'

import Link              from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth }       from '@/context/auth-context'
import { api }           from '@/lib/api'
import { WalletCard }    from '@/components/wallet/wallet-card'
import { DashboardStatsSkeleton } from '@/components/shared/skeleton'
import { formatGHS, formatRelative } from '@/lib/format'
import {
  ListProduceIcon, OrdersIcon, WalletIcon, PlusIcon, ChevronRightIcon,
} from '@/components/shared/icons'
import type { Wallet } from '@/lib/types'

interface Stats {
  totalListings:   number
  activeListings:  number
  pendingOrders:   number
  totalRevenue:    number
  thisMonthOrders: number
}

export default function DealerDashboardPage() {
  const { user }  = useAuth()
  const [stats, setStats]   = useState<Stats | null>(null)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.get('/dealer/stats'),
      api.get('/payments/wallet'),
      api.get('/orders/mine?limit=5'),
    ]).then(([s, w, o]) => {
      if (s.status === 'fulfilled') setStats(s.value.data.data)
      if (w.status === 'fulfilled') setWallet(w.value.data.data)
      if (o.status === 'fulfilled') setRecentOrders(o.value.data.data.orders ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const dealer   = (user as any)?.dealerProfile
  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const today    = new Date().toLocaleDateString('en-GH', { weekday: 'long', month: 'short', day: 'numeric' })
  const initials = (dealer?.businessName ?? user?.fullName ?? 'DL')
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
                {dealer?.businessName ?? user?.fullName}
              </h1>
              <p className="text-muted-foreground text-xs mt-0.5">{today}</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dealer/listings/new" className="btn btn-forest btn-sm hidden sm:inline-flex">
                <PlusIcon size={14} />
                Add Product
              </Link>
              <div className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-forest font-bold text-sm text-white sm:flex">
                {initials}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-5">

        {/* ── Stat Cards ───────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Active Listings', value: stats.activeListings,        mono: false },
              { label: 'Pending Orders',  value: stats.pendingOrders,         mono: false, alert: stats.pendingOrders > 0 },
              { label: 'This Month',      value: stats.thisMonthOrders,       mono: false },
              { label: 'Total Revenue',   value: formatGHS(stats.totalRevenue), mono: true },
            ].map((s: any) => (
              <div key={s.label} className="card-surface p-4">
                <div className="flex items-center justify-between">
                  <p className="label-eyebrow text-muted-foreground">{s.label}</p>
                  {s.alert && <span className="h-1.5 w-1.5 rounded-full bg-lime" />}
                </div>
                <p className={`font-extrabold font-mono text-forest mt-2 leading-none
                               ${s.mono ? 'text-xl' : 'text-2xl'}`}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── Wallet ───────────────────────────────────────────── */}
        {wallet && (
          <WalletCard
            balance={wallet.balance ?? 0}
            pendingBalance={wallet.pendingBalance ?? 0}
            totalEarned={wallet.totalEarned ?? 0}
            onWithdraw={() => {}}
          />
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
            {[
              { href: '/dealer/listings/new', Icon: PlusIcon,        label: 'Add Product', sub: 'List a new input',                     primary: true  },
              { href: '/dealer/orders',       Icon: OrdersIcon,      label: 'View Orders', sub: `${stats?.pendingOrders ?? 0} pending`,  primary: false },
              { href: '/dealer/listings',     Icon: ListProduceIcon, label: 'My Products', sub: `${stats?.activeListings ?? 0} active`,  primary: false },
              { href: '/dealer/analytics',    Icon: WalletIcon,      label: 'Analytics',   sub: 'Revenue & trends',                      primary: false },
            ].map(({ href, Icon, label, sub, primary }) => (
              <Link
                key={href}
                href={href}
                className="card-surface card-lift group p-4"
              >
                <span
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-colors
                    ${primary ? 'bg-forest text-white' : 'bg-cream-dark text-forest group-hover:bg-lime'}`}
                >
                  <Icon size={19} />
                </span>
                <p className="font-bold text-forest text-sm leading-tight">{label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Recent Orders ────────────────────────────────────── */}
        {recentOrders.length > 0 && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2
                className="font-display font-bold text-forest text-sm"
                style={{ letterSpacing: '-0.01em' }}
              >
                Recent Orders
              </h2>
              <Link
                href="/dealer/orders"
                className="text-xs font-semibold text-muted-foreground hover:text-forest
                           flex items-center gap-0.5 transition-colors"
              >
                All orders <ChevronRightIcon size={13} />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentOrders.map((order: any) => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-cream/50 transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                               bg-cream-dark text-muted-foreground text-[10px] font-bold"
                  >
                    {(order.buyer?.fullName ?? 'B').slice(0, 2).toUpperCase()}
                  </div>
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

      </div>
    </main>
  )
}
