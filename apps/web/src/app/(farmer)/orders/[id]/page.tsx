'use client'

import { useEffect, useState, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link          from 'next/link'
import { api }       from '@/lib/api'
import { useAuth }   from '@/context/auth-context'
import { OrderDetail } from '@/components/orders/order-detail'
import { ArrowLeftIcon } from '@/components/shared/icons'

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }   = use(params)
  const router   = useRouter()
  const { user } = useAuth()
  const [order, setOrder]   = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    api.get(`/orders/${id}`)
      .then(r => setOrder(r.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-white rounded-2xl border border-border animate-pulse" />
          ))}
        </div>
      </main>
    )
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <p className="text-forest font-bold mb-2">Order not found</p>
          <Link href="/orders" className="text-sm text-muted-foreground hover:text-forest underline">
            Back to orders
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button onClick={() => router.back()}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-cream transition-colors">
            <ArrowLeftIcon size={18} className="text-forest" />
          </button>
          <div>
            <h1 className="font-bold text-forest text-sm leading-tight">Order detail</h1>
            <p className="font-mono text-[10px] text-muted-foreground">{order.orderNumber}</p>
          </div>
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
