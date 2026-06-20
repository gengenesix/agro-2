'use client'

import { useEffect, useState } from 'react'
import Link        from 'next/link'
import { useAuth } from '@/context/auth-context'
import { api }     from '@/lib/api'
import { AgroScoreBar }  from '@/components/shared/agro-score-bar'
import { WalletCard }    from '@/components/wallet/wallet-card'
import {
  WeatherIcon, PricesIcon, ListProduceIcon,
  BuyInputsIcon, HarvestPledgeIcon, ChevronRightIcon,
} from '@/components/shared/icons'
import type { Wallet } from '@/lib/types'

interface DashboardData {
  wallet:          Wallet | null
  listingCount:    number
  orderCount:      number
}

const BNPL_TIERS = [
  { minScore: 90, tier: 'Commercial',  max: 15000, rate: 4 },
  { minScore: 70, tier: 'Established', max: 3000,  rate: 5 },
  { minScore: 50, tier: 'Grower',      max: 600,   rate: 6 },
  { minScore: 20, tier: 'Starter',     max: 150,   rate: 8 },
]

function getBnplTier(score: number) {
  return BNPL_TIERS.find(t => score >= t.minScore) ?? null
}

function getScoreTier(score: number): string {
  if (score >= 90) return 'Commercial'
  if (score >= 70) return 'Established'
  if (score >= 50) return 'Grower'
  if (score >= 20) return 'Starter'
  return 'New'
}

function getScoreColor(score: number): string {
  if (score >= 70) return 'var(--score-high)'
  if (score >= 50) return 'var(--score-mid)'
  return 'var(--score-low)'
}

