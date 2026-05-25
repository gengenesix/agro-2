import type { Metadata } from 'next'
import Link             from 'next/link'

export const metadata: Metadata = {
  title:       'Features — AgroConnect',
  description: 'Harvest pledge escrow, BNPL crop credit, field agent verification, market price feeds, and USSD access — every feature built for Ghanaian agriculture.',
}

const FEATURES = [
  {
    tag:   'Harvest Pledge System',
    id:    'pledges',
    title: 'Seasonal forward contracts with escrow-backed deposits.',
    body:  'Buyers commit a deposit (5–50%) at contract signing. The deposit is held in escrow by AgroConnect. Farmers plant with payment certainty. On delivery confirmation, escrow unlocks automatically and the remaining balance is charged — net of our 2.5% commission. No manual reconciliation.',
    detail: [
      'Pledge milestones: open → partially_pledged → fully_pledged → harvested → dispatched → delivered',
      'Farmer default protection: 100% deposit returned to buyer + score penalty',
      'Buyer cancellation: 50% of deposit compensates the farmer for preparation costs',
      'GPS progress logging by certified field agents',
    ],
  },
  {
    tag:   'Escrow Settlement Engine',
    id:    'escrow',
    title: 'Every payment is held until delivery is confirmed.',
    body:  'Buyer payments are collected via Paystack (MTN MoMo, Vodafone Cash, AirtelTigo, Visa/Mastercard) and held in the seller\'s pending balance. On buyer delivery confirmation, AgroConnect releases the escrow net of commission directly to the seller\'s available balance. All balance changes are wrapped in atomic database transactions — no race conditions.',
    detail: [
      'Atomic wallet operations prevent double-spend edge cases',
      'Commission rates: 3.0% direct, 2.5% pledge, 1.5% inputs, 0% BNPL',
      'Full ledger audit trail per transaction',
      'Paystack HMAC-SHA512 webhook verification — mandatory',
    ],
  },
  {
    tag:   'BNPL Crop Credit',
    id:    'bnpl',
    title: 'Buy Now Pay Later for agro-inputs, backed by harvest pledges.',
    body:  "Farmers with an AgroScore at or above 50 unlock credit lines for seeds, fertilisers, and agro-chemicals. Credit tiers are anchored to the AgroScore — a proprietary 0–110 score that weights verification level, order history, and BNPL repayment history. Repayment windows align with the farmer's harvest cycle.",
    detail: [
      'Starter (score ≥ 20): up to GHS 500 @ 8% flat',
      'Grower  (score ≥ 50): up to GHS 2,000 @ 6% flat',
      'Established (≥ 70): up to GHS 10,000 @ 5% flat',
      'Commercial (≥ 90): up to GHS 50,000 @ 4% flat',
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
      'Field agents earn per verified farmer onboarded',
    ],
  },
  {
    tag:   'Market Intelligence',
    id:    'intelligence',
    title: 'Daily price feeds, weather alerts, and pest advisories.',
    body:  'Regional market prices are updated daily from the Ghana Statistical Service feed. Weather alerts are fetched every 6 hours via Open-Meteo and broadcast as SMS if conditions are critical. Pest advisories are pushed to all registered farmers in the affected region.',
    detail: [
      'Prices: tomato, maize, cocoa, tilapia — all 16 regions',
      'Weather: Open-Meteo API, 7-day forecasts, critical alert SMS',
      'USSD access via *800*456# — no smartphone required',
      'Weekly digest email for buyer subscription accounts',
    ],
  },
  {
    tag:   'Multi-Role Portals',
    id:    'portals',
    title: 'Dedicated dashboards for every actor in the chain.',
    body:  'Each role — Farmer, Agro-Input Dealer, Buyer, Consumer, Field Agent, and Super Admin — gets a purpose-built portal with role-specific navigation, wallet, order management, and analytics. Notifications are role-aware; action URLs in every notification land on the correct portal page.',
    detail: [
      'Farmer: listings, harvest pledges, BNPL, AgroScore, wallet',
      'Dealer: inventory, demand forecasting, escrow wallet',
      'Buyer: marketplace, pledge reservations, enterprise analytics',
      'Field Agent: farmer registration queue, verification dispatch',
    ],
  },
]

export default function FeaturesPage() {
  return (
    <main>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-forest py-20 lg:py-28 text-center px-4">
        <p className="text-lime text-xs font-bold uppercase tracking-widest mb-5">
          Platform Features
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white
                       leading-tight mb-6 max-w-3xl mx-auto">
          Every feature built for how Ghanaian agriculture actually works.
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
          No generic marketplace logic. Each component — from escrow settlement to BNPL
          credit tiers — was designed around the seasonal rhythms and payment realities
          of Ghanaian farms, markets, and input distribution chains.
        </p>
      </section>

      {/* ── Feature list ──────────────────────────────────────────────────── */}
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

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-forest py-20 text-center px-4">
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-5">
          See it in action.
        </h2>
        <p className="text-white/60 text-base mb-8 max-w-md mx-auto">
          Register and your first verified listing or pledge contract is live within minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/login"
            className="px-8 py-4 bg-lime text-forest font-bold text-sm rounded-2xl
                       hover:bg-lime-dark transition-colors">
            Create Account
          </Link>
          <Link href="/about"
            className="px-8 py-4 bg-white/10 text-white font-bold text-sm rounded-2xl
                       hover:bg-white/20 transition-colors">
            About AgroConnect
          </Link>
        </div>
      </section>

    </main>
  )
}
