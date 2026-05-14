# CLAUDE_WEB.md — AgroConnect Frontend
# Next.js 15 on Vercel — Complete Build Instructions
# Read CLAUDE.md first, then this file.

---

## 1. PROJECT STRUCTURE

```
apps/web/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx           Full-page auth (forest/cream split)
│   │   │   ├── login/page.tsx       Phone + OTP entry
│   │   │   └── onboarding/
│   │   │       ├── role/page.tsx    Choose role
│   │   │       ├── farmer/page.tsx  Farmer profile setup
│   │   │       ├── dealer/page.tsx  Dealer profile setup
│   │   │       └── buyer/page.tsx   Buyer profile setup
│   │   │
│   │   ├── (market)/                Public marketplace (no auth required)
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx             Landing + browse
│   │   │   ├── produce/
│   │   │   │   ├── page.tsx         Browse all produce
│   │   │   │   └── [slug]/page.tsx  Listing detail
│   │   │   ├── inputs/
│   │   │   │   ├── page.tsx         Browse inputs
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── pledges/page.tsx     Browse harvest pledges
│   │   │   └── farmers/[id]/page.tsx Farmer profile
│   │   │
│   │   ├── (farmer)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── listings/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── wallet/page.tsx
│   │   │   ├── bnpl/page.tsx
│   │   │   ├── intelligence/page.tsx
│   │   │   └── profile/page.tsx
│   │   │
│   │   ├── (dealer)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── listings/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   └── analytics/page.tsx
│   │   │
│   │   ├── (buyer)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── orders/page.tsx
│   │   │   ├── pledges/page.tsx
│   │   │   └── alerts/page.tsx
│   │   │
│   │   ├── (admin)/
│   │   │   ├── layout.tsx
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── users/page.tsx
│   │   │   │   ├── listings/page.tsx
│   │   │   │   ├── orders/page.tsx
│   │   │   │   ├── bnpl/page.tsx
│   │   │   │   ├── disputes/page.tsx
│   │   │   │   └── broadcast/page.tsx
│   │   │
│   │   ├── payments/
│   │   │   └── verify/page.tsx      Paystack callback
│   │   │
│   │   ├── globals.css
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── ui/                      Radix primitives
│   │   ├── shared/
│   │   │   ├── icon.tsx
│   │   │   ├── navbar.tsx           Mobile bottom nav
│   │   │   ├── sidebar.tsx          Desktop sidebar
│   │   │   ├── sector-chip.tsx      Colored sector badge
│   │   │   ├── verification-badge.tsx
│   │   │   ├── agro-score-bar.tsx   Score 0–110 visualization
│   │   │   ├── price-display.tsx    GHS + Geist Mono
│   │   │   ├── quantity-display.tsx
│   │   │   ├── region-badge.tsx
│   │   │   └── empty-state.tsx
│   │   │
│   │   ├── listings/
│   │   │   ├── listing-card.tsx     Main listing card
│   │   │   ├── listing-grid.tsx
│   │   │   ├── listing-filters.tsx
│   │   │   ├── listing-map.tsx      Leaflet locations
│   │   │   ├── pledge-card.tsx      Harvest pledge variant
│   │   │   ├── input-card.tsx       Input dealer variant
│   │   │   ├── listing-gallery.tsx  Photo lightbox
│   │   │   ├── create-listing-form.tsx
│   │   │   └── bnpl-badge.tsx       "Pay at Harvest" indicator
│   │   │
│   │   ├── intelligence/
│   │   │   ├── weather-card.tsx     7-day forecast
│   │   │   ├── price-chart.tsx      Recharts price trend
│   │   │   ├── price-table.tsx      Current prices by region
│   │   │   ├── pest-alert-card.tsx
│   │   │   └── advisory-card.tsx
│   │   │
│   │   ├── wallet/
│   │   │   ├── wallet-card.tsx      Balance + pending
│   │   │   ├── wallet-history.tsx
│   │   │   └── withdraw-modal.tsx
│   │   │
│   │   ├── bnpl/
│   │   │   ├── bnpl-eligibility.tsx Score + tier
│   │   │   ├── bnpl-apply-modal.tsx
│   │   │   └── bnpl-status-card.tsx
│   │   │
│   │   └── admin/
│   │       ├── user-table.tsx
│   │       ├── verification-queue.tsx
│   │       ├── bnpl-queue.tsx
│   │       └── broadcast-modal.tsx
│   │
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   ├── use-listings.ts
│   │   ├── use-wallet.ts
│   │   ├── use-weather.ts
│   │   └── use-mobile.ts
│   │
│   ├── lib/
│   │   ├── api.ts            Axios + JWT interceptor
│   │   ├── supabase.ts       Browser auth client
│   │   ├── format.ts         GHS, dates, quantities
│   │   └── utils.ts
│   │
│   └── context/
│       ├── auth-context.tsx
│       └── locale-context.tsx  next-intl language switching
│
└── public/
    ├── icons/
    └── images/
```

