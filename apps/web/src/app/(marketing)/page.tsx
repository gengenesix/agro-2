import type { Metadata } from 'next'
import Image             from 'next/image'
import Link              from 'next/link'

export const metadata: Metadata = {
  title: 'AgroConnect — Ghana Agricultural Trading Platform',
  description:
    "Escrow-backed produce trading, harvest pledge contracts, and certified field verification across all 16 regions of Ghana.",
}

// ─── Role cards ───────────────────────────────────────────────────────────────

const ROLES = [
  {
    title:  'Input Dealers',
    body:   'Distribute seeds, fertilisers, and agro-chemicals through escrow-secured purchase orders. Real-time inventory tracking across Tamale, Kumasi, and Techiman distribution corridors.',
    img:    'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=600',
    alt:    'Agro-input distribution warehouse',
    href:   '/login',
    cta:    'Open Dealer Account',
  },
  {
    title:  'Wholesale Buyers',
    body:   'Source certified regional produce at scale. Lock in seasonal forward contracts through our Harvest Pledge system — backed by deposit escrow and milestone tracking from Bono East to Makola.',
    img:    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
    alt:    'Wholesale produce buyer inspecting stock',
    href:   '/produce',
    cta:    'Browse Produce',
  },
  {
    title:  'Retail Consumers',
    body:   'Order direct from field-verified farms in your region. Farm-to-door delivery or pickup, with every listing price-confirmed and produce quality graded at dispatch.',
    img:    'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=600',
    alt:    'Consumer purchasing fresh produce',
    href:   '/produce',
    cta:    'Shop Now',
  },
]

// ─── Pledge legs ──────────────────────────────────────────────────────────────

const PLEDGE_LEGS = [
  {
    step:   '01',
    label:  'Contract Execution',
    body:   'Buyer deposits a pre-agreed percentage (5–50%) directly into escrow at contract signing. The farmer receives confirmation and begins production with guaranteed payment visibility. Regional field agents in Sunyani and Tamale log GPS-verified progress milestones.',
    img:    'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&q=80&w=600',
    alt:    'Signing agricultural forward contract',
  },
  {
    step:   '02',
    label:  'Delivery & Settlement',
    body:   "On buyer confirmation of receipt, the escrow unlocks automatically. The platform releases the deposit net of our 2.5% commission and simultaneously charges the remaining contract balance. Every transaction is ledger-stamped in the farmer's and buyer's wallets in real time.",
    img:    'https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&q=80&w=600',
    alt:    'Digital payment settlement screen',
  },
]

// ─── Stats ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '24,000+', label: 'Registered Farmers' },
  { value: '16 / 16', label: 'Regions Covered'    },
  { value: 'GHS 4.2M', label: 'BNPL Disbursed'   },
  { value: '18,500+', label: 'Live Listings'       },
]

// ─── Impact profiles ──────────────────────────────────────────────────────────

