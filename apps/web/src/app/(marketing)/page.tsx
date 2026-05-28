import type { Metadata } from 'next'
import Image             from 'next/image'
import Link              from 'next/link'
import {
  FadeUp, FadeIn, SlideLeft, SlideRight,
  StaggerGrid, StaggerItem, Card3D,
} from './_components/animate-in'

export const dynamic   = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title:       'AgroConnect — The Global Agricultural Trade Platform',
  description: 'Trusted infrastructure for cross-border agricultural trade. Escrow-backed payments, harvest forward contracts, and farmer credit — built for the world.',
}

const TICKER_ITEMS = [
  { label: 'Maize',      price: 'GHS 1.80/kg', delta: '+2.4%',  up: true  },
  { label: 'Tomatoes',   price: 'GHS 2.50/kg', delta: '+5.1%',  up: true  },
  { label: 'Tilapia',    price: 'GHS 22.00/kg', delta: '-0.8%', up: false },
  { label: 'Cocoa',      price: 'GHS 48.00/kg', delta: '+3.7%', up: true  },
  { label: 'NPK 15-15',  price: 'GHS 180/bag', delta: '+1.2%',  up: true  },
  { label: 'Cassava',    price: 'GHS 0.95/kg', delta: '+1.8%',  up: true  },
  { label: 'Broiler',    price: 'GHS 35.00/hd', delta: '-1.5%', up: false },
  { label: 'Groundnut',  price: 'GHS 6.20/kg', delta: '+4.2%',  up: true  },
]

const STATS = [
  { value: '500M+',  label: 'Smallholder Farms' },
  { value: '54',     label: 'AfCFTA Nations'     },
  { value: '<2%',    label: 'Digitized'          },
  { value: '$3.5T',  label: 'Market Size'        },
]

