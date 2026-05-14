'use client'

import { AgroScoreBar }  from '@/components/shared/agro-score-bar'
import { WalletCard }    from '@/components/wallet/wallet-card'
import { PriceDisplay }  from '@/components/shared/price-display'
import {
  WeatherIcon, PricesIcon, ListProduceIcon,
  BuyInputsIcon, HarvestPledgeIcon, ChevronRightIcon, OrdersIcon,
} from '@/components/shared/icons'
import Link from 'next/link'

const MOCK_FARMER = {
  fullName:    'Kwame Asante Boateng',
  region:      'Ashanti',
  agroScore:   72,
  listings:    3,
  activeOrders: 2,
}

const MOCK_WALLET = {
  balance:        1_240.50,
  pendingBalance: 450.00,
  totalEarned:    8_920.00,
}

const MOCK_BNPL = {
  eligible:    true,
  tier:        'Grower',
  maxAmount:   2_000,
  interestRate: 6,
}

export default function FarmerDashboard() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-24">
      {/* Greeting */}
      <div>
        <p className="text-muted-foreground text-sm">Good morning,</p>
        <h1 className="text-2xl font-extrabold text-forest">{MOCK_FARMER.fullName}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{MOCK_FARMER.region} Region</p>
      </div>

      {/* AgroScore */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-forest text-sm">AgroScore</h2>
          <Link href="/score" className="text-xs font-semibold text-muted-foreground hover:text-forest flex items-center gap-0.5">
            Details <ChevronRightIcon size={14} />
          </Link>
        </div>
        <AgroScoreBar score={MOCK_FARMER.agroScore} size="lg" />

        {MOCK_BNPL.eligible && (
          <div className="mt-4 flex items-center justify-between p-3 bg-lime/10 rounded-xl border border-lime/20">
            <div>
              <p className="text-xs font-semibold text-forest">{MOCK_BNPL.tier} BNPL Tier</p>
              <p className="text-[11px] text-muted-foreground">
                Up to GHS {MOCK_BNPL.maxAmount.toLocaleString()} at {MOCK_BNPL.interestRate}% flat
              </p>
            </div>
            <Link
              href="/bnpl"
              className="px-3 py-1.5 bg-forest text-white text-xs font-bold rounded-lg
                         hover:bg-forest-dark transition-colors"
            >
              Apply
            </Link>
          </div>
        )}
      </div>

      {/* Wallet */}
      <WalletCard
        balance={MOCK_WALLET.balance}
        pendingBalance={MOCK_WALLET.pendingBalance}
        totalEarned={MOCK_WALLET.totalEarned}
        onWithdraw={() => {}}
      />

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/listings"
          className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3 hover:bg-cream transition-colors">
          <span className="p-2.5 bg-cream rounded-xl">
            <ListProduceIcon size={20} className="text-forest" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Active Listings</p>
            <p className="text-xl font-extrabold font-mono text-forest">{MOCK_FARMER.listings}</p>
          </div>
        </Link>
        <Link href="/orders"
          className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3 hover:bg-cream transition-colors">
          <span className="p-2.5 bg-cream rounded-xl">
            <OrdersIcon size={20} className="text-forest" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Active Orders</p>
            <p className="text-xl font-extrabold font-mono text-forest">{MOCK_FARMER.activeOrders}</p>
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
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-border
                         hover:bg-cream transition-colors"
            >
              <span className={`p-2.5 rounded-xl ${color}`}>
                <Icon size={20} />
              </span>
              <span className="text-sm font-semibold text-forest">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Intelligence snapshot */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-forest text-sm">Intelligence</h2>
          <Link href="/intelligence" className="text-xs font-semibold text-muted-foreground hover:text-forest flex items-center gap-0.5">
            Full report <ChevronRightIcon size={14} />
          </Link>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-cream rounded-xl">
            <WeatherIcon size={18} className="text-sector-fisheries mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-forest">Weather — Ashanti</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Favorable conditions this week. Max 32°C. 18mm rain expected.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-cream rounded-xl">
            <PricesIcon size={18} className="text-forest mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-forest">Tomato Price — Ashanti</p>
              <div className="flex items-center gap-2 mt-0.5">
                <PriceDisplay amount={2.50} unit="kg" size="sm" />
                <span className="text-[10px] font-semibold text-lime-dark bg-lime/20 px-1.5 py-0.5 rounded-full">
                  +19% vs last week
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
