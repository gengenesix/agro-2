'use client'

import { useEffect, useState } from 'react'
import { AgroScoreBar } from '@/components/shared/agro-score-bar'
import { ChevronRightIcon, LoadingIcon } from '@/components/shared/icons'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/context/auth-context'

interface ScoreData {
  total: number
  components: {
    profileCompleteness: { score: number; max: number; items: { label: string; done: boolean }[] }
    verificationLevel:   { score: number; max: number; level: string }
    orderHistory:        { score: number; max: number; completedOrders: number }
    repaymentHistory:    { score: number; max: number; repaid: number; total: number }
    platformTenure:      { score: number; max: number; months: number }
    communityRating:     { score: number; max: number; avgRating: number; reviewCount: number }
  }
}

const BNPL_TIERS = [
  { name: 'Starter',     minScore: 20, maxGHS: 500,    rate: 8 },
  { name: 'Grower',      minScore: 50, maxGHS: 2_000,  rate: 6 },
  { name: 'Established', minScore: 70, maxGHS: 10_000, rate: 5 },
  { name: 'Commercial',  minScore: 90, maxGHS: 50_000, rate: 4 },
]

const COMPONENT_META = {
  profileCompleteness: {
    label: 'Profile Completeness', max: 20,
    color: 'bg-sector-crops-bg',
    tip: (d: ScoreData['components']['profileCompleteness']) =>
      d.score < d.max ? `Complete ${d.items.filter(i => !i.done).map(i => i.label.toLowerCase()).join(', ')} to earn more points.` : 'All profile fields complete.',
  },
  verificationLevel: {
    label: 'Verification Level', max: 30,
    color: 'bg-sector-fisheries-bg',
    tip: (d: ScoreData['components']['verificationLevel']) =>
      d.level === 'unverified' ? 'Complete your profile to earn Self-Declared status (+10 pts).'
      : d.level === 'self_declared' ? 'Request a field agent visit to earn Field Verified status (+20 pts).'
      : d.level === 'field_verified' ? 'Submit lab-test certificates for Premium status (+30 pts).'
      : 'Maximum verification achieved.',
  },
  orderHistory: {
    label: 'Order History', max: 20,
    color: 'bg-sector-livestock-bg',
    tip: (d: ScoreData['components']['orderHistory']) =>
      d.score < d.max ? `Complete ${20 - d.completedOrders} more orders to reach the maximum.` : 'Maximum order history reached.',
  },
  repaymentHistory: {
    label: 'Repayment History', max: 20,
    color: 'bg-harvest-gold-bg',
    tip: (d: ScoreData['components']['repaymentHistory']) =>
      d.total === 0 ? 'Take a BNPL loan and repay it on time to boost this score.'
      : `${d.repaid}/${d.total} loans repaid on time.`,
  },
  platformTenure: {
    label: 'Platform Tenure', max: 10,
    color: 'bg-sector-poultry-bg',
    tip: (d: ScoreData['components']['platformTenure']) =>
      d.score < d.max ? `${d.months} months on platform — grows automatically every 2 months.` : 'Maximum tenure reached.',
  },
  communityRating: {
    label: 'Community Rating', max: 10,
    color: 'bg-sector-inputs-bg',
    tip: (d: ScoreData['components']['communityRating']) =>
      d.reviewCount === 0 ? 'No ratings yet — deliver great produce to earn buyer reviews.'
      : `${d.avgRating}/5 stars from ${d.reviewCount} review${d.reviewCount !== 1 ? 's' : ''}.`,
  },
}

function getCurrentTier(score: number) {
  return [...BNPL_TIERS].reverse().find(t => score >= t.minScore) ?? null
}
function getNextTier(score: number) {
  return BNPL_TIERS.find(t => score < t.minScore) ?? null
}