---

## 2. GLOBALS.CSS — EXACT IMPLEMENTATION

```css
@import 'tailwindcss';
@import 'tw-animate-css';

:root {
  /* Base tokens */
  --background:            oklch(0.97 0.015 100);
  --foreground:            oklch(0.18 0.04 145);
  --card:                  oklch(1 0 0);
  --card-foreground:       oklch(0.18 0.04 145);
  --primary:               oklch(0.28 0.07 145);
  --primary-foreground:    oklch(0.98 0 0);
  --muted:                 oklch(0.94 0.02 100);
  --muted-foreground:      oklch(0.52 0.03 145);
  --accent:                oklch(0.88 0.22 120);
  --accent-foreground:     oklch(0.18 0.08 145);
  --destructive:           oklch(0.577 0.245 27.325);
  --border:                oklch(0.90 0.02 100);
  --input:                 oklch(0.90 0.02 100);
  --ring:                  oklch(0.88 0.22 120);
  --radius:                1rem;
  --lime:                  oklch(0.88 0.22 120);
  --lime-dark:             oklch(0.78 0.20 120);
  --forest:                oklch(0.28 0.07 145);
  --forest-dark:           oklch(0.20 0.06 145);
  --cream:                 oklch(0.97 0.015 100);
  --cream-dark:            oklch(0.93 0.025 100);

  /* AgroConnect sector tokens */
  --sector-crops:          oklch(0.35 0.12 145);
  --sector-crops-bg:       oklch(0.94 0.04 145);
  --sector-livestock:      oklch(0.45 0.12 60);
  --sector-livestock-bg:   oklch(0.95 0.04 60);
  --sector-poultry:        oklch(0.62 0.18 80);
  --sector-poultry-bg:     oklch(0.96 0.05 80);
  --sector-fisheries:      oklch(0.48 0.16 240);
  --sector-fisheries-bg:   oklch(0.95 0.04 240);
  --sector-inputs:         oklch(0.42 0.16 300);
  --sector-inputs-bg:      oklch(0.95 0.03 300);
  --harvest-gold:          oklch(0.75 0.18 80);
  --harvest-gold-bg:       oklch(0.96 0.05 80);
  --verified-blue:         oklch(0.55 0.18 250);
  --premium-green:         oklch(0.48 0.20 145);
}

@theme inline {
  --font-sans:    var(--font-plus-jakarta);
  --font-serif:   var(--font-playfair);
  --font-mono:    'Geist Mono', monospace;
  --color-background:   var(--background);
  --color-foreground:   var(--foreground);
  --color-card:         var(--card);
  --color-primary:      var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-muted:        var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent:       var(--accent);
  --color-border:       var(--border);
  --color-lime:         var(--lime);
  --color-forest:       var(--forest);
  --color-cream:        var(--cream);
  --color-cream-dark:   var(--cream-dark);
  --color-harvest-gold: var(--harvest-gold);
  --color-sector-crops:     var(--sector-crops);
  --color-sector-livestock: var(--sector-livestock);
  --color-sector-poultry:   var(--sector-poultry);
  --color-sector-fisheries: var(--sector-fisheries);
  --color-sector-inputs:    var(--sector-inputs);
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground font-sans antialiased; }
  h1, h2, h3 { @apply text-forest tracking-tight; }
}

@layer utilities {
  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }
  .font-display    { font-family: var(--font-playfair), Georgia, serif; }
  .bg-forest       { background-color: var(--forest); }
  .bg-lime         { background-color: var(--lime); }
  .bg-cream        { background-color: var(--cream); }
  .bg-cream-dark   { background-color: var(--cream-dark); }
  .bg-harvest-gold { background-color: var(--harvest-gold); }
  .text-forest     { color: var(--forest); }
  .text-lime       { color: var(--lime); }
  .text-harvest-gold { color: var(--harvest-gold); }
  .pb-safe         { padding-bottom: env(safe-area-inset-bottom, 1.25rem); }
  .card-lift       { @apply transition-all duration-200; }
  .card-lift:hover { @apply shadow-md -translate-y-0.5; }

  /* Score bar colors */
  .score-high { background-color: oklch(0.48 0.18 145); }
  .score-mid  { background-color: oklch(0.62 0.18 80); }
  .score-low  { background-color: oklch(0.52 0.20 30); }
}
```

