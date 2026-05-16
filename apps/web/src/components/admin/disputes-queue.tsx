'use client'

import { useState } from 'react'
import Image        from 'next/image'
import Link         from 'next/link'
import { api }      from '@/lib/api'
import { formatGHS, formatRelative } from '@/lib/format'
import { SectorChip }   from '@/components/shared/sector-chip'
import { OrdersIcon, CheckIcon } from '@/components/shared/icons'

interface Dispute {
  id:          string
  orderNumber: string
  status:      string
  totalAmount: number
  createdAt:   string
  disputeReason?:  string
  listing:     { title: string; sector: string } | null
  buyer:       { fullName: string; phone: string } | null
  seller:      { fullName: string; phone: string } | null
}

interface DisputesQueueProps {
  disputes: Dispute[]
  loading:  boolean
  onRefresh: () => void
}

const RESOLUTION_OPTIONS = [
  { value: 'full_refund',        label: 'Full refund to buyer'       },
  { value: 'partial_refund',     label: 'Partial refund (50%)'       },
  { value: 'release_to_seller',  label: 'Release funds to seller'    },
  { value: 'relist',             label: 'Cancel & relist item'       },
]

export function DisputesQueue({ disputes, loading, onRefresh }: DisputesQueueProps) {
  const [resolving, setResolving]         = useState<string | null>(null)
  const [resolutionMap, setResolutionMap] = useState<Record<string, string>>({})
  const [notesMap, setNotesMap]           = useState<Record<string, string>>({})

  async function resolve(orderId: string) {
    const resolution = resolutionMap[orderId]
    const notes      = notesMap[orderId]
    if (!resolution) return

    setResolving(orderId)
    try {
      await api.post(`/admin/orders/${orderId}/resolve-dispute`, { resolution, notes })
      onRefresh()
    } finally {
      setResolving(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 bg-white rounded-2xl border border-border animate-pulse" />
        ))}
      </div>
    )
  }

  if (disputes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-lime/20 flex items-center justify-center mb-3">
          <CheckIcon size={22} className="text-forest" />
        </div>
        <p className="font-bold text-forest text-sm">No active disputes</p>
        <p className="text-xs text-muted-foreground mt-1">All disputes have been resolved.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {disputes.map(d => (
        <div key={d.id} className="bg-white rounded-2xl border-2 border-red-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 p-4 bg-red-50/50">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <OrdersIcon size={18} className="text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                {d.listing?.sector && <SectorChip sector={d.listing.sector as import('@/lib/types').Sector} size="sm" />}
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                  Disputed
                </span>
              </div>
              <p className="font-display text-sm font-semibold text-forest truncate">
                {d.listing?.title ?? 'Order'}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="font-mono text-xs font-bold text-forest">{formatGHS(d.totalAmount)}</span>
                <span className="font-mono text-xs text-muted-foreground">{d.orderNumber}</span>
                <span className="text-xs text-muted-foreground ml-auto">{formatRelative(d.createdAt)}</span>
              </div>
            </div>
            <Link href={`/orders/${d.id}`}
              className="text-xs font-semibold text-forest hover:underline flex-shrink-0">
              View order
            </Link>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 border-b border-border">
            {[
              { role: 'Buyer',  p: d.buyer  },
              { role: 'Seller', p: d.seller },
            ].map(({ role, p }) => (
              <div key={role} className={`px-4 py-3 ${role === 'Seller' ? 'border-l border-border' : ''}`}>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">{role}</p>
                <p className="text-xs font-semibold text-forest">{p?.fullName ?? '—'}</p>
                <p className="font-mono text-[10px] text-muted-foreground">{p?.phone ?? ''}</p>
              </div>
            ))}
          </div>

          {/* Dispute reason */}
          {d.disputeReason && (
            <div className="px-4 py-3 bg-red-50/30 border-b border-border">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                Dispute reason
              </p>
              <p className="text-xs text-forest">{d.disputeReason}</p>
            </div>
          )}

          {/* Resolution panel */}
          <div className="p-4 space-y-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
              Resolution
            </p>
            <div className="grid grid-cols-2 gap-2">
              {RESOLUTION_OPTIONS.map(opt => (
                <button key={opt.value}
                  onClick={() => setResolutionMap(m => ({ ...m, [d.id]: opt.value }))}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl border text-left transition-colors
                    ${resolutionMap[d.id] === opt.value
                      ? 'bg-forest text-white border-forest'
                      : 'bg-white text-forest border-border hover:border-forest'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
            <textarea
              value={notesMap[d.id] ?? ''}
              onChange={e => setNotesMap(m => ({ ...m, [d.id]: e.target.value }))}
              placeholder="Admin notes (optional)"
              rows={2}
              className="w-full border border-border rounded-xl p-3 text-xs resize-none
                         focus:border-forest focus:outline-none bg-cream"
            />
            <button
              disabled={!resolutionMap[d.id] || resolving === d.id}
              onClick={() => resolve(d.id)}
              className="w-full py-2.5 bg-forest text-white text-sm font-bold rounded-xl
                         hover:bg-forest-dark transition-colors disabled:opacity-50">
              {resolving === d.id ? 'Resolving…' : 'Apply resolution'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
