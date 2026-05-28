import type { Metadata } from 'next'
import Image             from 'next/image'
import Link              from 'next/link'
import {
  FadeUp, FadeIn, SlideLeft, SlideRight,
  StaggerGrid, StaggerItem, Card3D,
} from '../_components/animate-in'

export const metadata: Metadata = {
  title:       'Market Intelligence — AgroConnect',
  description: 'Daily market prices, 7-day weather forecasts, and pest advisories for all 16 regions of Ghana. Access via app or USSD.',
}

const FEATURES = [
  {
    title: 'Daily Market Prices',
    body:  'Price feeds for maize, tomato, cocoa, tilapia, yam, and 40+ more commodities — updated every morning from Ghana Statistical Service and regional market sources.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    stat: '40+ commodities',
    accent: 'var(--sector-crops)',
    bg:     'var(--sector-crops-bg)',
  },
  {
    title: '7-Day Weather Forecasts',
    body:  'Hyperlocal forecasts for all 16 regions fetched every 6 hours from Open-Meteo. Critical weather alerts trigger automatic SMS broadcast to all farmers in the affected region.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
      </svg>
    ),
    stat: 'Updated every 6 hrs',
    accent: 'var(--sector-fisheries)',
    bg:     'var(--sector-fisheries-bg)',
  },
  {
    title: 'Pest & Disease Alerts',
    body:  'Regional pest advisories pushed to all registered farmers in an affected area. Outbreak maps, severity levels, and recommended treatments from Ghana MoFA extension data.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    stat: 'All 16 regions',
    accent: 'var(--destructive)',
    bg:     'oklch(0.98 0.01 27)',
  },
  {
    title: 'USSD & SMS Access',
    body:  'No smartphone or internet required. Dial *800*456# from any mobile phone to check prices, weather, and receive alerts. Essential for rural farmers in low-connectivity areas.',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2"/>
        <path d="M12 18h.01"/>
        <path d="M9 7h6M9 11h6M9 15h4"/>
      </svg>
    ),
    stat: 'Dial *800*456#',
    accent: 'var(--forest)',
    bg:     'var(--cream-dark)',
  },
]

const PRICE_SNAPSHOT = [
  { crop: 'White Maize',   region: 'Ashanti',        price: 'GHS 320',  unit: 'per bag', trend: 'up'   },
  { crop: 'Roma Tomatoes', region: 'Greater Accra',   price: 'GHS 180',  unit: 'per crate', trend: 'down' },
  { crop: 'Dried Tilapia', region: 'Volta',           price: 'GHS 95',   unit: 'per kg', trend: 'up'   },
  { crop: 'Cocoa Beans',   region: 'Western',         price: 'GHS 1,200',unit: 'per bag', trend: 'flat' },
  { crop: 'Cassava',       region: 'Eastern',         price: 'GHS 55',   unit: 'per bag', trend: 'up'   },
  { crop: 'Broiler Chicken',region: 'Greater Accra',  price: 'GHS 85',   unit: 'per bird', trend: 'down' },
]

function TrendIcon({ dir }: { dir: string }) {
  if (dir === 'up') return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
         style={{ color: 'oklch(0.48 0.18 145)' }}>
      <path d="M3 11l5-6 5 6"/>
    </svg>
  )
  if (dir === 'down') return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
         style={{ color: 'var(--destructive)' }}>
      <path d="M3 5l5 6 5-6"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
         style={{ color: 'var(--muted-foreground)' }}>
      <path d="M3 8h10"/>
    </svg>
  )
}