export default async function LandingPage() {
  type LiveListing = {
    id: string; title: string; slug: string; pricePerUnit: number
    photos: string[]; category: { name: string; sector: string }
    unit: { symbol: string }; region: { name: string } | null
  }

  const SECTOR_FALLBACK: Record<string, string> = {
    crops:     'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&q=80&fit=crop',
    livestock: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&q=80&fit=crop',
    poultry:   'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&q=80&fit=crop',
    fisheries: 'https://images.unsplash.com/photo-1570367823578-74b3ef1eba96?w=600&q=80&fit=crop',
    inputs:    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80&fit=crop',
  }
  const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80&fit=crop'

  const liveListings: LiveListing[] = [
    { id: 'lst-001', title: 'Fresh Organic Tomatoes — Kumasi Farm', slug: 'fresh-organic-tomatoes-kumasi-farm', pricePerUnit: 2.50, photos: ['https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&q=80&fit=crop'], category: { name: 'Tomato', sector: 'crops' }, unit: { symbol: 'kg' }, region: { name: 'Ashanti' } },
    { id: 'lst-002', title: 'Live Tilapia — Volta Lake Farm', slug: 'live-tilapia-volta-lake', pricePerUnit: 22.00, photos: ['https://images.unsplash.com/photo-1570367823578-74b3ef1eba96?w=600&q=80&fit=crop'], category: { name: 'Tilapia', sector: 'fisheries' }, unit: { symbol: 'kg' }, region: { name: 'Volta' } },
    { id: 'lst-003', title: 'Cocoa Beans — Certified Fine Flavour', slug: 'cocoa-beans-certified-western', pricePerUnit: 12.50, photos: ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80&fit=crop'], category: { name: 'Cocoa', sector: 'crops' }, unit: { symbol: 'kg' }, region: { name: 'Western' } },
  ]

  return (
    <main className="overflow-x-hidden">

      {/* ── TICKER ─────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden py-2.5 border-b"
        style={{ backgroundColor: 'var(--forest)', borderColor: 'rgba(200,245,66,0.15)' }}
      >
        <div
          className="flex gap-10 whitespace-nowrap"
          style={{ animation: 'ticker 38s linear infinite' }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-2.5 text-[11px] font-mono font-bold">
              <span style={{ color: 'rgba(255,255,255,0.45)' }}>{item.label}</span>
              <span style={{ color: 'white' }}>{item.price}</span>
              <span style={{ color: item.up ? 'var(--lime)' : '#f87171' }}>
                {item.up ? '▲' : '▼'} {item.delta}
              </span>
              <span style={{ color: 'rgba(255,255,255,0.18)' }}>|</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center" style={{ backgroundColor: 'var(--forest)' }}>

        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&q=85&fit=crop"
            alt="" fill priority sizes="100vw"
            className="object-cover object-center"
            style={{ opacity: 0.18 }}
          />
        </div>

        {/* Lime accent bar — top right geometric cut */}
        <div
          className="absolute top-0 right-0 w-2 h-full hidden lg:block"
          style={{ backgroundColor: 'var(--lime)', opacity: 0.6 }}
        />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-8 py-24">
          <div className="max-w-3xl">

            <FadeIn>
              <div className="flex items-center gap-3 mb-10">
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]
                             px-3 py-1.5 rounded-sm"
                  style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: 'var(--forest)', animation: 'pulse 2s infinite' }}
                  />
                  Live · Piloting in Ghana
                </span>
                <span
                  className="text-[10px] font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  Next: SE Asia · Latin America
                </span>
              </div>
            </FadeIn>

            <FadeUp delay={0.05}>
              <h1
                className="font-display font-bold text-white leading-[0.95] mb-8"
                style={{
                  fontSize: 'clamp(3.4rem, 8.5vw, 7.2rem)',
                  letterSpacing: '-0.04em',
                }}
              >
                The Global<br />
                <span style={{ color: 'var(--lime)', WebkitTextStroke: '1px rgba(255,255,255,0.15)' }}>
                  Agricultural
                </span><br />
                Trade Platform.
              </h1>
            </FadeUp>

            <FadeUp delay={0.12}>
              <p
                className="text-lg sm:text-xl leading-relaxed mb-10 max-w-2xl"
                style={{ color: 'rgba(255,255,255,0.60)' }}
              >
                Escrow-backed payments, harvest forward contracts, and farmer credit —
                infrastructure for how agricultural trade actually works.
              </p>
            </FadeUp>

            <FadeUp delay={0.18}>
              <div className="flex flex-wrap gap-3 mb-16">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2.5 px-8 py-4 font-bold text-sm
                             transition-all hover:scale-[1.03] active:scale-[0.98]"
                  style={{
                    backgroundColor: 'var(--lime)',
                    color: 'var(--forest)',
                    clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                  }}
                >
                  Start Trading Free
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none"
                       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </Link>
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2.5 px-8 py-4 font-bold text-sm
                             text-white transition-all hover:bg-white/10"
                  style={{ border: '1.5px solid rgba(255,255,255,0.25)' }}
                >
                  Browse Marketplace
                </Link>
              </div>
            </FadeUp>

            {/* Market opportunity — horizontal rule stats */}
            <FadeIn delay={0.28}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 pt-8"
                   style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}>
                {STATS.map((s, i) => (
                  <div
                    key={s.label}
                    className="py-5 pr-6"
                    style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.10)' : 'none',
                             paddingLeft: i > 0 ? '1.5rem' : '0' }}
                  >
                    <p className="font-mono font-extrabold leading-none mb-1.5"
                       style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: 'var(--lime)' }}>
                      {s.value}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-widest leading-snug"
                       style={{ color: 'rgba(255,255,255,0.40)' }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── PLATFORM FEATURES — asymmetric editorial grid ──────────── */}
      <section className="py-28 lg:py-36" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8">

          <FadeUp className="mb-16">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-5"
               style={{ color: 'var(--forest)', opacity: 0.45 }}>
              The Platform
            </p>
            <h2
              className="font-display font-bold leading-[0.96]"
              style={{
                fontSize: 'clamp(2.6rem, 5vw, 4.4rem)',
                letterSpacing: '-0.04em',
                color: 'var(--forest)',
              }}
            >
              Four systems.<br />One platform.
            </h2>
          </FadeUp>

          {/* Large feature card + 3 stacked */}
          <div className="grid lg:grid-cols-[1fr_400px] gap-5">

            {/* Primary large card */}
            <Card3D>
              <Link
                href="/marketplace"
                className="group relative flex flex-col justify-between p-9 sm:p-12 overflow-hidden h-full min-h-[380px]"
                style={{
                  backgroundColor: 'var(--forest)',
                  clipPath: 'polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px))',
                }}
              >
                {/* Background texture */}
                <div className="absolute inset-0 opacity-10">
                  <Image
                    src="https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=60&fit=crop"
                    alt="" fill className="object-cover"
                  />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-10">
                    <div
                      className="w-14 h-14 flex items-center justify-center"
                      style={{
                        backgroundColor: 'var(--lime)',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
                        <path d="M2 7h20l-1.8 10a2 2 0 0 1-2 1.5H5.8a2 2 0 0 1-2-1.5L2 7Z"
                          fill="var(--forest)" stroke="var(--forest)" strokeWidth="1.5"/>
                        <path d="M2 7L4.5 3h15L22 7" stroke="var(--forest)" strokeWidth="2" strokeLinejoin="round"/>
                        <path d="M9 7v2a3 3 0 0 0 6 0V7" stroke="var(--forest)" strokeWidth="2" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em]"
                          style={{ color: 'rgba(200,245,66,0.6)' }}>
                      Marketplace
                    </span>
                  </div>
                  <h3
                    className="font-display font-bold text-white leading-[1.0] mb-4"
                    style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', letterSpacing: '-0.035em' }}
                  >
                    Buy & sell field-verified produce.
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                    Escrow-backed payments. Farmer-set prices. No brokers, no markups.
                    Every listing GPS-stamped by a certified field agent.
                  </p>
                </div>
                <div className="relative z-10 flex items-center gap-2 mt-8 font-bold text-sm"
                     style={{ color: 'var(--lime)' }}>
                  Explore Marketplace
                  <svg viewBox="0 0 16 16" width="13" height="13" fill="none"
                       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                       className="transition-transform group-hover:translate-x-1">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </div>
              </Link>
            </Card3D>

            {/* 3 smaller feature cards */}
            <div className="flex flex-col gap-5">
              {[
                {
                  href: '/harvest-pledges',
                  label: 'Harvest Pledges',
                  title: 'Forward contracts. Escrow-locked.',
                  body: 'International buyers commit before planting. Farmers grow with guaranteed off-take.',
                  accent: 'var(--harvest-gold)',
                  icon: (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                      <path d="M12 2a7.5 7.5 0 0 1 7.5 7.5c0 5.5-7.5 13-7.5 13S4.5 15 4.5 9.5A7.5 7.5 0 0 1 12 2Z"
                        fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2.5"/>
                      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                },
                {
                  href: '/market-intelligence',
                  label: 'Market Intelligence',
                  title: 'Live prices, weather & alerts.',
                  body: 'Regional benchmarks updated daily. 7-day forecasts. Offline SMS delivery for rural reach.',
                  accent: 'var(--sector-fisheries)',
                  icon: (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                      <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                      <path d="M7 17l4-5 3.5 3 5-6.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="7" cy="17" r="2" fill="currentColor"/>
                    </svg>
                  ),
                },
                {
                  href: '/agro-inputs',
                  label: 'Agro Inputs',
                  title: 'Seeds & fertilizers. Pay after harvest.',
                  body: 'AgroScore credit up to $15,000 — no bank, no collateral.',
                  accent: 'var(--sector-inputs)',
                  icon: (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                      <path d="M4 8h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"
                        fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"/>
                      <path d="M2 6h20v2H2z" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                      <path d="M10 13h4M12 11v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  ),
                },
              ].map((f) => (
                <Card3D key={f.href} className="flex-1">
                  <Link
                    href={f.href}
                    className="group flex items-start gap-4 p-6 h-full transition-colors"
                    style={{
                      backgroundColor: 'white',
                      borderLeft: `4px solid ${f.accent}`,
                      border: `1.5px solid rgba(25,60,30,0.10)`,
                      borderLeftWidth: '4px',
                      borderLeftColor: f.accent,
                    }}
                  >
                    <div
                      className="w-11 h-11 flex items-center justify-center flex-shrink-0 rounded-lg"
                      style={{ backgroundColor: `${f.accent}22`, color: f.accent }}
                    >
                      {f.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] mb-1"
                         style={{ color: f.accent }}>
                        {f.label}
                      </p>
                      <h3 className="font-display font-bold text-sm leading-snug mb-1"
                          style={{ color: 'var(--forest)', letterSpacing: '-0.02em' }}>
                        {f.title}
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: 'rgba(25,60,30,0.55)' }}>
                        {f.body}
                      </p>
                    </div>
                    <svg viewBox="0 0 16 16" width="12" height="12" fill="none"
                         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                         className="flex-shrink-0 mt-0.5 opacity-30 transition-opacity group-hover:opacity-80"
                         style={{ color: 'var(--forest)' }}>
                      <path d="M3 8h10M9 4l4 4-4 4"/>
                    </svg>
                  </Link>
                </Card3D>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BREAK — bold black strip ─────────────────────────── */}
      <section style={{ backgroundColor: '#0a1a0d' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <StaggerGrid className="grid grid-cols-2 lg:grid-cols-4" stagger={0.07}>
            {[
              { num: '24,000+', sub: 'Active Farmers' },
              { num: '18,500+', sub: 'Live Listings'  },
              { num: 'GHS 4.2M', sub: 'Escrow Secured' },
              { num: '16 / 16',  sub: 'Ghana Regions'  },
            ].map((s, i) => (
              <StaggerItem key={s.num}>
                <div
                  className="flex flex-col justify-center py-12 px-6"
                  style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}
                >
                  <p className="font-mono font-extrabold leading-none mb-2"
                     style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', color: 'var(--lime)' }}>
                    {s.num}
                  </p>
                  <p className="text-[10px] font-bold uppercase tracking-widest"
                     style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {s.sub}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── PAYMENT ENGINE ─────────────────────────────────────────── */}
      <section className="py-28 lg:py-36" style={{ backgroundColor: 'var(--forest)' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-16 items-start">

            <SlideLeft>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-6"
                 style={{ color: 'var(--lime)', opacity: 0.7 }}>
                The Engine
              </p>
              <h2
                className="font-display font-bold text-white leading-[0.96] mb-6"
                style={{
                  fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)',
                  letterSpacing: '-0.04em',
                }}
              >
                We built the payment engine. Not just plugged into one.
              </h2>
              <p className="leading-relaxed mb-8 text-base"
                 style={{ color: 'rgba(255,255,255,0.50)' }}>
                Milestone-triggered escrow, multi-currency settlement, and
                field-agent verified dispute resolution — purpose-built for
                agricultural contract law.
              </p>
              <Link
                href="/features"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 font-bold text-sm
                           transition-all hover:scale-[1.03]"
                style={{
                  backgroundColor: 'var(--lime)',
                  color: 'var(--forest)',
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                }}
              >
                See All Features
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none"
                     stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </Link>
            </SlideLeft>

            <SlideRight>
              <div className="space-y-0">
                {[
                  {
                    tag: '01',
                    label: 'Mobile Money Rail',
                    body: 'Instant settlement for local transactions. Works on any basic phone without a smartphone.',
                    detail: 'MTN · Vodafone · AirtelTigo',
                  },
                  {
                    tag: '02',
                    label: 'Multi-Currency Escrow',
                    body: 'Holds USD, EUR, GBP, and local currency. Auto-releases on verified delivery confirmation.',
                    detail: 'USD · EUR · GBP · GHS',
                  },
                  {
                    tag: '03',
                    label: 'AgroScore Credit Rail',
                    body: 'Farmer credit based on transaction history. No bank account required. No collateral.',
                    detail: 'Up to $15,000 credit line',
                  },
                ].map((rail, i) => (
                  <div
                    key={rail.tag}
                    className="flex gap-6 py-8"
                    style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}
                  >
                    <div className="flex-shrink-0 pt-0.5">
                      <div
                        className="font-mono font-extrabold text-lg leading-none"
                        style={{ color: 'var(--lime)' }}
                      >
                        {rail.tag}
                      </div>
                    </div>
                    <div>
                      <p className="font-display font-bold text-white mb-1.5"
                         style={{ fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
                        {rail.label}
                      </p>
                      <p className="text-sm leading-relaxed mb-2"
                         style={{ color: 'rgba(255,255,255,0.45)' }}>
                        {rail.body}
                      </p>
                      <span
                        className="text-[9px] font-bold uppercase tracking-[0.14em] px-2.5 py-1"
                        style={{ backgroundColor: 'rgba(200,245,66,0.12)', color: 'var(--lime)' }}
                      >
                        {rail.detail}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </SlideRight>
          </div>
        </div>
      </section>

      {/* ── LIVE LISTINGS ─────────────────────────────────────────── */}
      {liveListings.length > 0 && (
        <section className="py-28 lg:py-36" style={{ backgroundColor: 'white' }}>
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            <FadeUp className="flex items-end justify-between mb-14">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-4"
                   style={{ color: 'rgba(25,60,30,0.40)' }}>
                  Live on the Platform
                </p>
                <h2
                  className="font-display font-bold leading-[0.96]"
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 3.2rem)',
                    letterSpacing: '-0.04em',
                    color: 'var(--forest)',
                  }}
                >
                  Verified produce,<br />farm gate prices.
                </h2>
              </div>
              <Link href="/produce"
                className="hidden sm:inline-flex items-center gap-2 font-bold text-sm"
                style={{ color: 'var(--forest)' }}>
                All Listings
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none"
                     stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </Link>
            </FadeUp>
            <StaggerGrid className="grid sm:grid-cols-3 gap-5" stagger={0.1}>
              {liveListings.map(listing => {
                const photo = listing.photos[0] ?? SECTOR_FALLBACK[listing.category.sector] ?? DEFAULT_FALLBACK
                return (
                  <StaggerItem key={listing.id}>
                    <Card3D>
                      <Link href={`/produce/${listing.slug}`}
                        className="group block overflow-hidden"
                        style={{
                          backgroundColor: 'var(--cream)',
                          border: '1.5px solid rgba(25,60,30,0.10)',
                        }}>
                        <div className="relative h-52 overflow-hidden">
                          <Image src={photo} alt={listing.title} fill
                            sizes="400px"
                            className="object-cover transition-transform duration-700 group-hover:scale-[1.08]"
                          />
                          <div className="absolute inset-0"
                               style={{ background: 'linear-gradient(to top, rgba(10,26,13,0.5) 0%, transparent 50%)' }} />
                          <div className="absolute top-3 left-3">
                            <span
                              className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1"
                              style={{ backgroundColor: 'var(--forest)', color: 'var(--lime)' }}
                            >
                              {listing.category.name}
                            </span>
                          </div>
                          <div className="absolute bottom-3 right-3">
                            <p className="font-mono font-extrabold text-lg leading-none text-white"
                               style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
                              GHS {listing.pricePerUnit.toFixed(2)}
                              <span className="text-xs font-normal opacity-70 ml-1">/ {listing.unit.symbol}</span>
                            </p>
                          </div>
                        </div>
                        <div className="p-5">
                          <p className="font-display font-bold text-sm leading-snug line-clamp-2 mb-2"
                             style={{ color: 'var(--forest)', letterSpacing: '-0.01em' }}>
                            {listing.title}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor"
                                 strokeWidth="2.5" style={{ color: 'rgba(25,60,30,0.35)' }}>
                              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"/>
                              <circle cx="12" cy="10" r="2.5"/>
                            </svg>
                            <p className="text-[11px] font-semibold" style={{ color: 'rgba(25,60,30,0.45)' }}>
                              {listing.region?.name ?? 'Ghana'}
                            </p>
                          </div>
                        </div>
                      </Link>
                    </Card3D>
                  </StaggerItem>
                )
              })}
            </StaggerGrid>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="py-28 lg:py-36" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8">

          <FadeUp className="max-w-xl mb-16">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-5"
               style={{ color: 'rgba(25,60,30,0.40)' }}>
              How it works
            </p>
            <h2
              className="font-display font-bold leading-[0.96]"
              style={{
                fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
                letterSpacing: '-0.04em',
                color: 'var(--forest)',
              }}
            >
              Trade-ready in three steps.
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-0">
            {[
              {
                step: '01',
                title: 'Register & Get Verified',
                body: 'Sign up in minutes. A certified field agent verifies your farm via GPS — boosting your AgroScore and unlocking escrow trading.',
                icon: (
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                    <circle cx="12" cy="8" r="4" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2.5"/>
                    <path d="M4 20c0-3.5 3.6-6.5 8-6.5s8 3 8 6.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'List or Browse',
                body: 'Farmers list produce and pledge contracts. International buyers browse verified listings by region, sector, and price.',
                icon: (
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                    <circle cx="11" cy="11" r="7.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.5"/>
                    <path d="m21 21-4.5-4.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Trade with Confidence',
                body: 'Every payment in escrow, released on delivery confirmation. Multi-currency settlement. BNPL credit lets farmers buy inputs before harvest.',
                icon: (
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2"
                      fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.5"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                ),
              },
            ].map((h, i) => (
              <FadeUp key={h.step} delay={i * 0.1}>
                <div
                  className="relative py-10 pr-8 h-full"
                  style={{
                    paddingLeft: i === 0 ? '0' : '2.5rem',
                    borderLeft: i > 0 ? '1px solid rgba(25,60,30,0.12)' : 'none',
                  }}
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div
                      className="w-14 h-14 flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: 'var(--forest)',
                        color: 'var(--lime)',
                        clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                      }}
                    >
                      {h.icon}
                    </div>
                    <span
                      className="font-mono font-extrabold leading-none mt-3"
                      style={{ fontSize: '3.5rem', color: 'rgba(25,60,30,0.06)', lineHeight: 1 }}
                    >
                      {h.step}
                    </span>
                  </div>
                  <h3
                    className="font-display font-bold text-lg mb-3"
                    style={{ color: 'var(--forest)', letterSpacing: '-0.025em' }}
                  >
                    {h.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(25,60,30,0.55)' }}>
                    {h.body}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="relative py-36 overflow-hidden" style={{ backgroundColor: '#0a1a0d' }}>
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&q=80&fit=crop"
            alt="" fill aria-hidden="true"
            className="object-cover"
            style={{ opacity: 0.12 }}
            sizes="100vw"
          />
        </div>

        {/* Lime diagonal accent */}
        <div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ backgroundColor: 'var(--lime)', opacity: 0.5 }}
        />

        <FadeUp className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-8"
             style={{ color: 'var(--lime)', opacity: 0.6 }}>
            Join the Platform
          </p>
          <h2
            className="font-display font-bold text-white leading-[0.95] mb-6"
            style={{
              fontSize: 'clamp(2.8rem, 6vw, 5.2rem)',
              letterSpacing: '-0.04em',
            }}
          >
            Ready to trade with{' '}
            <em className="not-italic" style={{ color: 'var(--lime)' }}>
              confidence?
            </em>
          </h2>
          <p className="text-lg mb-12 leading-relaxed max-w-xl mx-auto"
             style={{ color: 'rgba(255,255,255,0.50)' }}>
            Join farmers, dealers, and international buyers on infrastructure
            built for trust — escrow-protected, field-verified, credit-enabled.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login"
              className="px-10 py-4 font-bold text-sm transition-all hover:scale-[1.03]"
              style={{
                backgroundColor: 'var(--lime)',
                color: 'var(--forest)',
                clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
              }}>
              Create Your Account
            </Link>
            <Link href="/about"
              className="px-10 py-4 font-bold text-sm transition-all hover:bg-white/10"
              style={{
                color: 'white',
                border: '1.5px solid rgba(255,255,255,0.25)',
              }}>
              Learn More
            </Link>
          </div>
        </FadeUp>
      </section>

    </main>
  )
}
