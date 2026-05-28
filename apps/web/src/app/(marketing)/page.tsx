import type { Metadata } from 'next'
import Image             from 'next/image'
import Link              from 'next/link'
import { prisma }        from '@/lib/prisma'
import {
  FadeUp, FadeIn, SlideLeft, SlideRight,
  StaggerGrid, StaggerItem, Card3D, FloatUp,
} from './_components/animate-in'

export const dynamic   = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title:       'AgroConnect — Ghana Agricultural Trading Platform',
  description: "Ghana's agricultural operating system. Buy produce, pledge harvests, access BNPL credit, and get real-time market intelligence across all 16 regions.",
}

const STATS = [
  { value: '24,000+',  label: 'Verified Farmers'   },
  { value: '18,500+',  label: 'Live Listings'       },
  { value: 'GHS 4.2M', label: 'Pledges in Escrow'  },
  { value: '16 / 16',  label: 'Regions Active'      },
]

const FEATURES = [
  {
    href:  '/marketplace',
    label: 'Marketplace',
    title: 'Buy & sell field-verified produce.',
    body:  'Escrow-backed payments. Farmer-set prices. No brokers, no markups. Every listing GPS-stamped by a certified field agent.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  {
    href:  '/harvest-pledges',
    label: 'Harvest Pledges',
    title: 'Forward contracts. Escrow-locked deposits.',
    body:  'Buyers commit 5–50% before planting season. Farmers grow with guaranteed off-take. Field agents verify every milestone.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <path d="M16 2v4M8 2v4M3 10h18"/>
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/>
      </svg>
    ),
  },
  {
    href:  '/market-intelligence',
    label: 'Market Intelligence',
    title: 'Daily prices, weather & pest alerts.',
    body:  'Regional price benchmarks updated daily. 7-day forecasts. Critical alerts delivered via SMS and USSD to offline farmers in all 16 regions.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    href:  '/agro-inputs',
    label: 'Agro Inputs',
    title: 'Seeds & fertilizers. Pay after harvest.',
    body:  'BNPL credit tiers up to GHS 50,000 anchored to your AgroScore. Certified inputs from verified dealers. Repay when your crop is sold.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12M12 12C12 7 8 4 4 4c0 4 3 8 8 8zM12 12c0-5 4-8 8-8 0 4-3 8-8 8"/>
      </svg>
    ),
  },
]

