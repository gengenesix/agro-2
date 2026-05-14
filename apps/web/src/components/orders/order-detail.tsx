'use client'

import { useState } from 'react'
import Image        from 'next/image'
import Link         from 'next/link'
import { api }      from '@/lib/api'
import { TrackingTimeline } from '@/components/orders/tracking-timeline'
import { SectorChip }       from '@/components/shared/sector-chip'
import {
  MapPinIcon, TruckIcon, ProfileIcon, CalendarIcon,
  CheckIcon, PledgeIcon, CloseIcon,
} from '@/components/shared/icons'
import { formatGHS, formatDate, formatRelative } from '@/lib/format'

interface OrderDetailProps {
  order:    any
  currentUserId: string
  onRefresh: () => void
}

const PLEDGE_PROGRESS_OPTIONS = [
  { value: 'planted',          label: 'Planted'           },
  { value: 'growing',          label: 'Growing'           },
  { value: 'ready_to_harvest', label: 'Ready to harvest'  },
  { value: 'harvested',        label: 'Harvested'         },
  { value: 'dispatched',       label: 'Dispatched'        },
]

export function OrderDetail({ order, currentUserId, onRefresh }: OrderDetailProps) {
  const [acting, setActing]     = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [reason, setReason]     = useState('')

  const isBuyer  = order.buyerId  === currentUserId
  const isSeller = order.sellerId === currentUserId
  const listing  = order.listing
  const isPledge = order.orderType === 'harvest_pledge'

  async function confirmDelivery() {
    setActing(true)
    try {
      await api.post(`/orders/${order.id}/confirm-delivery`)
      onRefresh()
    } finally {
      setActing(false)
    }
  }

  async function updatePledgeProgress(progress: string) {
    setActing(true)
    try {
      await api.post(`/orders/${order.id}/pledge-update`, { progress })
      onRefresh()
    } finally {
      setActing(false)
    }
  }

  async function cancelOrder() {
    if (!reason.trim()) return
    setActing(true)
    try {
      await api.post(`/orders/${order.id}/cancel`, { reason })
      setCancelOpen(false)
      onRefresh()
    } finally {
      setActing(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Listing header card */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center gap-4 p-4">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0">
            {listing?.photos?.[0] ? (
              <Image src={listing.photos[0]} alt="" fill sizes="64px" className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-forest/5">
                <PledgeIcon size={22} className="text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {listing?.sector && <SectorChip sector={listing.sector} size="sm" />}
              {isPledge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-harvest-gold/15 text-harvest-gold">
                  Harvest Pledge
                </span>
              )}
            </div>
            <p className="font-display font-semibold text-forest leading-tight">
              {listing?.title ?? 'Order'}
            </p>
            <p className="font-mono text-xs text-muted-foreground mt-1">{order.orderNumber}</p>
          </div>
        </div>

        {/* Order stats */}
        <div className="grid grid-cols-3 border-t border-border divide-x divide-border">
          <div className="px-4 py-3 text-center">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Quantity</p>
            <p className="font-mono text-sm font-bold text-forest mt-0.5">
              {order.quantity} {listing?.unit ?? 'units'}
            </p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Unit price</p>
            <p className="font-mono text-sm font-bold text-forest mt-0.5">{formatGHS(order.unitPrice)}</p>
          </div>
          <div className="px-4 py-3 text-center">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Total</p>
            <p className="font-mono text-sm font-bold text-forest mt-0.5">{formatGHS(order.totalAmount)}</p>
          </div>
        </div>
      </div>

      {/* Tracking timeline */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="font-bold text-forest text-sm mb-4">Order progress</h2>
        <TrackingTimeline
          status={order.trackingStatus}
          orderType={order.orderType}
          pledgeProgress={order.pledgeProgress}
        />
      </div>

      {/* Delivery & dates */}
      <div className="bg-white rounded-2xl border border-border p-4 space-y-3">
        <h2 className="font-bold text-forest text-sm">Details</h2>
        {order.deliveryOption && (
          <div className="flex items-center gap-3">
            <TruckIcon size={16} className="text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-forest capitalize">
                {order.deliveryOption.replace(/_/g, ' ')}
              </p>
              {order.deliveryAddress && (
                <p className="text-xs text-muted-foreground mt-0.5">{order.deliveryAddress}</p>
              )}
            </div>
          </div>
        )}
        {listing?.region && (
          <div className="flex items-center gap-3">
            <MapPinIcon size={16} className="text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              {listing.district && `${listing.district}, `}{listing.region}
            </p>
          </div>
        )}
        {isPledge && listing?.expectedHarvestDate && (
          <div className="flex items-center gap-3">
            <CalendarIcon size={16} className="text-muted-foreground flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              Expected harvest: {formatDate(listing.expectedHarvestDate)}
            </p>
          </div>
        )}
        <div className="flex items-center gap-3">
          <CalendarIcon size={16} className="text-muted-foreground flex-shrink-0" />
          <p className="text-xs text-muted-foreground">Placed {formatRelative(order.createdAt)}</p>
        </div>
        {order.buyerNotes && (
          <div className="bg-cream rounded-xl p-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Buyer note</p>
            <p className="text-xs text-forest">{order.buyerNotes}</p>
          </div>
        )}
      </div>

      {/* Price breakdown */}
      <div className="bg-white rounded-2xl border border-border p-4">
        <h2 className="font-bold text-forest text-sm mb-3">Price breakdown</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-mono font-semibold text-forest">{formatGHS(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Platform fee</span>
            <span className="font-mono text-muted-foreground">{formatGHS(order.platformCommission)}</span>
          </div>
          {order.depositAmount && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Deposit paid ({listing?.depositPercentage ?? 20}%)</span>
              <span className="font-mono text-harvest-gold font-semibold">{formatGHS(order.depositAmount)}</span>
            </div>
          )}
          <div className="border-t border-border pt-2 flex justify-between">
            <span className="font-bold text-forest text-sm">Total</span>
            <span className="font-mono font-bold text-forest">{formatGHS(order.totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Buyer',  person: order.buyer  },
          { label: 'Seller', person: order.seller },
        ].map(({ label, person }) => (
          <div key={label} className="bg-white rounded-2xl border border-border p-4">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">{label}</p>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-forest text-white text-xs font-bold
                              flex items-center justify-center flex-shrink-0">
                {(person?.fullName || '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-forest truncate">{person?.fullName ?? '—'}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{person?.phone ?? ''}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      {isBuyer && order.trackingStatus === 'dispatched' && (
        <button
          disabled={acting}
          onClick={confirmDelivery}
          className="w-full py-3.5 bg-forest text-white font-bold rounded-2xl
                     hover:bg-forest-dark transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          <CheckIcon size={16} />
          {acting ? 'Processing…' : 'Confirm delivery received'}
        </button>
      )}

      {isSeller && isPledge && !['delivered', 'completed', 'cancelled'].includes(order.trackingStatus) && (
        <div className="bg-white rounded-2xl border border-border p-4">
          <p className="text-xs font-bold text-forest mb-3">Update crop progress</p>
          <div className="flex gap-2 flex-wrap">
            {PLEDGE_PROGRESS_OPTIONS.map(opt => (
              <button key={opt.value}
                disabled={acting}
                onClick={() => updatePledgeProgress(opt.value)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-colors disabled:opacity-40
                  ${order.pledgeProgress === opt.value
                    ? 'bg-forest text-white border-forest'
                    : 'bg-white text-forest border-border hover:border-forest'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {['pending', 'confirmed'].includes(order.trackingStatus) && (isBuyer || isSeller) && (
        <div>
          {!cancelOpen ? (
            <button onClick={() => setCancelOpen(true)}
              className="w-full py-3 border border-red-200 text-red-500 text-sm font-semibold rounded-2xl
                         hover:bg-red-50 transition-colors">
              Cancel order
            </button>
          ) : (
            <div className="bg-white rounded-2xl border border-red-200 p-4 space-y-3">
              <p className="text-sm font-bold text-red-600">Cancel this order?</p>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Reason for cancellation (required)"
                rows={3}
                className="w-full border border-border rounded-xl p-3 text-sm resize-none
                           focus:border-red-400 focus:outline-none bg-cream"
              />
              <div className="flex gap-2">
                <button
                  disabled={acting || !reason.trim()}
                  onClick={cancelOrder}
                  className="flex-1 py-2.5 bg-red-500 text-white text-sm font-bold rounded-xl
                             hover:bg-red-600 transition-colors disabled:opacity-50">
                  {acting ? 'Cancelling…' : 'Confirm cancel'}
                </button>
                <button onClick={() => setCancelOpen(false)}
                  className="px-4 py-2.5 border border-border text-sm font-semibold rounded-xl
                             text-muted-foreground hover:text-forest transition-colors">
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
