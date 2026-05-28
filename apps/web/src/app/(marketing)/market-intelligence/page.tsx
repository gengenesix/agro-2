import type { Metadata } from 'next'
import Image             from 'next/image'
import Link              from 'next/link'
import {
  FadeUp, FadeIn, SlideLeft, SlideRight,
  StaggerGrid, StaggerItem, Card3D,
} from '../_components/animate-in'

export const metadata: Metadata = {
  title:       'Market Intelligence — AgroConnect',
  description: 'Daily commodity prices, 7-day weather forecasts, and pest advisories across all regions. Access via app or offline channels — built for farmers everywhere.',
}

const INTEL_FEATURES = [
  {
    title: 'Daily Market Prices',
    stat:  '40+ Commodities',
    body:  'Price feeds for maize, tomato, cocoa, tilapia, yam, and 40+ more commodities — updated every morning from regional market data sources across our pilot regions.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    title: '7-Day Weather Forecasts',
    stat:  'Updated Every 6 hrs',
    body:  'Hyperlocal forecasts for all 16 regions. Critical weather alerts trigger automatic SMS broadcast to all farmers in the affected region.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
      </svg>
    ),
  },
  {
    title: 'Pest & Disease Alerts',
    stat:  'All Active Regions',
    body:  'Regional pest advisories pushed to all registered farmers in an affected area. Outbreak maps, severity levels, and expert-sourced treatment recommendations.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    title: 'Offline & SMS Access',
    stat:  'Any Basic Phone',
    body:  'No smartphone or internet required. Access prices, weather, and alerts via USSD or SMS from any basic mobile phone — essential for rural farmers.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2"/>
        <path d="M12 18h.01"/>
        <path d="M9 7h6M9 11h6M9 15h4"/>
      </svg>
    ),
  },
]

const PRICE_SNAPSHOT = [
  { crop: 'White Maize',    region: 'Ashanti',       price: 'GHS 320',   unit: 'per bag',  trend: 'up'   },
  { crop: 'Roma Tomatoes',  region: 'Greater Accra', price: 'GHS 180',   unit: 'per crate', trend: 'down' },
  { crop: 'Dried Tilapia',  region: 'Volta',         price: 'GHS 95',    unit: 'per kg',   trend: 'up'   },
  { crop: 'Cocoa Beans',    region: 'Western',       price: 'GHS 1,200', unit: 'per bag',  trend: 'flat' },
  { crop: 'Cassava',        region: 'Eastern',       price: 'GHS 55',    unit: 'per bag',  trend: 'up'   },
  { crop: 'Broiler Chicken',region: 'Greater Accra', price: 'GHS 85',    unit: 'per bird', trend: 'down' },
]

function TrendIcon({ dir }: { dir: string }) {
  if (dir === 'up') return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
         style={{ color: 'hsl(140,50%,35%)' }}>
      <path d="M3 11l5-6 5 6"/>
    </svg>
  )
  if (dir === 'down') return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
         style={{ color: 'hsl(0,65%,52%)' }}>
      <path d="M3 5l5 6 5-6"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
         strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
         style={{ color: 'rgba(25,60,30,0.35)' }}>
      <path d="M3 8h10"/>
    </svg>
  )
}

