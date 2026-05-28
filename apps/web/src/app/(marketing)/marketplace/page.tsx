import type { Metadata } from 'next'
import Image             from 'next/image'
import Link              from 'next/link'
import {
  FadeUp, FadeIn, SlideLeft, SlideRight,
  StaggerGrid, StaggerItem, Card3D,
} from '../_components/animate-in'

export const metadata: Metadata = {
  title:       'Marketplace — AgroConnect',
  description: 'The global verified agricultural marketplace. Buy and sell crops, livestock, poultry, fisheries, and agro-inputs with escrow-backed payments and field-verified listings.',
}

const SECTORS = [
  {
    id: 'crops', label: 'Crops', count: '12,400+',
    desc: 'Maize, tomato, cassava, rice, yam and more',
    color: 'hsl(140,45%,30%)',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12M12 12C12 7 8 4 4 4c0 4 3 8 8 8zM12 12c0-5 4-8 8-8 0 4-3 8-8 8"/>
      </svg>
    ),
  },
  {
    id: 'livestock', label: 'Livestock', count: '3,200+',
    desc: 'Cattle, goats, sheep, and herd animals',
    color: 'hsl(30,55%,40%)',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7h-3.5c-.5-1-1.5-2-3-2H10c-1.5 0-2.5 1-3 2H4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
        <path d="M8 16v3M16 16v3"/>
      </svg>
    ),
  },
  {
    id: 'poultry', label: 'Poultry', count: '5,800+',
    desc: 'Broilers, layers, eggs, and day-old chicks',
    color: 'hsl(45,65%,35%)',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 8c0-2.5-2-5-5-5S7 5.5 7 8c0 4 3 7 5 9 2-2 5-5 5-9z"/>
        <path d="M12 13v5M9 15l3 3 3-3"/>
      </svg>
    ),
  },
  {
    id: 'fisheries', label: 'Fisheries', count: '1,900+',
    desc: 'Tilapia, catfish, shrimp, and smoked fish',
    color: 'hsl(200,55%,35%)',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 12c0-2.5 2-5 5.5-5 2.5 0 5 2.5 5 5s-2.5 5-5 5c-3.5 0-5.5-2.5-5.5-5z"/>
        <path d="M6.5 12 2 9v6l4.5-3z"/>
        <circle cx="15" cy="10" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    id: 'inputs', label: 'Agro Inputs', count: '8,100+',
    desc: 'Seeds, fertilizers, pesticides, equipment',
    color: 'hsl(86,50%,35%)',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
        <line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
]

