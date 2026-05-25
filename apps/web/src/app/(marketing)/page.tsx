import type { Metadata } from 'next'
import Image             from 'next/image'
import Link              from 'next/link'
import { prisma }        from '@/lib/prisma'
import { PortalTabs }    from './_components/portal-tabs'
import {
  FadeUp, FadeIn, SlideLeft, SlideRight,
  StaggerGrid, StaggerItem,
  Card3D, FloatUp,
}                        from './_components/animate-in'

export const metadata: Metadata = {
  title:       'AgroConnect — Ghana Agricultural Trading Platform',
  description: 'Escrow-backed produce trading, harvest pledge contracts, and certified field verification across all 16 regions of Ghana.',
}

// ─── Static marketing stats ───────────────────────────────────────────────────

const STATS = [
  { value: '24,000+',  label: 'Registered Farmers' },
  { value: '16 / 16',  label: 'Regions Covered'    },
  { value: 'GHS 4.2M', label: 'BNPL Disbursed'     },
  { value: '18,500+',  label: 'Live Listings'       },
]

// ─── Pledge framework cards ───────────────────────────────────────────────────

const PLEDGE_CARDS = [
  {
    step:  '01',
    title: 'Contract Execution',
    body:  'Buyer deposits 5–50% at signing, held in escrow. Farmer plants with confirmed payment. Field agents in Sunyani and Tamale log GPS-verified progress milestones.',
    img:   'https://images.unsplash.com/photo-1568219557405-376e23e4f7cf?w=600&q=80&fit=crop',
    alt:   'Lush maize rows — crop pledge foundation',
  },
  {
    step:  '02',
    title: 'Delivery & Settlement',
    body:  'Buyer confirms receipt. Escrow unlocks automatically — deposit released net of 2.5% commission and the remaining balance is charged simultaneously. Every ledger entry is timestamped in real time.',
    img:   'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
    alt:   'Fresh market produce — delivery and settlement',
  },
]

// ─── Trust / business logic pillars ──────────────────────────────────────────

