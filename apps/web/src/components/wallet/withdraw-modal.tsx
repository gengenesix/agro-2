'use client'

import { useState }    from 'react'
import { api }         from '@/lib/api'
import { formatGHS }   from '@/lib/format'
import { LoadingIcon, CloseIcon, WithdrawIcon } from '@/components/shared/icons'

interface WithdrawModalProps {
  balance:   number
  onClose:   () => void
  onSuccess: () => void
}

export function WithdrawModal({ balance, onClose, onSuccess }: WithdrawModalProps) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [step, setStep]       = useState<'form' | 'confirm' | 'success'>('form')

  const parsed = parseFloat(amount)
  const valid  = !isNaN(parsed) && parsed >= 1 && parsed <= balance

  async function submit() {
    if (!valid) return
    setStep('confirm')
  }

  async function confirm() {
    setLoading(true)
    setError('')
    try {
      await api.post('/payments/wallet/withdraw', { amount: parsed })
      setStep('success')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Withdrawal failed. Try again.')
      setStep('form')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <ModalShell onClose={() => { onSuccess(); onClose() }}>
        <div className="text-center py-6">
          <div className="w-14 h-14 bg-lime/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-forest">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h3 className="font-bold text-forest text-lg mb-1">Withdrawal initiated</h3>
          <p className="text-sm text-muted-foreground mb-2">
            {formatGHS(parsed)} will be sent to your Mobile Money number within 5 minutes.
          </p>
          <button onClick={() => { onSuccess(); onClose() }}
            className="mt-4 px-6 py-2.5 bg-forest text-white text-sm font-bold rounded-xl
                       hover:bg-forest-dark transition-colors">
            Done
          </button>
        </div>
      </ModalShell>
    )
  }

  if (step === 'confirm') {
    return (
      <ModalShell title="Confirm withdrawal" onClose={onClose}>
        <div className="space-y-4">
          <div className="bg-cream rounded-2xl p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">Withdrawal amount</p>
            <p className="font-mono text-3xl font-bold text-forest">{formatGHS(parsed)}</p>
            <p className="text-xs text-muted-foreground mt-1">to your registered MoMo number</p>
          </div>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">{error}</p>
          )}
          <div className="flex gap-3">
            <button onClick={() => setStep('form')} disabled={loading}
              className="flex-1 py-3 border border-border text-forest text-sm font-bold rounded-xl
                         hover:bg-cream transition-colors disabled:opacity-50">
              Back
            </button>
            <button onClick={confirm} disabled={loading}
              className="flex-1 py-3 bg-forest text-white text-sm font-bold rounded-xl
                         hover:bg-forest-dark active:scale-[0.98] transition-all
                         disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <><LoadingIcon size={15} className="animate-spin" /> Sending…</> : 'Confirm'}
            </button>
          </div>
        </div>
      </ModalShell>
    )
  }

  return (
    <ModalShell title="Withdraw funds" onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-cream rounded-xl p-3 flex justify-between items-center">
          <span className="text-xs text-muted-foreground">Available balance</span>
          <span className="font-mono text-sm font-bold text-forest">{formatGHS(balance)}</span>
        </div>

        <div>
          <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2">
            Amount (GHS)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-muted-foreground">
              GHS
            </span>
            <input
              type="number"
              min="1"
              max={balance}
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-14 pr-4 py-3 font-mono text-lg font-bold text-forest bg-cream
                         border border-border rounded-xl focus:border-forest focus:outline-none
                         focus:ring-2 focus:ring-forest/10"
            />
          </div>

          {/* Quick select */}
          <div className="flex gap-2 mt-2">
            {[100, 500, 1000].map(v => (
              <button key={v} type="button"
                onClick={() => setAmount(String(Math.min(v, balance)))}
                className="text-xs font-semibold text-forest border border-border bg-white px-3 py-1.5
                           rounded-lg hover:bg-cream transition-colors">
                {formatGHS(v)}
              </button>
            ))}
            <button type="button" onClick={() => setAmount(String(balance))}
              className="text-xs font-semibold text-forest border border-border bg-white px-3 py-1.5
                         rounded-lg hover:bg-cream transition-colors ml-auto">
              Max
            </button>
          </div>
        </div>

        <button onClick={submit} disabled={!valid}
          className="w-full py-3.5 bg-forest text-white font-bold text-sm rounded-xl
                     hover:bg-forest-dark active:scale-[0.98] transition-all
                     disabled:opacity-40 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2">
          <WithdrawIcon size={16} />
          Continue
        </button>
      </div>
    </ModalShell>
  )
}

function ModalShell({ title, onClose, children }: {
  title?: string; onClose: () => void; children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-bold text-forest">{title ?? ''}</h2>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-forest transition-colors">
            <CloseIcon size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
