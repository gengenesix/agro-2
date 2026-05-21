'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams }  from 'next/navigation'
import Link           from 'next/link'
import { api }        from '@/lib/api'
import { useAuth }    from '@/context/auth-context'
import { OrderDetail } from '@/components/orders/order-detail'
import { ChevronRightIcon } from '@/components/shared/icons'

export default function DealerOrderDetailPage() {
  const { id }           = useParams<{ id: string }>()
  const { user }         = useAuth()
  const [order, setOrder]   = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(false)

  const load = useCallback(() => {
    api.get(`/orders/${id}`)
      .then(r => setOrder(r.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <main className="min-h-screen bg-cream p-4 sm:p-6">
      <div className="max-w-2xl mx-auto space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-border animate-pulse" />
        ))}
      </div>
    </main>
  )

  if (error || !order) return (
    <main className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="text-center">
        <p className="font-bold text-forest text-lg mb-1">Order not found</p>
        <p className="text-sm text-muted-foreground mb-4">This order doesn't exist or you don't have access.</p>
        <Link href="/dealer/orders"
          className="inline-flex items-center gap-1 text-sm font-semibold text-forest hover:underline">
          <ChevronRightIcon size={14} className="rotate-180" /> Back to orders
        </Link>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/dealer/orders"
            className="flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-forest transition-colors">
            <ChevronRightIcon size={14} className="rotate-180" />
            Orders
          </Link>
          <span className="text-border">/</span>
          <span className="font-mono text-xs text-muted-foreground">{order.orderNumber}</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-5">
        <OrderDetail
          order={order}
          currentUserId={user?.id ?? ''}
          onRefresh={load}
        />
      </div>
    </main>
  )
}
