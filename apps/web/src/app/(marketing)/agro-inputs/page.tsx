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
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12M12 12C12 7 8 4 4 4c0 4 3 8 8 8zM12 12c0-5 4-8 8-8 0 4-3 8-8 8"/>
      </svg>
    ),
    accent: 'var(--sector-crops)', bg: 'var(--sector-crops-bg)',
  },
  {
    label: 'Fertilizers', count: '1,800+',
    desc: 'NPK, urea, compost, and micronutrient blends for all crop types',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
    accent: 'var(--sector-livestock)', bg: 'var(--sector-livestock-bg)',
  },
  {
    label: 'Pesticides', count: '900+',
    desc: 'EPA-approved herbicides, fungicides, and insecticides',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a9 9 0 0 1 9 9c0 4-2.5 7-5 9l-4 2-4-2c-2.5-2-5-5-5-9a9 9 0 0 1 9-9z"/>
        <path d="M12 6v6l3 3"/>
      </svg>
    ),
    accent: 'var(--destructive)', bg: 'oklch(0.97 0.01 27)',
  },
  {
    label: 'Equipment', count: '1,100+',
    desc: 'Irrigation kits, sprayers, seeders, and post-harvest handling tools',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
    accent: 'var(--sector-inputs)', bg: 'var(--sector-inputs-bg)',
  },
]

const BNPL_TIERS = [
  {
    tier: 'Starter',
    score: '≥ 20',
    limit: 'GHS 500',
    rate: '8% flat',
    desc: 'For new farmers building their credit history',
    highlight: false,
  },
  {
    tier: 'Grower',
    score: '≥ 50',
    limit: 'GHS 2,000',
    rate: '6% flat',
    desc: 'For verified farmers with a growing trade record',
    highlight: false,
  },
  {
    tier: 'Established',
    score: '≥ 70',
    limit: 'GHS 10,000',
    rate: '5% flat',
    desc: 'For field-verified farmers with strong order history',
    highlight: true,
  },
  {
    tier: 'Commercial',
    score: '≥ 90',
    limit: 'GHS 50,000',
    rate: '4% flat',
    desc: 'For top-tier producers with completed harvest pledges',
    highlight: false,
  },
]

const PROCESS = [
  { step: '01', title: 'Check Your Score', body: 'Log in and view your AgroScore. It is calculated from your verification level, order history, and repayment record.' },
  { step: '02', title: 'Select Inputs', body: 'Browse certified input dealers. Add seeds, fertilizers, or equipment to your cart. BNPL is shown automatically if your score qualifies.' },
  { step: '03', title: 'Buy Now, Pay Later', body: 'Choose BNPL at checkout. Inputs are dispatched immediately. Your repayment is scheduled to align with your harvest cycle — no penalty for early payment.' },
]

