'use client'

import Link              from 'next/link'
import Image             from 'next/image'
import { useEffect, useState } from 'react'
import { api }           from '@/lib/api'
import { EmptyState }    from '@/components/shared/empty-state'
import { OrderCardSkeleton } from '@/components/shared/skeleton'
import { SectorChip }    from '@/components/shared/sector-chip'
import { OrdersIcon, ChevronRightIcon, CheckIcon } from '@/components/shared/icons'
import { formatGHS, formatRelative } from '@/lib/format'
import type { Order } from '@/lib/types'

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
  { value: 'active',    label: 'Active'    },
  { value: 'completed', label: 'Completed' },
] as const

type Tab = (typeof TABS)[number]['value']

export default function BuyerOrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab]         = useState<Tab>('all')
  const [confirming, setConfirming] = useState<string | null>(null)

  function load() {
    api.get('/orders/mine')
      .then(r => setOrders(r.data.data.orders ?? r.data.data ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const filtered = orders.filter(o => {
    if (tab === 'active')    return ['pending', 'confirmed', 'dispatched'].includes(o.trackingStatus)
    if (tab === 'completed') return ['completed', 'delivered', 'cancelled'].includes(o.trackingStatus)
    return true
  })

  async function confirmDelivery(orderId: string) {
    setConfirming(orderId)
    try {
      await api.post(`/orders/${orderId}/confirm-delivery`)
      load()
    } finally {
      setConfirming(null)
    }
  }

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="font-bold text-forest text-lg">My Orders</h1>
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex gap-1 pb-1 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.value} onClick={() => setTab(t.value)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-xl border-b-2 transition-colors whitespace-nowrap
                ${tab === t.value
                  ? 'border-forest text-forest'
                  : 'border-transparent text-muted-foreground hover:text-forest'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <OrderCardSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<OrdersIcon size={32} />}
            title="No orders yet"
            description="Orders you place on the marketplace will appear here."
          />
        ) : (
          filtered.map(order => {
            const cfg = STATUS_CONFIG[order.trackingStatus] ?? STATUS_CONFIG.pending
            const listing = (order as any).listing
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-sm transition-shadow">
                <Link href={`/orders/${order.id}`} className="flex items-center gap-4 p-4">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0">
                    {listing?.photos?.[0] ? (
                      <Image src={listing.photos[0]} alt="" fill sizes="56px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <OrdersIcon size={18} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {listing?.sector && (
                          <SectorChip
                            sector={listing.sector}
                            label={listing.category?.name ?? listing.sector}
                            size="sm"
                          />
                        )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>
                    </div>
                    <p className="font-display text-sm font-semibold text-forest truncate">
                      {listing?.title ?? 'Order'}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-mono text-xs font-bold text-forest">{formatGHS(order.totalAmount)}</span>
                      <span className="text-xs text-muted-foreground">{order.quantity} {listing?.unit ?? 'units'}</span>
                      <span className="text-xs text-muted-foreground ml-auto">{formatRelative(order.createdAt)}</span>
                    </div>
                  </div>
                  <ChevronRightIcon size={14} className="text-muted-foreground flex-shrink-0" />
                </Link>

                {/* Confirm delivery button */}
                {order.trackingStatus === 'dispatched' && (
                  <div className="border-t border-border px-4 py-3 bg-lime/5 flex items-center gap-3">
                    <p className="text-xs text-muted-foreground flex-1">Have you received this order?</p>
                    <button
                      disabled={confirming === order.id}
                      onClick={() => confirmDelivery(order.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-forest text-white
                                 rounded-lg hover:bg-forest-dark transition-colors disabled:opacity-60">
                      <CheckIcon size={12} /> Confirm received
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </main>
  )
}