const TRUST = [
  {
    title: 'Field-Verified Listings',
    body:  'Every listing is verified by a GPS-stamped field agent. Premium listings undergo independent lab testing and earn a certified badge.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    title: 'Escrow-Backed Payments',
    body:  'Payment is collected at order and held in escrow. Released to the seller only after you confirm delivery. Multi-currency settlement included.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
  {
    title: 'Real-Time Pricing',
    body:  'Prices are set by farmers at listing time — not manipulated by brokers. Compare across regions and sectors instantly.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    title: 'Accessible Anywhere',
    body:  'Mobile-first experience for buyers worldwide. Offline access channels ensure rural farmers can list and receive orders without a smartphone.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
]

const STEPS = [
  {
    step: '01', title: 'Browse or Search',
    body: 'Filter by sector, region, price, and farming method. See verified seller scores and farm details before committing.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <path d="m21 21-4.35-4.35"/>
      </svg>
    ),
  },
  {
    step: '02', title: 'Place Your Order',
    body: 'Select quantity. Pay via mobile money, card, or bank transfer. Your payment is held in escrow — not released until delivery.',
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
    step: '03', title: 'Receive & Confirm',
    body: 'Seller ships or arranges pickup. You confirm delivery. Escrow releases automatically. Dispute resolution available 24/7.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
]

export default function MarketplacePage() {
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
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                Marketplace
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
                Verified produce,{' '}
                <em
                  className="not-italic"
                  style={{
                    color: 'var(--lime)',
                    WebkitTextStroke: '1.5px var(--forest)',
                  }}
                >
                  direct
                </em>
                <br />
                from the farm gate.
              </h1>
            </FadeUp>

            <FadeUp delay={0.15}>
              <p className="text-lg leading-relaxed mb-10 max-w-lg"
                 style={{ color: 'rgba(25,60,30,0.62)' }}>
                Buy directly from verified farmers anywhere. Every listing is field-inspected,
                priced at source, and backed by escrow so your money is safe until delivery.
              </p>
            </FadeUp>

            <FadeUp delay={0.22}>
              <div className="flex flex-wrap gap-3 mb-14">
                <Link href="/produce"
                  className="inline-flex items-center gap-2 px-7 py-3.5 font-bold text-sm rounded-full
                             transition-all hover:opacity-90 active:scale-[0.97]"
                  style={{ backgroundColor: 'var(--forest)', color: 'white' }}>
                  Browse All Listings
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
                  Sell Your Produce
                </Link>
              </div>
            </FadeUp>

            <FadeIn delay={0.30}>
              <div className="flex items-center gap-6">
                {[
                  { v: '18,500+', l: 'Live Listings' },
                  { v: '24,000+', l: 'Verified Farmers' },
                  { v: '2.5%',    l: 'Commission Only' },
                ].map((s, i) => (
                  <div key={s.l} className="flex items-center gap-6">
                    {i > 0 && (
                      <div className="w-px h-8" style={{ backgroundColor: 'rgba(25,60,30,0.15)' }} />
                    )}
                    <div>
                      <p className="font-mono font-extrabold text-lg leading-none"
                         style={{ color: 'var(--forest)' }}>
                        {s.v}
                      </p>
                      <p className="text-[10px] font-semibold uppercase tracking-widest mt-1"
                         style={{ color: 'rgba(25,60,30,0.45)' }}>
                        {s.l}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Right image */}
        <div className="relative hidden lg:block">
          <Image
            src="https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=900&q=85&fit=crop"
            alt="Fresh produce at market"
            fill sizes="48vw"
            className="object-cover object-center"
            draggable={false}
          />
          <div className="absolute inset-0"
               style={{ background: 'linear-gradient(to right, var(--cream) 0%, transparent 22%)' }} />

          {/* Floating verification badge */}
          <div className="absolute bottom-12 left-10 z-10">
            <div
              className="flex items-center gap-3 px-5 py-4 rounded-2xl"
              style={{
                backgroundColor: 'white',
                boxShadow: '0 8px 32px rgba(10,34,16,0.15)',
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                   style={{ backgroundColor: 'var(--forest)', color: 'var(--lime)' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                     strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div>
                <p className="font-display font-bold text-sm" style={{ color: 'var(--forest)' }}>
                  Field-Verified
                </p>
                <p className="text-[11px]" style={{ color: 'rgba(25,60,30,0.50)' }}>
                  Every listing GPS-stamped
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile image */}
        <div className="lg:hidden relative h-64 w-full">
          <Image
            src="https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=900&q=85&fit=crop"
            alt="Produce marketplace" fill sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0"
               style={{ background: 'linear-gradient(to top, var(--cream), transparent 50%)' }} />
        </div>
      </section>

      {/* ── SECTORS ───────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: 'white' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="max-w-lg mb-14">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4"
               style={{ color: 'rgba(25,60,30,0.40)' }}>
              Browse by Sector
            </p>
            <h2
              className="font-display font-bold leading-[1.06]"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                letterSpacing: '-0.03em',
                color: 'var(--forest)',
              }}
            >
              Every agricultural category. One platform.
            </h2>
          </FadeUp>

          <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" stagger={0.07}>
            {SECTORS.map(s => (
              <StaggerItem key={s.id}>
                <Card3D className="h-full">
                  <Link href={`/produce?sector=${s.id}`}
                    className="group flex flex-col p-6 rounded-2xl h-full transition-all"
                    style={{
                      backgroundColor: 'var(--cream)',
                      border: '1.5px solid rgba(25,60,30,0.10)',
                    }}>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 flex-shrink-0
                                 transition-transform duration-200 group-hover:scale-110"
                      style={{ backgroundColor: 'var(--forest)', color: 'var(--lime)' }}
                    >
                      {s.icon}
                    </div>
                    <p className="font-display font-bold text-sm mb-1" style={{ color: 'var(--forest)' }}>{s.label}</p>
                    <p className="text-[11px] leading-snug mb-3 flex-1"
                       style={{ color: 'rgba(25,60,30,0.55)' }}>
                      {s.desc}
                    </p>
                    <p className="font-mono text-xs font-bold" style={{ color: s.color }}>
                      {s.count}
                    </p>
                  </Link>
                </Card3D>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: 'var(--forest)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="text-center mb-16 max-w-xl mx-auto">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4"
               style={{ color: 'var(--lime)' }}>
              How it works
            </p>
            <h2
              className="font-display font-bold text-white leading-[1.06]"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                letterSpacing: '-0.03em',
              }}
            >
              From browse to delivery in three steps.
            </h2>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map((h, i) => (
              <FadeUp key={h.step} delay={i * 0.10}>
                <div
                  className="rounded-2xl p-7 h-full"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.10)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                         style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
                      {h.icon}
                    </div>
                    <p className="font-mono font-extrabold text-3xl"
                       style={{ color: 'rgba(255,255,255,0.10)' }}>
                      {h.step}
                    </p>
                  </div>
                  <h3 className="font-display font-bold text-base text-white mb-2"
                      style={{ letterSpacing: '-0.02em' }}>
                    {h.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {h.body}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST PILLARS ─────────────────────────────────────────── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="max-w-lg mb-14">
            <h2
              className="font-display font-bold leading-[1.06]"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                letterSpacing: '-0.03em',
                color: 'var(--forest)',
              }}
            >
              Why trust AgroConnect?
            </h2>
          </FadeUp>
          <StaggerGrid className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.08}>
            {TRUST.map(t => (
              <StaggerItem key={t.title}>
                <div
                  className="flex flex-col gap-4 p-6 rounded-2xl h-full"
                  style={{ backgroundColor: 'white', border: '1.5px solid rgba(25,60,30,0.10)' }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                       style={{ backgroundColor: 'var(--forest)', color: 'var(--lime)' }}>
                    {t.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-sm mb-2"
                        style={{ color: 'var(--forest)', letterSpacing: '-0.01em' }}>
                      {t.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(25,60,30,0.60)' }}>
                      {t.body}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
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
            Start buying or selling today.
          </h2>
          <p className="text-base mb-10 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Register free. Field-verify your farm. Go live in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login"
              className="px-8 py-4 font-bold text-sm rounded-full transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
              Create Account
            </Link>
            <Link href="/produce"
              className="px-8 py-4 font-bold text-sm rounded-full transition-all hover:opacity-80"
              style={{
                backgroundColor: 'transparent',
                color: 'white',
                border: '1.5px solid rgba(255,255,255,0.30)',
              }}>
              Browse Listings
            </Link>
          </div>
        </FadeUp>
      </section>

    </main>
  )
}
