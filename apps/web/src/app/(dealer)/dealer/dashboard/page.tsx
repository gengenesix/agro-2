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
import type { Wallet } from '@agroconnect/types'

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
    Promise.all([
      api.get('/dealer/stats'),
      api.get('/payments/wallet'),
      api.get('/orders/mine?limit=5'),
    ]).then(([s, w, o]) => {
      setStats(s.data.data)
      setWallet(w.data.data)
      setRecentOrders(o.data.data.orders ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const dealer = (user as any)?.dealerProfile

  if (loading) return (
    <main className="min-h-screen bg-cream p-4 sm:p-6 space-y-5">
      <DashboardStatsSkeleton />
    </main>
  )

  return (
    <main className="min-h-screen bg-cream pb-10">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
          <p className="text-sm text-muted-foreground">Good day,</p>
          <h1 className="text-xl font-bold text-forest">{dealer?.businessName ?? user?.fullName}</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Active listings',  value: stats.activeListings,   mono: false },
              { label: 'Pending orders',   value: stats.pendingOrders,    mono: false },
              { label: 'This month',       value: stats.thisMonthOrders,  mono: false },
              { label: 'Total revenue',    value: formatGHS(stats.totalRevenue), mono: true },
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

        {/* Wallet */}
        {wallet && (
          <WalletCard wallet={wallet} onWithdraw={() => {}} />
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/dealer/listings/new', Icon: PlusIcon,         label: 'Add product',    sub: 'List a new input'     },
            { href: '/dealer/orders',       Icon: OrdersIcon,       label: 'View orders',    sub: `${stats?.pendingOrders ?? 0} pending` },
            { href: '/dealer/listings',     Icon: ListProduceIcon,  label: 'My products',    sub: `${stats?.activeListings ?? 0} active` },
            { href: '/dealer/analytics',    Icon: WalletIcon,       label: 'Analytics',      sub: 'Revenue & trends'     },
          ].map(({ href, Icon, label, sub }) => (
            <Link key={href} href={href}
              className="bg-white rounded-2xl border border-border p-4 hover:shadow-md transition-shadow">
              <Icon size={22} className="text-forest mb-2" />
              <p className="font-bold text-forest text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        {recentOrders.length > 0 && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-forest text-sm">Recent orders</h2>
              <Link href="/dealer/orders" className="text-xs font-semibold text-forest hover:underline flex items-center gap-0.5">
                All orders <ChevronRightIcon size={12} />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentOrders.map((order: any) => (
                <Link key={order.id} href={`/orders/${order.id}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-cream/40 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-forest truncate">{order.listing?.title ?? 'Order'}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatRelative(order.createdAt)}</p>
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
