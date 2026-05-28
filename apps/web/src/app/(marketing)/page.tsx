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

const METRICS = [
  { value: '24,000+',  label: 'Registered Farmers'  },
  { value: '16 / 16',  label: 'Regions Covered'     },
  { value: 'GHS 4.2M', label: 'BNPL Disbursed'      },
  { value: '18,500+',  label: 'Live Listings'        },
]

const PILLARS = [
  {
    href:   '/marketplace',
    tag:    'Marketplace',
    title:  'Buy & sell verified produce',
    body:   'Field-verified listings across crops, livestock, poultry, fisheries, and inputs. Escrow-backed payments. No hidden markups.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
    accent: 'var(--sector-crops)',
    bg:     'var(--sector-crops-bg)',
  },
  {
    href:   '/harvest-pledges',
    tag:    'Harvest Pledges',
    title:  'Forward contracts with escrow',
    body:   'Lock in off-take agreements before planting. Buyers deposit 5–50% in escrow. Farmers plant with payment certainty.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    accent: 'var(--harvest-gold)',
    bg:     'var(--harvest-gold-bg)',
  },
  {
    href:   '/market-intelligence',
    tag:    'Intelligence',
    title:  'Prices, weather & pest alerts',
    body:   'Daily market prices from all 16 regions. 7-day weather forecasts. Critical alerts via SMS and USSD for offline farmers.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    accent: 'var(--sector-fisheries)',
    bg:     'var(--sector-fisheries-bg)',
  },
  {
    href:   '/agro-inputs',
    tag:    'Agro Inputs',
    title:  'Seeds & fertilizers on credit',
    body:   'Buy quality inputs now, pay after harvest. BNPL credit tiers up to GHS 50,000 anchored to your AgroScore.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a9 9 0 0 1 9 9c0 4-2.5 7-5 9l-4 2-4-2c-2.5-2-5-5-5-9a9 9 0 0 1 9-9z"/>
        <path d="M12 7v5l3 3"/>
      </svg>
    ),
    accent: 'var(--sector-inputs)',
    bg:     'var(--sector-inputs-bg)',
  },
]

