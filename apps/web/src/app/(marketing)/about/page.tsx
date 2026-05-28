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
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
        <circle cx="12" cy="10" r="3" fill="currentColor" fillOpacity="0.15"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    title: 'AgroScore Credit',
    body:  'Farmers build a portable credit profile with every transaction. No bank account required. No collateral. Credit eligibility grows with every successful trade.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
        <path d="M16 3H8a2 2 0 0 0-2 2v2h12V5a2 2 0 0 0-2-2z" fill="currentColor" fillOpacity="0.15"/>
        <line x1="2" y1="13" x2="22" y2="13"/>
      </svg>
    ),
  },
  {
    title: 'International Buyer Access',
    body:  'Buyers anywhere in the world can book verified supply months before harvest, pay into secure escrow, and receive a full audit trail for customs compliance.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
  {
    title: 'Multi-Currency Settlement',
    body:  'Holds USD, EUR, GBP, and local currency. Escrow auto-releases on verified delivery. FX conversion built in — no manual reconciliation.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
]

const WHY_GHANA = [
  {
    title: 'Highest Need',
    body:  "Ghana's smallholder farmers earn well below fair market prices with no access to credit or digital buyers. Proving the model here validates it globally.",
    num: '01',
  },
  {
    title: 'Ready Infrastructure',
    body:  'Ghana has 18.7M+ active mobile money accounts. The payment infrastructure already reaches rural farmers — we built the marketplace on top, not from scratch.',
    num: '02',
  },
  {
    title: 'Explosive Demand',
    body:  'Ghana is the world\'s 2nd largest cocoa producer and a top exporter of shea, cashew, and pineapple. International buyers are actively searching for verified direct sourcing.',
    num: '03',
  },
  {
    title: 'Continental Gateway',
    body:  'Ghana hosts the AfCFTA Secretariat — the 54-nation continental free trade agreement covering 1.4 billion people and a $3.4 trillion economy.',
    num: '04',
  },
]

export default function AboutPage() {
  return (
    <main>

      {/* ── Mission hero ────────────────────────────────────────────────── */}
      <section className="relative bg-forest py-24 lg:py-36 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&q=80&fit=crop"
          alt="Farmland at dusk"
          fill
          priority
          className="object-cover"
          style={{ opacity: 0.15 }}
          sizes="100vw"
        />
        {/* Lime accent vertical bar */}
        <div className="absolute top-0 right-0 bottom-0 w-1.5" style={{ backgroundColor: 'var(--lime)', opacity: 0.5 }} />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]
                       px-3 py-1.5 mb-10 inline-block"
            style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--forest)' }} />
            About AgroConnect
          </span>
          <h1
            className="font-display font-bold text-white leading-[0.95] mb-6"
            style={{
              fontSize: 'clamp(2.8rem, 6vw, 5rem)',
              letterSpacing: '-0.04em',
            }}
          >
            Global platform.<br />
            <span style={{ color: 'var(--lime)' }}>Piloting in Ghana.</span>
          </h1>
          <p className="text-lg leading-relaxed max-w-2xl" style={{ color: 'rgba(255,255,255,0.60)' }}>
            AgroConnect is not a simple marketplace. It is the financial and logistical
            infrastructure of agricultural trade — the platform through which inputs are
            distributed, harvests are pledged, payments are settled, and market intelligence
            flows to every actor in the chain.
          </p>
        </div>
      </section>

      {/* ── Story ───────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-5"
                 style={{ color: 'rgba(25,60,30,0.40)' }}>
                Why We Exist
              </p>
              <h2
                className="font-display font-bold leading-[0.95] mb-6"
                style={{
                  fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                  letterSpacing: '-0.04em',
                  color: 'var(--forest)',
                }}
              >
                The trust gap is the market gap.
              </h2>
              <div className="space-y-4 text-base leading-relaxed" style={{ color: 'rgba(25,60,30,0.65)' }}>
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

            {/* Stats card */}
            <div
              className="p-8 md:p-10 h-full min-h-[340px] flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--forest)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div>
                <p
                  className="text-[10px] font-bold uppercase tracking-widest mb-6"
                  style={{ color: 'var(--lime)' }}
                >
                  Core Infrastructure
                </p>
                <blockquote
                  className="font-display font-bold text-white leading-snug"
                  style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)' }}
                >
                  &ldquo;Every transaction is protected from the moment a contract is signed
                  to the instant payment clears — no cash changes hands without verified
                  delivery confirmation.&rdquo;
                </blockquote>
              </div>
              <div
                className="mt-8 pt-6 grid grid-cols-2 gap-5"
                style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
              >
                {[
                  { v: '500M+', l: 'Smallholder Farms' },
                  { v: '54',    l: 'AfCFTA Nations'    },
                  { v: '$3.5T', l: 'Agricultural Market'},
                  { v: '<2%',   l: 'Digitized Today'   },
                ].map(s => (
                  <div key={s.l}>
                    <p className="font-mono font-extrabold text-2xl leading-none mb-1.5"
                       style={{ color: 'var(--lime)' }}>
                      {s.v}
                    </p>
                    <p className="text-[11px] font-semibold uppercase tracking-wider"
                       style={{ color: 'rgba(255,255,255,0.40)' }}>
                      {s.l}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pillars ─────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-4"
               style={{ color: 'rgba(25,60,30,0.40)' }}>
              How the Platform Works
            </p>
            <h2
              className="font-display font-bold leading-[0.95]"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                letterSpacing: '-0.04em',
                color: 'var(--forest)',
              }}
            >
              Four systems. One platform.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {PILLARS.map((p, i) => (
              <div
                key={p.title}
                className="p-7 flex gap-5"
                style={{
                  backgroundColor: 'white',
                  border: '1.5px solid rgba(25,60,30,0.08)',
                  borderLeft: '4px solid var(--lime)',
                }}
              >
                <div
                  className="w-11 h-11 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    backgroundColor: 'rgba(25,60,30,0.06)',
                    color: 'var(--forest)',
                    clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
                  }}
                >
                  {p.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--forest)', letterSpacing: '-0.01em' }}>
                    {p.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(25,60,30,0.60)' }}>
                    {p.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Ghana First ─────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-4"
               style={{ color: 'rgba(25,60,30,0.40)' }}>
              Pilot Strategy
            </p>
            <h2
              className="font-display font-bold leading-[0.95] mb-3"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                letterSpacing: '-0.04em',
                color: 'var(--forest)',
              }}
            >
              Global platform.<br />Why Ghana first.
            </h2>
            <p className="text-sm max-w-2xl leading-relaxed" style={{ color: 'rgba(25,60,30,0.55)' }}>
              We are building for the world. We chose Ghana as our first pilot market for four
              specific reasons — and the model is designed to replicate into Southeast Asia,
              Latin America, and South Asia next.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {WHY_GHANA.map((w) => (
              <div
                key={w.title}
                className="p-7 relative overflow-hidden"
                style={{
                  backgroundColor: 'var(--cream)',
                  border: '1.5px solid rgba(25,60,30,0.08)',
                }}
              >
                <p
                  className="font-mono font-extrabold absolute top-5 right-6 text-5xl select-none"
                  style={{ color: 'rgba(25,60,30,0.05)' }}
                >
                  {w.num}
                </p>
                <h3
                  className="font-bold text-base mb-2 relative"
                  style={{ color: 'var(--lime)', letterSpacing: '-0.01em' }}
                >
                  {w.title}
                </h3>
                <p className="text-sm leading-relaxed relative" style={{ color: 'rgba(25,60,30,0.65)' }}>
                  {w.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section
        className="py-24 text-center px-4 relative overflow-hidden"
        style={{ backgroundColor: 'var(--forest)' }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--lime)', opacity: 0.4 }} />
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-6"
           style={{ color: 'rgba(255,255,255,0.35)' }}>
          Join the Network
        </p>
        <h2
          className="font-display font-bold text-white leading-[0.94] mb-5"
          style={{
            fontSize: 'clamp(2.2rem, 4vw, 3.5rem)',
            letterSpacing: '-0.04em',
          }}
        >
          Ready to grow with<br />
          <em className="not-italic" style={{ color: 'var(--lime)' }}>the world?</em>
        </h2>
        <p className="text-base mb-10 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Register as a farmer, dealer, buyer, or field agent in under two minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="px-8 py-4 font-bold text-sm transition-all hover:opacity-90 active:scale-[0.97]"
            style={{
              backgroundColor: 'var(--lime)',
              color: 'var(--forest)',
              clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
            }}
          >
            Get Started Free
          </Link>
          <Link
            href="/features"
            className="px-8 py-4 font-bold text-sm text-white transition-all hover:bg-white/10"
            style={{ border: '1.5px solid rgba(255,255,255,0.25)' }}
          >
            See All Features
          </Link>
        </div>
      </section>

    </main>
  )
}
