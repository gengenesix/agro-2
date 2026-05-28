import type { Metadata } from 'next'
import Image             from 'next/image'
import Link              from 'next/link'
import {
  FadeUp, FadeIn, SlideLeft, SlideRight,
  StaggerGrid, StaggerItem, Card3D,
} from '../_components/animate-in'

export const metadata: Metadata = {
  title:       'Agro Inputs — AgroConnect',
  description: 'Quality seeds, fertilizers, pesticides, and farm equipment. Buy now, pay after harvest with BNPL credit tied to your AgroScore.',
}

const CATEGORIES = [
  {
    label: 'Seeds', count: '2,400+',
    desc: 'Certified maize, rice, sorghum, cowpea, and vegetable seed varieties',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12M12 12C12 7 8 4 4 4c0 4 3 8 8 8zM12 12c0-5 4-8 8-8 0 4-3 8-8 8"/>
      </svg>
    ),
  },
  {
    label: 'Fertilizers', count: '1,800+',
    desc: 'NPK, urea, compost, and micronutrient blends for all crop types',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    label: 'Pesticides', count: '900+',
    desc: 'EPA-approved herbicides, fungicides, and insecticides',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a9 9 0 0 1 9 9c0 4-2.5 7-5 9l-4 2-4-2c-2.5-2-5-5-5-9a9 9 0 0 1 9-9z"/>
        <path d="M12 7v5l3 3"/>
      </svg>
    ),
  },
  {
    label: 'Equipment', count: '1,100+',
    desc: 'Irrigation kits, sprayers, seeders, and post-harvest handling tools',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
  },
]

const BNPL_TIERS = [
  {
    tier: 'Starter',    score: '≥ 20', limit: '$150',    rate: '8% flat',
    desc: 'Input credit unlocked. For new farmers building their credit history.',
    highlight: false,
  },
  {
    tier: 'Grower',     score: '≥ 50', limit: '$600',  rate: '6% flat',
    desc: 'Harvest Pledge listing enabled. For verified farmers with a growing trade record.',
    highlight: false,
  },
  {
    tier: 'Established',score: '≥ 70', limit: '$3,000', rate: '5% flat',
    desc: 'International buyer access. For field-verified farmers with strong order history.',
    highlight: true,
  },
  {
    tier: 'Commercial', score: '≥ 90', limit: '$15,000', rate: '4% flat',
    desc: 'Export contracts eligible. For top-tier producers with completed harvest pledges.',
    highlight: false,
  },
]

