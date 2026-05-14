'use client'

import { AgroScoreBar } from '@/components/shared/agro-score-bar'
import { ChevronRightIcon } from '@/components/shared/icons'
import Link from 'next/link'
import type { Metadata } from 'next'

const SCORE_COMPONENTS = [
  {
    label:    'Profile Completeness',
    points:   14,
    max:      20,
    desc:     'Name, farm details, GPS location, photos, and MoMo linked.',
    tip:      'Add your farm GPS coordinates and at least 2 farm photos to earn full points.',
    color:    'bg-sector-crops-bg text-sector-crops',
  },
  {
    label:    'Verification Level',
    points:   20,
    max:      30,
    desc:     'Unverified: 0 · Self-declared: 10 · Field-verified: 20 · Premium: 30',
    tip:      'Request a field verification visit from a GENE Agent to move from 20 → 30.',
    color:    'bg-sector-fisheries-bg text-sector-fisheries',
  },
  {
    label:    'Order History',
    points:   16,
    max:      20,
    desc:     'Completed orders on the platform (1 pt per order, capped at 20).',
    tip:      'Complete 4 more orders to reach the maximum.',
    color:    'bg-sector-livestock-bg text-sector-livestock',
  },
  {
    label:    'Repayment History',
    points:   10,
    max:      20,
    desc:     'BNPL loans repaid on time. New users receive 10 pts by default.',
    tip:      'Take and repay a BNPL loan early to boost this score.',
    color:    'bg-harvest-gold-bg text-harvest-gold',
  },
  {
    label:    'Platform Tenure',
    points:   6,
    max:      10,
    desc:     '1 pt per 2 months on platform, capped at 10.',
    tip:      'This grows automatically as you stay active on AgroConnect.',
    color:    'bg-sector-poultry-bg text-sector-poultry',
  },
  {
    label:    'Community Rating',
    points:   6,
    max:      10,
    desc:     'Average buyer rating × 2 (5-star rating = 10 pts).',
    tip:      'Provide accurate descriptions and deliver on time to improve ratings.',
    color:    'bg-sector-inputs-bg text-sector-inputs',
  },
]

const TOTAL   = SCORE_COMPONENTS.reduce((sum, c) => sum + c.points, 0)
const MAX     = 110

const BNPL_TIERS = [
  { name: 'Starter',     minScore: 20, maxGHS: 500,    rate: 8 },
  { name: 'Grower',      minScore: 50, maxGHS: 2_000,  rate: 6 },
  { name: 'Established', minScore: 70, maxGHS: 10_000, rate: 5 },
  { name: 'Commercial',  minScore: 90, maxGHS: 50_000, rate: 4 },
]

function currentTier(score: number) {
  return [...BNPL_TIERS].reverse().find(t => score >= t.minScore) ?? null
}

function nextTier(score: number) {
  return BNPL_TIERS.find(t => score < t.minScore) ?? null
}

export default function ScorePage() {
  const tier = currentTier(TOTAL)
  const next = nextTier(TOTAL)

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
          <span className="text-5xl font-extrabold font-mono text-forest">{TOTAL}</span>
          <span className="text-xl font-mono text-muted-foreground mb-1">/ {MAX}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          {TOTAL >= 90 ? 'Commercial grade — exceptional trust level.'
            : TOTAL >= 70 ? 'Established — strong credibility with buyers.'
            : TOTAL >= 50 ? 'Grower — good standing, keep improving.'
            : 'Starter — build your profile to unlock more credit.'}
        </p>
        <AgroScoreBar score={TOTAL} size="lg" showLabel={false} />

        {/* BNPL tier */}
        {tier && (
          <div className="mt-4 p-3 bg-lime/10 rounded-xl border border-lime/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-forest">{tier.name} BNPL Tier</p>
                <p className="text-[11px] text-muted-foreground">
                  Up to <span className="font-mono">GHS {tier.maxGHS.toLocaleString()}</span> at {tier.rate}% flat rate
                </p>
              </div>
              <Link
                href="/bnpl"
                className="px-3 py-1.5 bg-forest text-white text-xs font-bold rounded-lg hover:bg-forest-dark transition-colors"
              >
                Apply
              </Link>
            </div>
            {next && (
              <p className="text-[11px] text-muted-foreground mt-2">
                Reach score {next.minScore} to unlock {next.name} tier (GHS {next.maxGHS.toLocaleString()} at {next.rate}%)
              </p>
            )}
          </div>
        )}
      </div>

      {/* Score breakdown */}
      <div>
        <h2 className="font-bold text-forest text-sm mb-3">Score Breakdown</h2>
        <div className="space-y-3">
          {SCORE_COMPONENTS.map((comp) => {
            const pct = (comp.points / comp.max) * 100
            return (
              <div key={comp.label} className="bg-white rounded-2xl border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-forest">{comp.label}</p>
                  <span className="text-sm font-extrabold font-mono text-forest">
                    {comp.points}/{comp.max}
                  </span>
                </div>
                <div className="w-full h-2 bg-cream-dark rounded-full overflow-hidden mb-2.5">
                  <div
                    className={`h-full rounded-full ${comp.color.split(' ')[0]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">{comp.desc}</p>
                {comp.points < comp.max && (
                  <p className="text-[11px] text-forest font-semibold mt-1.5">
                    Tip: {comp.tip}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* BNPL tiers table */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="font-bold text-forest text-sm mb-3">Credit Tiers</h2>
        <div className="space-y-2">
          {BNPL_TIERS.map((t) => {
            const active = tier?.name === t.name
            return (
              <div
                key={t.name}
                className={`flex items-center justify-between p-3 rounded-xl
                  ${active ? 'bg-lime/10 border border-lime/30' : 'bg-cream'}`}
              >
                <div className="flex items-center gap-2.5">
                  {active && (
                    <span className="w-2 h-2 rounded-full bg-lime-dark flex-shrink-0" />
                  )}
                  {!active && (
                    <span className="w-2 h-2 rounded-full bg-border flex-shrink-0" />
                  )}
                  <div>
                    <p className={`text-xs font-bold ${active ? 'text-forest' : 'text-muted-foreground'}`}>
                      {t.name}
                    </p>
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
