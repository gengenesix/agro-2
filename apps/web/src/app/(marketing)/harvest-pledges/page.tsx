import type { Metadata } from 'next'
import Image             from 'next/image'
import Link              from 'next/link'
import {
  FadeUp, FadeIn, SlideLeft, SlideRight,
  StaggerGrid, StaggerItem, Card3D,
} from '../_components/animate-in'

export const metadata: Metadata = {
  title:       'Harvest Pledges — AgroConnect',
  description: 'The first platform to let international buyers pre-book a farmer\'s crop before it is even grown — with full escrow protection and GPS-verified milestones.',
}

const TIMELINE = [
  {
    step: '01', phase: 'Farmer Lists Harvest', who: 'Farmer',
    body: 'Crop type, quantity, expected harvest date, GPS location. Accessible on any phone. Listed to international buyers worldwide.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12M12 12C12 7 8 4 4 4c0 4 3 8 8 8zM12 12c0-5 4-8 8-8 0 4-3 8-8 8"/>
      </svg>
    ),
  },
  {
    step: '02', phase: 'Buyer Deposits Into Escrow', who: 'International Buyer',
    body: 'Buyer anywhere in the world deposits 20–50% into our secure escrow engine. Funds are locked — the farmer never touches them until delivery.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
  {
    step: '03', phase: 'Farmer Grows With Certainty', who: 'Farmer + Field Agent',
    body: 'Pledge confirmation unlocks AgroScore input credit. Farmer grows knowing the crop is sold. Field agents GPS-log progress milestones at every key stage.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14"/>
        <path d="M12 5l7 7-7 7"/>
      </svg>
    ),
  },
  {
    step: '04', phase: 'Agent Confirms Delivery', who: 'Field Agent + Buyer',
    body: 'Our field agent GPS-stamps the delivery. Escrow releases automatically. Full audit trail for customs compliance. Net of 2.5% commission.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
]

const PROTECTION = [
  {
    who: 'For International Buyers',
    bg: 'var(--forest)',
    textColor: 'white',
    mutedColor: 'rgba(255,255,255,0.65)',
    checkColor: 'var(--lime)',
    items: [
      'Price locked at contract signing — no seasonal inflation surprises',
      'GPS-verified crop progress before every milestone payment',
      'Farmer default: 100% of deposit refunded immediately',
      'Full audit trail and documentation for customs compliance',
    ],
  },
  {
    who: 'For Farmers',
    bg: 'var(--lime)',
    textColor: 'var(--forest)',
    mutedColor: 'rgba(10,34,16,0.70)',
    checkColor: 'var(--forest)',
    items: [
      'Guaranteed off-take contract before you plant a single seed',
      'Escrow-backed deposit — payment is real, not a promise',
      'Buyer cancellation: 50% of deposit paid to you as compensation',
      'AgroScore boost for every successfully completed pledge',
    ],
  },
]

const FAQ = [
  {
    q: 'What percentage deposit is required?',
    a: 'Buyer and farmer agree on a deposit between 20% and 50% of the total contract value at signing. The remaining balance is collected at delivery confirmation.',
  },
  {
    q: 'What happens if the farmer defaults?',
    a: "100% of the buyer's deposit is returned immediately. The farmer's AgroScore is penalised, which affects future credit eligibility and listing visibility.",
  },
  {
    q: 'What if the buyer cancels after signing?',
    a: "50% of the deposit is transferred to the farmer as compensation for preparation costs already incurred. The remaining 50% is refunded to the buyer.",
  },
  {
    q: 'How is crop quality verified?',
    a: 'Certified field agents visit the farm at key milestones and submit GPS-stamped photo evidence, quantity estimates, and quality assessments through the AgroConnect app.',
  },
  {
    q: 'Can international buyers pay in their own currency?',
    a: 'Yes. AgroConnect supports USD, EUR, GBP, and local currency. FX conversion is handled automatically — buyers pay in their preferred currency and farmers receive in local currency.',
  },
]

