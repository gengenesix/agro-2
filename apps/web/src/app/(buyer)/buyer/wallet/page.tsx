'use client'

import { useEffect, useState }        from 'react'
import { api }                         from '@/lib/api'
import { DashboardStatsSkeleton }      from '@/components/shared/skeleton'
import { EmptyState }                  from '@/components/shared/empty-state'
import { WalletIcon }                  from '@/components/shared/icons'
import { formatGHS, formatRelative }   from '@/lib/format'
import type { Wallet, WalletTransaction } from '@/lib/types'

const TX_TYPE_LABEL: Record<string, string> = {
  credit:         'Received',
  debit:          'Payment sent',
  escrow_hold:    'Held in escrow',
  escrow_release: 'Escrow released',
  withdrawal:     'Withdrawal',
  commission:     'Platform fee',
  bnpl_deduction: 'BNPL deduction',
  refund:         'Refund',
}

export default function BuyerWalletPage() {
  const [wallet, setWallet]         = useState<Wallet | null>(null)
  const [txns, setTxns]             = useState<WalletTransaction[]>([])
  const [orders, setOrders]         = useState<any[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.get('/payments/wallet'),
      api.get('/payments/wallet/transactions'),
      api.get('/orders/mine?limit=200'),
    ]).then(([w, t, o]) => {
      if (w.status === 'fulfilled') setWallet(w.value.data.data)
      if (t.status === 'fulfilled') setTxns(t.value.data.data.transactions ?? [])
      if (o.status === 'fulfilled') setOrders(o.value.data.data.orders ?? [])
    }).finally(() => setLoading(false))
  }, [])

  // Primary: aggregate from ledger transactions
  // Fallback: aggregate from live order states when ledger is empty
  const totalProcurement = txns.length > 0
    ? txns
        .filter(tx => tx.type === 'debit' || tx.type === 'escrow_hold')
        .reduce((sum, tx) => sum + tx.amount, 0)
    : orders
        .filter(o => ['completed', 'delivered'].includes(o.trackingStatus))
        .reduce((sum, o) => sum + Number(o.totalAmount), 0)

  const activeEscrow = txns.length > 0
    ? (wallet?.pendingBalance ?? 0)
    : orders
        .filter(o => ['pending', 'confirmed'].includes(o.trackingStatus))
        .reduce((sum, o) => sum + Number(o.totalAmount), 0)

  if (loading) return (
    <main className="min-h-screen bg-cream p-4 sm:p-6 space-y-5">
      <DashboardStatsSkeleton />
    </main>
  )

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="font-bold text-forest text-lg">Procurement Wallet</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Balance, escrow &amp; purchase history</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Balance card */}
        <div className="bg-forest rounded-2xl p-5 text-white relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize:  '20px 20px',
            }}
          />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">
                  Available Balance
                </p>
                <p className="text-3xl font-extrabold font-mono tracking-tight">
                  {formatGHS(wallet?.balance ?? 0)}
                </p>
              </div>
              <div className="p-2.5 bg-white/10 rounded-xl">
                <WalletIcon size={24} className="text-lime" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-white/50 text-[10px] font-medium uppercase tracking-wide mb-1">
                  Active Escrow
                </p>
                <p className="text-white font-bold font-mono text-sm">
                  {formatGHS(activeEscrow)}
                </p>
                <p className="text-white/40 text-[10px] mt-0.5">Pending order fulfilment</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <p className="text-white/50 text-[10px] font-medium uppercase tracking-wide mb-1">
                  Total Procurement
                </p>
                <p className="text-white font-bold font-mono text-sm">
                  {formatGHS(totalProcurement)}
                </p>
                <p className="text-white/40 text-[10px] mt-0.5">All-time spending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Escrow info banner */}
        {activeEscrow > 0 && (
          <div className="bg-harvest-gold/10 border border-harvest-gold/30 rounded-2xl px-5 py-4">
            <div className="flex items-start gap-3">
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
                   className="w-4 h-4 text-harvest-gold flex-shrink-0 mt-0.5">
                <path d="M10 2a4 4 0 00-4 4v1H5a2 2 0 00-2 2v7a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2h-1V6a4 4 0 00-4-4zm0 2a2 2 0 012 2v1H8V6a2 2 0 012-2zm0 8a2 2 0 100-4 2 2 0 000 4z"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="text-xs font-bold text-harvest-gold">Funds protected in escrow</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatGHS(activeEscrow)} is held securely until your orders are confirmed delivered.
                  You will be automatically refunded if a farmer fails to fulfil.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Transaction history */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-bold text-forest text-sm">Transaction history</h2>
          </div>

          {txns.length === 0 ? (
            <div className="py-10">
              <EmptyState
                icon={<WalletIcon size={28} />}
                title="No transactions yet"
                description="Your deposits and order payments will appear here once you start purchasing."
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {txns.map(tx => {
                const isCredit = ['credit', 'escrow_release', 'refund'].includes(tx.type)
                return (
                  <div key={tx.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-cream/40 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0
                                    ${isCredit ? 'bg-lime/20' : 'bg-red-50'}`}>
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                           className={`w-4 h-4 ${isCredit ? 'text-forest' : 'text-red-500'}`}>
                        {isCredit
                          ? <path d="M8 13V3M4 7l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                          : <path d="M8 3v10M4 9l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />}
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-forest">
                        {TX_TYPE_LABEL[tx.type] ?? tx.type}
                      </p>
                      {tx.description && (
                        <p className="text-xs text-muted-foreground truncate">{tx.description}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-0.5">{formatRelative(tx.createdAt)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-mono text-sm font-bold ${isCredit ? 'text-forest' : 'text-red-600'}`}>
                        {isCredit ? '+' : '-'}{formatGHS(tx.amount)}
                      </p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        Bal: {formatGHS(tx.balanceAfter)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
