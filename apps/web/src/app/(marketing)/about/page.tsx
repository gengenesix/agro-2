import type { Metadata } from 'next'
import Image             from 'next/image'
import Link              from 'next/link'

export const metadata: Metadata = {
  title: 'About AgroConnect — Our Mission',
  description:
    'AgroConnect is building trusted infrastructure for cross-border agricultural trade — escrow, payments, and farmer credit for the world. Piloting in Ghana.',
}

const PILLARS = [
  {
    title: 'Verified Transactions',
    body:  'Every listing is either field-agent GPS-stamped or escrow-backed. No listing ships without payment certainty. No payment clears without delivery confirmation.',
  },
  {
    title: 'AgroScore Credit',
    body:  'Farmers build a portable credit profile with every transaction. No bank account required. No collateral. Credit eligibility grows with every successful trade.',
  },
  {
    title: 'International Buyer Access',
    body:  'Buyers anywhere in the world can book verified supply months before harvest, pay into secure escrow, and receive a full audit trail for customs compliance.',
  },
  {
    title: 'Multi-Currency Settlement',
    body:  'Holds USD, EUR, GBP, and local currency. Escrow auto-releases on verified delivery. FX conversion built in — no manual reconciliation.',
  },
]

const WHY_GHANA = [
  {
    title: 'Highest Need',
    body:  "Ghana's smallholder farmers earn well below fair market prices with no access to credit or digital buyers. Proving the model here validates it globally.",
  },
  {
    title: 'Ready Infrastructure',
    body:  'Ghana has 18.7M+ active mobile money accounts. The payment infrastructure already reaches rural farmers — we built the marketplace on top, not from scratch.',
  },
  {
    title: 'Explosive Demand',
    body:  'Ghana is the world\'s 2nd largest cocoa producer and a top exporter of shea, cashew, and pineapple. International buyers are actively searching for verified direct sourcing.',
  },
  {
    title: 'Continental Gateway',
    body:  'Ghana hosts the AfCFTA Secretariat — the 54-nation continental free trade agreement covering 1.4 billion people and a $3.4 trillion economy.',
  },
]

export default function AboutPage() {
  return (
    <main>

      {/* ── Mission hero ────────────────────────────────────────────────── */}
      <section className="relative bg-forest py-24 lg:py-32 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&q=80&fit=crop"
          alt="Farmland at dusk"
          fill
          priority
          className="object-cover opacity-20"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest/80 to-forest/60" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-lime text-xs font-bold uppercase tracking-widest mb-5">
            About AgroConnect
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white
                         leading-tight mb-6">
            Global platform. Piloting in Ghana.
          </h1>
          <p className="text-white/65 text-lg leading-relaxed">
            AgroConnect is not a simple marketplace. It is the financial and logistical
            infrastructure of agricultural trade — the platform through which inputs are
            distributed, harvests are pledged, payments are settled, and market intelligence
            flows to every actor in the chain. Built for the world.
          </p>
        </div>
      </section>

      {/* ── Story ───────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold text-forest uppercase tracking-widest mb-4">
                Why We Exist
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-forest
                             leading-snug mb-6">
                The trust gap is the market gap.
              </h2>
              <div className="space-y-4 text-muted-foreground text-base leading-relaxed">
                <p>
                  Globally, farmers earn 60–80% below final market prices because intermediaries
                  capture the value in unorganised supply chains. Over 450 million smallholder
                  farmers lack access to formal financial services — no digital transaction record,
                  no path to financing inputs.
                </p>
                <p>
                  Cross-border agricultural payments have no escrow, no milestone triggers, and
                  no dispute resolution. Default risk sits entirely on the exporter. $400B+ in
                  post-harvest food loss happens every year because buyers and farmers cannot
                  coordinate reliably across borders.
                </p>
                <p>
                  AgroConnect closes these gaps: a field-agent verification network that
                  geo-stamps every farm, an escrow settlement engine that holds and releases
                  payments on delivery confirmation, and an AgroScore credit profile that
                  converts repayment history into input credit eligibility.
                </p>
              </div>
            </div>
            <div className="bg-forest rounded-2xl p-8 md:p-10 h-full min-h-[340px]
                            flex flex-col justify-between"
                 style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <p className="text-lime font-semibold text-xs tracking-wider uppercase mb-6">
                  Core Infrastructure
                </p>
                <blockquote className="font-display text-white text-xl sm:text-2xl font-bold leading-snug">
                  &ldquo;Every transaction is protected from the moment a contract is signed
                  to the instant payment clears — no cash changes hands without verified
                  delivery confirmation.&rdquo;
                </blockquote>
              </div>
              <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 gap-5">
                <div>
                  <p className="font-mono font-extrabold text-lime text-2xl leading-none">500M+</p>
                  <p className="text-white/55 text-[11px] font-semibold uppercase tracking-wider mt-1.5">Smallholder Farms</p>
                </div>
                <div>
                  <p className="font-mono font-extrabold text-lime text-2xl leading-none">54</p>
                  <p className="text-white/55 text-[11px] font-semibold uppercase tracking-wider mt-1.5">AfCFTA Nations</p>
                </div>
                <div>
                  <p className="font-mono font-extrabold text-lime text-2xl leading-none">$3.5T</p>
                  <p className="text-white/55 text-[11px] font-semibold uppercase tracking-wider mt-1.5">Agricultural Market</p>
                </div>
                <div>
                  <p className="font-mono font-extrabold text-lime text-2xl leading-none">&lt;2%</p>
                  <p className="text-white/55 text-[11px] font-semibold uppercase tracking-wider mt-1.5">Digitized Today</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pillars ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl font-extrabold text-forest mb-10">
            How the platform works
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {PILLARS.map((p) => (
              <div key={p.title}
                className="bg-white rounded-2xl border border-border p-7">
                <h3 className="font-display font-bold text-forest text-base mb-2">{p.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Ghana First ─────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-3"
               style={{ color: 'var(--lime-dark, hsl(86,55%,40%))' }}>
              Pilot Strategy
            </p>
            <h2 className="font-display text-3xl font-extrabold text-forest mb-3">
              Global platform. Why Ghana first.
            </h2>
            <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
              We are building for the world. We chose Ghana as our first pilot market for four
              specific reasons — and the model is designed to replicate into Southeast Asia,
              Latin America, and South Asia next.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {WHY_GHANA.map((w, i) => (
              <div key={w.title}
                className="rounded-2xl p-7"
                style={{
                  backgroundColor: i % 2 === 0 ? 'var(--cream)' : 'white',
                  border: '1.5px solid rgba(25,60,30,0.10)',
                }}>
                <h3 className="font-display font-bold text-forest text-base mb-2"
                    style={{ color: 'var(--lime-dark, hsl(86,55%,40%))' }}>
                  {w.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{w.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="bg-forest py-20 text-center px-4">
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-5">
          Join the network.
        </h2>
        <p className="text-white/60 text-base mb-8 max-w-md mx-auto">
          Register as a farmer, dealer, buyer, or field agent in under two minutes.
        </p>
        <Link href="/login"
          className="inline-flex px-8 py-4 font-bold text-sm rounded-full
                     transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
          Get Started Free
        </Link>
      </section>

    </main>
  )
}
