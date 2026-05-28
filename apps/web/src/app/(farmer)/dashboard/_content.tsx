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
        <div
          className="w-11 h-11 flex-shrink-0 flex items-center justify-center bg-forest
                     text-white font-display font-bold text-sm"
          style={{ clipPath: 'polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px))' }}
        >
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
                    clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
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
              <Link
                href="/bnpl"
                className="px-3.5 py-1.5 text-white text-xs font-bold transition-all active:scale-[0.97]
                           flex-shrink-0 hover:opacity-90"
                style={{
                  backgroundColor: 'var(--forest)',
                  clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))',
                }}
              >
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
          clipPath: 'polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))',
        }}
      >
        <span
          className="w-12 h-12 flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: 'rgba(255,255,255,0.12)',
            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
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
          {
            href:       '/listings',
            label:      'My Listings',
            value:      data?.listingCount ?? 0,
            Icon:       ListProduceIcon,
            iconBg:     'var(--sector-crops-bg)',
            iconColor:  'var(--sector-crops)',
            topColor:   'var(--sector-crops)',
          },
          {
            href:       '/farmer/orders',
            label:      'My Orders',
            value:      data?.orderCount ?? 0,
            Icon:       HarvestPledgeIcon,
            iconBg:     'var(--harvest-gold-bg)',
            iconColor:  'var(--harvest-gold)',
            topColor:   'var(--harvest-gold)',
          },
        ].map(({ href, label, value, Icon, iconBg, iconColor, topColor }) => (
          <Link
            key={href}
            href={href}
            className="bg-white rounded-2xl border border-border overflow-hidden
                       hover:shadow-sm transition-shadow"
          >
            <div className="h-[3px]" style={{ backgroundColor: topColor }} />
            <div className="p-4 flex items-center gap-3">
              <span
                className="p-2.5 flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: iconBg,
                  clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))',
                }}
              >
                <Icon size={18} style={{ color: iconColor }} />
              </span>
              <div>
                <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
                <p className="text-2xl font-extrabold font-mono text-forest leading-none mt-0.5">
                  {value}
                </p>
              </div>
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
            {
              href:        '/listings/new',
              label:       'List Produce',
              Icon:        ListProduceIcon,
              iconBg:      'var(--sector-crops-bg)',
              iconColor:   'var(--sector-crops)',
              accentColor: 'var(--sector-crops)',
            },
            {
              href:        '/inputs',
              label:       'Buy Inputs',
              Icon:        BuyInputsIcon,
              iconBg:      'var(--sector-inputs-bg)',
              iconColor:   'var(--sector-inputs)',
              accentColor: 'var(--sector-inputs)',
            },
            {
              href:        '/pledges',
              label:       'Browse Pledges',
              Icon:        HarvestPledgeIcon,
              iconBg:      'var(--harvest-gold-bg)',
              iconColor:   'var(--harvest-gold)',
              accentColor: 'var(--harvest-gold)',
            },
            {
              href:        '/intelligence',
              label:       'Intelligence',
              Icon:        WeatherIcon,
              iconBg:      'var(--sector-fisheries-bg)',
              iconColor:   'var(--sector-fisheries)',
              accentColor: 'var(--sector-fisheries)',
            },
          ].map(({ href, label, Icon, iconBg, iconColor, accentColor }) => (
            <Link
              key={href}
              href={href}
              className="bg-white rounded-2xl border border-border p-4 overflow-hidden relative
                         hover:shadow-sm transition-shadow"
            >
              <div
                className="absolute bottom-0 left-0 right-0 h-[3px]"
                style={{ backgroundColor: accentColor }}
              />
              <span
                className="mb-3 w-10 h-10 flex items-center justify-center"
                style={{
                  backgroundColor: iconBg,
                  clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))',
                }}
              >
                <Icon size={19} style={{ color: iconColor }} />
              </span>
              <span className="text-sm font-bold text-forest block leading-tight">{label}</span>
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
              href:      '/intelligence',
              Icon:      WeatherIcon,
              title:     'Weather Forecast',
              sub:       'Regional conditions & planting advice',
              iconBg:    'var(--sector-fisheries-bg)',
              iconColor: 'var(--sector-fisheries)',
            },
            {
              href:      '/intelligence',
              Icon:      PricesIcon,
              title:     'Market Prices',
              sub:       'Live prices by region & commodity',
              iconBg:    'var(--sector-crops-bg)',
              iconColor: 'var(--sector-crops)',
            },
          ].map(({ href, Icon, title, sub, iconBg, iconColor }) => (
            <Link
              key={title}
              href={href}
              className="flex items-center gap-3 p-3.5 bg-cream rounded-xl
                         hover:bg-cream-dark transition-colors"
            >
              <span
                className="p-2 flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: iconBg,
                  clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
                }}
              >
                <Icon size={16} style={{ color: iconColor }} />
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