---

## 3. APP LAYOUT (root)

```tsx
// src/app/layout.tsx
import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['700', '800'],
  display: 'swap',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${plusJakarta.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  )
}
```

---

## 4. LISTING CARD COMPONENT

This is the most important component. Build it precisely.

```tsx
// src/components/listings/listing-card.tsx
'use client'

import Link from 'next/link'
import Image from 'next/image'
import { SectorChip } from '@/components/shared/sector-chip'
import { VerificationBadge } from '@/components/shared/verification-badge'
import { PriceDisplay } from '@/components/shared/price-display'
import { BNPLBadge } from './bnpl-badge'
import { Icon } from '@/components/shared/icon'
import type { ListingSummary } from '@agroconnect/types'

interface ListingCardProps {
  listing: ListingSummary
  variant?: 'produce' | 'pledge' | 'input'
}

export function ListingCard({ listing, variant = 'produce' }: ListingCardProps) {
  const isPledge = listing.listingType === 'harvest_pledge'

  return (
    <Link
      href={`/produce/${listing.slug}`}
      className={`group block bg-card rounded-2xl overflow-hidden border card-lift
        ${isPledge ? 'border-l-4 border-l-harvest-gold border-border' : 'border-border'}`}
    >
      {/* Photo */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={listing.photos?.[0] ?? 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80&fit=crop'}
          alt={listing.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          draggable={false}
        />

        {/* Sector chip — always top-left */}
        <div className="absolute top-3 left-3">
          <SectorChip sector={listing.category.sector} label={listing.category.name} />
        </div>

        {/* Pledge badge — top-right */}
        {isPledge && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 bg-harvest-gold/90 backdrop-blur-sm
                             text-white text-[10px] font-bold rounded-full px-2.5 py-1">
              <Icon src="/icons/actions/pledge.png" size={10} alt="" />
              Harvest Pledge
            </span>
          </div>
        )}

        {/* Farming method */}
        {listing.farmingMethod === 'organic' && (
          <div className="absolute bottom-3 left-3">
            <span className="bg-lime/90 text-forest text-[10px] font-bold
                             rounded-full px-2 py-0.5">
              Organic
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Title — Playfair Display */}
        <h3 className="font-display text-base font-bold text-forest leading-snug
                       line-clamp-2 mb-2 group-hover:text-forest-dark transition-colors">
          {listing.title}
        </h3>

        {/* Farmer + region */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <div className="w-4 h-4 rounded-full bg-cream-dark overflow-hidden flex-shrink-0">
              {listing.seller.avatarUrl && (
                <Image src={listing.seller.avatarUrl} alt="" width={16} height={16}
                  className="object-cover" draggable={false} />
              )}
            </div>
            <span className="text-[11px] text-muted-foreground truncate">
              {listing.seller.fullName}
            </span>
            <VerificationBadge level={listing.seller.verificationLevel} size="xs" />
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <Icon src="/icons/hostel/location-pin.png" size={12} alt="" />
            <span className="text-[11px] text-muted-foreground">{listing.region.name}</span>
          </div>
        </div>

        {/* Price + quantity */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <PriceDisplay
              amount={Number(listing.pricePerUnit)}
              unit={listing.unit.abbreviation}
              size="lg"
            />
            {listing.bnplAvailable && <BNPLBadge className="mt-1" />}
          </div>
          <div className="text-right">
            <span className="font-mono text-sm font-bold text-forest">
              {Number(listing.quantityAvailable).toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground ml-1">
              {listing.unit.abbreviation}
            </span>
          </div>
        </div>

        {/* Pledge harvest date */}
        {isPledge && listing.expectedHarvestDate && (
          <div className="flex items-center gap-1.5 py-2 px-3 bg-harvest-gold/10
                          rounded-xl border border-harvest-gold/20 mb-3">
            <Icon src="/icons/actions/pledge.png" size={14} alt="Harvest date" />
            <span className="text-xs font-semibold text-harvest-gold">
              Expected harvest: {formatDate(listing.expectedHarvestDate)}
            </span>
          </div>
        )}

        {/* Footer — rating + views */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1">
            <Icon src="/icons/misc/star-filled.png" size={12} alt="Rating" />
            <span className="text-[11px] font-semibold text-forest">
              {listing.seller.agroScore}
            </span>
            <span className="text-[11px] text-muted-foreground">AgroScore</span>
          </div>
          <div className="flex items-center gap-1">
            <Icon src="/icons/misc/eye.png" size={12} alt="Views" />
            <span className="text-[11px] text-muted-foreground">
              {listing.viewsCount} views
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
```