export default function HarvestPledgesPage() {
  return (
    <main className="overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[86vh] grid lg:grid-cols-[52%_48%] pt-16"
        style={{ backgroundColor: 'var(--cream)' }}
      >
        <div className="flex items-center px-8 sm:px-12 lg:px-16 py-20 lg:py-0">
          <div className="max-w-2xl">

            <FadeIn>
              <span
                className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest
                           px-3 py-1.5 rounded-full mb-10"
                style={{ backgroundColor: 'var(--forest)', color: 'var(--lime)' }}
              >
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor"
                     strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <path d="M16 2v4M8 2v4M3 10h18"/>
                </svg>
                Harvest Pledge System
              </span>
            </FadeIn>

            <FadeUp delay={0.07}>
              <h1
                className="font-display font-bold leading-[1.02] mb-6"
                style={{
                  fontSize: 'clamp(2.8rem, 6vw, 5rem)',
                  letterSpacing: '-0.03em',
                  color: 'var(--forest)',
                }}
              >
                Forward contracts
                <br />
                for farmers,{' '}
                <em
                  className="not-italic"
                  style={{
                    color: 'var(--lime)',
                    WebkitTextStroke: '1.5px var(--forest)',
                  }}
                >
                  globally.
                </em>
              </h1>
            </FadeUp>

            <FadeUp delay={0.15}>
              <p className="text-lg leading-relaxed mb-10 max-w-lg"
                 style={{ color: 'rgba(25,60,30,0.62)' }}>
                The first platform to let international buyers pre-book a farmer&apos;s
                crop before it is even grown — with full escrow protection and
                GPS-verified milestones.
              </p>
            </FadeUp>

            <FadeUp delay={0.22}>
              <div className="flex flex-wrap gap-3 mb-14">
                <Link href="/pledges"
                  className="inline-flex items-center gap-2 px-7 py-3.5 font-bold text-sm rounded-full
                             transition-all hover:opacity-90 active:scale-[0.97]"
                  style={{ backgroundColor: 'var(--forest)', color: 'white' }}>
                  Browse Pledges
                  <svg viewBox="0 0 16 16" width="13" height="13" fill="none"
                       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </Link>
                <Link href="/login"
                  className="inline-flex items-center px-7 py-3.5 font-bold text-sm rounded-full
                             transition-all hover:opacity-80"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--forest)',
                    border: '1.5px solid var(--forest)',
                  }}>
                  Create a Pledge Listing
                </Link>
              </div>
            </FadeUp>

            <FadeIn delay={0.30}>
              <div
                className="inline-flex items-center gap-4 px-6 py-4 rounded-2xl"
                style={{
                  backgroundColor: 'white',
                  border: '1.5px solid rgba(25,60,30,0.10)',
                }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                       strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div>
                  <p className="font-mono font-extrabold text-xl leading-none"
                     style={{ color: 'var(--forest)' }}>
                    GHS 4.2M
                  </p>
                  <p className="text-[11px] font-semibold mt-1"
                     style={{ color: 'rgba(25,60,30,0.50)' }}>
                    currently held in escrow · Ghana pilot
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Right image */}
        <div className="relative hidden lg:block">
          <Image
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900&q=85&fit=crop"
            alt="Farmland at harvest"
            fill sizes="48vw"
            className="object-cover object-center"
            draggable={false}
          />
          <div className="absolute inset-0"
               style={{ background: 'linear-gradient(to right, var(--cream) 0%, transparent 22%)' }} />

          {/* Field agent badge */}
          <div className="absolute top-16 left-10 z-10">
            <div
              className="flex items-center gap-3 px-5 py-4 rounded-2xl"
              style={{
                backgroundColor: 'var(--forest)',
                boxShadow: '0 8px 32px rgba(10,34,16,0.30)',
              }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                   style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--lime)"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
              </div>
              <div>
                <p className="font-display font-bold text-sm text-white">GPS Verified</p>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.50)' }}>
                  Every milestone logged
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile image */}
        <div className="lg:hidden relative h-64 w-full">
          <Image
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900&q=85&fit=crop"
            alt="Farmland at harvest" fill sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0"
               style={{ background: 'linear-gradient(to top, var(--cream), transparent 50%)' }} />
        </div>
      </section>

      {/* ── TIMELINE ──────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: 'white' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <FadeUp className="max-w-xl mb-14">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4"
               style={{ color: 'rgba(25,60,30,0.40)' }}>
              The Process
            </p>
            <h2
              className="font-display font-bold leading-[1.06]"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                letterSpacing: '-0.03em',
                color: 'var(--forest)',
              }}
            >
              Five milestones. Fully automated.
            </h2>
          </FadeUp>

          <div className="space-y-4">
            {TIMELINE.map((t, i) => (
              <FadeUp key={t.step} delay={i * 0.09}>
                <Card3D>
                  <div
                    className="rounded-2xl p-6 grid sm:grid-cols-[64px_1fr_auto] gap-4 items-start"
                    style={{
                      backgroundColor: 'var(--cream)',
                      border: '1.5px solid rgba(25,60,30,0.10)',
                    }}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                           style={{ backgroundColor: 'var(--forest)', color: 'var(--lime)' }}>
                        {t.icon}
                      </div>
                      <p className="font-mono font-extrabold text-xs"
                         style={{ color: 'rgba(25,60,30,0.30)' }}>
                        {t.step}
                      </p>
                    </div>
                    <div>
                      <p className="font-display font-bold text-base mb-1.5"
                         style={{ color: 'var(--forest)', letterSpacing: '-0.02em' }}>
                        {t.phase}
                      </p>
                      <p className="text-sm leading-relaxed"
                         style={{ color: 'rgba(25,60,30,0.60)' }}>
                        {t.body}
                      </p>
                    </div>
                    <span
                      className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1.5
                                 rounded-full whitespace-nowrap self-start mt-1"
                      style={{
                        backgroundColor: 'var(--forest)',
                        color: 'var(--lime)',
                      }}
                    >
                      {t.who}
                    </span>
                  </div>
                </Card3D>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROTECTION ────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="text-center mb-16 max-w-xl mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4"
               style={{ color: 'rgba(25,60,30,0.40)' }}>
              Protection
            </p>
            <h2
              className="font-display font-bold leading-[1.06]"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                letterSpacing: '-0.03em',
                color: 'var(--forest)',
              }}
            >
              Both sides are protected. Always.
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-5">
            {PROTECTION.map((p, i) => (
              <FadeUp key={p.who} delay={i * 0.10}>
                <div
                  className="rounded-3xl p-8 h-full"
                  style={{ backgroundColor: p.bg }}
                >
                  <p
                    className="font-display font-bold text-lg mb-6"
                    style={{ color: p.textColor, letterSpacing: '-0.02em' }}
                  >
                    {p.who}
                  </p>
                  <ul className="space-y-3.5">
                    {p.items.map(item => (
                      <li key={item} className="flex items-start gap-3 text-sm"
                          style={{ color: p.mutedColor }}>
                        <svg viewBox="0 0 16 16" width="15" height="15" fill="none"
                             stroke={p.checkColor} strokeWidth="2.2"
                             strokeLinecap="round" strokeLinejoin="round"
                             className="shrink-0 mt-0.5">
                          <path d="M3 8l3.5 3.5L13 4.5"/>
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: 'white' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <FadeUp className="mb-12">
            <h2
              className="font-display font-bold"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                letterSpacing: '-0.03em',
                color: 'var(--forest)',
              }}
            >
              Frequently asked questions.
            </h2>
          </FadeUp>
          <div className="space-y-3">
            {FAQ.map((f, i) => (
              <FadeUp key={f.q} delay={i * 0.07}>
                <div
                  className="rounded-2xl p-6"
                  style={{
                    backgroundColor: 'var(--cream)',
                    border: '1.5px solid rgba(25,60,30,0.10)',
                  }}
                >
                  <p className="font-display font-bold text-sm mb-2"
                     style={{ color: 'var(--forest)', letterSpacing: '-0.01em' }}>
                    {f.q}
                  </p>
                  <p className="text-sm leading-relaxed"
                     style={{ color: 'rgba(25,60,30,0.60)' }}>
                    {f.a}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="py-24 text-center px-4" style={{ backgroundColor: 'var(--forest)' }}>
        <FadeUp>
          <h2
            className="font-display font-bold text-white mb-4"
            style={{
              fontSize: 'clamp(1.9rem, 4vw, 3rem)',
              letterSpacing: '-0.04em',
            }}
          >
            Secure your harvest today.
          </h2>
          <p className="text-base mb-10 max-w-md mx-auto"
             style={{ color: 'rgba(255,255,255,0.55)' }}>
            Farmers: list a pledge. International buyers: browse available contracts.
            Escrow does the rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login"
              className="px-8 py-4 font-bold text-sm rounded-full transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
              Get Started
            </Link>
            <Link href="/pledges"
              className="px-8 py-4 font-bold text-sm rounded-full transition-all hover:opacity-80"
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '1.5px solid rgba(255,255,255,0.30)',
              }}>
              Browse Pledges
            </Link>
          </div>
        </FadeUp>
      </section>

    </main>
  )
}
