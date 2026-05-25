import type { Metadata } from 'next'
import Image             from 'next/image'
import Link              from 'next/link'
import { PortalTabs }    from './_components/portal-tabs'
import {
  FadeUp, FadeIn, SlideLeft, SlideRight,
  StaggerGrid, StaggerItem,
}                        from './_components/animate-in'

export const metadata: Metadata = {
  title:       'AgroConnect — Ghana Agricultural Trading Platform',
  description: 'Escrow-backed produce trading, harvest pledge contracts, and certified field verification across all 16 regions of Ghana.',
}

// ─── Service cards ────────────────────────────────────────────────────────────

const SERVICES = [
  {
    label:  'Fresh Tomatoes',
    region: 'Ashanti Region',
    price:  'GHS 2.50 / kg',
    img:    'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&q=80&fit=crop',
  },
  {
    label:  'Volta Lake Tilapia',
    region: 'Volta Region',
    price:  'GHS 22.00 / kg',
    img:    'https://images.unsplash.com/photo-1570367823578-74b3ef1eba96?w=400&q=80&fit=crop',
  },
  {
    label:  'NPK 15-15-15 Fertiliser',
    region: 'Greater Accra',
    price:  'GHS 180.00 / bag',
    img:    'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80&fit=crop',
  },
]

const STATS = [
  { value: '24,000+',  label: 'Registered Farmers' },
  { value: '16 / 16',  label: 'Regions Covered'    },
  { value: 'GHS 4.2M', label: 'BNPL Disbursed'     },
  { value: '18,500+',  label: 'Live Listings'       },
]

// ─── Pledge cards — updated images per mandate ───────────────────────────────

const PLEDGE_CARDS = [
  {
    step:  '01',
    title: 'Contract Execution',
    body:  'Buyer deposits 5–50% at signing, held in escrow. Farmer plants with confirmed payment. Field agents in Sunyani and Tamale log GPS-verified progress milestones.',
    img:   'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=600',
    alt:   'Bright West African farm field — crop pledge foundation',
  },
  {
    step:  '02',
    title: 'Delivery & Settlement',
    body:  'Buyer confirms receipt. Escrow unlocks automatically — deposit released net of 2.5% commission and the remaining balance is charged simultaneously. Every ledger entry is timestamped in real time.',
    img:   'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600',
    alt:   'Secure digital transaction — delivery & settlement',
  },
]

export default function LandingPage() {
  return (
    <main className="overflow-x-hidden">

      {/* ── 1. HERO — 55/45 split ─────────────────────────────────────── */}
      <section className="grid lg:grid-cols-[55%_45%] min-h-[88vh]">

        {/* Left — forest green text panel */}
        <div className="bg-forest flex items-center px-8 sm:px-12 lg:px-16 py-20 lg:py-0">
          <div className="max-w-lg">
            <span className="inline-block text-lime text-xs font-bold uppercase tracking-widest
                             bg-white/10 px-3 py-1.5 rounded-full mb-8">
              All 16 Regions of Ghana
            </span>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold
                           text-white leading-[1.08] tracking-tight mb-6">
              Ghanaian Agriculture.
              <br />
              <span className="text-lime">Secure Markets.</span>
              <br />
              Real Prosperity.
            </h1>

            <p className="text-white/65 text-base sm:text-lg leading-relaxed mb-10">
              Escrow-backed input distribution, crop pledge milestone tracking, seasonal
              forward contracts, and certified regional field mapping — Bono East,
              Techiman, Sunyani, Tamale, Makola.
            </p>

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

            <div className="flex flex-wrap gap-8 mt-12 pt-8 border-t border-white/10">
              {STATS.map(s => (
                <div key={s.label}>
                  <p className="font-mono font-extrabold text-xl text-white">{s.value}</p>
                  <p className="text-white/45 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — panoramic crop production photo (updated per mandate) */}
        <div className="relative hidden lg:block bg-cream-dark">
          <Image
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1200"
            alt="Rich West African crop production panorama"
            fill
            priority
            sizes="45vw"
            className="object-cover object-center"
            draggable={false}
          />
          <div className="absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-forest to-transparent" />
        </div>
      </section>

      {/* Mobile hero image */}
      <div className="lg:hidden relative h-64 sm:h-80 w-full">
        <Image
          src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1200"
          alt="West African agricultural production"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      {/* ── 2. SERVICES — left big photo + right listing cards ────────── */}
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
              <div className="relative rounded-3xl overflow-hidden h-80 lg:h-[480px]">
                <Image
                  src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&fit=crop"
                  alt="Ghana produce market — verified farms"
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
              </div>
            </SlideLeft>

            <SlideRight>
              <div className="mb-6">
                <h3 className="font-bold text-forest text-xl mb-2">Today&apos;s Listings</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                  Field-verified produce updated daily. Prices are confirmed at listing —
                  no hidden markups at checkout.
                </p>
              </div>

              <StaggerGrid className="grid sm:grid-cols-3 gap-4" stagger={0.1}>
                {SERVICES.map(s => (
                  <StaggerItem key={s.label}>
                    <Link href="/produce"
                      className="group rounded-2xl border border-border overflow-hidden
                                 hover:shadow-md transition-shadow bg-white block">
                      <div className="relative h-40 overflow-hidden">
                        <Image
                          src={s.img}
                          alt={s.label}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 200px"
                          className="object-cover group-hover:scale-[1.05] transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <p className="font-bold text-forest text-sm leading-snug mb-0.5">
                          {s.label}
                        </p>
                        <p className="text-muted-foreground text-xs">{s.region}</p>
                        <p className="font-mono font-bold text-forest text-sm mt-2">
                          {s.price}
                        </p>
                      </div>
                    </Link>
                  </StaggerItem>
                ))}
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
            </SlideRight>
          </div>
        </div>
      </section>

      {/* ── 3. PORTAL TABS ────────────────────────────────────────────── */}
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

      {/* ── 4. PLEDGE FRAMEWORK ───────────────────────────────────────── */}
      {/*   • No orange/harvest-gold accents — section tag uses text-forest   */}
      {/*   • Card borders: neutral rounded frame (border-border), no accent   */}
      {/*   • Images updated to specified bright agriculture / fintech assets   */}
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

          <div className="grid md:grid-cols-2 gap-8">
            {PLEDGE_CARDS.map((card, i) => (
              <FadeUp key={card.step} delay={i * 0.15}>
                <div className="rounded-3xl overflow-hidden border border-border group
                                hover:shadow-lg transition-shadow h-full flex flex-col">
                  <div className="relative h-64 overflow-hidden shrink-0">
                    <Image
                      src={card.img}
                      alt={card.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover group-hover:scale-[1.04] transition-transform duration-700"
                    />
                    {/* Forest green overlay — on-brand, no orange */}
                    <div className="absolute inset-0 bg-gradient-to-t from-forest/65 via-forest/10 to-transparent" />
                    <div className="absolute bottom-5 left-6">
                      <span className="font-mono text-lime/80 text-xs font-bold block mb-1">
                        Step {card.step}
                      </span>
                      <span className="font-bold text-white text-xl">{card.title}</span>
                    </div>
                  </div>
                  <div className="p-7 bg-cream flex-1">
                    <p className="text-muted-foreground text-sm leading-relaxed">{card.body}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. BOTTOM CTA ─────────────────────────────────────────────── */}
      <section className="relative bg-forest py-24 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&q=80&fit=crop"
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