const PROFILES = [
  {
    name:   'Abena Owusu',
    role:   'Maize Farmer · Eastern Region',
    quote:  '"Before AgroConnect I had no way to guarantee my buyer would pay after harvest. Now the deposit is locked at signing and I plant with full confidence."',
    img:    'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=500',
  },
  {
    name:   'Kwame Asante',
    role:   'Agro-Input Dealer · Ashanti Region',
    quote:  '"The escrow system means my NPK stock moves faster. Farmers in Kumasi book directly on the platform — no more chasing payments at the end of the season."',
    img:    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=500',
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-forest">
        <Image
          src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1200"
          alt="Active Ghanaian agricultural production"
          fill
          priority
          className="object-cover opacity-25"
          sizes="100vw"
          draggable={false}
        />
        {/* gradient overlay — ensures text legibility across screen widths */}
        <div className="absolute inset-0 bg-gradient-to-r from-forest/90 via-forest/60 to-transparent" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-24 lg:py-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-lime text-xs font-bold uppercase
                             tracking-widest mb-7 bg-white/10 px-3 py-1.5 rounded-full">
              <svg viewBox="0 0 16 16" width="10" height="10" fill="currentColor">
                <path d="M8 1a5 5 0 1 0 0 10A5 5 0 0 0 8 1zm0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7z"/>
              </svg>
              All 16 Regions of Ghana
            </span>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white
                           leading-[1.08] tracking-tight mb-6">
              Ghana&apos;s Agricultural{' '}
              <span className="text-lime">Trading Platform.</span>
            </h1>

            <p className="text-white/70 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl">
              Escrow-backed input distribution, crop pledge milestone tracking, seasonal
              forward contracts, and certified regional field mapping — Bono East,
              Techiman, Sunyani, Tamale, Makola.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-lime
                           text-forest font-bold text-sm rounded-xl hover:bg-lime-dark
                           transition-colors">
                Get Started Free
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none"
                     stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </Link>
              <Link href="/produce"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10
                           text-white font-bold text-sm rounded-xl hover:bg-white/20
                           transition-colors">
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            {STATS.map((s) => (
              <div key={s.label} className="px-6 py-8 text-center">
                <p className="font-mono font-extrabold text-2xl sm:text-3xl text-forest">
                  {s.value}
                </p>
                <p className="text-muted-foreground text-xs font-semibold mt-1 uppercase tracking-wider">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What AgroConnect Does ─────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-xs font-bold text-forest uppercase tracking-widest mb-3">
              Three portals. One platform.
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-forest
                           leading-snug max-w-xl">
              Built for every actor in Ghana&apos;s agricultural chain.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ROLES.map((r) => (
              <div key={r.title}
                className="bg-white rounded-2xl overflow-hidden border border-border
                           flex flex-col group hover:shadow-md transition-shadow">
                <div className="relative h-52 overflow-hidden">
                  <Image
                    src={r.img}
                    alt={r.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-forest text-lg mb-2">{r.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed flex-1">{r.body}</p>
                  <Link href={r.href}
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-forest
                               hover:text-forest-dark transition-colors group/link">
                    {r.cta}
                    <svg viewBox="0 0 16 16" width="13" height="13" fill="none"
                         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                         className="group-hover/link:translate-x-0.5 transition-transform">
                      <path d="M3 8h10M9 4l4 4-4 4"/>
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Crop Pledge Framework ─────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-bold text-harvest-gold uppercase tracking-widest mb-3">
              Harvest Pledge System
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-forest leading-snug">
              A dual-stage financial escrow framework for seasonal forward contracts.
            </h2>
            <p className="text-muted-foreground text-base mt-4 leading-relaxed">
              Buyers commit before the growing season. Farmers plant with payment certainty.
              Settlement is automatic on confirmed delivery — no manual reconciliation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {PLEDGE_LEGS.map((leg) => (
              <div key={leg.step}
                className="border-l-4 border-harvest-gold bg-cream rounded-2xl overflow-hidden">
                <div className="relative h-56">
                  <Image
                    src={leg.img}
                    alt={leg.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-5">
                    <span className="font-mono text-xs font-bold text-white/60 block mb-0.5">
                      Step {leg.step}
                    </span>
                    <span className="font-bold text-white text-base">{leg.label}</span>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-muted-foreground text-sm leading-relaxed">{leg.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link href="/features#pledges"
              className="inline-flex items-center gap-2 text-sm font-bold text-forest
                         hover:text-forest-dark transition-colors">
              Read the full pledge mechanics
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none"
                   stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4"/>
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Local Impact ──────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-12">
            <p className="text-xs font-bold text-forest uppercase tracking-widest mb-3">
              On the ground
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-forest">
              Real operators. Real transactions.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {PROFILES.map((p) => (
              <div key={p.name}
                className="bg-white rounded-2xl border border-border p-6 flex flex-col
                           sm:flex-row gap-5">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={p.img}
                    alt={p.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-sm text-muted-foreground leading-relaxed italic mb-3">
                    {p.quote}
                  </p>
                  <p className="font-bold text-forest text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section className="relative bg-forest py-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&q=80&fit=crop"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
            aria-hidden="true"
          />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto text-center px-4">
          <h2 className="font-display text-4xl sm:text-5xl font-extrabold text-white
                         leading-tight mb-5">
            Ready to trade with confidence?
          </h2>
          <p className="text-white/65 text-lg mb-10 leading-relaxed">
            Join 24,000+ farmers, dealers, and buyers across Ghana.
            Escrow-protected payments. Field-verified listings.
            BNPL credit for every season.
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
        </div>
      </section>

    </main>
  )
}
