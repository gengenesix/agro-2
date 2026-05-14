'use client'

import Link              from 'next/link'
import Image             from 'next/image'
import { useEffect, useState, useCallback } from 'react'
import { api }           from '@/lib/api'
import { EmptyState }    from '@/components/shared/empty-state'
import { OrderCardSkeleton } from '@/components/shared/skeleton'
import { SectorChip }    from '@/components/shared/sector-chip'
import { OrdersIcon, ChevronRightIcon, CheckIcon, TruckIcon } from '@/components/shared/icons'
import { formatGHS, formatRelative } from '@/lib/format'
import type { Order } from '@agroconnect/types'

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'Pending',    cls: 'bg-harvest-gold/15 text-harvest-gold' },
  confirmed:  { label: 'Confirmed',  cls: 'bg-lime/20 text-forest' },
  dispatched: { label: 'Dispatched', cls: 'bg-sector-fisheries-bg text-sector-fisheries' },
  delivered:  { label: 'Delivered',  cls: 'bg-lime/30 text-forest' },
  completed:  { label: 'Completed',  cls: 'bg-cream-dark text-muted-foreground' },
  cancelled:  { label: 'Cancelled',  cls: 'bg-red-50 text-red-600' },
  disputed:   { label: 'Disputed',   cls: 'bg-red-50 text-red-600' },
}

const TABS = [
  { value: 'all',       label: 'All'       },
  { value: 'pending',   label: 'Pending'   },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
] as const

type Tab = (typeof TABS)[number]['value']

export default function DealerOrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState<Tab>('all')
  const [page, setPage]       = useState(1)
  const [total, setTotal]     = useState(0)
  const [acting, setActing]   = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    api.get(`/orders/mine?${params}`)
      .then(r => {
        setOrders(r.data.data.orders ?? r.data.data ?? [])
        setTotal(r.data.pagination?.total ?? 0)
      })
      .finally(() => setLoading(false))
  }, [page])

  useEffect(() => { load() }, [load])

  const filtered = orders.filter(o => {
    if (tab === 'pending')   return o.trackingStatus === 'pending'
    if (tab === 'confirmed') return ['confirmed', 'dispatched'].includes(o.trackingStatus)
    if (tab === 'completed') return ['completed', 'delivered', 'cancelled'].includes(o.trackingStatus)
    return true
  })

  async function confirmOrder(orderId: string) {
    setActing(orderId)
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: 'confirmed' })
      load()
    } finally {
      setActing(null)
    }
  }

  async function dispatchOrder(orderId: string) {
    setActing(orderId)
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: 'dispatched' })
      load()
    } finally {
      setActing(null)
    }
  }

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-forest text-lg">Orders</h1>
              <p className="text-xs text-muted-foreground">{total} total orders</p>
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex gap-1 pb-1 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.value} onClick={() => { setTab(t.value); setPage(1) }}
              className={`px-4 py-2 text-sm font-semibold rounded-t-xl border-b-2 transition-colors whitespace-nowrap
                ${tab === t.value
                  ? 'border-forest text-forest'
                  : 'border-transparent text-muted-foreground hover:text-forest'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <OrderCardSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<OrdersIcon size={32} />}
            title="No orders"
            description="Orders from buyers will appear here."
          />
        ) : (
          filtered.map(order => {
            const cfg = STATUS_CONFIG[order.trackingStatus] ?? STATUS_CONFIG.pending
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-sm transition-shadow">
                <Link href={`/orders/${order.id}`} className="flex items-center gap-4 p-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0">
                    {(order as any).listing?.photos?.[0] ? (
                      <Image src={(order as any).listing.photos[0]} alt="" fill sizes="56px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <OrdersIcon size={18} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {(order as any).listing?.sector && <SectorChip sector={(order as any).listing.sector} size="sm" />}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                    </div>
                    <p className="font-display text-sm font-semibold text-forest truncate">
                      {(order as any).listing?.title ?? 'Order'}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-mono text-xs font-bold text-forest">{formatGHS(order.totalAmount)}</span>
                      <span className="text-xs text-muted-foreground">
                        {order.quantity} {(order as any).listing?.unit ?? 'units'}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">{formatRelative(order.createdAt)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Buyer: {(order as any).buyer?.fullName ?? '—'}
                    </p>
                  </div>
                  <ChevronRightIcon size={14} className="text-muted-foreground flex-shrink-0" />
                </Link>

                {/* Actions */}
                {order.trackingStatus === 'pending' && (
                  <div className="border-t border-border px-4 py-3 bg-cream/30 flex gap-2">
                    <button
                      disabled={acting === order.id}
                      onClick={() => confirmOrder(order.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-forest text-white
                                 rounded-lg hover:bg-forest-dark transition-colors disabled:opacity-60">
                      <CheckIcon size={12} /> Confirm order
                    </button>
                  </div>
                )}
                {order.trackingStatus === 'confirmed' && (
                  <div className="border-t border-border px-4 py-3 bg-cream/30 flex gap-2">
                    <button
                      disabled={acting === order.id}
                      onClick={() => dispatchOrder(order.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-sector-fisheries text-white
                                 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60">
                      <TruckIcon size={12} /> Mark dispatched
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}

        {total > 20 && (
          <div className="flex items-center justify-center gap-3 pt-4">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 text-sm font-semibold border border-border rounded-xl
                         hover:bg-cream transition-colors disabled:opacity-40">
              Previous
            </button>
            <span className="text-sm text-muted-foreground">Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}
              className="px-4 py-2 text-sm font-semibold border border-border rounded-xl
                         hover:bg-cream transition-colors disabled:opacity-40">
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
