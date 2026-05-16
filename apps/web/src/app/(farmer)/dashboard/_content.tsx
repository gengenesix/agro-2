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
  { minScore: 90, tier: 'Commercial',  max: 50000,  rate: 4 },
  { minScore: 70, tier: 'Established', max: 10000,  rate: 5 },
  { minScore: 50, tier: 'Grower',      max: 2000,   rate: 6 },
  { minScore: 20, tier: 'Starter',     max: 500,    rate: 8 },
]

function getBnplTier(score: number) {
  return BNPL_TIERS.find(t => score >= t.minScore) ?? null
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

  const hour    = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const bnpl    = getBnplTier(user?.agroScore ?? 0)

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-24">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-cream-dark rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-24">
      {/* Greeting */}
      <div>
        <p className="text-muted-foreground text-sm">{greeting},</p>
        <h1 className="text-2xl font-extrabold text-forest">
          {user?.fullName || user?.phone?.replace('+233', '0') || 'Farmer'}
        </h1>
      </div>

      {/* AgroScore */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-forest text-sm">AgroScore</h2>
          <Link href="/score" className="text-xs font-semibold text-muted-foreground hover:text-forest flex items-center gap-0.5">
            Details <ChevronRightIcon size={14} />
          </Link>
        </div>
        <AgroScoreBar score={user?.agroScore ?? 10} size="lg" />

        {bnpl && (
          <div className="mt-4 flex items-center justify-between p-3 bg-lime/10 rounded-xl border border-lime/20">
            <div>
              <p className="text-xs font-semibold text-forest">{bnpl.tier} BNPL Tier</p>
              <p className="text-[11px] text-muted-foreground">
                Up to GHS {bnpl.max.toLocaleString()} at {bnpl.rate}% flat
              </p>
            </div>
            <Link href="/bnpl"
              className="px-3 py-1.5 bg-forest text-white text-xs font-bold rounded-lg hover:bg-forest-dark transition-colors">
              Apply
            </Link>
          </div>
        )}
      </div>

      {/* Wallet */}
      <WalletCard
        balance={data?.wallet?.balance ?? 0}
        pendingBalance={data?.wallet?.pendingBalance ?? 0}
        totalEarned={data?.wallet?.totalEarned ?? 0}
        onWithdraw={() => {}}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/listings"
          className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3 hover:bg-cream transition-colors">
          <span className="p-2.5 bg-sector-crops-bg rounded-xl">
            <ListProduceIcon size={20} className="text-sector-crops" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">My Listings</p>
            <p className="text-xl font-extrabold font-mono text-forest">{data?.listingCount ?? 0}</p>
          </div>
        </Link>
        <Link href="/orders"
          className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3 hover:bg-cream transition-colors">
          <span className="p-2.5 bg-cream-dark rounded-xl">
            <HarvestPledgeIcon size={20} className="text-harvest-gold" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">My Orders</p>
            <p className="text-xl font-extrabold font-mono text-forest">{data?.orderCount ?? 0}</p>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="font-bold text-forest text-sm mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/listings/new', label: 'List Produce',   Icon: ListProduceIcon,   color: 'bg-sector-crops-bg text-sector-crops' },
            { href: '/inputs',       label: 'Buy Inputs',     Icon: BuyInputsIcon,     color: 'bg-sector-inputs-bg text-sector-inputs' },
            { href: '/pledges',      label: 'Browse Pledges', Icon: HarvestPledgeIcon, color: 'bg-harvest-gold-bg text-harvest-gold' },
            { href: '/intelligence', label: 'Intelligence',   Icon: WeatherIcon,       color: 'bg-sector-fisheries-bg text-sector-fisheries' },
          ].map(({ href, label, Icon, color }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-border hover:bg-cream transition-colors">
              <span className={`p-2.5 rounded-xl ${color}`}>
                <Icon size={20} />
              </span>
              <span className="text-sm font-semibold text-forest">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Market snapshot */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-forest text-sm">Market Snapshot</h2>
          <Link href="/intelligence" className="text-xs font-semibold text-muted-foreground hover:text-forest flex items-center gap-0.5">
            Full report <ChevronRightIcon size={14} />
          </Link>
        </div>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-cream rounded-xl">
            <WeatherIcon size={18} className="text-sector-fisheries mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-forest">Weather</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Visit Intelligence for your regional forecast.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-cream rounded-xl">
            <PricesIcon size={18} className="text-forest mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-forest">Market Prices</p>
              <Link href="/intelligence" className="text-[11px] text-forest underline underline-offset-2 font-semibold">
                Check current prices by region
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
