'use client'

import { useEffect, useState } from 'react'
import Link                     from 'next/link'
import { api }                  from '@/lib/api'
import { formatGHS }            from '@/lib/format'

interface Order {
  id:             string
  orderNumber:    string
  trackingStatus: string
  totalAmount:    number
  createdAt:      string
  listing: { title: string; photos: string[]; sector: string }
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:    { label: 'Pending',    color: 'bg-cream-dark text-muted-foreground' },
  confirmed:  { label: 'Confirmed',  color: 'bg-lime/20 text-forest'             },
  dispatched: { label: 'On the way', color: 'bg-blue-50 text-blue-700'           },
  delivered:  { label: 'Delivered',  color: 'bg-lime/30 text-forest font-bold'   },
  cancelled:  { label: 'Cancelled',  color: 'bg-destructive/10 text-destructive' },
}

export default function ConsumerOrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders/mine').then(res => {
      setOrders(res.data.data?.orders ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const confirmDelivery = async (id: string) => {
    await api.post(`/orders/${id}/confirm-delivery`)
    setOrders(prev =>
      prev.map(o => o.id === id ? { ...o, trackingStatus: 'delivered' } : o),
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-bold text-forest">My orders</h1>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 bg-cream-dark rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-10 text-center">
          <p className="text-sm text-muted-foreground mb-3">No orders yet.</p>
          <Link href="/consumer"
            className="inline-block bg-forest text-white text-xs font-bold px-5 py-2.5 rounded-xl">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => {
            const status = STATUS_LABEL[order.trackingStatus] ?? STATUS_LABEL['pending']
            return (
              <div key={order.id}
                className="bg-white rounded-2xl border border-border p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm font-semibold text-forest line-clamp-2">
                      {order.listing.title}
                    </p>
                    <p className="font-mono text-xs text-muted-foreground mt-0.5">
                      #{order.orderNumber}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0 ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-forest">
                    {formatGHS(Number(order.totalAmount))}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString('en-GH', {
                      day: 'numeric', month: 'short',
                    })}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Link href={`/orders/${order.id}`}
                    className="flex-1 h-9 border border-border rounded-xl text-xs font-semibold
                               text-forest flex items-center justify-center">
                    View details
                  </Link>
                  {order.trackingStatus === 'dispatched' && (
                    <button
                      onClick={() => confirmDelivery(order.id)}
                      className="flex-1 h-9 bg-forest text-white rounded-xl text-xs font-bold"
                    >
                      Confirm received
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
