'use client'

import { useEffect, useState } from 'react'
import { api }                  from '@/lib/api'
import { formatGHS }            from '@/lib/format'

interface WalletTx {
  id:          string
  type:        string
  amount:      number
  balanceAfter: number
  description: string | null
  reference:   string | null
  createdAt:   string
}

interface EarningsData {
  transactions:  WalletTx[]
  total:         number
  walletBalance: number
}

export default function FieldAgentEarningsPage() {
  const [data, setData]     = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage]     = useState(1)
  const [pages, setPages]   = useState(1)

  const load = (p: number) => {
    setLoading(true)
    api.get(`/field-agent/earnings?page=${p}`)
      .then(res => {
        setData(res.data.data)
        setPages(res.data.pagination?.pages ?? 1)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(page) }, [page])

  const totalEarned = (data?.transactions ?? [])
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + Number(t.amount), 0)

  const verifiedCount = (data?.transactions ?? [])
    .filter(t => t.type === 'credit' && t.reference?.startsWith('verify-')).length

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-forest">Earnings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">GHS 10 per verified farmer</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground font-semibold">Wallet balance</p>
          <p className="font-mono text-lg font-bold text-forest mt-1">
            {data ? formatGHS(data.walletBalance) : '—'}
          </p>
        </div>
        <div className="bg-lime/20 rounded-2xl border border-lime/40 p-4">
          <p className="text-xs text-muted-foreground font-semibold">Total earned</p>
          <p className="font-mono text-lg font-bold text-forest mt-1">
            {formatGHS(totalEarned)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-border p-4">
          <p className="text-xs text-muted-foreground font-semibold">Farmers verified</p>
          <p className="text-lg font-bold text-forest mt-1">{verifiedCount}</p>
        </div>
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-semibold text-sm text-forest">Transaction history</h2>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-cream-dark rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (data?.transactions ?? []).length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted-foreground">No transactions yet. Start verifying farmers to earn.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {(data?.transactions ?? []).map(tx => (
              <div key={tx.id} className="px-5 py-4 flex items-center gap-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  tx.type === 'credit' ? 'bg-lime/20' : 'bg-cream-dark'
                }`}>
                  <svg viewBox="0 0 24 24" className={`w-4 h-4 fill-current ${
                    tx.type === 'credit' ? 'text-forest' : 'text-muted-foreground'
                  }`}>
                    {tx.type === 'credit'
                      ? <path d="M7 14l5-5 5 5z"/>
                      : <path d="M7 10l5 5 5-5z"/>}
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-forest truncate">
                    {tx.description ?? tx.type}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(tx.createdAt).toLocaleDateString('en-GH', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-mono text-sm font-bold ${
                    tx.type === 'credit' ? 'text-forest' : 'text-destructive'
                  }`}>
                    {tx.type === 'credit' ? '+' : '-'}{formatGHS(Number(tx.amount))}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    bal {formatGHS(Number(tx.balanceAfter))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="px-5 py-4 border-t border-border flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-xs font-semibold text-forest disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-muted-foreground">Page {page} of {pages}</span>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="text-xs font-semibold text-forest disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