const HOW = [
  {
    step: '01',
    title: 'Register & Verify',
    body:  'Sign up in minutes. A certified field agent verifies your farm via GPS — boosting your AgroScore and unlocking escrow trading.',
  },
  {
    step: '02',
    title: 'List or Browse',
    body:  'Farmers list produce and pledge contracts. Buyers browse verified listings filtered by region, sector, and price. Dealers manage inventory.',
  },
  {
    step: '03',
    title: 'Trade with Confidence',
    body:  'Every payment is held in escrow and released only on delivery confirmation. BNPL credit lets farmers access inputs before the harvest.',
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

      {/* ═══════════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-[92vh] grid lg:grid-cols-[58%_42%]"
        style={{ backgroundColor: 'var(--forest)' }}
      >
        {/* Left — copy */}
        <div className="flex items-center px-8 sm:px-12 lg:px-16 py-24 lg:py-0">
          <div className="w-full max-w-xl">

            <FadeIn>
              <span
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest
                           mb-10 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.10)', color: 'var(--lime)' }}
              >
                <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor">
                  <circle cx="8" cy="8" r="4"/>
                </svg>
                From Seed to Sale · All 16 Regions
              </span>
            </FadeIn>

            <FadeUp delay={0.08}>
              <h1
                className="font-display font-extrabold text-white leading-[1.05] tracking-tight mb-6"
                style={{ fontSize: 'clamp(2.4rem, 5vw, 3.4rem)' }}
              >
                Ghana&apos;s{' '}
                <em className="not-italic" style={{ color: 'var(--lime)' }}>
                  Agricultural<br />
                  Operating System.
                </em>
              </h1>
            </FadeUp>

            <FadeUp delay={0.18}>
              <p className="text-lg leading-relaxed mb-10 max-w-lg" style={{ color: 'rgba(255,255,255,0.65)' }}>
                The three-sided marketplace connecting farmers, dealers, and buyers with
                escrow-backed payments, harvest pledges, BNPL credit, and real-time
                market intelligence.
              </p>
            </FadeUp>

            <FadeUp delay={0.26}>
              <div className="flex flex-col sm:flex-row gap-3 mb-14">
                <Link href="/login"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 font-bold text-sm
                             rounded-xl transition-all duration-150 active:scale-[0.98]"
                  style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
                  Get Started Free
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none"
                       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </Link>
                <Link href="/marketplace"
                  className="inline-flex items-center justify-center px-7 py-4 font-bold text-sm
                             rounded-xl transition-all duration-150"
                  style={{ backgroundColor: 'rgba(255,255,255,0.10)', color: 'white' }}>
                  Browse Marketplace
                </Link>
              </div>
            </FadeUp>

            {/* Metrics */}
            <FadeIn delay={0.38}>
              <div className="border-t pt-8" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-0 gap-y-0">
                  {METRICS.map((m, i) => (
                    <div
                      key={m.label}
                      className={[
                        'pr-4 pb-6 lg:pb-0',
                        i % 2 === 1 ? 'pl-4 border-l' : '',
                        i >= 2 ? 'pt-6 border-t lg:border-t-0 lg:pt-0' : '',
                        i > 0 ? 'lg:pl-4 lg:border-l' : '',
                      ].filter(Boolean).join(' ')}
                      style={{ borderColor: 'rgba(255,255,255,0.10)' }}
                    >
                      <p className="font-mono font-extrabold text-2xl leading-none"
                         style={{ color: 'var(--lime)' }}>
                        {m.value}
                      </p>
                      <p className="text-[11px] font-semibold uppercase tracking-widest mt-2 leading-snug"
                         style={{ color: 'rgba(255,255,255,0.55)' }}>
                        {m.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Right — hero image */}
        <div className="relative hidden lg:flex items-center justify-center px-8 py-16">
          <FloatUp className="relative w-full h-full max-h-[76vh]">
            <div className="relative w-full h-full rounded-3xl overflow-hidden"
                 style={{ boxShadow: '0 40px 80px rgba(0,0,0,0.45)' }}>
              <Image
                src="https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=900&q=85&fit=crop"
                alt="Premium West African agricultural produce"
                fill priority sizes="42vw"
                className="object-cover object-center"
                draggable={false}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,34,16,0.4) 0%, transparent 60%)' }} />
              {/* Floating stat card */}
              <div
                className="absolute bottom-6 left-6 right-6 rounded-2xl p-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.18)' }}
              >
                <p className="text-white font-bold text-sm">Today&apos;s Listings</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  18,500+ verified produce listings updated daily
                </p>
              </div>
            </div>
          </FloatUp>
        </div>

        {/* Mobile hero image */}
        <div className="lg:hidden relative h-64 sm:h-80 w-full">
          <Image
            src="https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=900&q=85&fit=crop"
            alt="West African agricultural production"
            fill priority sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,34,16,0.45) 0%, transparent 60%)' }} />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4 PLATFORM PILLARS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--forest)' }}>
              The Platform
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold max-w-xl leading-snug"
                style={{ color: 'var(--forest)' }}>
              Four systems, one platform.
            </h2>
          </FadeUp>

          <StaggerGrid className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" stagger={0.09}>
            {PILLARS.map(p => (
              <StaggerItem key={p.href}>
                <Card3D className="h-full">
                  <Link href={p.href}
                    className="group flex flex-col h-full rounded-2xl p-6 card-lift"
                    style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 flex-shrink-0
                                    transition-transform duration-200 group-hover:scale-110"
                         style={{ backgroundColor: p.bg, color: p.accent }}>
                      {p.icon}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5"
                       style={{ color: p.accent }}>
                      {p.tag}
                    </p>
                    <h3 className="font-bold text-base mb-2 leading-snug"
                        style={{ color: 'var(--forest)' }}>
                      {p.title}
                    </h3>
                    <p className="text-sm leading-relaxed flex-1" style={{ color: 'var(--muted-foreground)' }}>
                      {p.body}
                    </p>
                    <div className="flex items-center gap-1 mt-4 text-xs font-bold"
                         style={{ color: 'var(--forest)' }}>
                      Learn more
                      <svg viewBox="0 0 16 16" width="12" height="12" fill="none"
                           stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 8h10M9 4l4 4-4 4"/>
                      </svg>
                    </div>
                  </Link>
                </Card3D>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          LIVE LISTINGS PREVIEW
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'white' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[400px_1fr] gap-12 items-center">
            <SlideLeft>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-4"
                   style={{ color: 'var(--forest)' }}>
                  Live on the platform
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-snug mb-5"
                    style={{ color: 'var(--forest)' }}>
                  Verified produce, priced at the farm gate.
                </h2>
                <p className="text-base leading-relaxed mb-8" style={{ color: 'var(--muted-foreground)' }}>
                  Every listing is field-verified. Prices are set by farmers — no middlemen,
                  no hidden markups. Escrow holds payment until you confirm delivery.
                </p>
                <Link href="/marketplace"
                  className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm rounded-xl transition-colors"
                  style={{ backgroundColor: 'var(--forest)', color: 'white' }}>
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
                            className="group block rounded-2xl overflow-hidden card-lift"
                            style={{ border: '1px solid var(--border)', backgroundColor: 'white' }}>
                            <div className="relative h-36 overflow-hidden">
                              <Image src={photo} alt={listing.title} fill
                                sizes="200px"
                                className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                              />
                              <div className="absolute top-2 left-2">
                                <span
                                  className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                                  style={{
                                    backgroundColor: 'rgba(255,255,255,0.90)',
                                    backdropFilter: 'blur(4px)',
                                    color: 'var(--forest)',
                                  }}
                                >
                                  {listing.category.name}
                                </span>
                              </div>
                            </div>
                            <div className="p-3.5">
                              <p className="font-bold text-sm leading-snug line-clamp-2 mb-1"
                                 style={{ color: 'var(--forest)' }}>
                                {listing.title}
                              </p>
                              <p className="text-[11px] mb-2" style={{ color: 'var(--muted-foreground)' }}>
                                {listing.region?.name ?? 'Ghana'}
                              </p>
                              <p className="font-mono font-extrabold text-base" style={{ color: 'var(--forest)' }}>
                                GHS {listing.pricePerUnit.toFixed(2)}
                                <span className="text-xs font-normal ml-1" style={{ color: 'var(--muted-foreground)' }}>
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
                  <div
                    className="rounded-3xl p-10 text-center"
                    style={{ backgroundColor: 'var(--cream)', border: '1px solid var(--border)' }}
                  >
                    <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center"
                         style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
                           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </div>
                    <h3 className="font-display text-xl font-extrabold mb-2" style={{ color: 'var(--forest)' }}>
                      Be the first to list.
                    </h3>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--muted-foreground)' }}>
                      The marketplace is open. List your produce, inputs, or harvest pledge today.
                    </p>
                    <Link href="/login"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors"
                      style={{ backgroundColor: 'var(--forest)', color: 'white' }}>
                      Create a Listing
                    </Link>
                  </div>
                </FadeUp>
              )}
            </SlideRight>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          HOW IT WORKS (dark)
      ═══════════════════════════════════════════════════════════════ */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'var(--forest)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--lime)' }}>
              How it works
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-snug">
              Three steps from sign-up to trade.
            </h2>
          </FadeUp>

          <StaggerGrid className="grid md:grid-cols-3 gap-6" stagger={0.12}>
            {HOW.map((h, i) => (
              <StaggerItem key={h.step}>
                <Card3D className="h-full">
                  <div
                    className="rounded-3xl p-8 h-full flex flex-col transition-colors duration-200"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}
                  >
                    <p className="font-mono text-xs font-bold mb-5" style={{ color: 'rgba(136,200,50,0.55)' }}>
                      {h.step}
                    </p>
                    {/* Step connector line */}
                    {i < HOW.length - 1 && (
                      <div className="hidden md:block absolute right-0 top-1/2 w-6 h-px"
                           style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
                    )}
                    <h3 className="text-white font-bold text-lg mb-3">{h.title}</h3>
                    <p className="text-sm leading-relaxed flex-1"
                       style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {h.body}
                    </p>
                  </div>
                </Card3D>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          BOTTOM CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden" style={{ backgroundColor: 'var(--forest)' }}>
        <Image
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80&fit=crop"
          alt="" fill aria-hidden="true"
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(10,34,16,0.82)' }} />

        <FadeUp className="relative z-10 max-w-2xl mx-auto text-center px-4">
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
            Ready to trade with confidence?
          </h2>
          <p className="text-lg mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Join 24,000+ farmers, dealers, and buyers across Ghana.
            Escrow-protected payments. Field-verified listings. BNPL credit every season.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login"
              className="px-8 py-4 font-bold text-sm rounded-2xl transition-colors"
              style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
              Create Your Account
            </Link>
            <Link href="/about"
              className="px-8 py-4 font-bold text-sm rounded-2xl transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.18)' }}>
              Learn More About Us
            </Link>
          </div>
        </FadeUp>
      </section>

    </main>
  )
}