export default function AgroInputsPage() {
  return (
    <main className="overflow-x-hidden">

      {/* Hero */}
      <section className="relative min-h-[80vh] grid lg:grid-cols-[55%_45%] overflow-hidden"
               style={{ backgroundColor: 'var(--forest)' }}>
        <div className="flex items-center px-8 sm:px-12 lg:px-16 py-24 lg:py-0">
          <div className="max-w-xl">
            <FadeIn>
              <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-8"
                    style={{ backgroundColor: 'var(--sector-inputs-bg)', color: 'var(--sector-inputs)' }}>
                Agro Inputs
              </span>
            </FadeIn>
            <FadeUp delay={0.08}>
              <h1 className="font-display font-extrabold text-white leading-[1.06] tracking-tight mb-6"
                  style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)' }}>
                Quality inputs.<br />
                <em className="not-italic" style={{ color: 'var(--lime)' }}>
                  Pay after harvest.
                </em>
              </h1>
            </FadeUp>
            <FadeUp delay={0.18}>
              <p className="text-base leading-relaxed mb-10 max-w-lg"
                 style={{ color: 'rgba(255,255,255,0.65)' }}>
                Buy certified seeds, fertilizers, pesticides, and equipment today.
                Pay after your harvest with BNPL credit lines up to GHS&nbsp;50,000 —
                anchored to your AgroScore.
              </p>
            </FadeUp>
            <FadeUp delay={0.26}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/farmer/inputs"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 font-bold text-sm rounded-xl"
                  style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
                  Browse Inputs
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor"
                       strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </Link>
                <Link href="/login"
                  className="inline-flex items-center justify-center px-7 py-4 font-bold text-sm rounded-xl"
                  style={{ backgroundColor: 'rgba(255,255,255,0.10)', color: 'white' }}>
                  Check My AgroScore
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <Image
            src="https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=900&q=85&fit=crop"
            alt="Agro inputs — seeds and fertilizers"
            fill sizes="45vw"
            className="object-cover object-center"
            draggable={false}
          />
          <div className="absolute inset-0"
               style={{ background: 'linear-gradient(to right, var(--forest) 0%, transparent 35%)' }} />
        </div>
      </section>

      {/* Input categories */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--forest)' }}>
              Categories
            </p>
            <h2 className="font-display text-3xl font-extrabold" style={{ color: 'var(--forest)' }}>
              Everything your farm needs, in one place.
            </h2>
          </FadeUp>

          <StaggerGrid className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" stagger={0.08}>
            {CATEGORIES.map(c => (
              <StaggerItem key={c.label}>
                <Card3D className="h-full">
                  <Link href={`/farmer/inputs?category=${c.label.toLowerCase()}`}
                    className="group flex flex-col rounded-2xl p-6 h-full card-lift"
                    style={{ backgroundColor: 'white', border: '1px solid var(--border)' }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4
                                    transition-transform duration-200 group-hover:scale-110"
                         style={{ backgroundColor: c.bg, color: c.accent }}>
                      {c.icon}
                    </div>
                    <p className="font-bold text-base mb-1" style={{ color: 'var(--forest)' }}>{c.label}</p>
                    <p className="text-sm leading-relaxed flex-1 mb-3" style={{ color: 'var(--muted-foreground)' }}>{c.desc}</p>
                    <p className="font-mono text-xs font-bold" style={{ color: c.accent }}>{c.count} listings</p>
                  </Link>
                </Card3D>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* BNPL tiers */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'var(--forest)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="text-center mb-14 max-w-2xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--lime)' }}>
              BNPL Credit Tiers
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white leading-snug">
              Your AgroScore unlocks your credit line.
            </h2>
            <p className="mt-4 text-base" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Build your score by completing verified orders, pledges, and BNPL repayments.
              Every transaction moves you up a tier.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BNPL_TIERS.map((t, i) => (
              <FadeUp key={t.tier} delay={i * 0.09}>
                <div
                  className="rounded-2xl p-6 h-full flex flex-col"
                  style={t.highlight ? {
                    backgroundColor: 'var(--lime)',
                    color: 'var(--forest)',
                    boxShadow: '0 0 0 2px var(--lime)',
                  } : {
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.10)',
                  }}
                >
                  <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${t.highlight ? 'opacity-70' : ''}`}
                     style={{ color: t.highlight ? 'var(--forest)' : 'rgba(255,255,255,0.45)' }}>
                    AgroScore {t.score}
                  </p>
                  <p className={`font-bold text-lg mb-0.5 ${t.highlight ? '' : 'text-white'}`}
                     style={{ color: t.highlight ? 'var(--forest)' : undefined }}>
                    {t.tier}
                  </p>
                  <p className={`font-mono font-extrabold text-3xl mb-1 ${t.highlight ? '' : 'text-white'}`}
                     style={{ color: t.highlight ? 'var(--forest)' : undefined }}>
                    {t.limit}
                  </p>
                  <p className={`text-xs font-semibold mb-3 ${t.highlight ? 'opacity-60' : ''}`}
                     style={{ color: t.highlight ? 'var(--forest)' : 'rgba(255,255,255,0.50)' }}>
                    @ {t.rate}
                  </p>
                  <p className={`text-sm flex-1 leading-relaxed`}
                     style={{ color: t.highlight ? 'rgba(10,34,16,0.70)' : 'rgba(255,255,255,0.50)' }}>
                    {t.desc}
                  </p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* How BNPL works */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'white' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="text-center mb-12 max-w-xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--forest)' }}>
              How BNPL Works
            </p>
            <h2 className="font-display text-3xl font-extrabold leading-snug" style={{ color: 'var(--forest)' }}>
              Inputs today. Pay after harvest.
            </h2>
          </FadeUp>
          <StaggerGrid className="grid md:grid-cols-3 gap-6" stagger={0.1}>
            {PROCESS.map(p => (
              <StaggerItem key={p.step}>
                <Card3D className="h-full">
                  <div className="rounded-2xl p-7 h-full"
                       style={{ backgroundColor: 'var(--cream)', border: '1px solid var(--border)' }}>
                    <p className="font-mono font-bold text-xs mb-4" style={{ color: 'var(--lime-dark)' }}>{p.step}</p>
                    <h3 className="font-bold text-lg mb-2" style={{ color: 'var(--forest)' }}>{p.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{p.body}</p>
                  </div>
                </Card3D>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-4" style={{ backgroundColor: 'var(--forest)' }}>
        <FadeUp>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Start farming with credit confidence.
          </h2>
          <p className="text-base mb-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.60)' }}>
            Verify your farm. Build your AgroScore. Unlock credit before next season.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login"
              className="px-8 py-4 font-bold text-sm rounded-2xl"
              style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
              Check My Eligibility
            </Link>
            <Link href="/farmer/inputs"
              className="px-8 py-4 font-bold text-sm rounded-2xl"
              style={{ backgroundColor: 'rgba(255,255,255,0.10)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
              Browse Inputs
            </Link>
          </div>
        </FadeUp>
      </section>

    </main>
  )
}