export default function MarketIntelligencePage() {
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
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                </svg>
                Market Intelligence
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
                Prices, weather &amp;{' '}
                <em
                  className="not-italic"
                  style={{
                    color: 'var(--lime)',
                    WebkitTextStroke: '1.5px var(--forest)',
                  }}
                >
                  alerts
                </em>
                <br />
                for every region.
              </h1>
            </FadeUp>

            <FadeUp delay={0.15}>
              <p className="text-lg leading-relaxed mb-10 max-w-lg"
                 style={{ color: 'rgba(25,60,30,0.62)' }}>
                Real-time commodity prices, 7-day weather forecasts, and pest advisories —
                across all active regions. Access via app or offline channels
                from any phone, including basic handsets.
              </p>
            </FadeUp>

            <FadeUp delay={0.22}>
              <div className="flex flex-wrap gap-3 mb-14">
                <Link href="/login"
                  className="inline-flex items-center gap-2 px-7 py-3.5 font-bold text-sm rounded-full
                             transition-all hover:opacity-90 active:scale-[0.97]"
                  style={{ backgroundColor: 'var(--forest)', color: 'white' }}>
                  Access Intelligence
                  <svg viewBox="0 0 16 16" width="13" height="13" fill="none"
                       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </Link>
                <div
                  className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-bold"
                  style={{
                    backgroundColor: 'white',
                    color: 'var(--forest)',
                    border: '1.5px solid rgba(25,60,30,0.15)',
                  }}
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor"
                       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2"/>
                    <path d="M12 18h.01"/>
                  </svg>
                  Works Offline Too
                </div>
              </div>
            </FadeUp>

            <FadeIn delay={0.30}>
              <div className="flex items-center gap-6">
                {[
                  { v: '40+', l: 'Commodities Tracked' },
                  { v: '6+', l: 'Regions Active' },
                  { v: 'Every 6 hrs', l: 'Price Updates' },
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
            src="https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=900&q=85&fit=crop"
            alt="Market price data and analytics"
            fill sizes="48vw"
            className="object-cover object-center"
            draggable={false}
          />
          <div className="absolute inset-0"
               style={{ background: 'linear-gradient(to right, var(--cream) 0%, transparent 22%)' }} />

          {/* Weather card */}
          <div className="absolute top-16 left-10 z-10">
            <div
              className="rounded-2xl px-5 py-4 min-w-[190px]"
              style={{
                backgroundColor: 'white',
                boxShadow: '0 8px 32px rgba(10,34,16,0.15)',
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2"
                 style={{ color: 'rgba(25,60,30,0.40)' }}>
                Ashanti Region
              </p>
              <p className="font-mono font-extrabold text-3xl leading-none"
                 style={{ color: 'var(--forest)' }}>
                28°C
              </p>
              <p className="text-[11px] mt-1" style={{ color: 'rgba(25,60,30,0.50)' }}>
                Partly cloudy · 62% humidity
              </p>
            </div>
          </div>

          {/* USSD card */}
          <div className="absolute bottom-16 left-10 z-10">
            <div
              className="rounded-2xl px-5 py-4"
              style={{
                backgroundColor: 'var(--forest)',
                boxShadow: '0 8px 32px rgba(10,34,16,0.30)',
              }}
            >
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1"
                 style={{ color: 'rgba(255,255,255,0.45)' }}>
                No Smartphone
              </p>
              <p className="font-display font-extrabold text-lg"
                 style={{ color: 'var(--lime)' }}>
                Any Basic Phone
              </p>
            </div>
          </div>
        </div>

        {/* Mobile image */}
        <div className="lg:hidden relative h-64 w-full">
          <Image
            src="https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=900&q=85&fit=crop"
            alt="Market data" fill sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0"
               style={{ background: 'linear-gradient(to top, var(--cream), transparent 50%)' }} />
        </div>
      </section>

      {/* ── LIVE PRICE TABLE ──────────────────────────────────────── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: 'white' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1fr_340px] gap-14 items-start">

            <SlideLeft>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-4"
                   style={{ color: 'rgba(25,60,30,0.40)' }}>
                  Today&apos;s Prices
                </p>
                <h2
                  className="font-display font-bold leading-[1.06] mb-8"
                  style={{
                    fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                    letterSpacing: '-0.03em',
                    color: 'var(--forest)',
                  }}
                >
                  Live price snapshot.
                </h2>

                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ border: '1.5px solid rgba(25,60,30,0.10)' }}
                >
                  <div
                    className="grid grid-cols-4 px-5 py-3 text-[10px] font-bold uppercase tracking-widest"
                    style={{
                      backgroundColor: 'var(--forest)',
                      color: 'rgba(255,255,255,0.50)',
                    }}
                  >
                    <span className="col-span-2">Commodity</span>
                    <span>Region</span>
                    <span className="text-right">Price</span>
                  </div>
                  {PRICE_SNAPSHOT.map((p, i) => (
                    <div
                      key={p.crop}
                      className="grid grid-cols-4 px-5 py-4 items-center text-sm"
                      style={{
                        borderTop: '1px solid rgba(25,60,30,0.07)',
                        backgroundColor: i % 2 === 0 ? 'white' : 'var(--cream)',
                      }}
                    >
                      <div className="col-span-2 flex items-center gap-2.5">
                        <TrendIcon dir={p.trend} />
                        <span className="font-semibold" style={{ color: 'var(--forest)' }}>{p.crop}</span>
                      </div>
                      <span className="text-xs" style={{ color: 'rgba(25,60,30,0.50)' }}>{p.region}</span>
                      <div className="text-right">
                        <span className="font-mono font-bold" style={{ color: 'var(--forest)' }}>{p.price}</span>
                        <span className="text-[10px] ml-1" style={{ color: 'rgba(25,60,30,0.40)' }}>{p.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] mt-3" style={{ color: 'rgba(25,60,30,0.40)' }}>
                  Indicative prices. Login to see live data for all commodities and regions.
                </p>
              </div>
            </SlideLeft>

            <SlideRight>
              <div className="space-y-4 lg:sticky lg:top-24">
                {/* Weather card */}
                <Card3D>
                  <div
                    className="rounded-2xl p-6"
                    style={{
                      backgroundColor: 'var(--cream)',
                      border: '1.5px solid rgba(25,60,30,0.10)',
                    }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                           style={{ backgroundColor: 'var(--forest)', color: 'var(--lime)' }}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-sm" style={{ color: 'var(--forest)' }}>Ashanti Region</p>
                        <p className="text-[11px]" style={{ color: 'rgba(25,60,30,0.45)' }}>Updated 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-end gap-3 mb-4">
                      <p className="font-mono font-extrabold text-4xl leading-none"
                         style={{ color: 'var(--forest)' }}>28°C</p>
                      <p className="text-sm mb-0.5" style={{ color: 'rgba(25,60,30,0.55)' }}>
                        Partly cloudy · 62% humidity
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => (
                        <div
                          key={d}
                          className="flex-1 rounded-xl px-1 py-2 text-center"
                          style={{ backgroundColor: 'white' }}
                        >
                          <p className="text-[9px] font-bold uppercase"
                             style={{ color: 'rgba(25,60,30,0.40)' }}>{d}</p>
                          <p className="font-mono font-bold text-sm mt-0.5"
                             style={{ color: 'var(--forest)' }}>
                            {[28, 27, 29, 30, 26][i]}°
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card3D>

                {/* Offline access card */}
                <Card3D>
                  <div
                    className="rounded-2xl p-6"
                    style={{ backgroundColor: 'var(--forest)' }}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-2"
                       style={{ color: 'var(--lime)' }}>
                      No Smartphone? No Problem.
                    </p>
                    <p className="font-display font-extrabold text-xl text-white mt-1">Offline Access</p>
                    <p className="text-sm mt-2.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      Check prices and weather on any basic mobile — all active regions covered via USSD and SMS.
                    </p>
                  </div>
                </Card3D>
              </div>
            </SlideRight>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────── */}
      <section className="py-24 lg:py-32" style={{ backgroundColor: 'var(--forest)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="max-w-xl mb-16">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-4"
               style={{ color: 'var(--lime)' }}>
              Intelligence Tools
            </p>
            <h2
              className="font-display font-bold text-white leading-[1.06]"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                letterSpacing: '-0.03em',
              }}
            >
              Everything you need to trade smarter.
            </h2>
          </FadeUp>

          <StaggerGrid className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" stagger={0.08}>
            {INTEL_FEATURES.map(f => (
              <StaggerItem key={f.title}>
                <div
                  className="rounded-2xl p-6 h-full flex flex-col"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.10)',
                  }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 flex-shrink-0"
                       style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
                    {f.icon}
                  </div>
                  <p className="font-mono text-xs font-bold mb-2"
                     style={{ color: 'var(--lime)' }}>
                    {f.stat}
                  </p>
                  <h3 className="font-bold text-sm text-white mb-2"
                      style={{ letterSpacing: '-0.01em' }}>
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed flex-1"
                     style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {f.body}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="py-24 text-center px-4" style={{ backgroundColor: 'var(--cream)' }}>
        <FadeUp>
          <h2
            className="font-bold mb-4"
            style={{
              fontSize: 'clamp(1.9rem, 4vw, 3rem)',
              letterSpacing: '-0.05em',
              color: 'var(--forest)',
            }}
          >
            Stay ahead of the market.
          </h2>
          <p className="text-base mb-10 max-w-md mx-auto"
             style={{ color: 'rgba(25,60,30,0.58)' }}>
            Register to unlock full price history, personalised alerts,
            and regional forecasts for your sector.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login"
              className="px-8 py-4 font-bold text-sm rounded-full transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--forest)', color: 'white' }}>
              Access Intelligence
            </Link>
            <Link href="/features#intelligence"
              className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full text-sm font-bold
                         transition-all hover:opacity-80"
              style={{
                backgroundColor: 'white',
                color: 'var(--forest)',
                border: '1.5px solid rgba(25,60,30,0.15)',
              }}
            >
              See All Features
            </Link>
          </div>
        </FadeUp>
      </section>

    </main>
  )
}
