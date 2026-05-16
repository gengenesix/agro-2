'use client'

import Link              from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { api }           from '@/lib/api'
import { SectorChip }    from '@/components/shared/sector-chip'
import { SearchIcon, ChevronRightIcon } from '@/components/shared/icons'
import { formatGHS, formatRelative } from '@/lib/format'

interface AdminOrder {
  id:             string
  orderNumber:    string
  status:         string
  trackingStatus: string
  orderType:      string
  totalAmount:    number
  quantity:       number
  createdAt:      string
  listing:        { title: string; sector: string; sectorLabel?: string; unit: string } | null
  buyer:          { fullName: string; phone: string } | null
  seller:         { fullName: string; phone: string } | null
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'Pending',    cls: 'bg-harvest-gold/15 text-harvest-gold' },
  confirmed:  { label: 'Confirmed',  cls: 'bg-lime/20 text-forest' },
  dispatched: { label: 'Dispatched', cls: 'bg-sector-fisheries-bg text-sector-fisheries' },
  delivered:  { label: 'Delivered',  cls: 'bg-lime/30 text-forest' },
  completed:  { label: 'Completed',  cls: 'bg-cream-dark text-muted-foreground' },
  cancelled:  { label: 'Cancelled',  cls: 'bg-red-50 text-red-600' },
  disputed:   { label: 'Disputed',   cls: 'bg-red-50 text-red-600' },
}

export default function AdminOrdersPage() {
  const [orders, setOrders]   = useState<AdminOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [status, setStatus]   = useState('')
  const [page, setPage]       = useState(1)
  const [total, setTotal]     = useState(0)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '25' })
    if (search) params.set('search', search)
    if (status) params.set('status', status)
    api.get(`/admin/orders?${params}`)
      .then(r => {
        setOrders(r.data.data?.orders ?? [])
        setTotal(r.data.data?.total ?? r.data.pagination?.total ?? 0)
      })
      .finally(() => setLoading(false))
  }, [page, search, status])

  useEffect(() => { load() }, [load])

  async function updateOrderStatus(id: string, newStatus: string) {
    await api.put(`/admin/orders/${id}/status`, { status: newStatus })
    load()
  }

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-bold text-forest text-lg">Orders</h1>
              <p className="text-xs text-muted-foreground">{total.toLocaleString('en-GH')} total</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Order number or buyer…"
                  className="pl-9 pr-4 py-2 text-sm border border-border rounded-xl bg-cream
                             focus:border-forest focus:outline-none w-52"
                />
              </div>
              <select value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}
                className="py-2 px-3 text-sm border border-border rounded-xl bg-white focus:border-forest focus:outline-none">
                <option value="">All statuses</option>
                {Object.keys(STATUS_CONFIG).map(s => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-cream/50">
                  {['Order', 'Listing', 'Buyer', 'Seller', 'Amount', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      {[1, 2, 3, 4, 5, 6, 7].map(j => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-cream-dark rounded animate-pulse" style={{ width: `${50 + j * 8}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : orders.map(o => {
                  const cfg = STATUS_CONFIG[o.trackingStatus] ?? STATUS_CONFIG.pending
                  return (
                    <tr key={o.id} className="hover:bg-cream/40 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs font-bold text-forest">{o.orderNumber}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{formatRelative(o.createdAt)}</p>
                      </td>
                      <td className="px-4 py-3 max-w-[200px]">
                        <div className="flex items-center gap-2">
                          {o.listing?.sector && <SectorChip sector={o.listing.sector as import('@/lib/types').Sector} label={o.listing.sectorLabel} size="sm" />}
                          <p className="text-xs font-semibold text-forest truncate">{o.listing?.title ?? '—'}</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{o.quantity} {o.listing?.unit ?? 'units'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-forest">{o.buyer?.fullName ?? '—'}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{o.buyer?.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-forest">{o.seller?.fullName ?? '—'}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{o.seller?.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-bold text-forest">{formatGHS(o.totalAmount)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={o.trackingStatus}
                          onChange={e => updateOrderStatus(o.id, e.target.value)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg border-0 cursor-pointer focus:outline-none ${cfg.cls}`}>
                          {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/orders/${o.id}`}
                          className="text-xs font-semibold text-forest hover:underline flex items-center gap-0.5">
                          View <ChevronRightIcon size={12} />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {total > 25 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-cream/30">
              <p className="text-xs text-muted-foreground">
                {(page - 1) * 25 + 1}–{Math.min(page * 25, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg
                             hover:bg-cream transition-colors disabled:opacity-40">
                  Previous
                </button>
                <button onClick={() => setPage(p => p + 1)} disabled={page * 25 >= total}
                  className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg
                             hover:bg-cream transition-colors disabled:opacity-40">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
