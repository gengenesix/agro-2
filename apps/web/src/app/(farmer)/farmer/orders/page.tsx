'use client'

import Link              from 'next/link'
import Image             from 'next/image'
import { useEffect, useState, useCallback } from 'react'
import { api }           from '@/lib/api'
import { useAuth }       from '@/context/auth-context'
import { EmptyState }    from '@/components/shared/empty-state'
import { OrderCardSkeleton } from '@/components/shared/skeleton'
import { SectorChip }    from '@/components/shared/sector-chip'
import { OrdersIcon, ChevronRightIcon, CheckIcon } from '@/components/shared/icons'
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
  buyerId:        string
  sellerId:       string
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
  pending:    { label: 'Pending',    cls: 'bg-harvest-gold/15 text-harvest-gold' },
  confirmed:  { label: 'Confirmed',  cls: 'bg-lime/20 text-forest' },
  preparing:  { label: 'Preparing',  cls: 'bg-lime/20 text-forest' },
  dispatched: { label: 'Dispatched', cls: 'bg-sector-fisheries-bg text-sector-fisheries' },
  in_transit: { label: 'In Transit', cls: 'bg-sector-fisheries-bg text-sector-fisheries' },
  delivered:  { label: 'Delivered',  cls: 'bg-lime/30 text-forest' },
  completed:  { label: 'Completed',  cls: 'bg-cream-dark text-muted-foreground' },
  cancelled:  { label: 'Cancelled',  cls: 'bg-red-50 text-red-600' },
  disputed:   { label: 'Disputed',   cls: 'bg-red-50 text-red-600' },
}

const TABS = [
  { value: 'purchases', label: 'Input Purchases'      },
  { value: 'sales',     label: 'Crop Sales & Pledges' },
] as const

type Tab = (typeof TABS)[number]['value']

export default function FarmerOrdersPage() {
  const { user }                          = useAuth()
  const [orders, setOrders]               = useState<FarmerOrder[]>([])
  const [loading, setLoading]             = useState(true)
  const [fetchError, setFetchError]       = useState(false)
  const [tab, setTab]                     = useState<Tab>('purchases')
  const [acting, setActing]               = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    setFetchError(false)
    api.get('/orders/mine')
      .then(r => setOrders(r.data?.data?.orders ?? []))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const userId    = user?.id ?? ''
  const purchases = orders.filter(o => o.buyerId === userId)
  const sales     = orders.filter(o => o.sellerId === userId)
  const displayed = tab === 'purchases' ? purchases : sales

  async function confirmDelivery(orderId: string) {
    setActing(orderId)
    try {
      await api.post(`/orders/${orderId}/confirm-delivery`)
      load()
    } catch {
      // no-op — user can retry via the detail page
    } finally {
      setActing(null)
    }
  }

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="font-bold text-forest text-lg">My Orders</h1>
        </div>

        {/* Tab switcher */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 flex gap-1 pb-1 overflow-x-auto scrollbar-none">
          {TABS.map(t => {
            const count = t.value === 'purchases' ? purchases.length : sales.length
            return (
              <button key={t.value} onClick={() => setTab(t.value)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-t-xl
                            border-b-2 transition-colors whitespace-nowrap
                  ${tab === t.value
                    ? 'border-forest text-forest'
                    : 'border-transparent text-muted-foreground hover:text-forest'}`}>
                {t.label}
                {!loading && count > 0 && (
                  <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full
                    ${tab === t.value ? 'bg-forest/10 text-forest' : 'bg-cream-dark text-muted-foreground'}`}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
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
        ) : displayed.length === 0 ? (
          <EmptyState
            icon={<OrdersIcon size={32} />}
            title={tab === 'purchases' ? 'No input purchases yet' : 'No crop sales yet'}
            description={tab === 'purchases'
              ? 'Inputs you buy from dealers will appear here.'
              : 'Orders for your listings and harvest pledges will appear here.'}
          />
        ) : (
          displayed.map(order => {
            const cfg              = STATUS_CONFIG[order.trackingStatus] ?? STATUS_CONFIG.pending
            const sector           = order.listing ? safeSector(order.listing.sector) : 'inputs'
            const unitAbbr         = order.listing?.unit ?? 'units'
            const canConfirmDelivery = tab === 'purchases' &&
              ['dispatched', 'in_transit'].includes(order.trackingStatus)

            return (
              <div key={order.id}
                   className={`bg-white rounded-2xl border overflow-hidden
                     ${canConfirmDelivery ? 'border-forest/30' : 'border-border'}`}>

                <Link href={`/orders/${order.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-cream/40 transition-colors">
                  {/* Thumbnail */}
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

                  {/* Info */}
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
                </Link>

                {/* Confirm Delivery CTA — only on dispatched/in_transit input purchases */}
                {canConfirmDelivery && (
                  <div className="px-4 pb-4 pt-0">
                    <button
                      disabled={acting === order.id}
                      onClick={() => confirmDelivery(order.id)}
                      className="w-full py-2.5 bg-forest text-white text-sm font-bold rounded-xl
                                 hover:bg-forest-dark transition-colors disabled:opacity-60
                                 flex items-center justify-center gap-2"
                    >
                      <CheckIcon size={14} />
                      {acting === order.id ? 'Confirming…' : 'Confirm Delivery'}
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