const TRUST_PILLARS = [
  {
    num:   '01',
    title: 'Escrow Protection',
    body:  'Every crop pledge deposit is held securely inside our isolated transaction engine, releasing funds to producers only upon explicit delivery verification — never before.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
  {
    num:   '02',
    title: 'Field Verification',
    body:  'On-demand agents dynamically verify bulk quantities, moisture levels, and regional origin attributes right from the farm gate before any trading line opens on the platform.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    num:   '03',
    title: 'Forward Settlement',
    body:  'Secure harvest milestones at predictable pricing thresholds, protecting buyers from seasonal inflation and guaranteeing farmers guaranteed off-take contracts before a single seed is planted.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
]

// ─── Sector fallback images ───────────────────────────────────────────────────

const SECTOR_FALLBACK: Record<string, string> = {
  crops:     'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&q=80&fit=crop',
  livestock: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&q=80&fit=crop',
  poultry:   'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&q=80&fit=crop',
  fisheries: 'https://images.unsplash.com/photo-1570367823578-74b3ef1eba96?w=400&q=80&fit=crop',
  inputs:    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80&fit=crop',
}
const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80&fit=crop'

export default async function LandingPage() {

  type LiveListing = {
    id:           string
    title:        string
    slug:         string
    pricePerUnit: number
    photos:       string[]
    category:     { name: string; sector: string }
    unit:         { symbol: string }
    region:       { name: string } | null
  }

  let liveListings: LiveListing[] = []
  try {
    const rows = await prisma.listing.findMany({
      where:   { status: 'active' },
      take:    3,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true, sector: true } },
        unit:     { select: { abbreviation: true } },
        region:   { select: { name: true } },
      },
    })
    liveListings = rows.map(r => ({
      id:           r.id,
      title:        r.title,
      slug:         r.slug,
      pricePerUnit: Number(r.pricePerUnit),
      photos:       r.photos,
      category:     { name: r.category.name, sector: String(r.category.sector) },
      unit:         { symbol: r.unit.abbreviation },
      region:       r.region ? { name: r.region.name } : null,
    }))
  } catch {
    // DB unavailable at build-time / cold start — fall through to empty state
  }

  return (
    <main className="overflow-x-hidden">

      {/* ── 1. HERO ───────────────────────────────────────────────────────── */}
      <section className="grid lg:grid-cols-[55%_45%] min-h-[88vh]">

        <div className="bg-forest flex items-center px-8 sm:px-12 lg:px-16 py-20 lg:py-0">
          <div className="max-w-lg">
            <FadeIn>
              <span className="inline-block text-lime text-xs font-bold uppercase tracking-widest
                               bg-white/10 px-3 py-1.5 rounded-full mb-8">
                All 16 Regions of Ghana
              </span>
            </FadeIn>

            <FadeUp delay={0.08}>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold
                             text-white leading-[1.08] tracking-tight mb-6">
                Ghanaian Agriculture.
                <br />
                <span className="text-lime">Secure Markets.</span>
                <br />
                Real Prosperity.
              </h1>
            </FadeUp>

            <FadeUp delay={0.18}>
              <p className="text-white/65 text-base sm:text-lg leading-relaxed mb-10">
                Escrow-backed input distribution, crop pledge milestone tracking, seasonal
                forward contracts, and certified regional field mapping — Bono East,
                Techiman, Sunyani, Tamale, Makola.
              </p>
            </FadeUp>

            <FadeUp delay={0.26}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/login"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-lime
                             text-forest font-bold text-sm rounded-xl hover:bg-lime-dark
                             transition-colors">
                  Get Started Free
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none"
                       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </Link>
                <Link href="/produce"
                  className="inline-flex items-center justify-center px-7 py-4 bg-white/10
                             text-white font-bold text-sm rounded-xl hover:bg-white/20 transition-colors">
                  Browse Marketplace
                </Link>
              </div>
            </FadeUp>

            <FadeIn delay={0.38}>
              <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/10">
                {STATS.map(s => (
                  <div key={s.label}>
                    <p className="font-mono font-extrabold text-xl text-white">{s.value}</p>
                    <p className="text-white/45 text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>

        <div className="relative hidden lg:flex items-center justify-center bg-cream-dark px-8 py-12">
          <FloatUp className="relative w-full h-full max-h-[72vh]">
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=85&fit=crop"
                alt="Communal farm landscape — West African agricultural production"
                fill
                priority
                sizes="45vw"
                className="object-cover object-center"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/30 to-transparent" />
            </div>
          </FloatUp>
        </div>
      </section>

      <div className="lg:hidden relative h-64 sm:h-80 w-full">
        <Image
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=85&fit=crop"
          alt="West African agricultural production"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* ── 2. LIVE MARKETPLACE PREVIEW ──────────────────────────────────── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <FadeUp className="text-center mb-14">
            <p className="text-xs font-bold text-forest uppercase tracking-widest mb-3">
              Live on the platform
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-forest">
              Produce, inputs, and pledges — all in one place.
            </h2>
          </FadeUp>

          <div className="grid lg:grid-cols-[420px_1fr] gap-10 items-start">

            <SlideLeft>
              <Card3D className="relative rounded-3xl overflow-hidden h-80 lg:h-[480px]">
                <Image
                  src="https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=80&fit=crop"
                  alt="Farmers tending crops in West African field"
                  fill
                  sizes="(max-width: 1024px) 100vw, 420px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-forest/60 to-transparent" />
                <div className="absolute bottom-5 left-6 right-6">
                  <p className="text-white font-bold text-lg leading-snug">
                    Verified produce from certified farms across all regions.
                  </p>
                </div>
              </Card3D>
            </SlideLeft>

            <SlideRight>
              {liveListings.length > 0 ? (
                <>
                  <div className="mb-6">
                    <h3 className="font-bold text-forest text-xl mb-2">Today&apos;s Listings</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                      Field-verified produce updated daily. Prices confirmed at listing —
                      no hidden markups at checkout.
                    </p>
                  </div>

                  <StaggerGrid className="grid sm:grid-cols-3 gap-4" stagger={0.1} style={{ perspective: '1000px' }}>
                    {liveListings.map(listing => {
                      const photo = listing.photos[0]
                        ?? SECTOR_FALLBACK[listing.category.sector]
                        ?? DEFAULT_FALLBACK
                      return (
                        <StaggerItem key={listing.id}>
                          <Card3D>
                            <Link href={`/produce/${listing.slug}`}
                              className="group rounded-2xl border border-border overflow-hidden
                                         hover:shadow-xl transition-shadow bg-white block">
                              <div className="relative h-40 overflow-hidden">
                                <Image
                                  src={photo}
                                  alt={listing.title}
                                  fill
                                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 200px"
                                  className="object-cover group-hover:scale-[1.06] transition-transform duration-500"
                                />
                              </div>
                              <div className="p-4">
                                <p className="font-display font-bold text-forest text-sm leading-snug mb-0.5 line-clamp-2">
                                  {listing.title}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {listing.region?.name ?? 'Ghana'}
                                </p>
                                {/* Clean price — no badge wrapper, plain high-contrast mono */}
                                <p className="font-mono font-bold text-base text-forest mt-2">
                                  GHS {listing.pricePerUnit.toFixed(2)}
                                  <span className="text-xs font-normal text-muted-foreground ml-1">
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

                  <FadeIn delay={0.35}>
                    <Link href="/produce"
                      className="inline-flex items-center gap-2 mt-6 text-sm font-bold text-forest
                                 hover:text-forest-dark transition-colors">
                      View all live listings
                      <svg viewBox="0 0 16 16" width="13" height="13" fill="none"
                           stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 8h10M9 4l4 4-4 4"/>
                      </svg>
                    </Link>
                  </FadeIn>
                </>
              ) : (
                /* Empty state — no active listings yet */
                <FadeUp delay={0.1}>
                  <div className="flex flex-col justify-center h-full py-8 max-w-md">
                    <div className="w-12 h-12 rounded-2xl bg-lime/20 border border-lime-dark/20
                                    flex items-center justify-center mb-6">
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
                           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
                           className="text-lime-dark">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                    </div>
                    <h3 className="font-display text-2xl font-extrabold text-forest mb-3">
                      Be the first to create a live listing.
                    </h3>
                    <p className="text-muted-foreground text-base leading-relaxed mb-8">
                      The marketplace is live and open. List your produce, inputs, or harvest pledge
                      and connect with thousands of verified buyers across all 16 regions of Ghana.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href="/login"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-forest
                                   text-white font-bold text-sm rounded-xl hover:bg-forest-dark
                                   transition-colors shadow-lg shadow-forest/15">
                        Create Your First Listing
                        <svg viewBox="0 0 16 16" width="13" height="13" fill="none"
                             stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 8h10M9 4l4 4-4 4"/>
                        </svg>
                      </Link>
                      <Link href="/produce"
                        className="inline-flex items-center justify-center px-6 py-3 bg-cream
                                   border border-border text-forest font-bold text-sm rounded-xl
                                   hover:bg-cream-dark transition-colors">
                        Browse Marketplace
                      </Link>
                    </div>
                  </div>
                </FadeUp>
              )}
            </SlideRight>
          </div>
        </div>
      </section>

      {/* ── 3. ROLE WORKSPACES — image-free, clean SaaS feature grid ────── */}
      <section className="bg-cream py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="mb-12">
            <p className="text-xs font-bold text-forest uppercase tracking-widest mb-3">
              Purpose-built portals
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-forest max-w-xl">
              Every role has its own dedicated workspace.
            </h2>
          </FadeUp>
          <FadeIn delay={0.15}>
            <PortalTabs />
          </FadeIn>
        </div>
      </section>

      {/* ── 4. BUSINESS LOGIC — 3-column trust foundation ────────────────── */}
      <section className="bg-forest py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <FadeUp className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-xs font-bold text-lime uppercase tracking-widest mb-3">
              How it works
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-snug">
              Every transaction is protected from seed to settlement.
            </h2>
          </FadeUp>

          <StaggerGrid className="grid md:grid-cols-3 gap-6" stagger={0.12} style={{ perspective: '1000px' }}>
            {TRUST_PILLARS.map(pillar => (
              <StaggerItem key={pillar.num}>
                <Card3D className="h-full">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 h-full
                                  hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 rounded-2xl bg-lime/20 border border-lime/20
                                    flex items-center justify-center mb-6 text-lime">
                      {pillar.icon}
                    </div>
                    <p className="font-mono text-lime/60 text-xs font-bold mb-2">
                      {pillar.num}
                    </p>
                    <h3 className="font-bold text-white text-lg mb-3">
                      {pillar.title}
                    </h3>
                    <p className="text-white/55 text-sm leading-relaxed">
                      {pillar.body}
                    </p>
                  </div>
                </Card3D>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── 5. HARVEST PLEDGE FRAMEWORK ──────────────────────────────────── */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <FadeUp className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-xs font-bold text-forest uppercase tracking-widest mb-3">
              Harvest Pledge System
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-forest leading-snug">
              A dual-stage financial escrow framework for seasonal forward contracts.
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-8" style={{ perspective: '1200px' }}>
            {PLEDGE_CARDS.map((card, i) => (
              <FadeUp key={card.step} delay={i * 0.15}>
                <Card3D className="h-full">
                  <div className="rounded-3xl overflow-hidden border border-border
                                  hover:shadow-2xl transition-shadow h-full flex flex-col">
                    <div className="relative h-64 overflow-hidden shrink-0">
                      <Image
                        src={card.img}
                        alt={card.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-forest/65 via-forest/10 to-transparent" />
                      <div className="absolute bottom-5 left-6">
                        <span className="font-mono text-lime/80 text-xs font-bold block mb-1">
                          Step {card.step}
                        </span>
                        <span className="font-bold text-white text-xl">{card.title}</span>
                      </div>
                    </div>
                    {/* White body — no cream capsule */}
                    <div className="p-7 bg-white flex-1">
                      <p className="text-muted-foreground text-sm leading-relaxed">{card.body}</p>
                    </div>
                  </div>
                </Card3D>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. BOTTOM CTA ─────────────────────────────────────────────────── */}
      <section className="relative bg-forest py-24 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80&fit=crop"
          alt=""
          fill
          aria-hidden="true"
          className="object-cover opacity-[0.12]"
          sizes="100vw"
        />
        <FadeUp className="relative z-10 max-w-2xl mx-auto text-center px-4">
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-white
                         leading-tight mb-5">
            Ready to trade with confidence?
          </h2>
          <p className="text-white/60 text-lg mb-10 leading-relaxed">
            Join 24,000+ farmers, dealers, and buyers across Ghana.
            Escrow-protected payments. Field-verified listings. BNPL credit every season.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login"
              className="px-8 py-4 bg-lime text-forest font-bold text-sm rounded-2xl
                         hover:bg-lime-dark transition-colors">
              Create Your Account
            </Link>
            <Link href="/about"
              className="px-8 py-4 bg-white/10 text-white font-bold text-sm rounded-2xl
                         hover:bg-white/20 transition-colors">
              Learn More About Us
            </Link>
          </div>
        </FadeUp>
      </section>

    </main>
  )
}
