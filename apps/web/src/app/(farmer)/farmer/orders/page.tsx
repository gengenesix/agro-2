'use client'

import Link              from 'next/link'
import Image             from 'next/image'
import { useEffect, useState } from 'react'
import { api }           from '@/lib/api'
import { EmptyState }    from '@/components/shared/empty-state'
import { OrderCardSkeleton } from '@/components/shared/skeleton'
import { SectorChip }    from '@/components/shared/sector-chip'
import { OrdersIcon, ChevronRightIcon } from '@/components/shared/icons'
import { formatGHS, formatRelative } from '@/lib/format'
import type { Sector } from '@/lib/types'

interface OrderListing {
  title:    string
  photos:   string[]
  slug:     string
  sector:   string
  category: { name: string }
  unit:     string
}

interface FarmerOrder {
  id:             string
  orderNumber:    string
  orderType:      string
  quantity:       number
  totalAmount:    number
  trackingStatus: string
  createdAt:      string
  listing:        OrderListing | null
}

const VALID_SECTORS = new Set<string>(['crops', 'livestock', 'poultry', 'fisheries', 'inputs'])
function safeSector(s: string): Sector {
  return VALID_SECTORS.has(s) ? (s as Sector) : 'crops'
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'Pending',     cls: 'bg-harvest-gold/15 text-harvest-gold' },
  confirmed:  { label: 'Confirmed',   cls: 'bg-lime/20 text-forest' },
  preparing:  { label: 'Preparing',   cls: 'bg-lime/20 text-forest' },
  dispatched: { label: 'Dispatched',  cls: 'bg-sector-fisheries-bg text-sector-fisheries' },
  in_transit: { label: 'In Transit',  cls: 'bg-sector-fisheries-bg text-sector-fisheries' },
  delivered:  { label: 'Delivered',   cls: 'bg-lime/30 text-forest' },
  completed:  { label: 'Completed',   cls: 'bg-cream-dark text-muted-foreground' },
  cancelled:  { label: 'Cancelled',   cls: 'bg-red-50 text-red-600' },
  disputed:   { label: 'Disputed',    cls: 'bg-red-50 text-red-600' },
}

const TABS = [
  { value: 'all',       label: 'All'       },
  { value: 'active',    label: 'Active'    },
  { value: 'completed', label: 'Completed' },
] as const

type Tab = (typeof TABS)[number]['value']

export default function FarmerOrdersPage() {
  const [orders, setOrders]       = useState<FarmerOrder[]>([])
  const [loading, setLoading]     = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [tab, setTab]             = useState<Tab>('all')

  useEffect(() => {
    api.get('/orders/mine')
      .then(r => setOrders(r.data?.data?.orders ?? []))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter(o => {
    if (tab === 'active')    return !['cancelled', 'disputed', 'completed'].includes(o.trackingStatus)
    if (tab === 'completed') return o.trackingStatus === 'completed'
    return true
  })

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="font-bold text-forest text-lg">My Orders</h1>
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex gap-1 pb-1 overflow-x-auto scrollbar-none">
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
          Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)
        ) : fetchError ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center">
            <p className="text-sm font-semibold text-forest">Could not load orders</p>
            <p className="text-xs text-muted-foreground mt-1">Check your connection and refresh.</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<OrdersIcon size={32} />}
            title={tab === 'all' ? 'No orders yet' : `No ${tab} orders`}
            description="Your purchase and sale orders will appear here."
          />
        ) : (
          filtered.map(order => {
            const cfg     = STATUS_CONFIG[order.trackingStatus] ?? STATUS_CONFIG.pending
            const sector  = order.listing ? safeSector(order.listing.sector) : 'crops'
            const unitAbbr = order.listing?.unit ?? 'units'
            return (
              <Link key={order.id} href={`/orders/${order.id}`}
                className="block bg-white rounded-2xl border border-border p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0">
                    {order.listing?.photos?.[0] ? (
                      <Image
                        src={order.listing.photos[0]}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <OrdersIcon size={20} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {order.listing && (
                        <SectorChip
                          sector={sector}
                          label={order.listing.category.name}
                          size="sm"
                        />
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.cls}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="font-display text-sm font-semibold text-forest truncate">
                      {order.listing?.title ?? `Order #${order.orderNumber}`}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-mono text-xs font-bold text-forest">
                        {formatGHS(order.totalAmount)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {order.quantity} {unitAbbr}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatRelative(order.createdAt)}
                      </span>
                    </div>
                  </div>

                  <ChevronRightIcon size={16} className="text-muted-foreground flex-shrink-0" />
                </div>
              </Link>
            )
          })
        )}
      </div>
    </main>
  )
}