export default function FarmerDashboard() {
  const { user }  = useAuth()
  const [data, setData]       = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      api.get('/payments/wallet'),
      api.get('/listings/mine?limit=1'),
      api.get('/orders?limit=1'),
    ]).then(([walletRes, listingsRes, ordersRes]) => {
      setData({
        wallet:       walletRes.status === 'fulfilled' ? walletRes.value.data.data as Wallet : null,
        listingCount: listingsRes.status === 'fulfilled' ? (listingsRes.value.data.data.pagination?.total ?? 0) : 0,
        orderCount:   ordersRes.status === 'fulfilled'  ? (ordersRes.value.data.data.pagination?.total  ?? 0) : 0,
      })
    }).finally(() => setLoading(false))
  }, [])

  const hour     = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const today    = new Date().toLocaleDateString('en-GH', { weekday: 'long', month: 'short', day: 'numeric' })
  const score    = user?.agroScore ?? 10
  const bnpl     = getBnplTier(score)
  const initials = (user?.fullName || 'AG')
    .split(' ')
    .map((w: string) => w[0] ?? '')
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4 pb-28">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 bg-cream-dark rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-28 space-y-4">

      {/* ── Greeting ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-[0.14em] mb-1">
            {greeting}
          </p>
          <h1
            className="font-display font-bold text-forest leading-tight"
            style={{ fontSize: 'clamp(1.35rem, 5vw, 1.85rem)', letterSpacing: '-0.03em' }}
          >
            {user?.fullName || user?.phone?.replace('+233', '0') || 'Farmer'}
          </h1>
          <p className="text-muted-foreground text-xs mt-0.5">{today}</p>
        </div>
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-forest font-bold text-sm text-white">
          {initials}
        </div>
      </div>

      {/* ── AgroScore ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {/* Score progress strip at top */}
        <div className="h-[3px] bg-cream-dark">
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${Math.min((score / 110) * 100, 100)}%`,
              backgroundColor: getScoreColor(score),
            }}
          />
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-bold text-forest text-sm">AgroScore</h2>
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.13em] px-2 py-0.5 text-white"
                  style={{
                    backgroundColor: getScoreColor(score),
                    borderRadius: '0.85rem',
                  }}
                >
                  {getScoreTier(score)}
                </span>
              </div>
              <p className="text-muted-foreground text-[11px]">Credit & trust · 0–110 scale</p>
            </div>
            <div className="text-right">
              <p
                className="font-mono font-extrabold text-forest leading-none"
                style={{ fontSize: 'clamp(1.9rem, 6vw, 2.4rem)' }}
              >
                {score}
              </p>
              <p className="text-[10px] text-muted-foreground font-medium">/110</p>
            </div>
          </div>

          <AgroScoreBar score={score} size="lg" />

          {bnpl ? (
            <div
              className="mt-4 p-3.5 bg-cream rounded-xl flex items-center justify-between gap-3 border-l-[3px]"
              style={{ borderLeftColor: getScoreColor(score) }}
            >
              <div className="min-w-0">
                <p className="text-xs font-bold text-forest">
                  {bnpl.tier} BNPL — up to ${bnpl.max.toLocaleString()}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {bnpl.rate}% flat fee · Pay at harvest
                </p>
              </div>
              <Link href="/bnpl" className="btn btn-forest btn-sm flex-shrink-0">
                Apply
              </Link>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-1.5">
              <Link
                href="/score"
                className="text-xs font-semibold text-muted-foreground hover:text-forest
                           flex items-center gap-0.5 transition-colors"
              >
                View score breakdown <ChevronRightIcon size={12} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Purchase Farm Inputs CTA ───────────────────────────── */}
      <Link
        href="/inputs"
        className="flex items-center gap-4 p-5 hover:opacity-90 transition-opacity group"
        style={{
          backgroundColor: 'var(--forest)',
          borderRadius: '0.85rem',
        }}
      >
        <span
          className="w-12 h-12 flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: 'rgba(255,255,255,0.12)',
            borderRadius: '0.85rem',
          }}
        >
          <BuyInputsIcon size={22} className="text-white" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-white leading-tight"
             style={{ fontSize: 'clamp(0.9rem, 3vw, 1rem)', letterSpacing: '-0.01em' }}>
            Purchase Farm Inputs
          </p>
          <p className="text-[11px] mt-0.5 leading-snug" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Seeds · Fertilizers · Equipment — Cash or BNPL
          </p>
        </div>
        <ChevronRightIcon
          size={18}
          className="text-white/30 group-hover:text-white/70 flex-shrink-0 transition-colors"
        />
      </Link>

      {/* ── Wallet ─────────────────────────────────────────────── */}
      <WalletCard
        balance={data?.wallet?.balance ?? 0}
        pendingBalance={data?.wallet?.pendingBalance ?? 0}
        totalEarned={data?.wallet?.totalEarned ?? 0}
        onWithdraw={() => {}}
      />

      {/* ── Stats ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { href: '/listings',     label: 'My Listings', value: data?.listingCount ?? 0, Icon: ListProduceIcon },
          { href: '/farmer/orders', label: 'My Orders',   value: data?.orderCount ?? 0,   Icon: HarvestPledgeIcon },
        ].map(({ href, label, value, Icon }) => (
          <Link
            key={href}
            href={href}
            className="card-surface card-lift p-4 flex items-center gap-3"
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-cream-dark">
              <Icon size={18} className="text-forest" />
            </span>
            <div>
              <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
              <p className="text-2xl font-extrabold font-mono text-forest leading-none mt-0.5">
                {value}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Quick Actions ──────────────────────────────────────── */}
      <div>
        <h2
          className="font-display font-bold text-forest text-sm mb-3"
          style={{ letterSpacing: '-0.01em' }}
        >
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/listings/new', label: 'List Produce',   Icon: ListProduceIcon,   primary: true  },
            { href: '/inputs',       label: 'Buy Inputs',     Icon: BuyInputsIcon,     primary: false },
            { href: '/pledges',      label: 'Browse Pledges', Icon: HarvestPledgeIcon, primary: false },
            { href: '/intelligence', label: 'Intelligence',   Icon: WeatherIcon,       primary: false },
          ].map(({ href, label, Icon, primary }) => (
            <Link
              key={href}
              href={href}
              className="card-surface card-lift group p-4"
            >
              <span
                className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl transition-colors
                  ${primary ? 'bg-lime text-forest' : 'bg-cream-dark text-forest group-hover:bg-lime'}`}
              >
                <Icon size={19} />
              </span>
              <span className="block text-sm font-bold leading-tight text-forest">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Market Snapshot ────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2
            className="font-display font-bold text-forest text-sm"
            style={{ letterSpacing: '-0.01em' }}
          >
            Market Snapshot
          </h2>
          <Link
            href="/intelligence"
            className="text-xs font-semibold text-muted-foreground hover:text-forest
                       flex items-center gap-0.5 transition-colors"
          >
            Full report <ChevronRightIcon size={13} />
          </Link>
        </div>
        <div className="space-y-2.5">
          {[
            {
              href:  '/intelligence',
              Icon:  WeatherIcon,
              title: 'Weather Forecast',
              sub:   'Regional conditions & planting advice',
            },
            {
              href:  '/intelligence',
              Icon:  PricesIcon,
              title: 'Market Prices',
              sub:   'Live prices by region & commodity',
            },
          ].map(({ href, Icon, title, sub }) => (
            <Link
              key={title}
              href={href}
              className="group flex items-center gap-3 p-3.5 bg-cream rounded-xl
                         hover:bg-cream-dark transition-colors"
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white text-forest border border-border group-hover:border-lime transition-colors">
                <Icon size={16} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-forest">{title}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
              </div>
              <ChevronRightIcon size={13} className="text-muted-foreground flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
