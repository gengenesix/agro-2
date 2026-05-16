'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { api }        from '@/lib/api'
import { LoadingIcon } from '@/components/shared/icons'
import Link           from 'next/link'

type State = 'loading' | 'success' | 'failed' | 'already_paid'

function PaymentVerifyContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const [state, setState]   = useState<State>('loading')
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (!reference) { setState('failed'); return }

    api.get(`/payments/verify?reference=${reference}`)
      .then(r => {
        const { status, orderId: oid } = r.data.data
        setOrderId(oid)
        if (status === 'success')      setState('success')
        else if (status === 'already') setState('already_paid')
        else                           setState('failed')
      })
      .catch(() => setState('failed'))
  }, [searchParams])

  if (state === 'loading') return (
    <div className="min-h-screen bg-cream flex items-center justify-center flex-col gap-4">
      <LoadingIcon size={36} className="animate-spin text-forest" />
      <p className="text-sm text-muted-foreground font-semibold">Verifying your payment…</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-border p-8 max-w-sm w-full text-center">
        {(state === 'success' || state === 'already_paid') ? (
          <>
            <div className="w-16 h-16 bg-lime/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-forest">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-forest mb-2">Payment confirmed</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Your order has been placed. The seller has been notified and will prepare your produce.
            </p>
            <div className="space-y-2">
              {orderId && (
                <Link href={`/orders/${orderId}`}
                  className="block w-full py-3 bg-forest text-white font-bold text-sm rounded-xl
                             hover:bg-forest-dark transition-colors">
                  View order
                </Link>
              )}
              <Link href="/produce"
                className="block w-full py-3 border border-border text-forest font-bold text-sm
                           rounded-xl hover:bg-cream transition-colors">
                Continue shopping
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-red-500">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-forest mb-2">Payment failed</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Your payment could not be verified. No charge was made to your account.
            </p>
            <button onClick={() => router.back()}
              className="w-full py-3 bg-forest text-white font-bold text-sm rounded-xl
                         hover:bg-forest-dark transition-colors">
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function PaymentVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center flex-col gap-4">
        <LoadingIcon size={36} className="animate-spin text-forest" />
        <p className="text-sm text-muted-foreground font-semibold">Verifying your payment…</p>
      </div>
    }>
      <PaymentVerifyContent />
    </Suspense>
  )
}
