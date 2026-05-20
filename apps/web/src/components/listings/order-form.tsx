'use client'

import { useState }      from 'react'
import { useRouter }     from 'next/navigation'
import { useAuth }       from '@/context/auth-context'
import { api }           from '@/lib/api'
import { formatGHS }     from '@/lib/format'
import { LoadingIcon }   from '@/components/shared/icons'
import { BnplBadge }     from './bnpl-badge'
import type { ListingDetail } from '@/lib/types'

interface OrderFormProps {
  listing: ListingDetail
}

type Step = 'quantity' | 'confirm' | 'processing' | 'success' | 'error'

export function OrderForm({ listing }: OrderFormProps) {
  const { user }   = useAuth()
  const router     = useRouter()
  const [step, setStep]         = useState<Step>('quantity')
  const [qty, setQty]           = useState(listing.minOrderQuantity ?? 1)
  const [paymentMethod, setPM]  = useState<'mobile_money' | 'bnpl'>('mobile_money')
  const [errorMsg, setErrorMsg] = useState('')

  const min    = listing.minOrderQuantity ?? 1
  const max    = listing.quantityAvailable
  const total  = qty * listing.pricePerUnit
  const isPledge = listing.listingType === 'harvest_pledge'

  async function placeOrder() {
    if (!user) { router.push(`/login?next=/produce/${listing.slug}`); return }
    setStep('processing')
    try {
      const { data } = await api.post('/orders', {
        listingId:     listing.id,
        quantity:      parseInt(String(qty), 10),
        paymentMethod,
      })
      const order = data.data
      if (paymentMethod === 'mobile_money' && order.paymentUrl) {
        window.location.href = order.paymentUrl
      } else {
        setStep('success')
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error ?? 'Failed to place order. Try again.')
      setStep('error')
    }
  }

  if (step === 'success') {
    return (
      <div className="bg-white rounded-2xl border border-border p-6 text-center space-y-3">
        <div className="w-12 h-12 bg-lime/20 rounded-full flex items-center justify-center mx-auto">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-forest">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
        <h3 className="font-bold text-forest">Order placed!</h3>
        <p className="text-sm text-muted-foreground">
          Your {isPledge ? 'pledge' : 'order'} has been confirmed. The seller will be notified.
        </p>
        <button
          onClick={() => router.push('/orders')}
          className="w-full py-2.5 bg-forest text-white text-sm font-bold rounded-xl hover:bg-forest-dark transition-colors"
        >
          View orders
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className={`px-5 py-4 border-b border-border ${isPledge ? 'bg-harvest-gold/8' : 'bg-cream/50'}`}>
        <h2 className="font-bold text-forest text-sm">
          {isPledge ? 'Place a Pledge' : 'Place an Order'}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isPledge
            ? 'Reserve this harvest in advance with escrow protection'
            : 'Secure your purchase with mobile money'}
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Quantity */}
        <div>
          <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2.5">
            Quantity ({listing.unit.abbreviation})
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQty(q => Math.max(min, q - 1))}
              disabled={qty <= min}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-border
                         text-forest font-bold text-lg hover:bg-cream transition-colors disabled:opacity-30"
            >
              −
            </button>
            <input
              type="number"
              min={min}
              max={max}
              value={qty}
              onChange={e => {
                const parsed = parseInt(e.target.value, 10)
                setQty(isNaN(parsed) ? min : Math.min(max, Math.max(min, parsed)))
              }}
              className="flex-1 text-center font-mono text-lg font-bold text-forest border border-border
                         rounded-xl py-2 focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/10"
            />
            <button
              type="button"
              onClick={() => setQty(q => Math.min(max, q + 1))}
              disabled={qty >= max}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-border
                         text-forest font-bold text-lg hover:bg-cream transition-colors disabled:opacity-30"
            >
              +
            </button>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
            Min {min} · Max {max} {listing.unit.abbreviation}
          </p>
        </div>

        {/* Payment method */}
        {listing.bnplAvailable && (
          <div>
            <p className="text-xs font-bold text-forest uppercase tracking-wider mb-2.5">
              Payment method
            </p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'mobile_money', label: 'Mobile Money', sub: 'Pay now' },
                { value: 'bnpl',         label: 'Pay at Harvest', sub: 'BNPL eligible', badge: true },
              ] as const).map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPM(opt.value)}
                  className={`p-3 rounded-xl border text-left transition-all
                    ${paymentMethod === opt.value
                      ? 'border-forest bg-forest/5 ring-1 ring-forest/20'
                      : 'border-border hover:border-forest/40'}`}
                >
                  <p className="text-xs font-bold text-forest">{opt.label}</p>
                  {'badge' in opt && opt.badge ? (
                    <div className="mt-1"><BnplBadge size="sm" /></div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground mt-0.5">{opt.sub}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Total */}
        <div className="rounded-xl bg-cream p-4 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{qty} {listing.unit.abbreviation} × {formatGHS(listing.pricePerUnit)}</span>
            <span className="font-mono">{formatGHS(total)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Platform fee (3%)</span>
            <span className="font-mono">{formatGHS(total * 0.03)}</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-forest border-t border-border pt-1.5 mt-1">
            <span>Total</span>
            <span className="font-mono">{formatGHS(total * 1.03)}</span>
          </div>
        </div>

        {/* Error */}
        {step === 'error' && (
          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
            {errorMsg}
          </p>
        )}

        {/* CTA */}
        <button
          type="button"
          onClick={placeOrder}
          disabled={step === 'processing'}
          className="w-full py-3 bg-forest text-white text-sm font-bold rounded-xl
                     hover:bg-forest-dark active:scale-[0.98] transition-all
                     disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {step === 'processing' ? (
            <>
              <LoadingIcon size={16} className="animate-spin" />
              Processing…
            </>
          ) : (
            isPledge ? 'Pledge this harvest' : 'Place order'
          )}
        </button>

        {!user && (
          <p className="text-center text-xs text-muted-foreground">
            You'll be asked to sign in before checkout.
          </p>
        )}
      </div>
    </div>
  )
}
