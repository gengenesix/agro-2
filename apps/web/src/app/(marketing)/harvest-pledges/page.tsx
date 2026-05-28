import type { Metadata } from 'next'
import Image             from 'next/image'
import Link              from 'next/link'
import {
  FadeUp, FadeIn, SlideLeft, SlideRight,
  StaggerGrid, StaggerItem, Card3D,
} from '../_components/animate-in'

export const metadata: Metadata = {
  title:       'Harvest Pledges — AgroConnect',
  description: 'Lock in seasonal forward contracts with escrow-backed deposits. Buyers commit before planting. Farmers plant with payment certainty.',
}

const TIMELINE = [
  {
    step: '01', phase: 'Contract Signing',
    who: 'Buyer + Farmer',
    body: 'Buyer selects a pledge listing and deposits 5–50% of the total contract value. Funds are locked in escrow immediately — the farmer never touches them until delivery.',
  },
  {
    step: '02', phase: 'Planting & Growth',
    who: 'Farmer + Field Agent',
    body: 'Farmer plants with payment certainty. Certified field agents GPS-log progress milestones — quantity estimates, crop health, and farm location — at every key stage.',
  },
  {
    step: '03', phase: 'Harvest & Dispatch',
    who: 'Farmer',
    body: 'Farmer logs the harvest, updates final quantity, and marks the pledge as dispatched. Photos and weight records are submitted for buyer review.',
  },
  {
    step: '04', phase: 'Delivery & Settlement',
    who: 'Buyer',
    body: 'Buyer confirms receipt. Escrow releases automatically — deposit net of 2.5% commission. Remaining balance is charged. Full ledger entry timestamped in real time.',
  },
]

const PROTECTION = [
  {
    who: 'For Buyers',
    items: [
      'Price locked at contract signing — no seasonal inflation surprises',
      'GPS-verified crop progress before every milestone payment',
      'Farmer default: 100% of deposit refunded',
      'Dispute resolution with an independent field agent review',
    ],
  },
  {
    who: 'For Farmers',
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
    a: 'Buyer and farmer agree on a deposit between 5% and 50% of the total contract value at signing. The remaining balance is collected at delivery confirmation.',
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
    a: 'Certified field agents visit the farm at key milestones and submit GPS-stamped photo evidence, moisture readings, and quantity estimates through the AgroConnect app.',
  },
]

