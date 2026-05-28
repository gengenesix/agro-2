import type { Metadata } from 'next'
import Link             from 'next/link'

export const metadata: Metadata = {
  title:       'Features — AgroConnect',
  description: 'Harvest pledge escrow, AgroScore farmer credit, field agent verification, multi-currency settlement, and market intelligence — every feature built for global agricultural trade.',
}

const FEATURES = [
  {
    tag:   'Harvest Pledge System',
    id:    'pledges',
    title: 'Seasonal forward contracts with escrow-backed deposits.',
    body:  'International buyers commit a deposit (20–50%) at contract signing. The deposit is held in escrow by AgroConnect. Farmers plant with payment certainty. On delivery confirmation, escrow unlocks automatically and the remaining balance is charged — net of our 2.5% commission. No manual reconciliation.',
    detail: [
      'Pledge milestones: open → partially_pledged → fully_pledged → harvested → dispatched → delivered',
      'Farmer default protection: 100% deposit returned to buyer + AgroScore penalty',
      'Buyer cancellation: 50% of deposit compensates the farmer for preparation costs',
      'GPS progress logging by certified field agents at every milestone',
    ],
    accent: 'var(--harvest-gold)',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22V12M12 12C11 8 8 6 4 6c0 3.5 2.5 6.5 8 6Z" fill="currentColor" fillOpacity="0.15"/>
        <path d="M12 22V12M12 12C11 8 8 6 4 6c0 3.5 2.5 6.5 8 6ZM12 12c1-4 4-6 8-6 0 3.5-2.5 6.5-8 6Z"/>
      </svg>
    ),
  },
  {
    tag:   'Escrow Settlement Engine',
    id:    'escrow',
    title: 'Every payment is held until delivery is confirmed.',
    body:  'Buyer payments are collected and held in the seller\'s pending balance. On buyer delivery confirmation, AgroConnect releases escrow net of commission directly to the seller\'s available balance. Multi-currency support — USD, EUR, GBP, and local currency. All balance changes are wrapped in atomic database transactions.',
    detail: [
      'Multi-currency: USD, EUR, GBP, and local currency settlement',
      'Atomic wallet operations prevent double-spend edge cases',
      'Commission rates: 3.0% direct, 2.5% pledge, 1.5% inputs',
      'Full ledger audit trail per transaction — customs-compliant',
    ],
    accent: 'var(--verified-blue)',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" fill="currentColor" fillOpacity="0.10"/>
        <rect x="3" y="11" width="18" height="11" rx="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
  {
    tag:   'AgroScore Credit',
    id:    'agroscore',
    title: 'The world\'s first portable farmer credit profile.',
    body:  "Every transaction on AgroConnect builds a farmer's score — from 0 to 110. No bank account. No collateral. No history needed to start. The AgroScore lives only on AgroConnect — it gets more valuable with every trade and cannot be replicated elsewhere.",
    detail: [
      'Starter (score ≥ 20): up to $150 credit — input credit unlocked',
      'Grower  (score ≥ 50): up to $600 credit — Harvest Pledge listing',
      'Established (≥ 70):   up to $3,000 credit — international buyer access',
      'Commercial (≥ 90):    up to $15,000 credit — export contracts eligible',
    ],
    accent: 'var(--premium-green)',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill="currentColor" fillOpacity="0.12"/>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
  },
  {
    tag:   'Field Agent Verification',
    id:    'verification',
    title: 'GPS-stamped farm records from certified ground agents.',
    body:  'Field agents use the AgroConnect mobile app to register farmers offline — syncing when reconnected. Each farm is GPS-verified with photo evidence. Verified listings show a blue checkmark badge; lab-tested premium produce earns a green star. Top 10% sellers by volume receive a Gold Trophy badge automatically.',
    detail: [
      'Works offline — syncs on reconnect for rural coverage',
      'GPS coordinates embedded in every verified farm record',
      'Verification levels: Self-Declared → Field-Verified → Premium Certified',
      'Field agents earn per verified farmer successfully onboarded',
    ],
    accent: 'var(--sector-fisheries)',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"
              fill="currentColor" fillOpacity="0.10"/>
        <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
  },
  {
    tag:   'Market Intelligence',
    id:    'intelligence',
    title: 'Daily price feeds, weather alerts, and pest advisories.',
    body:  'Regional market prices are updated daily. Weather alerts are fetched every 6 hours and broadcast as SMS if conditions are critical. Pest advisories are pushed to all registered farmers in the affected region. Available via mobile app and offline channels for rural coverage.',
    detail: [
      'Commodity prices across all regions and sectors — updated daily',
      'Weather: Open-Meteo API, 7-day forecasts, critical alert SMS delivery',
      'Offline channel access ensures coverage for feature-phone farmers',
      'Weekly digest email for enterprise buyer subscription accounts',
    ],
    accent: 'var(--sector-poultry)',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
  {
    tag:   'Multi-Role Portals',
    id:    'portals',
    title: 'Dedicated dashboards for every actor in the chain.',
    body:  'Each role — Farmer, Agro-Input Dealer, International Buyer, Consumer, Field Agent, and Super Admin — gets a purpose-built portal with role-specific navigation, wallet, order management, and analytics. Notifications are role-aware; action URLs in every notification land on the correct portal page.',
    detail: [
      'Farmer: listings, harvest pledges, AgroScore credit, wallet',
      'Dealer: inventory, demand forecasting, escrow wallet',
      'International Buyer: marketplace, pledge reservations, customs audit trail',
      'Field Agent: farmer registration queue, verification dispatch',
    ],
    accent: 'var(--sector-livestock)',
    icon: (
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
           strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" fill="currentColor" fillOpacity="0.12"/>
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1" fill="currentColor" fillOpacity="0.12"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
]

export default function FeaturesPage() {
  return (
    <main>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section
        className="relative py-20 lg:py-28 overflow-hidden"
        style={{ backgroundColor: 'var(--forest)' }}
      >
        <div className="absolute top-0 right-0 bottom-0 w-1.5" style={{ backgroundColor: 'var(--lime)', opacity: 0.5 }} />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <span
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]
                       px-3 py-1.5 mb-10 inline-block"
            style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}
          >
            Platform Features
          </span>
          <h1
            className="font-display font-bold text-white leading-[0.93] mb-6"
            style={{
              fontSize: 'clamp(2.8rem, 6vw, 5rem)',
              letterSpacing: '-0.04em',
            }}
          >
            Every feature built for how<br />
            <span style={{ color: 'var(--lime)' }}>agricultural trade works.</span>
          </h1>
          <p className="text-lg leading-relaxed max-w-2xl" style={{ color: 'rgba(255,255,255,0.55)' }}>
            No generic marketplace logic. Each component — from escrow settlement to AgroScore
            credit tiers — was designed around the seasonal rhythms and payment realities
            of smallholder farms, cross-border buyers, and input distribution chains.
          </p>
        </div>
      </section>

      {/* ── Feature list ────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28" style={{ backgroundColor: 'var(--cream)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          {FEATURES.map((f) => (
            <div
              key={f.id}
              id={f.id}
              className="bg-white p-7 sm:p-9 scroll-mt-24"
              style={{
                border: '1.5px solid rgba(25,60,30,0.08)',
                borderLeft: `4px solid ${f.accent}`,
              }}
            >
              <div className="flex items-start gap-4 mb-5">
                <div
                  className="w-11 h-11 flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${f.accent} 12%, transparent)`,
                    color: f.accent,
                    clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))',
                  }}
                >
                  {f.icon}
                </div>
                <div>
                  <span
                    className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 mb-2"
                    style={{
                      backgroundColor: 'var(--cream)',
                      color: 'rgba(25,60,30,0.50)',
                      border: '1px solid rgba(25,60,30,0.10)',
                    }}
                  >
                    {f.tag}
                  </span>
                  <h2
                    className="font-display font-bold text-forest leading-snug"
                    style={{ fontSize: 'clamp(1.1rem, 2vw, 1.4rem)', letterSpacing: '-0.02em' }}
                  >
                    {f.title}
                  </h2>
                </div>
              </div>
              <p className="text-base leading-relaxed mb-5 pl-0 sm:pl-15"
                 style={{ color: 'rgba(25,60,30,0.65)' }}>
                {f.body}
              </p>
              <ul className="grid sm:grid-cols-2 gap-2">
                {f.detail.map((d) => (
                  <li key={d} className="flex items-start gap-2.5 text-sm"
                      style={{ color: 'rgba(25,60,30,0.60)' }}>
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none"
                         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                         className="shrink-0 mt-0.5" style={{ color: f.accent }}>
                      <path d="M3 8l3.5 3.5L13 4.5"/>
                    </svg>
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section
        className="py-24 text-center px-4 relative overflow-hidden"
        style={{ backgroundColor: 'var(--forest)' }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--lime)', opacity: 0.4 }} />
        <h2
          className="font-display font-bold text-white leading-[0.94] mb-5"
          style={{
            fontSize: 'clamp(2rem, 4vw, 3.2rem)',
            letterSpacing: '-0.04em',
          }}
        >
          See it in action.
        </h2>
        <p className="text-base mb-10 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Register and your first verified listing or pledge contract is live within minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="px-8 py-4 font-bold text-sm transition-all hover:opacity-90"
            style={{
              backgroundColor: 'var(--lime)',
              color: 'var(--forest)',
              clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
            }}
          >
            Create Account
          </Link>
          <Link
            href="/about"
            className="px-8 py-4 font-bold text-sm text-white transition-all hover:bg-white/10"
            style={{ border: '1.5px solid rgba(255,255,255,0.25)' }}
          >
            About AgroConnect
          </Link>
        </div>
      </section>

    </main>
  )
}
