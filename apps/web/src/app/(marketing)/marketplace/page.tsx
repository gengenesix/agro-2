import type { Metadata } from 'next'
import Image             from 'next/image'
import Link              from 'next/link'
import {
  FadeUp, FadeIn, SlideLeft, SlideRight,
  StaggerGrid, StaggerItem, Card3D,
} from '../_components/animate-in'

export const metadata: Metadata = {
  title:       'Marketplace — AgroConnect',
  description: "Ghana's largest verified agricultural marketplace. Buy and sell crops, livestock, poultry, fisheries, and agro-inputs with escrow-backed payments.",
}

const SECTORS = [
  {
    id: 'crops', label: 'Crops', count: '12,400+',
    desc: 'Maize, tomato, cassava, rice, yam and more',
    accent: 'var(--sector-crops)', bg: 'var(--sector-crops-bg)',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/>
        <circle cx="12" cy="9" r="2.5"/>
      </svg>
    ),
  },
  {
    id: 'livestock', label: 'Livestock', count: '3,200+',
    desc: 'Cattle, goats, sheep, and herd animals',
    accent: 'var(--sector-livestock)', bg: 'var(--sector-livestock-bg)',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 7h-3.5c-.5-1-1.5-2-3-2H10c-1.5 0-2.5 1-3 2H4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
        <path d="M8 16v3M16 16v3"/>
      </svg>
    ),
  },
  {
    id: 'poultry', label: 'Poultry', count: '5,800+',
    desc: 'Broilers, layers, eggs, and day-old chicks',
    accent: 'var(--sector-poultry)', bg: 'var(--sector-poultry-bg)',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8 2 5 5 5 8c0 4 4 7 7 10 3-3 7-6 7-10 0-3-3-6-7-6z"/>
        <path d="M9 8h6M12 5v6"/>
      </svg>
    ),
  },
  {
    id: 'fisheries', label: 'Fisheries', count: '1,900+',
    desc: 'Tilapia, catfish, shrimp, and smoked fish',
    accent: 'var(--sector-fisheries)', bg: 'var(--sector-fisheries-bg)',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 12c0-2.5 2-5 5.5-5 2.5 0 5 2.5 5 5s-2.5 5-5 5c-3.5 0-5.5-2.5-5.5-5z"/>
        <path d="M6.5 12 2 9v6l4.5-3z"/>
        <circle cx="15" cy="10" r="1"/>
      </svg>
    ),
  },
  {
    id: 'inputs', label: 'Agro Inputs', count: '8,100+',
    desc: 'Seeds, fertilizers, pesticides, equipment',
    accent: 'var(--sector-inputs)', bg: 'var(--sector-inputs-bg)',
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <path d="M9 9h6M9 12h6M9 15h4"/>
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
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    title: 'Escrow-Backed Payments',
    body:  'Payment is collected at order and held in escrow. It is released to the seller only after you confirm delivery. No risk, no surprises.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    title: 'USSD Access',
    body:  'No smartphone required. Farmers and buyers in rural areas can access listings and place orders via *800*456# from any mobile phone.',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2"/>
        <path d="M12 18h.01"/>
      </svg>
    ),
  },
]

const STEPS = [
  { step: '01', title: 'Browse or Search', body: 'Filter by sector, region, price, and farming method. See verified seller scores and farm details before committing.' },
  { step: '02', title: 'Place Your Order', body: 'Select quantity. Pay via MTN MoMo, Vodafone Cash, AirtelTigo, or card. Your payment is held in escrow — not released until delivery.' },
  { step: '03', title: 'Receive & Confirm', body: 'Seller ships or arranges pickup. You confirm delivery. Escrow releases automatically. Dispute resolution available 24/7.' },
]