export default function HarvestPledgesPage() {
  return (
    <main className="overflow-x-hidden">

      {/* Hero */}
      <section
        className="relative min-h-[80vh] grid lg:grid-cols-[55%_45%] overflow-hidden"
        style={{ backgroundColor: 'var(--forest)' }}
      >
        <div className="flex items-center px-8 sm:px-12 lg:px-16 py-24 lg:py-0">
          <div className="max-w-xl">
            <FadeIn>
              <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-8"
                    style={{ backgroundColor: 'var(--harvest-gold-bg)', color: 'var(--harvest-gold)' }}>
                Harvest Pledge System
              </span>
            </FadeIn>
            <FadeUp delay={0.08}>
              <h1 className="font-display font-extrabold text-white leading-[1.06] tracking-tight mb-6"
                  style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)' }}>
                Lock in your harvest<br />
                <em className="not-italic" style={{ color: 'var(--harvest-gold)' }}>
                  before planting season.
                </em>
              </h1>
            </FadeUp>
            <FadeUp delay={0.18}>
              <p className="text-base leading-relaxed mb-10 max-w-lg"
                 style={{ color: 'rgba(255,255,255,0.65)' }}>
                A dual-stage financial escrow framework for seasonal forward contracts.
                Buyers commit deposits before planting. Farmers grow with certainty.
                Field agents verify every milestone. Settlement is automatic on delivery.
              </p>
            </FadeUp>
            <FadeUp delay={0.26}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/pledges"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 font-bold text-sm rounded-xl"
                  style={{ backgroundColor: 'var(--harvest-gold)', color: 'var(--forest)' }}>
                  Browse Pledge Listings
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor"
                       strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </Link>
                <Link href="/login"
                  className="inline-flex items-center justify-center px-7 py-4 font-bold text-sm rounded-xl"
                  style={{ backgroundColor: 'rgba(255,255,255,0.10)', color: 'white' }}>
                  Create a Pledge Listing
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <Image
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=900&q=85&fit=crop"
            alt="Ghana farmland at harvest"
            fill sizes="45vw"
            className="object-cover object-center"
            draggable={false}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, var(--forest) 0%, transparent 35%)' }} />
          {/* Escrow badge */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="rounded-2xl px-6 py-5 text-center"
                 style={{ backgroundColor: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.20)' }}>
              <p className="font-mono font-extrabold text-3xl text-white">GHS 4.2M</p>
              <p className="text-xs font-semibold uppercase tracking-widest mt-1"
                 style={{ color: 'rgba(255,255,255,0.60)' }}>
                Pledges in Escrow
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How the escrow works */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="mb-12">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--forest)' }}>
              The Process
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-snug"
                style={{ color: 'var(--forest)' }}>
              Four milestones. Fully automated.
            </h2>
          </FadeUp>

          <div className="space-y-4">
            {TIMELINE.map((t, i) => (
              <FadeUp key={t.step} delay={i * 0.10}>
                <Card3D>
                  <div className="rounded-2xl p-7 grid sm:grid-cols-[80px_1fr_auto] gap-4 items-start"
                       style={{ backgroundColor: 'white', border: '1px solid var(--border)' }}>
                    <p className="font-mono font-extrabold text-3xl leading-none"
                       style={{ color: 'var(--lime)' }}>
                      {t.step}
                    </p>
                    <div>
                      <p className="font-bold text-lg mb-1" style={{ color: 'var(--forest)' }}>{t.phase}</p>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{t.body}</p>
                    </div>
                    <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full whitespace-nowrap"
                          style={{ backgroundColor: 'var(--cream)', color: 'var(--forest)', border: '1px solid var(--border)' }}>
                      {t.who}
                    </span>
                  </div>
                </Card3D>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Protection — for buyers & farmers */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'var(--forest)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--lime)' }}>
              Protection
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
              Both sides are protected. Always.
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-2 gap-6">
            {PROTECTION.map(p => (
              <FadeUp key={p.who} delay={0.1}>
                <div className="rounded-3xl p-8 h-full"
                     style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)' }}>
                  <p className="font-bold text-lg text-white mb-5">{p.who}</p>
                  <ul className="space-y-3">
                    {p.items.map(item => (
                      <li key={item} className="flex items-start gap-3 text-sm"
                          style={{ color: 'rgba(255,255,255,0.65)' }}>
                        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="var(--lime)"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
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

      {/* FAQ */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'white' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <FadeUp className="mb-10">
            <h2 className="font-display text-3xl font-extrabold" style={{ color: 'var(--forest)' }}>
              Frequently asked questions
            </h2>
          </FadeUp>
          <div className="space-y-4">
            {FAQ.map((f, i) => (
              <FadeUp key={f.q} delay={i * 0.07}>
                <div className="rounded-2xl p-6" style={{ backgroundColor: 'var(--cream)', border: '1px solid var(--border)' }}>
                  <p className="font-bold text-sm mb-2" style={{ color: 'var(--forest)' }}>{f.q}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{f.a}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-4" style={{ backgroundColor: 'var(--forest)' }}>
        <FadeUp>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Secure your harvest today.
          </h2>
          <p className="text-base mb-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.60)' }}>
            Farmers: list a pledge. Buyers: browse available contracts.
            Escrow does the rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login"
              className="px-8 py-4 font-bold text-sm rounded-2xl"
              style={{ backgroundColor: 'var(--harvest-gold)', color: 'var(--forest)' }}>
              Get Started
            </Link>
            <Link href="/pledges"
              className="px-8 py-4 font-bold text-sm rounded-2xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.10)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
              Browse Pledges
            </Link>
          </div>
        </FadeUp>
      </section>

    </main>
  )
}
