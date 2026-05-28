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
  },
]

export default function FeaturesPage() {
  return (
    <main>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="bg-forest py-20 lg:py-28 text-center px-4">
        <p className="text-lime text-xs font-bold uppercase tracking-widest mb-5">
          Platform Features
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white
                       leading-tight mb-6 max-w-3xl mx-auto">
          Every feature built for how global agricultural trade actually works.
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
          No generic marketplace logic. Each component — from escrow settlement to AgroScore
          credit tiers — was designed around the seasonal rhythms and payment realities
          of smallholder farms, cross-border buyers, and input distribution chains.
        </p>
      </section>

      {/* ── Feature list ────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          {FEATURES.map((f) => (
            <div key={f.id} id={f.id}
              className="bg-white rounded-2xl border border-border p-7 sm:p-9
                         scroll-mt-24">
              <span className="inline-block text-xs font-bold text-forest uppercase
                               tracking-widest bg-cream border border-border
                               px-3 py-1 rounded-full mb-4">
                {f.tag}
              </span>
              <h2 className="font-display text-2xl font-extrabold text-forest mb-3">
                {f.title}
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-5">
                {f.body}
              </p>
              <ul className="space-y-2">
                {f.detail.map((d) => (
                  <li key={d} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                    <svg viewBox="0 0 16 16" width="14" height="14" fill="none"
                         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                         className="text-lime-dark shrink-0 mt-0.5">
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
      <section className="bg-forest py-20 text-center px-4">
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-5">
          See it in action.
        </h2>
        <p className="text-white/60 text-base mb-8 max-w-md mx-auto">
          Register and your first verified listing or pledge contract is live within minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login"
            className="px-8 py-4 font-bold text-sm rounded-full transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
            Create Account
          </Link>
          <Link href="/about"
            className="px-8 py-4 font-bold text-sm rounded-full transition-all hover:opacity-80"
            style={{
              backgroundColor: 'rgba(255,255,255,0.10)',
              color: 'white',
            }}>
            About AgroConnect
          </Link>
        </div>
      </section>

    </main>
  )
}