export default function MarketplacePage() {
  return (
    <main className="overflow-x-hidden">

      {/* Hero */}
      <section
        className="relative py-24 lg:py-32 overflow-hidden"
        style={{ backgroundColor: 'var(--forest)' }}
      >
        <div className="absolute inset-0 opacity-[0.03]"
             style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-12 items-center">
          <FadeUp>
            <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-8"
                  style={{ backgroundColor: 'rgba(255,255,255,0.10)', color: 'var(--lime)' }}>
              Marketplace
            </span>
            <h1 className="font-display font-extrabold text-white leading-[1.06] tracking-tight mb-6"
                style={{ fontSize: 'clamp(2.4rem, 4.5vw, 3.2rem)' }}>
              Ghana&apos;s largest<br />
              <em className="not-italic" style={{ color: 'var(--lime)' }}>verified produce</em><br />
              marketplace.
            </h1>
            <p className="text-base leading-relaxed mb-10 max-w-lg"
               style={{ color: 'rgba(255,255,255,0.65)' }}>
              Buy directly from verified farmers. Every listing is field-inspected,
              priced at source, and backed by escrow so your money is safe until delivery.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/produce"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 font-bold text-sm rounded-xl transition-all"
                style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
                Browse All Listings
                <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor"
                     strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </Link>
              <Link href="/login"
                className="inline-flex items-center justify-center px-7 py-4 font-bold text-sm rounded-xl transition-all"
                style={{ backgroundColor: 'rgba(255,255,255,0.10)', color: 'white' }}>
                Sell Your Produce
              </Link>
            </div>
          </FadeUp>

          <SlideRight>
            <div className="relative rounded-3xl overflow-hidden h-72 lg:h-96 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=80&fit=crop"
                alt="Fresh Ghanaian produce at market"
                fill sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                draggable={false}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,34,16,0.35), transparent)' }} />
            </div>
          </SlideRight>
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <FadeIn>
            <div className="flex flex-wrap items-center justify-center gap-8 text-center">
              {[
                { v: '18,500+', l: 'Live Listings' },
                { v: '24,000+', l: 'Verified Farmers' },
                { v: '16 / 16', l: 'Regions Active' },
                { v: '2.5%',    l: 'Commission Only' },
              ].map(s => (
                <div key={s.l}>
                  <p className="font-mono font-extrabold text-xl leading-none">{s.v}</p>
                  <p className="text-[11px] font-semibold uppercase tracking-wide mt-0.5 opacity-70">{s.l}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Sectors */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--forest)' }}>
              Browse by Sector
            </p>
            <h2 className="font-display text-3xl font-extrabold" style={{ color: 'var(--forest)' }}>
              Every agricultural category, one platform.
            </h2>
          </FadeUp>

          <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4" stagger={0.07}>
            {SECTORS.map(s => (
              <StaggerItem key={s.id}>
                <Link href={`/produce?sector=${s.id}`}
                  className="group flex flex-col items-center text-center p-5 rounded-2xl card-lift h-full"
                  style={{ backgroundColor: 'white', border: '1px solid var(--border)' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-3
                                  transition-transform duration-200 group-hover:scale-110"
                       style={{ backgroundColor: s.bg, color: s.accent }}>
                    {s.icon}
                  </div>
                  <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--forest)' }}>{s.label}</p>
                  <p className="text-[10px] leading-snug mb-2" style={{ color: 'var(--muted-foreground)' }}>{s.desc}</p>
                  <p className="font-mono text-xs font-bold" style={{ color: s.accent }}>{s.count}</p>
                </Link>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'white' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--forest)' }}>
              How it works
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold leading-snug"
                style={{ color: 'var(--forest)' }}>
              From browse to delivery in three steps.
            </h2>
          </FadeUp>

          <StaggerGrid className="grid md:grid-cols-3 gap-6" stagger={0.1}>
            {STEPS.map(h => (
              <StaggerItem key={h.step}>
                <Card3D className="h-full">
                  <div className="rounded-2xl p-7 h-full" style={{ backgroundColor: 'var(--cream)', border: '1px solid var(--border)' }}>
                    <p className="font-mono text-xs font-bold mb-4" style={{ color: 'var(--lime-dark)' }}>{h.step}</p>
                    <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--forest)' }}>{h.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{h.body}</p>
                  </div>
                </Card3D>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* Trust pillars */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="mb-12">
            <h2 className="font-display text-3xl font-extrabold" style={{ color: 'var(--forest)' }}>
              Why trust AgroConnect?
            </h2>
          </FadeUp>
          <StaggerGrid className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" stagger={0.08}>
            {TRUST.map(t => (
              <StaggerItem key={t.title}>
                <div className="rounded-2xl p-6 h-full" style={{ backgroundColor: 'white', border: '1px solid var(--border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                       style={{ backgroundColor: 'var(--forest)', color: 'var(--lime)' }}>
                    {t.icon}
                  </div>
                  <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--forest)' }}>{t.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{t.body}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-4" style={{ backgroundColor: 'var(--forest)' }}>
        <FadeUp>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Start buying or selling today.
          </h2>
          <p className="text-base mb-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.60)' }}>
            Register free. Field-verify your farm. Go live in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login"
              className="px-8 py-4 font-bold text-sm rounded-2xl transition-colors"
              style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
              Create Account
            </Link>
            <Link href="/produce"
              className="px-8 py-4 font-bold text-sm rounded-2xl transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.10)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
              Browse Listings
            </Link>
          </div>
        </FadeUp>
      </section>

    </main>
  )
}