export default function MarketIntelligencePage() {
  return (
    <main className="overflow-x-hidden">

      {/* Hero */}
      <section className="relative py-24 lg:py-32 overflow-hidden"
               style={{ backgroundColor: 'var(--forest)' }}>
        <div className="absolute inset-0 opacity-[0.03]"
             style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <FadeIn>
              <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-8"
                    style={{ backgroundColor: 'var(--sector-fisheries-bg)', color: 'var(--sector-fisheries)' }}>
                Market Intelligence
              </span>
            </FadeIn>
            <FadeUp delay={0.08}>
              <h1 className="font-display font-extrabold text-white leading-[1.06] tracking-tight mb-6"
                  style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.4rem)' }}>
                Prices, weather &amp; alerts<br />
                <em className="not-italic" style={{ color: 'var(--sector-fisheries)' }}>
                  for every region.
                </em>
              </h1>
            </FadeUp>
            <FadeUp delay={0.18}>
              <p className="text-base leading-relaxed mb-10 max-w-lg"
                 style={{ color: 'rgba(255,255,255,0.65)' }}>
                Real-time commodity prices from the Ghana Statistical Service, 7-day
                weather forecasts, and pest advisories — all 16 regions. Access via app
                or USSD from any phone.
              </p>
            </FadeUp>
            <FadeUp delay={0.26}>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/login"
                  className="inline-flex items-center justify-center gap-2 px-7 py-4 font-bold text-sm rounded-xl"
                  style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
                  Access Intelligence
                  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor"
                       strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </Link>
                <div className="inline-flex items-center gap-2 px-5 py-4 rounded-xl text-sm font-semibold"
                     style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.70)' }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor"
                       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2"/>
                    <path d="M12 18h.01"/>
                  </svg>
                  USSD: *800*456#
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* Live price snapshot */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'white' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[1fr_380px] gap-12 items-start">
            <SlideLeft>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--forest)' }}>
                  Today&apos;s Prices
                </p>
                <h2 className="font-display text-3xl font-extrabold mb-6" style={{ color: 'var(--forest)' }}>
                  Live price snapshot.
                </h2>
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <div className="grid grid-cols-4 px-5 py-3 text-[10px] font-bold uppercase tracking-widest"
                       style={{ backgroundColor: 'var(--cream)', color: 'var(--muted-foreground)', borderBottom: '1px solid var(--border)' }}>
                    <span className="col-span-2">Commodity</span>
                    <span>Region</span>
                    <span className="text-right">Price</span>
                  </div>
                  {PRICE_SNAPSHOT.map((p, i) => (
                    <div key={p.crop}
                         className="grid grid-cols-4 px-5 py-3.5 items-center text-sm"
                         style={{
                           borderBottom: i < PRICE_SNAPSHOT.length - 1 ? '1px solid var(--border)' : 'none',
                           backgroundColor: i % 2 === 0 ? 'white' : 'var(--cream)',
                         }}>
                      <div className="col-span-2 flex items-center gap-2">
                        <TrendIcon dir={p.trend} />
                        <span className="font-semibold" style={{ color: 'var(--forest)' }}>{p.crop}</span>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{p.region}</span>
                      <div className="text-right">
                        <span className="font-mono font-bold" style={{ color: 'var(--forest)' }}>{p.price}</span>
                        <span className="text-[10px] ml-1" style={{ color: 'var(--muted-foreground)' }}>{p.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] mt-3" style={{ color: 'var(--muted-foreground)' }}>
                  * Indicative prices. Login to see live data for all commodities and regions.
                </p>
              </div>
            </SlideLeft>

            <SlideRight>
              <div className="space-y-4 lg:sticky lg:top-24">
                {/* Weather card */}
                <Card3D>
                  <div className="rounded-2xl p-6"
                       style={{ backgroundColor: 'var(--sector-fisheries-bg)', border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                           style={{ backgroundColor: 'var(--sector-fisheries)', color: 'white' }}>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-sm" style={{ color: 'var(--forest)' }}>Weather — Ashanti</p>
                        <p className="text-[11px]" style={{ color: 'var(--muted-foreground)' }}>Updated 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-end gap-3">
                      <p className="font-mono font-extrabold text-4xl" style={{ color: 'var(--forest)' }}>28°C</p>
                      <p className="text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>Partly cloudy · 62% humidity</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((d, i) => (
                        <div key={d} className="flex-1 rounded-xl px-1 py-2 text-center"
                             style={{ backgroundColor: 'rgba(255,255,255,0.50)' }}>
                          <p className="text-[9px] font-bold uppercase" style={{ color: 'var(--muted-foreground)' }}>{d}</p>
                          <p className="font-mono font-bold text-sm mt-0.5" style={{ color: 'var(--forest)' }}>
                            {[28, 27, 29, 30, 26][i]}°
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card3D>

                {/* USSD card */}
                <Card3D>
                  <div className="rounded-2xl p-6"
                       style={{ backgroundColor: 'var(--forest)', border: '1px solid rgba(255,255,255,0.10)' }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-1"
                       style={{ color: 'var(--lime)' }}>
                      No Smartphone? No Problem.
                    </p>
                    <p className="font-mono font-extrabold text-2xl text-white mt-1">*800*456#</p>
                    <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      Prices &amp; weather on any mobile — Ashanti, Brong-Ahafo, Northern, and all 16 regions.
                    </p>
                  </div>
                </Card3D>
              </div>
            </SlideRight>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <FadeUp className="mb-10">
            <h2 className="font-display text-3xl font-extrabold" style={{ color: 'var(--forest)' }}>
              Everything you need to farm smarter.
            </h2>
          </FadeUp>
          <StaggerGrid className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" stagger={0.08}>
            {FEATURES.map(f => (
              <StaggerItem key={f.title}>
                <div className="rounded-2xl p-6 h-full"
                     style={{ backgroundColor: 'white', border: '1px solid var(--border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                       style={{ backgroundColor: f.bg, color: f.accent }}>
                    {f.icon}
                  </div>
                  <p className="font-mono text-xs font-bold mb-2" style={{ color: f.accent }}>{f.stat}</p>
                  <h3 className="font-bold text-sm mb-2" style={{ color: 'var(--forest)' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{f.body}</p>
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
            Stay ahead of the market.
          </h2>
          <p className="text-base mb-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.60)' }}>
            Register to unlock full price history, personalised alerts,
            and regional forecasts for your sector.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login"
              className="px-8 py-4 font-bold text-sm rounded-2xl"
              style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
              Access Intelligence
            </Link>
            <div className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-sm font-semibold"
                 style={{ backgroundColor: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.70)', border: '1px solid rgba(255,255,255,0.15)' }}>
              USSD: *800*456# (No app needed)
            </div>
          </div>
        </FadeUp>
      </section>

    </main>
  )
}
