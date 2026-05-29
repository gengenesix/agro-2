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
  title:       'AgroConnect — Agricultural Trade Infrastructure',
  description: 'Trusted infrastructure for agricultural trade across Africa. Escrow-backed payments, harvest forward contracts, and farmer credit without banks.',
}

const MARQUEE_ITEMS = [
  'Escrow-Protected Payments',
  'Harvest Forward Contracts',
  'GPS Farm Verification',
  'Zero-Collateral Credit',
  'Multi-Currency Settlement',
  'Field-Agent Network',
  'Real-Time Market Intelligence',
  'Input Finance',
  'Certified Supply Chain',
  'Offline-First Infrastructure',
]

const SAMPLE_PRODUCE = [
  {
    id: 'smp-001',
    title: 'Certified Organic Tomatoes',
    category: 'Vegetables',
    sector: 'crops',
    region: 'West Africa',
    photo: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&q=80&fit=crop',
    badge: 'Field Verified',
    slug: 'fresh-organic-tomatoes-kumasi-farm',
  },
  {
    id: 'smp-002',
    title: 'Tilapia — Lake Farm',
    category: 'Fisheries',
    sector: 'fisheries',
    region: 'East Africa',
    photo: 'https://images.unsplash.com/photo-1570367823578-74b3ef1eba96?w=600&q=80&fit=crop',
    badge: 'Available Now',
    slug: 'live-tilapia-volta-lake',
  },
  {
    id: 'smp-003',
    title: 'Premium Cocoa Beans',
    category: 'Cash Crops',
    sector: 'crops',
    region: 'West Africa',
    photo: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80&fit=crop',
    badge: 'Harvest Pledge',
    slug: 'cocoa-beans-certified-western',
  },
]

