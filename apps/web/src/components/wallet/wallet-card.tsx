'use client'

import { formatGHS }     from '@/lib/format'
import { WalletIcon, WithdrawIcon, AgroScoreIcon } from '@/components/shared/icons'

interface WalletCardProps {
  balance:        number
  pendingBalance: number
  totalEarned:    number
  onWithdraw:     () => void
}

export function WalletCard({ balance, pendingBalance, totalEarned, onWithdraw }: WalletCardProps) {
  return (
    <div className="bg-forest rounded-2xl p-5 text-white relative overflow-hidden">
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize:  '20px 20px',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">
              Available Balance
            </p>
            <p className="text-3xl font-extrabold font-mono tracking-tight">
              {formatGHS(balance)}
            </p>
          </div>
          <div className="p-2.5 bg-white/10 rounded-xl">
            <WalletIcon size={24} className="text-lime" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-white/50 text-[10px] font-medium uppercase tracking-wide mb-1">In Escrow</p>
            <p className="text-white font-bold font-mono text-sm">{formatGHS(pendingBalance)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-white/50 text-[10px] font-medium uppercase tracking-wide mb-1">Total Earned</p>
            <p className="text-white font-bold font-mono text-sm">{formatGHS(totalEarned)}</p>
          </div>
        </div>

        <button
          onClick={onWithdraw}
          className="w-full py-3 bg-lime text-forest font-bold text-sm rounded-xl
                     transition-all duration-150 active:scale-[0.98] hover:bg-lime-dark
                     flex items-center justify-center gap-2"
        >
          <WithdrawIcon size={18} />
          Withdraw to Mobile Money
        </button>
      </div>
    </div>
  )
}