export default function ScorePage() {
  const { user }    = useAuth()
  const [data, setData]     = useState<ScoreData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/score')
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false))
  }, [])

  const score = data?.total ?? user?.agroScore ?? 0
  const tier  = getCurrentTier(score)
  const next  = getNextTier(score)

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/dashboard" className="p-2 rounded-xl hover:bg-cream transition-colors">
            <ChevronRightIcon size={18} className="text-muted-foreground rotate-180" />
          </Link>
          <h1 className="text-xl font-extrabold text-forest">AgroScore</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <LoadingIcon size={24} className="text-forest animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="p-2 rounded-xl hover:bg-cream transition-colors">
          <ChevronRightIcon size={18} className="text-muted-foreground rotate-180" />
        </Link>
        <div>
          <h1 className="text-xl font-extrabold text-forest">AgroScore</h1>
          <p className="text-xs text-muted-foreground">Your farm credibility score</p>
        </div>
      </div>

      {/* Score hero */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-end gap-2 mb-1">
          <span className="text-5xl font-extrabold font-mono text-forest">{score}</span>
          <span className="text-xl font-mono text-muted-foreground mb-1">/ 110</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {score >= 90 ? 'Commercial grade — exceptional trust level.'
            : score >= 70 ? 'Established — strong credibility with buyers.'
            : score >= 50 ? 'Grower — good standing, keep improving.'
            : score >= 20 ? 'Starter — build your profile to unlock more credit.'
            : 'Complete your profile to start building your score.'}
        </p>
        <AgroScoreBar score={score} size="lg" showLabel={false} />

        {tier ? (
          <div className="mt-4 p-3 bg-lime/10 rounded-xl border border-lime/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-forest">{tier.name} BNPL Tier</p>
                <p className="text-[11px] text-muted-foreground">
                  Up to <span className="font-mono">GHS {tier.maxGHS.toLocaleString()}</span> at {tier.rate}% flat rate
                </p>
              </div>
              <Link href="/bnpl"
                className="px-3 py-1.5 bg-forest text-white text-xs font-bold rounded-lg hover:bg-forest-dark transition-colors">
                Apply
              </Link>
            </div>
            {next && (
              <p className="text-[11px] text-muted-foreground mt-2">
                Reach score {next.minScore} to unlock {next.name} tier (GHS {next.maxGHS.toLocaleString()} at {next.rate}%)
              </p>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground mt-3 p-3 bg-cream rounded-xl">
            Reach a score of 20 to unlock BNPL credit (Starter tier).
          </p>
        )}
      </div>

      {/* Score breakdown */}
      {data && (
        <div>
          <h2 className="font-bold text-forest text-sm mb-3">Score Breakdown</h2>
          <div className="space-y-3">
            {(Object.entries(COMPONENT_META) as [keyof typeof COMPONENT_META, typeof COMPONENT_META[keyof typeof COMPONENT_META]][]).map(([key, meta]) => {
              const comp   = data.components[key] as any
              const points = comp.score as number
              const pct    = (points / meta.max) * 100
              return (
                <div key={key} className="bg-white rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-forest">{meta.label}</p>
                    <span className="text-sm font-extrabold font-mono text-forest">
                      {points}/{meta.max}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-cream-dark rounded-full overflow-hidden mb-2.5">
                    <div
                      className={`h-full rounded-full transition-all ${meta.color}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">{meta.tip(comp as never)}</p>

                  {/* Completeness checklist */}
                  {key === 'profileCompleteness' && comp.items && (
                    <div className="mt-3 space-y-1.5 pt-3 border-t border-border">
                      {comp.items.map((item: { label: string; done: boolean }) => (
                        <div key={item.label} className="flex items-center gap-2 text-[11px]">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0
                            ${item.done ? 'bg-forest text-white' : 'border border-border bg-cream'}`}>
                            {item.done ? '✓' : ''}
                          </span>
                          <span className={item.done ? 'text-muted-foreground line-through' : 'text-forest'}>{item.label}</span>
                        </div>
                      ))}
                      {!comp.items.every((i: { done: boolean }) => i.done) && (
                        <Link href="/profile" className="text-[11px] font-semibold text-forest underline underline-offset-2 mt-1 block">
                          Complete your profile
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* BNPL tiers */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="font-bold text-forest text-sm mb-3">Credit Tiers</h2>
        <div className="space-y-2">
          {BNPL_TIERS.map(t => {
            const active = tier?.name === t.name
            return (
              <div key={t.name}
                className={`flex items-center justify-between p-3 rounded-xl
                  ${active ? 'bg-lime/10 border border-lime/30' : 'bg-cream'}`}>
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? 'bg-lime-dark' : 'bg-border'}`} />
                  <div>
                    <p className={`text-xs font-bold ${active ? 'text-forest' : 'text-muted-foreground'}`}>{t.name}</p>
                    <p className="text-[10px] text-muted-foreground">Score ≥ {t.minScore}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-extrabold font-mono ${active ? 'text-forest' : 'text-muted-foreground'}`}>
                    GHS {t.maxGHS.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{t.rate}% flat</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