const PROCESS = [
  {
    step: '01', title: 'Check Your Score',
    body: 'Log in and view your AgroScore. It is calculated from your verification level, order history, and repayment record.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    step: '02', title: 'Select Inputs',
    body: 'Browse certified input dealers. Add seeds, fertilizers, or equipment to your cart. BNPL is shown automatically if your score qualifies.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  {
    step: '03', title: 'Buy Now, Pay Later',
    body: 'Choose BNPL at checkout. Inputs are dispatched immediately. Your repayment is scheduled to align with your harvest cycle — no penalty for early payment.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
]

export default function AgroInputsPage() {
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
                  <path d="M12 22V12M12 12C12 7 8 4 4 4c0 4 3 8 8 8zM12 12c0-5 4-8 8-8 0 4-3 8-8 8"/>
                </svg>
                Agro Inputs
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
                Quality inputs.{' '}
                <br />
                <em
                  className="not-italic"
                  style={{
                    color: 'var(--lime)',
                    WebkitTextStroke: '1.5px var(--forest)',
                  }}
                >
                  Pay after
                </em>{' '}
                harvest.
              </h1>
            </FadeUp>

            <FadeUp delay={0.15}>
              <p className="text-lg leading-relaxed mb-10 max-w-lg"
                 style={{ color: 'rgba(25,60,30,0.62)' }}>
                Buy certified seeds, fertilizers, pesticides, and equipment today.
                Pay after your harvest with AgroScore credit lines up to $15,000 —
                no bank account, no collateral required.
              </p>
            </FadeUp>

            <FadeUp delay={0.22}>
              <div className="flex flex-wrap gap-3 mb-14">
                <Link href="/farmer/inputs"
                  className="inline-flex items-center gap-2 px-7 py-3.5 font-bold text-sm rounded-full
                             transition-all hover:opacity-90 active:scale-[0.97]"
                  style={{ backgroundColor: 'var(--forest)', color: 'white' }}>
                  Browse Inputs
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
                  Check My AgroScore
                </Link>
              </div>
            </FadeUp>

            <FadeIn delay={0.30}>
              <div
                className="inline-flex items-center gap-5 px-6 py-4 rounded-2xl"
                style={{
                  backgroundColor: 'white',
                  border: '1.5px solid rgba(25,60,30,0.10)',
                }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                     style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                       strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2"/>
                    <line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <div>
                  <p className="font-mono font-extrabold text-xl leading-none"
                     style={{ color: 'var(--forest)' }}>
                    Up to $15,000
                  </p>
                  <p className="text-[11px] font-semibold mt-1"
                     style={{ color: 'rgba(25,60,30,0.50)' }}>
                    BNPL credit available
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Right image */}
        <div className="relative hidden lg:block">
          <Image
            src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=85&fit=crop"
            alt="Agro inputs — seeds and fertilizers"
            fill sizes="48vw"
            className="object-cover object-center"
            draggable={false}
          />
          <div className="absolute inset-0"
               style={{ background: 'linear-gradient(to right, var(--cream) 0%, transparent 22%)' }} />

          {/* BNPL badge */}
          <div className="absolute bottom-16 left-10 z-10">
            <div
              className="flex items-center gap-3 px-5 py-4 rounded-2xl"
              style={{
                backgroundColor: 'var(--forest)',
                boxShadow: '0 8px 32px rgba(10,34,16,0.30)',
              }}
            >
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                   style={{ backgroundColor: 'rgba(255,255,255,0.10)' }}>
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="var(--lime)"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
              <div>
                <p className="font-bold text-sm text-white">Buy Now, Pay Later</p>
                <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.50)' }}>
                  Repay after harvest
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile image */}
        <div className="lg:hidden relative h-64 w-full">
          <Image
            src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=85&fit=crop"
            alt="Agro inputs" fill sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0"
               style={{ background: 'linear-gradient(to top, var(--cream), transparent 50%)' }} />
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: 'white' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="max-w-lg mb-14">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4"
               style={{ color: 'rgba(25,60,30,0.40)' }}>
              Categories
            </p>
            <h2
              className="font-display font-bold leading-[1.06]"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                letterSpacing: '-0.03em',
                color: 'var(--forest)',
              }}
            >
              Everything your farm needs, in one place.
            </h2>
          </FadeUp>

          <StaggerGrid className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.08}>
            {CATEGORIES.map(c => (
              <StaggerItem key={c.label}>
                <Card3D className="h-full">
                  <Link
                    href={`/farmer/inputs?category=${c.label.toLowerCase()}`}
                    className="group flex flex-col rounded-2xl p-6 h-full transition-all"
                    style={{
                      backgroundColor: 'var(--cream)',
                      border: '1.5px solid rgba(25,60,30,0.10)',
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 flex-shrink-0
                                 transition-transform duration-200 group-hover:scale-110"
                      style={{ backgroundColor: 'var(--forest)', color: 'var(--lime)' }}
                    >
                      {c.icon}
                    </div>
                    <p className="font-bold text-base mb-1.5"
                       style={{ color: 'var(--forest)', letterSpacing: '-0.02em' }}>
                      {c.label}
                    </p>
                    <p className="text-sm leading-relaxed flex-1 mb-3"
                       style={{ color: 'rgba(25,60,30,0.58)' }}>
                      {c.desc}
                    </p>
                    <p className="font-mono text-xs font-bold"
                       style={{ color: 'hsl(86,50%,35%)' }}>
                      {c.count} listings
                    </p>
                  </Link>
                </Card3D>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── BNPL TIERS ────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: 'var(--forest)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="text-center mb-16 max-w-2xl mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4"
               style={{ color: 'var(--lime)' }}>
              BNPL Credit Tiers
            </p>
            <h2
              className="font-display font-bold text-white leading-[1.06]"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                letterSpacing: '-0.03em',
              }}
            >
              Your AgroScore unlocks your credit line.
            </h2>
            <p className="mt-4 text-base" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Build your score by completing verified orders, pledges, and BNPL repayments.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BNPL_TIERS.map((t, i) => (
              <FadeUp key={t.tier} delay={i * 0.09}>
                <div
                  className="rounded-2xl p-6 h-full flex flex-col"
                  style={
                    t.highlight
                      ? {
                          backgroundColor: 'var(--lime)',
                          transform: 'translateY(-8px)',
                          boxShadow: '0 16px 48px rgba(0,0,0,0.25)',
                        }
                      : {
                          backgroundColor: 'rgba(255,255,255,0.05)',
                          border: '1px solid rgba(255,255,255,0.10)',
                        }
                  }
                >
                  <p
                    className="text-[10px] font-bold uppercase tracking-widest mb-2"
                    style={{ color: t.highlight ? 'rgba(10,34,16,0.50)' : 'rgba(255,255,255,0.40)' }}
                  >
                    AgroScore {t.score}
                  </p>
                  <p
                    className="font-bold text-base mb-0.5"
                    style={{ color: t.highlight ? 'var(--forest)' : 'white' }}
                  >
                    {t.tier}
                  </p>
                  <p
                    className="font-mono font-extrabold text-3xl mb-1"
                    style={{ color: t.highlight ? 'var(--forest)' : 'white' }}
                  >
                    {t.limit}
                  </p>
                  <p
                    className="text-xs font-bold mb-3"
                    style={{ color: t.highlight ? 'rgba(10,34,16,0.55)' : 'rgba(255,255,255,0.45)' }}
                  >
                    @ {t.rate}
                  </p>
                  <p
                    className="text-sm flex-1 leading-relaxed"
                    style={{ color: t.highlight ? 'rgba(10,34,16,0.65)' : 'rgba(255,255,255,0.50)' }}
                  >
                    {t.desc}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW BNPL WORKS ────────────────────────────────────────── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="text-center mb-16 max-w-xl mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4"
               style={{ color: 'rgba(25,60,30,0.40)' }}>
              How BNPL Works
            </p>
            <h2
              className="font-display font-bold leading-[1.06]"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                letterSpacing: '-0.03em',
                color: 'var(--forest)',
              }}
            >
              Inputs today. Pay after harvest.
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-5">
            {PROCESS.map((p, i) => (
              <FadeUp key={p.step} delay={i * 0.09}>
                <div
                  className="rounded-2xl p-7 h-full"
                  style={{
                    backgroundColor: 'white',
                    border: '1.5px solid rgba(25,60,30,0.10)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ backgroundColor: 'var(--forest)', color: 'var(--lime)' }}>
                      {p.icon}
                    </div>
                    <p className="font-mono font-extrabold text-3xl"
                       style={{ color: 'rgba(25,60,30,0.08)' }}>
                      {p.step}
                    </p>
                  </div>
                  <h3 className="font-bold text-base mb-2"
                      style={{ color: 'var(--forest)', letterSpacing: '-0.02em' }}>
                    {p.title}
                  </h3>
                  <p className="text-sm leading-relaxed"
                     style={{ color: 'rgba(25,60,30,0.60)' }}>
                    {p.body}
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
            Start farming with credit confidence.
          </h2>
          <p className="text-base mb-10 max-w-md mx-auto"
             style={{ color: 'rgba(255,255,255,0.55)' }}>
            Verify your farm. Build your AgroScore. Unlock credit before next season.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login"
              className="px-8 py-4 font-bold text-sm rounded-full transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
              Check My Eligibility
            </Link>
            <Link href="/farmer/inputs"
              className="px-8 py-4 font-bold text-sm rounded-full transition-all hover:opacity-80"
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '1.5px solid rgba(255,255,255,0.30)',
              }}>
              Browse Inputs
            </Link>
          </div>
        </FadeUp>
      </section>

    </main>
  )
}