const HOW = [
  {
    step: '01',
    title: 'Register & Get Verified',
    body: 'Sign up in minutes. A certified field agent verifies your farm via GPS — boosting your AgroScore and unlocking escrow trading.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    step: '02',
    title: 'List or Browse',
    body: 'Farmers list produce and pledge contracts. Buyers browse verified listings by region, sector, and price. Dealers manage inventory and bulk orders.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Trade with Confidence',
    body: 'Every payment is held in escrow and released only on delivery confirmation. BNPL credit lets farmers access inputs before the harvest.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
]

export default async function LandingPage() {
  type LiveListing = {
    id: string; title: string; slug: string; pricePerUnit: number
    photos: string[]; category: { name: string; sector: string }
    unit: { symbol: string }; region: { name: string } | null
  }

  const SECTOR_FALLBACK: Record<string, string> = {
    crops:     'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&q=80&fit=crop',
    livestock: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&q=80&fit=crop',
    poultry:   'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&q=80&fit=crop',
    fisheries: 'https://images.unsplash.com/photo-1570367823578-74b3ef1eba96?w=400&q=80&fit=crop',
    inputs:    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80&fit=crop',
  }
  const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80&fit=crop'

  let liveListings: LiveListing[] = []
  try {
    const rows = await prisma.listing.findMany({
      where: { status: 'active' }, take: 3, orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true, sector: true } },
        unit:     { select: { abbreviation: true } },
        region:   { select: { name: true } },
      },
    })
    liveListings = rows.map(r => ({
      id: r.id, title: r.title, slug: r.slug, pricePerUnit: Number(r.pricePerUnit),
      photos: r.photos,
      category: { name: r.category.name, sector: String(r.category.sector) },
      unit: { symbol: r.unit.abbreviation },
      region: r.region ? { name: r.region.name } : null,
    }))
  } catch { /* DB cold start — fall through */ }

  return (
    <main className="overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[92vh] grid lg:grid-cols-[54%_46%] pt-16"
        style={{ backgroundColor: 'var(--cream)' }}
      >
        {/* Left — copy */}
        <div className="flex items-center px-8 sm:px-12 lg:px-16 py-20 lg:py-0">
          <div className="w-full max-w-2xl">

            <FadeIn>
              <div className="inline-flex items-center gap-2 mb-10">
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest
                             px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--forest)', color: 'var(--lime)' }}
                >
                  <svg viewBox="0 0 10 10" width="7" height="7" fill="currentColor">
                    <circle cx="5" cy="5" r="5"/>
                  </svg>
                  Live · All 16 Regions
                </span>
              </div>
            </FadeIn>

            <FadeUp delay={0.06}>
              <h1
                className="font-bold leading-[1.04] mb-6"
                style={{
                  fontSize: 'clamp(2.8rem, 6vw, 5rem)',
                  letterSpacing: '-0.055em',
                  color: 'var(--forest)',
                }}
              >
                Ghana&apos;s{' '}
                <em
                  className="not-italic"
                  style={{
                    color: 'var(--lime)',
                    WebkitTextStroke: '1.5px var(--forest)',
                  }}
                >
                  Agricultural
                </em>
                <br />
                Operating System.
              </h1>
            </FadeUp>

            <FadeUp delay={0.14}>
              <p
                className="text-lg leading-relaxed mb-10 max-w-lg"
                style={{ color: 'rgba(25,60,30,0.62)' }}
              >
                The three-sided marketplace connecting farmers, dealers, and buyers with
                escrow-backed payments, harvest pledges, BNPL credit, and real-time
                market intelligence.
              </p>
            </FadeUp>

            <FadeUp delay={0.22}>
              <div className="flex flex-wrap gap-3 mb-14">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-7 py-3.5 font-bold text-sm rounded-full
                             transition-all hover:opacity-90 active:scale-[0.97]"
                  style={{ backgroundColor: 'var(--forest)', color: 'white' }}
                >
                  Get Started Free
                  <svg viewBox="0 0 16 16" width="13" height="13" fill="none"
                       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </Link>
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2 px-7 py-3.5 font-bold text-sm rounded-full
                             transition-all hover:opacity-80"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--forest)',
                    border: '1.5px solid var(--forest)',
                  }}
                >
                  Browse Marketplace
                </Link>
              </div>
            </FadeUp>

            {/* Horizontal stat row */}
            <FadeIn delay={0.34}>
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-0 rounded-2xl overflow-hidden"
                style={{ border: '1.5px solid rgba(25,60,30,0.12)', backgroundColor: 'white' }}
              >
                {STATS.map((s, i) => (
                  <div
                    key={s.label}
                    className="px-5 py-4"
                    style={{ borderRight: i < 3 ? '1.5px solid rgba(25,60,30,0.10)' : 'none' }}
                  >
                    <p className="font-mono font-extrabold text-xl leading-none"
                       style={{ color: 'var(--forest)' }}>
                      {s.value}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-widest mt-1.5 leading-snug"
                       style={{ color: 'rgba(25,60,30,0.45)' }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Right — hero image */}
        <div className="relative hidden lg:flex items-stretch">
          <div className="relative w-full h-full">
            <Image
              src="https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=1000&q=90&fit=crop"
              alt="Premium West African agricultural produce"
              fill priority sizes="46vw"
              className="object-cover object-center"
              draggable={false}
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to right, var(--cream) 0%, transparent 18%)' }}
            />

            {/* Floating card — top left of image */}
            <FloatUp className="absolute top-16 left-8 z-10">
              <div
                className="rounded-2xl px-5 py-4 min-w-[180px]"
                style={{
                  backgroundColor: 'white',
                  boxShadow: '0 8px 32px rgba(10,34,16,0.18)',
                  border: '1px solid rgba(10,34,16,0.08)',
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                       style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
                    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
                         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8h10M9 4l4 4-4 4"/>
                    </svg>
                  </div>
                  <p className="text-[11px] font-bold uppercase tracking-widest"
                     style={{ color: 'rgba(10,34,16,0.45)' }}>
                    Live Listings
                  </p>
                </div>
                <p className="font-mono font-extrabold text-2xl leading-none"
                   style={{ color: 'var(--forest)' }}>
                  18,500+
                </p>
                <p className="text-[11px] mt-1" style={{ color: 'rgba(10,34,16,0.50)' }}>
                  verified produce today
                </p>
              </div>
            </FloatUp>

            {/* Floating card — bottom right of image */}
            <div className="absolute bottom-16 right-8 z-10">
              <div
                className="rounded-2xl px-5 py-4 min-w-[200px]"
                style={{
                  backgroundColor: 'var(--forest)',
                  boxShadow: '0 8px 32px rgba(10,34,16,0.35)',
                }}
              >
                <p className="text-[11px] font-bold uppercase tracking-widest mb-2"
                   style={{ color: 'rgba(255,255,255,0.45)' }}>
                  In Escrow
                </p>
                <p className="font-mono font-extrabold text-2xl leading-none"
                   style={{ color: 'var(--lime)' }}>
                  GHS 4.2M
                </p>
                <p className="text-[11px] mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  secured this season
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile hero image */}
        <div className="lg:hidden relative h-72 w-full">
          <Image
            src="https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=900&q=85&fit=crop"
            alt="West African agricultural production"
            fill priority sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0"
               style={{ background: 'linear-gradient(to top, var(--cream) 0%, transparent 50%)' }} />
        </div>
      </section>

      {/* ── PLATFORM FEATURES ─────────────────────────────────────── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: 'white' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <FadeUp className="max-w-xl mb-16">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4"
               style={{ color: 'var(--lime-dark, hsl(86,55%,40%))' }}>
              The Platform
            </p>
            <h2
              className="font-bold leading-[1.08]"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                letterSpacing: '-0.04em',
                color: 'var(--forest)',
              }}
            >
              Four systems.<br />One platform.
            </h2>
          </FadeUp>

          <StaggerGrid className="grid md:grid-cols-2 gap-4" stagger={0.08}>
            {FEATURES.map((f, i) => (
              <StaggerItem key={f.href}>
                <Card3D className="h-full">
                  <Link
                    href={f.href}
                    className="group flex items-start gap-5 p-7 rounded-2xl h-full transition-shadow"
                    style={{
                      backgroundColor: i % 2 === 0 ? 'var(--cream)' : 'white',
                      border: '1.5px solid rgba(25,60,30,0.10)',
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                                 mt-0.5 transition-transform duration-200 group-hover:scale-110"
                      style={{ backgroundColor: 'var(--forest)', color: 'var(--lime)' }}
                    >
                      {f.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                         style={{ color: 'rgba(25,60,30,0.40)' }}>
                        {f.label}
                      </p>
                      <h3
                        className="font-bold text-base leading-snug mb-2"
                        style={{ color: 'var(--forest)', letterSpacing: '-0.02em' }}
                      >
                        {f.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(25,60,30,0.60)' }}>
                        {f.body}
                      </p>
                      <div className="flex items-center gap-1 mt-4 text-xs font-bold"
                           style={{ color: 'var(--forest)' }}>
                        Explore
                        <svg viewBox="0 0 16 16" width="11" height="11" fill="none"
                             stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 8h10M9 4l4 4-4 4"/>
                        </svg>
                      </div>
                    </div>
                  </Link>
                </Card3D>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── LIVE LISTINGS ─────────────────────────────────────────── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: 'var(--forest)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[380px_1fr] gap-14 items-start">

            <SlideLeft>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-4"
                   style={{ color: 'var(--lime)' }}>
                  Live on the platform
                </p>
                <h2
                  className="font-bold text-white leading-[1.08] mb-5"
                  style={{
                    fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                    letterSpacing: '-0.04em',
                  }}
                >
                  Verified produce, priced at the farm gate.
                </h2>
                <p className="text-sm leading-relaxed mb-8"
                   style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Every listing is field-verified. Prices set by farmers —
                  no middlemen, no markups. Escrow holds payment until you confirm delivery.
                </p>
                <Link
                  href="/marketplace"
                  className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-full
                             transition-all hover:opacity-90"
                  style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}
                >
                  Browse All Listings
                  <svg viewBox="0 0 16 16" width="13" height="13" fill="none"
                       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </Link>
              </div>
            </SlideLeft>

            <SlideRight>
              {liveListings.length > 0 ? (
                <StaggerGrid className="grid sm:grid-cols-3 gap-4" stagger={0.1}>
                  {liveListings.map(listing => {
                    const photo = listing.photos[0] ?? SECTOR_FALLBACK[listing.category.sector] ?? DEFAULT_FALLBACK
                    return (
                      <StaggerItem key={listing.id}>
                        <Card3D>
                          <Link href={`/produce/${listing.slug}`}
                            className="group block rounded-2xl overflow-hidden"
                            style={{ backgroundColor: 'white' }}>
                            <div className="relative h-40 overflow-hidden">
                              <Image src={photo} alt={listing.title} fill
                                sizes="200px"
                                className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                              />
                              <div className="absolute top-2 left-2">
                                <span
                                  className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: 'var(--forest)',
                                    color: 'var(--lime)',
                                  }}
                                >
                                  {listing.category.name}
                                </span>
                              </div>
                            </div>
                            <div className="p-4">
                              <p className="font-bold text-sm leading-snug line-clamp-2 mb-1"
                                 style={{ color: 'var(--forest)' }}>
                                {listing.title}
                              </p>
                              <p className="text-[11px] mb-2.5" style={{ color: 'rgba(25,60,30,0.50)' }}>
                                {listing.region?.name ?? 'Ghana'}
                              </p>
                              <p className="font-mono font-extrabold text-base" style={{ color: 'var(--forest)' }}>
                                GHS {listing.pricePerUnit.toFixed(2)}
                                <span className="text-xs font-normal ml-1" style={{ color: 'rgba(25,60,30,0.45)' }}>
                                  / {listing.unit.symbol}
                                </span>
                              </p>
                            </div>
                          </Link>
                        </Card3D>
                      </StaggerItem>
                    )
                  })}
                </StaggerGrid>
              ) : (
                <FadeUp>
                  <div className="rounded-3xl p-10 text-center"
                       style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                    <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                         style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
                           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </div>
                    <h3 className="font-bold text-xl text-white mb-2"
                        style={{ letterSpacing: '-0.03em' }}>
                      Be the first to list.
                    </h3>
                    <p className="text-sm leading-relaxed mb-6"
                       style={{ color: 'rgba(255,255,255,0.55)' }}>
                      The marketplace is open. List your produce, inputs, or harvest pledge today.
                    </p>
                    <Link href="/login"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold"
                      style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
                      Create a Listing
                    </Link>
                  </div>
                </FadeUp>
              )}
            </SlideRight>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <FadeUp className="text-center mb-16 max-w-xl mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4"
               style={{ color: 'rgba(25,60,30,0.40)' }}>
              How it works
            </p>
            <h2
              className="font-bold leading-[1.08]"
              style={{
                fontSize: 'clamp(1.9rem, 3.5vw, 2.8rem)',
                letterSpacing: '-0.04em',
                color: 'var(--forest)',
              }}
            >
              Three steps from sign-up to trade.
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-5">
            {HOW.map((h, i) => (
              <FadeUp key={h.step} delay={i * 0.10}>
                <div
                  className="relative rounded-2xl p-7 h-full"
                  style={{ backgroundColor: 'white', border: '1.5px solid rgba(25,60,30,0.10)' }}
                >
                  <div className="flex items-start gap-4 mb-5">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--forest)', color: 'var(--lime)' }}
                    >
                      {h.icon}
                    </div>
                    <p
                      className="font-mono font-extrabold text-4xl leading-none"
                      style={{ color: 'rgba(25,60,30,0.08)' }}
                    >
                      {h.step}
                    </p>
                  </div>
                  <h3
                    className="font-bold text-base mb-2"
                    style={{ color: 'var(--forest)', letterSpacing: '-0.02em' }}
                  >
                    {h.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(25,60,30,0.60)' }}>
                    {h.body}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────── */}
      <section className="relative py-32 overflow-hidden" style={{ backgroundColor: 'var(--forest)' }}>
        <Image
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80&fit=crop"
          alt="" fill aria-hidden="true"
          className="object-cover opacity-20"
          sizes="100vw"
        />

        <FadeUp className="relative z-10 max-w-2xl mx-auto text-center px-4">
          <h2
            className="font-bold text-white leading-[1.06] mb-5"
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              letterSpacing: '-0.05em',
            }}
          >
            Ready to trade with{' '}
            <em className="not-italic" style={{ color: 'var(--lime)' }}>
              confidence?
            </em>
          </h2>
          <p className="text-lg mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>
            Join 24,000+ farmers, dealers, and buyers across Ghana.
            Escrow-protected. Field-verified. BNPL credit every season.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login"
              className="px-8 py-4 font-bold text-sm rounded-full transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
              Create Your Account
            </Link>
            <Link href="/about"
              className="px-8 py-4 font-bold text-sm rounded-full transition-all hover:opacity-80"
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '1.5px solid rgba(255,255,255,0.30)',
              }}>
              Learn More
            </Link>
          </div>
        </FadeUp>
      </section>

    </main>
  )
}