---

## 5. SECTOR CHIP COMPONENT

```tsx
// src/components/shared/sector-chip.tsx
interface SectorChipProps {
  sector: 'crops' | 'livestock' | 'poultry' | 'fisheries' | 'inputs'
  label: string
  size?: 'sm' | 'md'
  className?: string
}

const SECTOR_STYLES: Record<string, string> = {
  crops:     'bg-[oklch(0.94_0.04_145)] text-[oklch(0.35_0.12_145)] border-[oklch(0.35_0.12_145)]/20',
  livestock: 'bg-[oklch(0.95_0.04_60)]  text-[oklch(0.45_0.12_60)]  border-[oklch(0.45_0.12_60)]/20',
  poultry:   'bg-[oklch(0.96_0.05_80)]  text-[oklch(0.62_0.18_80)]  border-[oklch(0.62_0.18_80)]/20',
  fisheries: 'bg-[oklch(0.95_0.04_240)] text-[oklch(0.48_0.16_240)] border-[oklch(0.48_0.16_240)]/20',
  inputs:    'bg-[oklch(0.95_0.03_300)] text-[oklch(0.42_0.16_300)] border-[oklch(0.42_0.16_300)]/20',
}

export function SectorChip({ sector, label, size = 'sm', className = '' }: SectorChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold border rounded-full
        ${size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'}
        ${SECTOR_STYLES[sector]} ${className}`}
    >
      <img
        src={`/icons/sectors/${sector}.png`}
        alt=""
        width={size === 'sm' ? 10 : 14}
        height={size === 'sm' ? 10 : 14}
        draggable={false}
      />
      {label}
    </span>
  )
}
```

---

## 6. AGROSCORE BAR COMPONENT

```tsx
// src/components/shared/agro-score-bar.tsx
'use client'

import { useEffect, useState } from 'react'