const SECTOR_CHIP_COLOR: Record<string, string> = {
  crops:     'var(--sector-crops)',
  fisheries: 'var(--sector-fisheries)',
  livestock: 'var(--sector-livestock)',
  inputs:    'var(--sector-inputs)',
}

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden">

      {/* ── CAPABILITIES MARQUEE ──────────────────────────────── */}
      <div
        className="relative overflow-hidden py-2.5 border-b"
        style={{ backgroundColor: 'var(--forest)', borderColor: 'rgba(200,230,120,0.10)' }}
      >
        <div className="flex gap-14 whitespace-nowrap" style={{ animation: 'ticker 44s linear infinite' }}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.15em]">
              <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ backgroundColor: 'var(--lime)' }} />
              <span style={{ color: 'rgba(255,255,255,0.45)' }}>{item}</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-[94vh] flex items-center" style={{ backgroundColor: 'var(--forest)' }}>

        {/* Photo overlay */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&q=80&fit=crop"
            alt="" fill priority sizes="100vw"
            className="object-cover"
            style={{ opacity: 0.11 }}
          />
        </div>

        {/* Left vertical accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] hidden lg:block"
             style={{ backgroundColor: 'var(--lime)', opacity: 0.55 }} />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-8 sm:px-12 py-28">
          <div className="grid lg:grid-cols-[1fr_420px] gap-16 items-center">

            {/* Left — headline + CTA */}
            <div>
              <FadeIn>
                <div className="inline-flex items-center gap-3 mb-12">
                  <span
                    className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.18em] px-3 py-1.5"
                    style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--forest)' }} />
                    Live · Africa First
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-[0.14em]"
                        style={{ color: 'rgba(255,255,255,0.28)' }}>
                    Global Infrastructure
                  </span>
                </div>
              </FadeIn>

              <FadeUp delay={0.04}>
                <h1
                  className="font-display font-bold text-white leading-[0.90] mb-8"
                  style={{ fontSize: 'clamp(3.4rem, 8.5vw, 7rem)', letterSpacing: '-0.045em' }}
                >
                  Agricultural<br />
                  <span style={{ color: 'var(--lime)' }}>Trade</span><br />
                  Infrastructure.
                </h1>
              </FadeUp>

              <FadeUp delay={0.10}>
                <p className="text-lg leading-relaxed mb-12 max-w-[38ch]"
                   style={{ color: 'rgba(255,255,255,0.50)', fontWeight: 400 }}>
                  Escrow-backed payments. Harvest forward contracts.
                  Farmer credit without banks or collateral.
                </p>
              </FadeUp>

              <FadeUp delay={0.16}>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-3 px-8 py-4 font-bold text-sm
                               transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      backgroundColor: 'var(--lime)',
                      color: 'var(--forest)',
                      clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                    }}
                  >
                    Start Trading Free
                    <svg viewBox="0 0 16 16" width="13" height="13" fill="none"
                         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8h10M9 4l4 4-4 4"/>
                    </svg>
                  </Link>
                  <Link
                    href="/marketplace"
                    className="inline-flex items-center gap-3 px-8 py-4 font-bold text-sm text-white
                               transition-all duration-200 hover:bg-white/[0.07]"
                    style={{ border: '1.5px solid rgba(255,255,255,0.18)' }}
                  >
                    Browse Marketplace
                  </Link>
                </div>
              </FadeUp>
            </div>

            {/* Right — product UI preview card */}
            <FadeIn delay={0.22}>
              <div className="hidden lg:block">
                <div
                  className="relative p-6"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.10)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  {/* Card header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--lime)' }} />
                      <span className="text-[9px] font-bold uppercase tracking-[0.16em]"
                            style={{ color: 'rgba(255,255,255,0.40)' }}>
                        Active Pledge
                      </span>
                    </div>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5"
                          style={{ backgroundColor: 'rgba(200,230,100,0.12)', color: 'var(--lime)' }}>
                      ESCROW LOCKED
                    </span>
                  </div>

                  {/* Listing info */}
                  <div className="mb-5 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5"
                       style={{ color: 'rgba(255,255,255,0.28)' }}>
                      West Africa · Certified Organic
                    </p>
                    <p className="font-display font-bold text-white text-lg leading-snug mb-1"
                       style={{ letterSpacing: '-0.03em' }}>
                      Premium Cocoa Beans
                    </p>
                    <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Fine Flavour · Harvest Nov 2026
                    </p>
                  </div>

                  {/* Trade details grid */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    {[
                      { label: 'Pledged Volume', value: '2,400 kg' },
                      { label: 'Deposit Status', value: '20% Secured' },
                      { label: 'Seller Score', value: 'AgroScore 101' },
                      { label: 'Settlement', value: 'Multi-Currency' },
                    ].map(item => (
                      <div key={item.label}>
                        <p className="text-[8px] font-bold uppercase tracking-widest mb-1"
                           style={{ color: 'rgba(255,255,255,0.25)' }}>
                          {item.label}
                        </p>
                        <p className="font-mono font-bold text-xs text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="mb-5">
                    <div className="flex justify-between mb-2">
                      <span className="text-[8px] font-bold uppercase tracking-widest"
                            style={{ color: 'rgba(255,255,255,0.25)' }}>
                        Pledge Progress
                      </span>
                      <span className="text-[9px] font-mono font-bold" style={{ color: 'var(--lime)' }}>
                        68%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                      <div className="h-1.5 rounded-full w-[68%]" style={{ backgroundColor: 'var(--lime)' }} />
                    </div>
                  </div>

                  {/* CTA row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
                        <path d="M1 6l3 3 7-6" stroke="currentColor" strokeWidth="1.6"
                              strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--lime)' }}/>
                      </svg>
                      <span className="text-[9px] font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        Field-agent verified
                      </span>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-widest"
                          style={{ color: 'var(--lime)' }}>
                      View Contract →
                    </span>
                  </div>

                  {/* Corner accent */}
                  <div
                    className="absolute bottom-0 right-0 w-12 h-12"
                    style={{
                      background: 'linear-gradient(135deg, transparent 50%, rgba(200,230,100,0.08) 50%)',
                    }}
                  />
                </div>

                {/* Second floating card — offset */}
                <div
                  className="relative p-4 mt-3 ml-8"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex-shrink-0 overflow-hidden">
                      <Image
                        src="https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=80&q=80&fit=crop"
                        alt="" width={40} height={40} className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-white mb-0.5">Organic Tomatoes</p>
                      <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.30)' }}>Available Now · 500 kg</p>
                    </div>
                    <span className="text-[8px] font-bold uppercase tracking-widest px-2 py-1"
                          style={{ backgroundColor: 'rgba(200,230,100,0.10)', color: 'var(--lime)' }}>
                      Buy Now
                    </span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── PLATFORM SYSTEMS ─────────────────────────────────── */}
      <section className="py-28 lg:py-36" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8">

          <FadeUp className="mb-16">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-5"
               style={{ color: 'rgba(25,60,30,0.38)' }}>
              The Platform
            </p>
            <h2
              className="font-display font-bold leading-[0.93]"
              style={{ fontSize: 'clamp(2.8rem, 5.5vw, 4.8rem)', letterSpacing: '-0.04em', color: 'var(--forest)' }}
            >
              Four systems.<br />One platform.
            </h2>
          </FadeUp>

          <div className="grid lg:grid-cols-[1fr_380px] gap-4">

            {/* Primary card */}
            <Card3D>
              <Link
                href="/marketplace"
                className="group relative flex flex-col justify-between p-10 sm:p-14 overflow-hidden h-full min-h-[420px]"
                style={{
                  backgroundColor: 'var(--forest)',
                  clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
                }}
              >
                <div className="absolute inset-0 opacity-[0.07]">
                  <Image src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=60&fit=crop"
                         alt="" fill className="object-cover" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-12">
                    <div
                      className="w-16 h-16 flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: 'var(--lime)',
                        clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                      }}
                    >
                      {/* Hub-and-spoke network — marketplace connectivity */}
                      <svg viewBox="0 0 28 28" width="26" height="26" fill="none">
                        <circle cx="14" cy="14" r="3.5" fill="var(--forest)"/>
                        <circle cx="4"  cy="5"  r="2"   fill="var(--forest)" fillOpacity="0.55"/>
                        <circle cx="24" cy="5"  r="2"   fill="var(--forest)" fillOpacity="0.55"/>
                        <circle cx="4"  cy="23" r="2"   fill="var(--forest)" fillOpacity="0.55"/>
                        <circle cx="24" cy="23" r="2"   fill="var(--forest)" fillOpacity="0.55"/>
                        <circle cx="14" cy="2"  r="1.5" fill="var(--forest)" fillOpacity="0.4"/>
                        <circle cx="26" cy="14" r="1.5" fill="var(--forest)" fillOpacity="0.4"/>
                        <path d="M6 7l6.5 5.5M21.5 7l-6.5 5.5M6 21l6.5-5.5M21.5 21l-6.5-5.5M14 2v8.5M26 14h-8.5"
                              stroke="var(--forest)" strokeWidth="1.2" strokeOpacity="0.45" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em]"
                          style={{ color: 'rgba(200,230,100,0.50)' }}>
                      Marketplace
                    </span>
                  </div>

                  <h3
                    className="font-display font-bold text-white leading-[1.0] mb-5"
                    style={{ fontSize: 'clamp(2rem, 3.8vw, 3rem)', letterSpacing: '-0.04em' }}
                  >
                    Buy and sell field-verified produce. Directly.
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.48)', lineHeight: 1.78, maxWidth: '38ch' }}>
                    Escrow-backed transactions. Farmer-set prices.
                    No brokers, no markups. Every listing GPS-stamped
                    by a certified field agent.
                  </p>
                </div>

                <div className="relative z-10 flex items-center gap-2.5 mt-10 font-bold text-sm
                                group-hover:gap-4 transition-all"
                     style={{ color: 'var(--lime)' }}>
                  Explore Marketplace
                  <svg viewBox="0 0 16 16" width="13" height="13" fill="none"
                       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </div>
              </Link>
            </Card3D>

            {/* 3 side cards */}
            <div className="flex flex-col gap-4">
              {[
                {
                  href: '/harvest-pledges',
                  label: 'Harvest Pledges',
                  title: 'Forward contracts. Escrow-locked.',
                  body: 'Buyers commit before planting. Farmers grow with guaranteed off-take and a deposit up front.',
                  accent: 'var(--harvest-gold)',
                  icon: (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                      {/* Clock face with leaf at top — time + growth */}
                      <circle cx="12" cy="13" r="8.5" fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 9.5V13.5l2.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 4.5c0 0-1.5-2 0-3.5C13.5 2.5 12 4.5 12 4.5Z"
                            fill="currentColor" fillOpacity="0.7" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                      <path d="M12 4.5v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ),
                },
                {
                  href: '/market-intelligence',
                  label: 'Market Intelligence',
                  title: 'Live prices, weather & alerts.',
                  body: 'Regional benchmarks updated daily. 7-day forecasts. Offline delivery for rural reach.',
                  accent: 'var(--sector-fisheries)',
                  icon: (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                      {/* Radar rings + upward trend line */}
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.18"/>
                      <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.28"/>
                      <circle cx="12" cy="12" r="2.5" fill="currentColor" fillOpacity="0.45"/>
                      <path d="M12 12L19.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="19.5" cy="4.5" r="2" fill="currentColor"/>
                      <path d="M5 18.5l3-3.5 2.5 2 3-4 2.5 1.5"
                            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                },
                {
                  href: '/agro-inputs',
                  label: 'Agro Inputs',
                  title: 'Seeds & fertilizers. Pay after harvest.',
                  body: 'AgroScore credit without collateral. Inputs flow before the season begins.',
                  accent: 'var(--sector-inputs)',
                  icon: (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                      {/* Seedling with bifurcating leaves — growth from inputs */}
                      <path d="M5 22h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 22V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                      <path d="M12 17c0 0-3-1.5-3-4.5 1.5 0 3 1.5 3 4.5Z"
                            fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M12 14.5c0 0 3-1.5 3-4.5-1.5 0-3 1.5-3 4.5Z"
                            fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
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
                      border: '1.5px solid rgba(25,60,30,0.08)',
                      borderLeftWidth: '4px',
                      borderLeftColor: f.accent,
                    }}
                  >
                    <div
                      className="w-11 h-11 flex items-center justify-center flex-shrink-0 rounded-xl"
                      style={{ backgroundColor: 'rgba(25,60,30,0.06)', color: f.accent }}
                    >
                      {f.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] mb-1.5"
                         style={{ color: f.accent }}>
                        {f.label}
                      </p>
                      <h3 className="font-display font-bold text-sm leading-snug mb-1.5"
                          style={{ color: 'var(--forest)', letterSpacing: '-0.02em' }}>
                        {f.title}
                      </h3>
                      <p className="text-xs leading-relaxed" style={{ color: 'rgba(25,60,30,0.50)' }}>
                        {f.body}
                      </p>
                    </div>
                    <svg viewBox="0 0 16 16" width="11" height="11" fill="none"
                         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                         className="flex-shrink-0 mt-0.5 opacity-20 transition-opacity group-hover:opacity-60"
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

      {/* ── QUALITY STRIP ─────────────────────────────────────── */}
      <section style={{ backgroundColor: '#07130a' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <StaggerGrid className="grid grid-cols-2 lg:grid-cols-4" stagger={0.06}>
            {[
              { num: 'Field\nVerified',  sub: 'Every Listing'       },
              { num: 'Zero',             sub: 'Collateral Required'  },
              { num: 'Escrow',           sub: 'Every Transaction'    },
              { num: '<24h',             sub: 'Average Settlement'   },
            ].map((s, i) => (
              <StaggerItem key={s.sub}>
                <div
                  className="flex flex-col justify-center py-12 px-6"
                  style={{ borderRight: i < 3 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
                >
                  <p
                    className="font-display font-bold leading-tight mb-2 whitespace-pre-line"
                    style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2.1rem)', color: 'var(--lime)', letterSpacing: '-0.03em' }}
                  >
                    {s.num}
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest"
                     style={{ color: 'rgba(255,255,255,0.26)' }}>
                    {s.sub}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── WHO IT'S FOR ──────────────────────────────────────── */}
      <section className="py-28 lg:py-36" style={{ backgroundColor: 'white' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8">

          <FadeUp className="mb-16">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-5"
               style={{ color: 'rgba(25,60,30,0.36)' }}>
              Who It&apos;s For
            </p>
            <h2
              className="font-display font-bold leading-[0.93]"
              style={{ fontSize: 'clamp(2.6rem, 5vw, 4.2rem)', letterSpacing: '-0.04em', color: 'var(--forest)' }}
            >
              Three actors.<br />One system.
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                role: 'Farmer',
                color: 'var(--sector-crops)',
                headline: 'Sell your harvest before it leaves the ground.',
                points: [
                  'GPS-verified farm listing',
                  'Harvest pledge contracts',
                  'Credit up to $15K, no bank',
                  'Real-time market prices',
                  'Instant wallet settlement',
                ],
                cta: "I'm a Farmer",
                href: '/login',
                icon: (
                  <svg viewBox="0 0 32 32" width="30" height="30" fill="none">
                    {/* Person + location pin */}
                    <circle cx="13" cy="10" r="5" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2"/>
                    <path d="M3 28c0-5.5 4.5-9 10-9s10 3.5 10 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="25" cy="9" r="4.5" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.8"/>
                    <path d="M25 13.5v2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <circle cx="25" cy="8.5" r="1.4" fill="currentColor"/>
                  </svg>
                ),
              },
              {
                role: 'Buyer',
                color: 'var(--sector-fisheries)',
                headline: 'Secure verified supply chains before harvest.',
                points: [
                  'Pre-harvest forward contracts',
                  'Escrow-locked payment',
                  'Multi-currency settlement',
                  'Certified quality assurance',
                  'Direct farm access',
                ],
                cta: "I'm a Buyer",
                href: '/login',
                icon: (
                  <svg viewBox="0 0 32 32" width="30" height="30" fill="none">
                    {/* Globe with verified checkmark */}
                    <circle cx="14" cy="16" r="12" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2"/>
                    <path d="M2 16c3 2.5 6 3.5 12 3.5s9-1 12-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M2 16c3-2.5 6-3.5 12-3.5s9 1 12-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M14 4c-2.5 3.5-3 7-3 12s.5 8.5 3 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M14 4c2.5 3.5 3 7 3 12s-.5 8.5-3 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <circle cx="26" cy="7" r="5.5" fill="white"/>
                    <path d="M23 7l2.5 2.5L29 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
              },
              {
                role: 'Dealer',
                color: 'var(--sector-inputs)',
                headline: 'Reach more farmers. Move more inputs.',
                points: [
                  'Verified farmer network',
                  'BNPL distribution tools',
                  'Regional demand forecasting',
                  'Digital order management',
                  'Mobile-first storefront',
                ],
                cta: "I'm a Dealer",
                href: '/login',
                icon: (
                  <svg viewBox="0 0 32 32" width="30" height="30" fill="none">
                    {/* Package with upward arrows — dealer distribution */}
                    <path d="M16 3l13 7v12l-13 7L3 22V10l13-7Z"
                          fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                    <path d="M3 10l13 7M29 10l-13 7M16 17v15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.5"/>
                  </svg>
                ),
              },
            ].map((r, ri) => (
              <FadeUp key={r.role} delay={ri * 0.08}>
                <div
                  className="flex flex-col h-full p-8 transition-transform hover:-translate-y-1"
                  style={{
                    border: '1.5px solid rgba(25,60,30,0.09)',
                    borderTopWidth: '3px',
                    borderTopColor: r.color,
                  }}
                >
                  <div
                    className="w-14 h-14 flex items-center justify-center mb-6 rounded-2xl"
                    style={{ backgroundColor: 'rgba(25,60,30,0.05)', color: r.color }}
                  >
                    {r.icon}
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-[0.16em] mb-3"
                        style={{ color: r.color }}>
                    {r.role}
                  </span>
                  <h3 className="font-display font-bold text-[1.05rem] leading-snug mb-5"
                      style={{ color: 'var(--forest)', letterSpacing: '-0.025em' }}>
                    {r.headline}
                  </h3>
                  <ul className="space-y-2 mb-8 flex-1">
                    {r.points.map((p) => (
                      <li key={p} className="flex items-start gap-2.5 text-sm"
                          style={{ color: 'rgba(25,60,30,0.58)' }}>
                        <svg viewBox="0 0 12 12" width="11" height="11" fill="none"
                             className="flex-shrink-0 mt-[3px]" style={{ color: r.color }}>
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8"
                                strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={r.href}
                    className="inline-flex items-center gap-2 text-sm font-bold transition-all hover:gap-3"
                    style={{ color: r.color }}
                  >
                    {r.cta}
                    <svg viewBox="0 0 14 14" width="11" height="11" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 7h10M7 3l4 4-4 4"/>
                    </svg>
                  </Link>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST INFRASTRUCTURE ─────────────────────────────── */}
      <section className="py-28 lg:py-36" style={{ backgroundColor: 'var(--forest)' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <div className="grid lg:grid-cols-[1fr_1fr] gap-16 items-start">

            <SlideLeft>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-7"
                 style={{ color: 'rgba(200,230,100,0.55)' }}>
                The Infrastructure
              </p>
              <h2
                className="font-display font-bold text-white leading-[0.93] mb-7"
                style={{ fontSize: 'clamp(2.4rem, 4.8vw, 3.8rem)', letterSpacing: '-0.04em' }}
              >
                We built the trust layer. Not just a marketplace.
              </h2>
              <p className="leading-relaxed mb-10 text-base" style={{ color: 'rgba(255,255,255,0.46)' }}>
                Milestone-triggered escrow, multi-currency settlement,
                and field-agent verified dispute resolution —
                purpose-built for agricultural trade dynamics.
              </p>
              <Link
                href="/features"
                className="inline-flex items-center gap-3 px-7 py-3.5 font-bold text-sm
                           transition-all hover:scale-[1.02]"
                style={{
                  backgroundColor: 'var(--lime)',
                  color: 'var(--forest)',
                  clipPath: 'polygon(0 0, calc(100% - 9px) 0, 100% 9px, 100% 100%, 9px 100%, 0 calc(100% - 9px))',
                }}
              >
                See All Features
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none"
                     stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </Link>
            </SlideLeft>

            <SlideRight>
              <div>
                {[
                  {
                    tag: '01',
                    label: 'Local Payment Rails',
                    body: 'Instant settlement via local digital payment infrastructure. Works on feature phones without internet.',
                    detail: 'Mobile · Card · Bank Transfer',
                  },
                  {
                    tag: '02',
                    label: 'Multi-Currency Escrow',
                    body: 'Holds USD, EUR, and local currencies. Auto-releases on verified delivery confirmation.',
                    detail: 'USD · EUR · Local Currencies',
                  },
                  {
                    tag: '03',
                    label: 'AgroScore Credit Rail',
                    body: 'Farmer credit built from verified transaction history. No bank. No collateral.',
                    detail: 'Credit up to $15,000',
                  },
                ].map((rail, i) => (
                  <div
                    key={rail.tag}
                    className="flex gap-6 py-8"
                    style={{ borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}
                  >
                    <span className="flex-shrink-0 font-mono font-black pt-0.5"
                          style={{ fontSize: '1.3rem', color: 'var(--lime)' }}>
                      {rail.tag}
                    </span>
                    <div>
                      <p className="font-display font-bold text-white mb-2"
                         style={{ fontSize: '1.05rem', letterSpacing: '-0.025em' }}>
                        {rail.label}
                      </p>
                      <p className="text-sm leading-relaxed mb-3"
                         style={{ color: 'rgba(255,255,255,0.42)' }}>
                        {rail.body}
                      </p>
                      <span className="text-[9px] font-bold uppercase tracking-[0.14em] px-2.5 py-1.5"
                            style={{ backgroundColor: 'rgba(200,230,100,0.09)', color: 'var(--lime)' }}>
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

      {/* ── SAMPLE LISTINGS ───────────────────────────────────── */}
      <section className="py-28 lg:py-36" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <FadeUp className="flex items-end justify-between mb-14">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-5"
                 style={{ color: 'rgba(25,60,30,0.36)' }}>
                Live on the Platform
              </p>
              <h2
                className="font-display font-bold leading-[0.93]"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)', letterSpacing: '-0.04em', color: 'var(--forest)' }}
              >
                Verified produce,<br />farm-gate access.
              </h2>
            </div>
            <Link href="/produce"
              className="hidden sm:inline-flex items-center gap-2 font-bold text-sm
                         transition-all hover:gap-3"
              style={{ color: 'var(--forest)' }}>
              All Listings
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none"
                   stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4"/>
              </svg>
            </Link>
          </FadeUp>

          <StaggerGrid className="grid sm:grid-cols-3 gap-4" stagger={0.10}>
            {SAMPLE_PRODUCE.map(listing => (
              <StaggerItem key={listing.id}>
                <Card3D>
                  <Link href={`/produce/${listing.slug}`}
                    className="group block overflow-hidden"
                    style={{ backgroundColor: 'white', border: '1.5px solid rgba(25,60,30,0.08)' }}
                  >
                    <div className="relative h-56 overflow-hidden">
                      <Image src={listing.photo} alt={listing.title} fill sizes="400px"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                      />
                      <div className="absolute inset-0"
                           style={{ background: 'linear-gradient(to top, rgba(7,19,10,0.7) 0%, transparent 55%)' }} />
                      <div className="absolute top-3 left-3">
                        <span
                          className="text-[8px] font-bold uppercase tracking-[0.12em] px-2.5 py-1"
                          style={{
                            backgroundColor: SECTOR_CHIP_COLOR[listing.sector] ?? 'var(--forest)',
                            color: 'white',
                          }}
                        >
                          {listing.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span
                          className="text-[8px] font-bold uppercase tracking-[0.12em] px-2 py-1"
                          style={{ backgroundColor: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.85)' }}
                        >
                          {listing.badge}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="font-display font-bold text-sm leading-snug line-clamp-2 mb-3"
                         style={{ color: 'var(--forest)', letterSpacing: '-0.015em' }}>
                        {listing.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <svg viewBox="0 0 14 14" width="10" height="10" fill="none"
                               stroke="currentColor" strokeWidth="2"
                               style={{ color: 'rgba(25,60,30,0.32)' }}>
                            <path d="M7 1a5 5 0 0 1 5 5c0 3.5-5 8-5 8S2 9.5 2 6a5 5 0 0 1 5-5Z"/>
                            <circle cx="7" cy="6" r="1.5"/>
                          </svg>
                          <span className="text-[10px] font-semibold"
                                style={{ color: 'rgba(25,60,30,0.42)' }}>
                            {listing.region}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold uppercase tracking-widest"
                              style={{ color: SECTOR_CHIP_COLOR[listing.sector] ?? 'var(--forest)' }}>
                          Trade Now →
                        </span>
                      </div>
                    </div>
                  </Link>
                </Card3D>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section className="py-28 lg:py-36" style={{ backgroundColor: 'white' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8">
          <FadeUp className="max-w-xl mb-16">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-5"
               style={{ color: 'rgba(25,60,30,0.36)' }}>
              How It Works
            </p>
            <h2
              className="font-display font-bold leading-[0.93]"
              style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)', letterSpacing: '-0.04em', color: 'var(--forest)' }}
            >
              Trade-ready<br />in three steps.
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-0">
            {[
              {
                step: '01',
                title: 'Register & Verify',
                body: 'Sign up in minutes. A certified field agent verifies your farm with GPS — boosting your AgroScore and unlocking escrow trading.',
                icon: (
                  <svg viewBox="0 0 28 28" width="28" height="28" fill="none">
                    {/* ID card with verification shield */}
                    <rect x="3" y="7" width="22" height="16" rx="2.5"
                          fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="2.2"/>
                    <circle cx="9.5" cy="14" r="3" fill="currentColor" fillOpacity="0.35"/>
                    <path d="M15 12h6M15 16h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    <path d="M22 2l5 2.5v5c0 2.5-2 4-5 5.5C19 13.5 17 12 17 9.5V4.5L22 2Z"
                          fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M20 7.5l1.5 1.5 2.5-2.5"
                          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'List or Browse',
                body: 'Farmers list produce and pledge harvest contracts. Buyers browse verified listings by region, sector, and certification.',
                icon: (
                  <svg viewBox="0 0 28 28" width="28" height="28" fill="none">
                    {/* Four-grid with magnifier over last cell */}
                    <rect x="3" y="3" width="9" height="9" rx="2"
                          fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2"/>
                    <rect x="16" y="3" width="9" height="9" rx="2"
                          fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2"/>
                    <rect x="3" y="16" width="9" height="9" rx="2"
                          fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="21" cy="21" r="5.5"
                            fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="2"/>
                    <path d="m24.5 24.5 2 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Trade with Confidence',
                body: 'Every payment held in escrow, released on confirmed delivery. Multi-currency settlement. BNPL credit for inputs before harvest.',
                icon: (
                  <svg viewBox="0 0 28 28" width="28" height="28" fill="none">
                    {/* Lock with checkmark — security + confirmation */}
                    <rect x="6" y="13" width="16" height="12" rx="2"
                          fill="currentColor" fillOpacity="0.14" stroke="currentColor" strokeWidth="2.2"/>
                    <path d="M10 13V9a4 4 0 0 1 8 0v4"
                          stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
                    <path d="M11 20l2 2 4-4"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ),
              },
            ].map((h, i) => (
              <FadeUp key={h.step} delay={i * 0.08}>
                <div
                  className="relative py-10 pr-8 h-full"
                  style={{
                    paddingLeft: i === 0 ? '0' : '2.5rem',
                    borderLeft: i > 0 ? '1px solid rgba(25,60,30,0.10)' : 'none',
                  }}
                >
                  <div className="flex items-start gap-4 mb-7">
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
                      className="font-mono font-black leading-none mt-4"
                      style={{ fontSize: '3.2rem', color: 'rgba(25,60,30,0.05)', lineHeight: 1 }}
                    >
                      {h.step}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg mb-3.5"
                      style={{ color: 'var(--forest)', letterSpacing: '-0.03em' }}>
                    {h.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(25,60,30,0.50)' }}>
                    {h.body}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────── */}
      <section className="relative py-40 overflow-hidden" style={{ backgroundColor: '#060f08' }}>
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80&fit=crop"
            alt="" fill aria-hidden="true" className="object-cover" style={{ opacity: 0.09 }} sizes="100vw"
          />
        </div>
        <div className="absolute top-0 left-0 right-0 h-[2px]"
             style={{ backgroundColor: 'var(--lime)', opacity: 0.35 }} />

        <FadeUp className="relative z-10 max-w-3xl mx-auto text-center px-6">
          <div
            className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em]
                       px-4 py-2 mb-10"
            style={{ border: '1px solid rgba(200,230,100,0.20)', color: 'var(--lime)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--lime)' }} />
            Open for Registration
          </div>

          <h2
            className="font-display font-bold text-white leading-[0.92] mb-7"
            style={{ fontSize: 'clamp(2.8rem, 6.5vw, 5.6rem)', letterSpacing: '-0.045em' }}
          >
            Infrastructure for<br />
            <em className="not-italic" style={{ color: 'var(--lime)' }}>
              agricultural trust.
            </em>
          </h2>

          <p className="text-lg mb-14 leading-relaxed max-w-lg mx-auto"
             style={{ color: 'rgba(255,255,255,0.40)' }}>
            Join farmers, dealers, and buyers on a platform built for
            how agricultural trade actually works — verified, secured, and financed.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login"
              className="px-12 py-4 font-bold text-sm transition-all hover:scale-[1.02]"
              style={{
                backgroundColor: 'var(--lime)',
                color: 'var(--forest)',
                clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
              }}>
              Create Your Account
            </Link>
            <Link href="/about"
              className="px-12 py-4 font-bold text-sm transition-all hover:bg-white/[0.06]"
              style={{ color: 'white', border: '1.5px solid rgba(255,255,255,0.15)' }}>
              Learn More
            </Link>
          </div>
        </FadeUp>
      </section>

    </main>
  )
}
