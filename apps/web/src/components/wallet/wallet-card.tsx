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
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-white/50 text-[10px] font-bold uppercase tracking-[0.15em] mb-2">
              Available Balance
            </p>
            <p className="font-mono font-extrabold text-white tracking-tight leading-none"
               style={{ fontSize: 'clamp(1.6rem, 5vw, 2rem)' }}>
              {formatGHS(balance)}
            </p>
          </div>
          <div
            className="p-2.5 bg-white/10 flex items-center justify-center"
            style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))' }}
          >
            <WalletIcon size={22} className="text-lime" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 mb-5">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.12em] mb-1.5">In Escrow</p>
            <p className="text-white font-bold font-mono text-sm">{formatGHS(pendingBalance)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.12em] mb-1.5">Total Earned</p>
            <p className="text-white font-bold font-mono text-sm">{formatGHS(totalEarned)}</p>
          </div>
        </div>

        <button
          onClick={onWithdraw}
          className="w-full py-3 text-forest font-bold text-sm transition-all duration-150
                     active:scale-[0.98] hover:opacity-90 flex items-center justify-center gap-2"
          style={{
            backgroundColor: 'var(--lime)',
            clipPath: 'polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px))',
          }}
        >
          <WithdrawIcon size={18} />
          Withdraw to Mobile Money
        </button>
      </div>
    </div>
  )
}
