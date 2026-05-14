'use client'

import { useEffect, useState } from 'react'
import { api }                 from '@/lib/api'
import { AgroScoreBar }        from '@/components/shared/agro-score-bar'
import { DashboardStatsSkeleton } from '@/components/shared/skeleton'
import { formatGHS, formatDate } from '@/lib/format'
import { PayAtHarvestIcon, AgroScoreIcon, LoadingIcon } from '@/components/shared/icons'

interface Eligibility {
  eligible:     boolean
  tier:         string | null
  maxAmount:    number
  interestRate: number
  score:        number
  reason?:      string
}

interface BNPLApplication {
  id:          string
  amount:      number
  status:      string
  purpose:     string
  dueDate:     string
  createdAt:   string
  repaidAmount: number
}

const TIER_COLORS: Record<string, string> = {
  starter:     'bg-cream-dark text-muted-foreground',
  grower:      'bg-lime/20 text-forest',
  established: 'bg-forest/10 text-forest',
  commercial:  'bg-sector-crops-bg text-sector-crops',
}

export default function BNPLPage() {
  const [eligibility, setEligibility] = useState<Eligibility | null>(null)
  const [applications, setApplications] = useState<BNPLApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applyForm, setApplyForm] = useState({ amount: '', purpose: '' })
  const [applyError, setApplyError] = useState('')
  const [applySuccess, setApplySuccess] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/bnpl/eligibility'),
      api.get('/bnpl/status'),
    ]).then(([e, s]) => {
      setEligibility(e.data.data)
      setApplications(s.data.data.applications ?? [])
    }).finally(() => setLoading(false))
  }, [])

  async function handleApply() {
    const amount = parseFloat(applyForm.amount)
    if (!amount || !applyForm.purpose) { setApplyError('Fill all fields.'); return }
    setApplying(true)
    setApplyError('')
    try {
      await api.post('/bnpl/apply', { amount, purpose: applyForm.purpose })
      setApplySuccess(true)
      const s = await api.get('/bnpl/status')
      setApplications(s.data.data.applications ?? [])
    } catch (err: any) {
      setApplyError(err.response?.data?.error ?? 'Application failed.')
    } finally {
      setApplying(false)
    }
  }

  if (loading) return (
    <main className="min-h-screen bg-cream p-4 sm:p-6"><DashboardStatsSkeleton /></main>
  )

  const STATUS_CFG: Record<string, string> = {
    pending:   'bg-harvest-gold/15 text-harvest-gold',
    approved:  'bg-lime/20 text-forest',
    active:    'bg-forest/10 text-forest',
    repaid:    'bg-cream-dark text-muted-foreground',
    defaulted: 'bg-red-50 text-red-600',
    rejected:  'bg-red-50 text-red-600',
  }

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="font-bold text-forest text-lg">Buy Now, Pay Later</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Eligibility card */}
        {eligibility && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <AgroScoreIcon size={18} className="text-forest" />
              <h2 className="font-bold text-forest text-sm">Your BNPL eligibility</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs text-muted-foreground">AgroScore</p>
                  <p className="font-mono text-sm font-bold text-forest">{eligibility.score}/110</p>
                </div>
                <AgroScoreBar score={eligibility.score} animate />
              </div>

              {eligibility.eligible && eligibility.tier ? (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Tier',          value: eligibility.tier.charAt(0).toUpperCase() + eligibility.tier.slice(1) },
                    { label: 'Credit limit',  value: formatGHS(eligibility.maxAmount) },
                    { label: 'Interest rate', value: `${(eligibility.interestRate * 100).toFixed(0)}% flat` },
                  ].map(s => (
                    <div key={s.label} className="bg-cream rounded-xl p-3 text-center">
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                      <p className="font-mono text-sm font-bold text-forest mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-cream rounded-xl p-4">
                  <p className="text-sm text-muted-foreground">{eligibility.reason ?? 'Build your AgroScore to unlock BNPL credit.'}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Apply form */}
        {eligibility?.eligible && !applySuccess && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center gap-2">
              <PayAtHarvestIcon size={18} className="text-harvest-gold" />
              <h2 className="font-bold text-forest text-sm">Apply for credit</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2">
                  Amount (GHS)
                </label>
                <input
                  type="number"
                  min="1"
                  max={eligibility.maxAmount}
                  value={applyForm.amount}
                  onChange={e => setApplyForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder={`Max ${formatGHS(eligibility.maxAmount)}`}
                  className="w-full px-4 py-2.5 font-mono bg-cream border border-border rounded-xl
                             text-sm text-forest focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/10"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2">
                  Purpose
                </label>
                <select
                  value={applyForm.purpose}
                  onChange={e => setApplyForm(f => ({ ...f, purpose: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-cream border border-border rounded-xl text-sm
                             text-forest focus:border-forest focus:outline-none"
                >
                  <option value="">Select purpose…</option>
                  {['Seeds', 'Fertilizer', 'Pesticides', 'Equipment hire', 'Labour', 'Transport', 'Other'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              {applyError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">{applyError}</p>
              )}

              <button onClick={handleApply} disabled={applying}
                className="w-full py-3 bg-forest text-white text-sm font-bold rounded-xl
                           hover:bg-forest-dark active:scale-[0.98] transition-all
                           disabled:opacity-50 flex items-center justify-center gap-2">
                {applying ? <><LoadingIcon size={15} className="animate-spin" /> Applying…</> : 'Submit application'}
              </button>
            </div>
          </div>
        )}

        {applySuccess && (
          <div className="bg-lime/15 border border-lime/30 rounded-2xl p-5 text-center">
            <p className="font-bold text-forest mb-1">Application submitted</p>
            <p className="text-sm text-muted-foreground">Your BNPL application is under review. You'll receive an SMS update within 24 hours.</p>
          </div>
        )}

        {/* Active applications */}
        {applications.length > 0 && (
          <div className="bg-white rounded-2xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="font-bold text-forest text-sm">Your applications</h2>
            </div>
            <div className="divide-y divide-border">
              {applications.map(app => {
                const pct = app.amount > 0 ? Math.min(100, (app.repaidAmount / app.amount) * 100) : 0
                return (
                  <div key={app.id} className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_CFG[app.status] ?? ''}`}>
                          {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                        </span>
                        <p className="font-mono text-lg font-bold text-forest mt-1">{formatGHS(app.amount)}</p>
                        <p className="text-xs text-muted-foreground">{app.purpose}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Due date</p>
                        <p className="text-sm font-semibold text-forest">{formatDate(app.dueDate)}</p>
                      </div>
                    </div>
                    {app.status === 'active' && (
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Repaid</span>
                          <span className="font-mono">{formatGHS(app.repaidAmount)} / {formatGHS(app.amount)}</span>
                        </div>
                        <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
                          <div className="h-full bg-forest rounded-full transition-all duration-500"
                               style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
