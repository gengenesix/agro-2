'use client'

import { CheckIcon } from '@/components/shared/icons'

type OrderStatus  = 'pending' | 'confirmed' | 'dispatched' | 'delivered' | 'completed' | 'cancelled' | 'disputed'
type PledgeProgress = 'planted' | 'growing' | 'ready_to_harvest' | 'harvested' | 'dispatched' | 'delivered'

interface TrackingTimelineProps {
  status:          OrderStatus
  orderType:       'direct_purchase' | 'harvest_pledge' | 'input_purchase'
  pledgeProgress?: PledgeProgress | null
}

const DIRECT_STEPS = [
  { key: 'pending',    label: 'Order Placed',   desc: 'Waiting for confirmation' },
  { key: 'confirmed',  label: 'Confirmed',      desc: 'Seller confirmed your order' },
  { key: 'dispatched', label: 'Dispatched',     desc: 'Produce is on the way' },
  { key: 'delivered',  label: 'Delivered',      desc: 'Delivered to you' },
  { key: 'completed',  label: 'Completed',      desc: 'Payment released to seller' },
]

const PLEDGE_STEPS = [
  { key: 'pending',          label: 'Pledge Created',     desc: 'Harvest pledge recorded' },
  { key: 'planted',          label: 'Planted',            desc: 'Crop has been planted' },
  { key: 'growing',          label: 'Growing',            desc: 'Crop is developing well' },
  { key: 'ready_to_harvest', label: 'Ready to Harvest',   desc: 'Approaching harvest time' },
  { key: 'harvested',        label: 'Harvested',          desc: 'Crop has been harvested' },
  { key: 'dispatched',       label: 'Dispatched',         desc: 'Produce dispatched to you' },
  { key: 'delivered',        label: 'Delivered',          desc: 'Produce delivered' },
  { key: 'completed',        label: 'Completed',          desc: 'Payment released to farmer' },
]

const DIRECT_ORDER = ['pending', 'confirmed', 'dispatched', 'delivered', 'completed']
const PLEDGE_ORDER = ['pending', 'planted', 'growing', 'ready_to_harvest', 'harvested', 'dispatched', 'delivered', 'completed']

function getActiveIndex(steps: string[], orderType: string, status: OrderStatus, pledge?: PledgeProgress | null): number {
  if (orderType === 'harvest_pledge' && pledge) {
    return steps.indexOf(pledge)
  }
  if (status === 'delivered' || status === 'completed') {
    return steps.indexOf(status)
  }
  return steps.indexOf(status)
}

export function TrackingTimeline({ status, orderType, pledgeProgress }: TrackingTimelineProps) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-3 py-4 px-5 bg-red-50 rounded-2xl border border-red-100">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M18 6 6 18M6 6l12 12" stroke="#dc2626" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <p className="font-bold text-sm text-red-700">Order Cancelled</p>
          <p className="text-xs text-red-500">This order has been cancelled.</p>
        </div>
      </div>
    )
  }

  if (status === 'disputed') {
    return (
      <div className="flex items-center gap-3 py-4 px-5 bg-harvest-gold/10 rounded-2xl border border-harvest-gold/20">
        <div className="w-8 h-8 rounded-full bg-harvest-gold/20 flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" stroke="#ca8a04" strokeWidth="1.75" strokeLinejoin="round"/>
            <path d="M12 9v4" stroke="#ca8a04" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="17" r="1" fill="#ca8a04"/>
          </svg>
        </div>
        <div>
          <p className="font-bold text-sm text-harvest-gold">Under Dispute</p>
          <p className="text-xs text-harvest-gold/70">AgroConnect team is reviewing this order.</p>
        </div>
      </div>
    )
  }

  const isPledge    = orderType === 'harvest_pledge'
  const steps       = isPledge ? PLEDGE_STEPS : DIRECT_STEPS
  const order       = isPledge ? PLEDGE_ORDER : DIRECT_ORDER
  const activeIndex = getActiveIndex(order, orderType, status, pledgeProgress)

  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const idx      = order.indexOf(step.key)
        const done     = idx < activeIndex
        const current  = idx === activeIndex
        const upcoming = idx > activeIndex
        const isLast   = i === steps.length - 1

        return (
          <div key={step.key} className="flex gap-4">
            {/* Dot + line */}
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                ${done    ? 'bg-forest border-forest text-white'
                : current ? 'bg-lime border-forest text-forest'
                : 'bg-white border-border'}`}>
                {done
                  ? <CheckIcon size={13} />
                  : current
                    ? <div className="w-2.5 h-2.5 rounded-full bg-forest" />
                    : <div className="w-2 h-2 rounded-full bg-border" />
                }
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 min-h-[28px] transition-colors ${done ? 'bg-forest' : 'bg-border'}`} />
              )}
            </div>

            {/* Label */}
            <div className={`pb-5 ${isLast ? 'pb-0' : ''}`}>
              <p className={`text-sm font-bold transition-colors ${upcoming ? 'text-muted-foreground' : 'text-forest'}`}>
                {step.label}
              </p>
              <p className={`text-xs mt-0.5 ${upcoming ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                {step.desc}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
