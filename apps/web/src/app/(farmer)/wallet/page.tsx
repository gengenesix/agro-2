'use client'

import { useEffect, useState } from 'react'
import { api }                 from '@/lib/api'
import { WalletCard }          from '@/components/wallet/wallet-card'
import { WithdrawModal }       from '@/components/wallet/withdraw-modal'
import { DashboardStatsSkeleton } from '@/components/shared/skeleton'
import { EmptyState }          from '@/components/shared/empty-state'
import { WalletIcon }          from '@/components/shared/icons'
import { formatGHS, formatRelative } from '@/lib/format'
import type { Wallet, WalletTransaction } from '@/lib/types'

const TX_TYPE_LABEL: Record<string, string> = {
  credit:          'Received',
  debit:           'Sent',
  escrow_hold:     'Funds held in escrow',
  escrow_release:  'Payment settled to seller',
  withdrawal:      'Withdrawal',
  commission:      'Platform fee',
  refund:          'Refund',
}

export default function WalletPage() {
  const [wallet, setWallet]         = useState<Wallet | null>(null)
  const [txns, setTxns]             = useState<WalletTransaction[]>([])
  const [orders, setOrders]         = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [showWithdraw, setShowWithdraw] = useState(false)

  async function load() {
    try {
      const [w, t, o] = await Promise.allSettled([
        api.get('/payments/wallet'),
        api.get('/payments/wallet/transactions'),
        api.get('/orders/mine?limit=200'),
      ])
      if (w.status === 'fulfilled') setWallet(w.value.data.data)
      if (t.status === 'fulfilled') setTxns(t.value.data.data.transactions ?? [])
      if (o.status === 'fulfilled') setOrders(o.value.data.data.orders ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Primary: wallet ledger. Fallback: live seller-scoped order aggregation
  const inEscrow = txns.length > 0
    ? (wallet?.pendingBalance ?? 0)
    : orders
        .filter(o => ['pending', 'confirmed'].includes(o.trackingStatus))
        .reduce((sum, o) => sum + Number(o.totalAmount), 0)

  const totalEarned = txns.length > 0
    ? (wallet?.totalEarned ?? 0)
    : orders
        .filter(o => ['completed', 'delivered'].includes(o.trackingStatus))
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
          <h1 className="font-bold text-forest text-lg">Wallet</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {wallet && (
          <WalletCard
            balance={wallet.balance ?? 0}
            pendingBalance={inEscrow}
            totalEarned={totalEarned}
            onWithdraw={() => setShowWithdraw(true)}
          />
        )}

        {/* Pending / escrow banner */}
        {inEscrow > 0 && (
          <div className="bg-harvest-gold/10 border border-harvest-gold/30 rounded-2xl px-5 py-4 flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-harvest-gold uppercase tracking-wider">In Escrow</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Held until your pledges are fulfilled
              </p>
            </div>
            <p className="font-mono text-lg font-bold text-harvest-gold">
              {formatGHS(Math.abs(inEscrow))}
            </p>
          </div>
        )}

        {/* Transactions */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="font-bold text-forest text-sm">Transaction history</h2>
          </div>

          {txns.length === 0 ? (
            <div className="py-10">
              <EmptyState
                icon={<WalletIcon size={28} />}
                title="No transactions yet"
                description="Your deposits, withdrawals and order payments will appear here."
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {txns.map(tx => {
                // For a buyer/farmer, escrow_release means funds left escrow to pay the seller — debit.
                const isCredit = ['credit', 'refund'].includes(tx.type)
                return (
                  <div key={tx.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-cream/40 transition-colors">
                    {/* Icon */}
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

                    <p className={`font-mono text-sm font-bold flex-shrink-0 ${isCredit ? 'text-forest' : 'text-red-600'}`}>
                      {isCredit ? '+' : '-'}{formatGHS(tx.amount)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showWithdraw && wallet && (
        <WithdrawModal
          balance={wallet.balance}
          onClose={() => setShowWithdraw(false)}
          onSuccess={() => load()}
        />
      )}
    </main>
  )
}