interface AgroScoreBarProps {
  score: number   // 0–110
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function AgroScoreBar({ score, showLabel = true, size = 'md' }: AgroScoreBarProps) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setWidth((score / 110) * 100), 100)
    return () => clearTimeout(t)
  }, [score])

  const color = score >= 80 ? 'score-high' : score >= 50 ? 'score-mid' : 'score-low'
  const label = score >= 80 ? 'Excellent' : score >= 50 ? 'Good' : 'Building'
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' }

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-medium text-muted-foreground">AgroScore</span>
          <span className="text-[11px] font-bold text-forest font-mono">
            {score}/110 · {label}
          </span>
        </div>
      )}
      <div className={`w-full bg-cream-dark rounded-full overflow-hidden ${heights[size]}`}
        role="progressbar" aria-valuenow={score} aria-valuemax={110}>
        <div
          className={`h-full rounded-full ${color} transition-all duration-700 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}
```

---

## 7. PRICE DISPLAY COMPONENT

```tsx
// src/components/shared/price-display.tsx
import { formatGHS } from '@/lib/format'

interface PriceDisplayProps {
  amount: number
  unit?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl',
}

export function PriceDisplay({ amount, unit, size = 'md', className = '' }: PriceDisplayProps) {
  return (
    <span className={`inline-flex items-baseline gap-1 ${className}`}>
      <span className={`font-mono font-bold text-forest ${sizes[size]}`}>
        {formatGHS(amount)}
      </span>
      {unit && (
        <span className="text-xs text-muted-foreground font-sans">
          /{unit}
        </span>
      )}
    </span>
  )
}
```

---

## 8. WEATHER CARD COMPONENT

```tsx
// src/components/intelligence/weather-card.tsx
'use client'

import Image from 'next/image'
import { Icon } from '@/components/shared/icon'

interface WeatherDay {
  date: string
  maxTempC: number
  minTempC: number
  precipitationMm: number
  description: string
}

interface WeatherCardProps {
  region: string
  district: string
  forecast: WeatherDay[]
  assessment: { alert: boolean; severity: string; message: string }
}

export function WeatherCard({ region, district, forecast, assessment }: WeatherCardProps) {
  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-forest px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-white/60 text-[11px] font-medium uppercase tracking-wider">
            7-Day Forecast
          </p>
          <h3 className="text-white font-bold text-sm">{district}, {region}</h3>
        </div>
        <Icon src="/icons/actions/weather.png" size={32} alt="Weather" className="opacity-80" />
      </div>

      {/* Alert banner */}
      {assessment.alert && (
        <div className={`px-4 py-2.5 flex items-start gap-2 text-sm
          ${assessment.severity === 'critical'
            ? 'bg-red-50 text-red-700 border-b border-red-100'
            : 'bg-amber-50 text-amber-700 border-b border-amber-100'
          }`}>
          <Icon src="/icons/actions/pest-alert.png" size={16} alt="Alert"
            className="mt-0.5 flex-shrink-0" />
          <p className="text-xs font-medium leading-relaxed">{assessment.message}</p>
        </div>
      )}

      {/* 7-day grid */}
      <div className="grid grid-cols-7 divide-x divide-border p-0">
        {forecast.slice(0, 7).map((day, i) => (
          <div key={day.date} className="flex flex-col items-center py-3 px-1">
            <span className="text-[9px] font-bold text-muted-foreground uppercase">
              {i === 0 ? 'Today' : formatDayShort(day.date)}
            </span>
            <span className="text-xs font-bold text-forest mt-1">
              {Math.round(day.maxTempC)}°
            </span>
            <span className="text-[9px] text-muted-foreground">
              {Math.round(day.minTempC)}°
            </span>
            {day.precipitationMm > 2 && (
              <span className="text-[8px] text-blue-500 mt-0.5 font-semibold">
                {day.precipitationMm.toFixed(0)}mm
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function formatDayShort(date: string): string {
  return new Date(date).toLocaleDateString('en-GH', { weekday: 'short' }).slice(0, 3)
}
```

---

## 9. WALLET CARD COMPONENT

```tsx
// src/components/wallet/wallet-card.tsx
'use client'

import { formatGHS } from '@/lib/format'
import { Icon } from '@/components/shared/icon'

interface WalletCardProps {
  balance: number
  pendingBalance: number
  totalEarned: number
  onWithdraw: () => void
}

export function WalletCard({ balance, pendingBalance, totalEarned, onWithdraw }: WalletCardProps) {
  return (
    <div className="bg-forest rounded-2xl p-5 text-white relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-wider mb-1">
              Available Balance
            </p>
            <p className="text-3xl font-extrabold font-mono tracking-tight">
              {formatGHS(balance)}
            </p>
          </div>
          <Icon src="/icons/actions/wallet.png" size={40} alt="Wallet" className="opacity-70" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-white/60 text-[10px] font-medium mb-0.5">In Escrow</p>
            <p className="text-white font-bold font-mono text-sm">
              {formatGHS(pendingBalance)}
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-white/60 text-[10px] font-medium mb-0.5">Total Earned</p>
            <p className="text-white font-bold font-mono text-sm">
              {formatGHS(totalEarned)}
            </p>
          </div>
        </div>

        <button
          onClick={onWithdraw}
          className="w-full py-3 bg-lime text-forest font-bold text-sm rounded-xl
                     transition-all duration-150 active:scale-[0.98] flex items-center
                     justify-center gap-2"
        >
          <Icon src="/icons/actions/withdraw.png" size={18} alt="" />
          Withdraw to Mobile Money
        </button>
      </div>
    </div>
  )
}
```

---

## 10. OTP LOGIN PAGE

```tsx
// src/app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Icon } from '@/components/shared/icon'

const phoneSchema = z.object({
  phone: z.string()
    .min(10, 'Enter a valid Ghana phone number')
    .regex(/^(\+233|0)[0-9]{9}$/, 'Enter a valid Ghana phone number (+233 or 0XX format)')
})

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'Digits only')
})

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const phoneForm = useForm({ resolver: zodResolver(phoneSchema) })
  const otpForm = useForm({ resolver: zodResolver(otpSchema) })

  async function onPhoneSubmit({ phone: p }: { phone: string }) {
    setLoading(true)
    try {
      const formatted = p.startsWith('0') ? `+233${p.slice(1)}` : p
      await api.post('/auth/request-otp', { phone: formatted })
      setPhone(formatted)
      setStep('otp')
    } finally {
      setLoading(false)
    }
  }

  async function onOTPSubmit({ otp }: { otp: string }) {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-otp', { phone, otp })
      // Store session in Supabase client
      router.push(data.isNewUser ? '/onboarding/role' : '/dashboard')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-5">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center">
            <span className="text-lime font-black text-sm">AC</span>
          </div>
          <div>
            <p className="font-bold text-forest text-lg leading-none">AgroConnect</p>
            <p className="text-[11px] text-muted-foreground">From seed to sale.</p>
          </div>
        </div>

        {step === 'phone' ? (
          <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-4">
            <div>
              <h1 className="text-2xl font-extrabold text-forest mb-1">Welcome</h1>
              <p className="text-sm text-muted-foreground">
                Enter your Ghana phone number to continue
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-forest block mb-2">
                Phone Number
              </label>
              <div className="flex gap-2">
                <span className="flex items-center px-3 bg-cream-dark border border-border
                                 rounded-xl text-sm font-semibold text-forest">
                  +233
                </span>
                <input
                  {...phoneForm.register('phone')}
                  type="tel"
                  placeholder="024 000 0000"
                  className="flex-1 px-4 py-3 border-2 border-border rounded-xl text-sm
                             focus:border-forest focus:outline-none text-forest bg-white
                             transition-colors"
                />
              </div>
              {phoneForm.formState.errors.phone && (
                <p className="text-destructive text-xs mt-1">
                  {phoneForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-forest text-white font-bold text-base rounded-2xl
                         transition-all duration-150 active:scale-[0.98] disabled:opacity-50
                         flex items-center justify-center gap-2"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <>Get OTP <Icon src="/icons/actions/send.png" size={18} alt="" /></>
              }
            </button>

            <p className="text-center text-xs text-muted-foreground">
              An SMS will be sent to your number. Standard rates apply.
            </p>
          </form>
        ) : (
          <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-4">
            <div>
              <h1 className="text-2xl font-extrabold text-forest mb-1">Enter OTP</h1>
              <p className="text-sm text-muted-foreground">
                6-digit code sent to <strong className="text-forest">{phone}</strong>
              </p>
            </div>

            <div>
              <input
                {...otpForm.register('otp')}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                className="w-full px-4 py-5 border-2 border-border rounded-2xl text-center
                           text-3xl font-mono font-bold text-forest tracking-[0.5em]
                           focus:border-forest focus:outline-none bg-white transition-colors"
              />
              {otpForm.formState.errors.otp && (
                <p className="text-destructive text-xs mt-1 text-center">
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-forest text-white font-bold text-base rounded-2xl
                         transition-all duration-150 active:scale-[0.98] disabled:opacity-50
                         flex items-center justify-center"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : 'Verify & Continue'
              }
            </button>

            <button type="button" onClick={() => setStep('phone')}
              className="w-full text-sm text-muted-foreground hover:text-forest text-center">
              Change phone number
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
```

---

## 11. FORMAT UTILITIES

```typescript
// src/lib/format.ts
import { format, formatDistanceToNow } from 'date-fns'

export function formatGHS(amount: number): string {
  return `GHS ${amount.toLocaleString('en-GH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatGHSCompact(amount: number): string {
  if (amount >= 1_000_000) return `GHS ${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000)     return `GHS ${(amount / 1_000).toFixed(1)}K`
  return formatGHS(amount)
}

export function formatQuantity(qty: number, unit: string): string {
  return `${qty.toLocaleString('en-GH')} ${unit}`
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatPhoneGhana(phone: string): string {
  // +233241234567 → 024 123 4567
  const digits = phone.replace('+233', '0')
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}
```

---

## 12. FRONTEND BUILD ORDER

```
Step 1:  globals.css — exact tokens (base + sector + harvest-gold)
Step 2:  app/layout.tsx — Plus Jakarta Sans + Playfair Display + Geist Mono
Step 3:  middleware.ts — protect farmer/dealer/buyer/admin routes
Step 4:  lib/api.ts — axios + JWT interceptor
Step 5:  context/auth-context.tsx

Step 6:  (auth)/layout.tsx — forest/cream split, AgroConnect branding
Step 7:  (auth)/login/page.tsx — phone + OTP flow (no email/password)
Step 8:  (auth)/onboarding/* — role selection + profile setup forms

Step 9:  Shared components:
  - Icon (PNG wrapper — always draggable=false, explicit size)
  - SectorChip (5 sector colors)
  - VerificationBadge (4 levels: unverified/self/field/premium)
  - AgroScoreBar (0–110, animated, 3 color states)
  - PriceDisplay (GHS + Geist Mono, always)
  - RegionBadge
  - EmptyState

Step 10: ListingCard — reference Section 4 of this file exactly
Step 11: PledgeCard — harvest-gold border variant
Step 12: InputCard — dealer listing variant

Step 13: (market)/layout.tsx — public navbar + footer
Step 14: (market)/page.tsx — landing + hero + featured + categories
Step 15: (market)/produce/page.tsx — full marketplace with filters + map
Step 16: (market)/produce/[slug]/page.tsx — listing detail + order flow
Step 17: (market)/pledges/page.tsx — harvest pledges browse

Step 18: (farmer)/layout.tsx — farmer sidebar + mobile nav
Step 19: (farmer)/dashboard/page.tsx — score + listings + wallet snapshot
Step 20: (farmer)/listings/* — create + manage listings
Step 21: (farmer)/wallet/page.tsx — WalletCard + history + withdraw modal
Step 22: (farmer)/bnpl/page.tsx — eligibility + apply + active loans
Step 23: (farmer)/intelligence/page.tsx — weather + prices + pest alerts

Step 24: (dealer)/layout.tsx + dashboard + listings
Step 25: (buyer)/layout.tsx + dashboard + orders + pledges

Step 26: (admin)/layout.tsx — dark forest sidebar
Step 27: admin/dashboard — GMV charts + stats (recharts)
Step 28: admin/users — verification queue
Step 29: admin/bnpl — approve/reject queue
Step 30: admin/broadcast — send SMS/push to filtered users

Step 31: Skeleton states for all pages
Step 32: Empty states for all pages
Step 33: Error boundaries
Step 34: PWA manifest (installable on Android)
Step 35: OG metadata for listing pages (WhatsApp card sharing)
Step 36: next-intl setup (English default + Twi/Hausa/Ewe/Ga stubs)
Step 37: pnpm build — zero TypeScript errors
```
