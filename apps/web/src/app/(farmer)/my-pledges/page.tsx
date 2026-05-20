'use client'

import Link              from 'next/link'
import Image             from 'next/image'
import { useEffect, useState } from 'react'
import { api }           from '@/lib/api'
import { EmptyState }    from '@/components/shared/empty-state'
import { OrderCardSkeleton } from '@/components/shared/skeleton'
import { PledgeIcon, ChevronRightIcon, CalendarIcon } from '@/components/shared/icons'
import { formatGHS, formatDate, formatRelative } from '@/lib/format'

interface PledgeOrder {
  id:              string
  orderNumber:     string
  pledgeProgress:  string | null
  trackingStatus:  string
  totalAmount:     number
  quantity:        number
  createdAt:       string
  listing: {
    title:              string
    photos:             string[]
    unit:               string
    expectedHarvestDate?: string
    slug:               string
  }
  buyer: {
    fullName: string
    avatarUrl?: string
  }
}

const PROGRESS_LABELS: Record<string, { label: string; cls: string }> = {
  planted:          { label: 'Planted',           cls: 'bg-sector-crops-bg text-sector-crops' },
  growing:          { label: 'Growing',           cls: 'bg-lime/20 text-forest' },
  ready_to_harvest: { label: 'Ready to harvest',  cls: 'bg-harvest-gold/15 text-harvest-gold' },
  harvested:        { label: 'Harvested',         cls: 'bg-forest/10 text-forest' },
  dispatched:       { label: 'Dispatched',        cls: 'bg-sector-fisheries-bg text-sector-fisheries' },
  delivered:        { label: 'Delivered',         cls: 'bg-lime/30 text-forest' },
  completed:        { label: 'Completed',         cls: 'bg-cream-dark text-muted-foreground' },
}

const PROGRESS_OPTIONS = [
  'planted', 'growing', 'ready_to_harvest', 'harvested', 'dispatched',
] as const

export default function FarmerPledgesPage() {
  const [orders, setOrders]   = useState<PledgeOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  function load() {
    api.get('/orders/mine?orderType=harvest_pledge')
      .then(r => {
        const all: PledgeOrder[] = r.data.data.orders ?? r.data.data ?? []
        setOrders(all.filter(o => o.listing && o.pledgeProgress !== null))
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function updateProgress(orderId: string, progress: string) {
    setUpdating(orderId)
    try {
      await api.post(`/orders/${orderId}/pledge-update`, { progress })
      load()
    } finally {
      setUpdating(null)
    }
  }

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="font-bold text-forest text-lg">Harvest Pledges</h1>
          <p className="text-xs text-muted-foreground">Update crop progress to notify buyers</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <OrderCardSkeleton key={i} />)
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<PledgeIcon size={32} />}
            title="No harvest pledges"
            description="When buyers reserve your future harvests, they will appear here."
          />
        ) : (
          orders.map(order => {
            const prog = PROGRESS_LABELS[order.pledgeProgress ?? '']
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-l-4 border-harvest-gold overflow-hidden">
                <Link href={`/orders/${order.id}`} className="flex items-center gap-4 p-4 hover:bg-cream/30 transition-colors">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0">
                    {order.listing.photos?.[0] ? (
                      <Image src={order.listing.photos[0]} alt="" fill sizes="56px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <PledgeIcon size={18} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm font-semibold text-forest truncate">{order.listing.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {order.quantity} {order.listing?.unit} — {order.buyer?.fullName ?? '—'}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      {prog && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${prog.cls}`}>
                          {prog.label}
                        </span>
                      )}
                      {order.listing.expectedHarvestDate && (
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <CalendarIcon size={10} />
                          {formatDate(order.listing.expectedHarvestDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="font-mono text-sm font-bold text-forest">{formatGHS(order.totalAmount)}</span>
                    <ChevronRightIcon size={14} className="text-muted-foreground ml-2" />
                  </div>
                </Link>

                {/* Progress update */}
                {!['delivered', 'completed', 'cancelled'].includes(order.trackingStatus) && (
                  <div className="border-t border-border px-4 py-3 bg-cream/30">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
                      Update crop progress
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {PROGRESS_OPTIONS.map(opt => (
                        <button key={opt}
                          disabled={updating === order.id}
                          onClick={() => updateProgress(order.id, opt)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-full border transition-colors
                            ${order.pledgeProgress === opt
                              ? 'bg-forest text-white border-forest'
                              : 'bg-white text-forest border-border hover:border-forest'}`}>
                          {opt.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
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
