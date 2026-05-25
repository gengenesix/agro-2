'use client'

import { useState }                    from 'react'
import Link                            from 'next/link'
import { motion, AnimatePresence }     from 'framer-motion'

const ease = [0.22, 1, 0.36, 1] as const

const TABS = [
  {
    id:       'farmers',
    label:    'Farmers',
    headline: 'Built for every farmer across all 16 regions of Ghana.',
    sub:      'From smallholders in Northern Region to commercial operations in Ashanti — one platform for produce listing, escrow credit, and certified field verification.',
    cta:      { label: 'Start as a Farmer', href: '/login' },
    features: [
      {
        title: 'Harvest Pledge Contracts',
        body:  'Lock in buyers before planting season. Receive a verified deposit into escrow at signing — you plant with confirmed, guaranteed payment already secured.',
      },
      {
        title: 'BNPL Input Credit',
        body:  'AgroScore above 50 unlocks Buy Now Pay Later credit for seeds, fertilisers, and chemicals. Repayment is aligned with your harvest cycle, not a bank calendar.',
      },
      {
        title: 'Field Agent Verification',
        body:  'A certified agent GPS-stamps your farm and produce. Verified listings carry a trust badge that attracts premium buyers and higher contract prices across all regions.',
      },
    ],
  },
  {
    id:       'dealers',
    label:    'Input Dealers',
    headline: 'A distribution channel backed by guaranteed payment infrastructure.',
    sub:      'No more chasing payments after dispatch. Farmer funds are held in escrow before your stock leaves the warehouse — release is automatic on delivery confirmation.',
    cta:      { label: 'Register Your Business', href: '/login' },
    features: [
      {
        title: 'Escrow-Secured Orders',
        body:  'Farmer payment is collected and held at order creation. Your stock ships only against confirmed payment in escrow — zero cash-flow risk on every order.',
      },
      {
        title: 'Regional Demand Forecasting',
        body:  'See aggregate demand for NPK, urea, and pesticides in Techiman, Tamale, and Sunyani weeks ahead of the selling season so you stock exactly what sells.',
      },
      {
        title: 'BNPL Distribution Network',
        body:  'Extend credit-backed sales to farmers without carrying the credit risk yourself. AgroConnect manages the full BNPL ledger, collections, and default protection.',
      },
    ],
  },
  {
    id:       'buyers',
    label:    'Buyers & Consumers',
    headline: 'Source direct from verified farms — no middlemen, transparent pricing.',
    sub:      'Reserve unharvested maize from Bono East, procure certified tilapia from Volta Lake, or order broilers from Eastern Region with escrow-backed delivery guarantees.',
    cta:      { label: 'Browse Live Produce', href: '/produce' },
    features: [
      {
        title: 'Forward Contract Reservations',
        body:  'Reserve unharvested produce months before the season ends. Your deposit locks the agreed price — the balance is charged only on confirmed delivery at your gate.',
      },
      {
        title: 'Field-Verified Provenance',
        body:  'Every listing carries a verification tier. Blue badge = GPS-confirmed farm location. Green star = lab-tested quality score. Full supply chain visibility on every item.',
      },
      {
        title: 'Direct Farm Ordering',
        body:  'Source tilapia from Volta Lake, maize from Bono East, or broilers from Eastern Region — direct from the producer, with clear pricing and no hidden commission markups.',
      },
    ],
  },
]

export function PortalTabs() {
  const [active, setActive] = useState('farmers')
  const tab = TABS.find(t => t.id === active) ?? TABS[0]!

  return (
    <div>
      {/* ── Tab selector ──────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-10 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all
              ${active === t.id
                ? 'bg-forest text-white shadow-lg shadow-forest/20'
                : 'bg-white border border-border text-muted-foreground hover:text-forest hover:border-forest/30'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content — smooth crossfade between tabs ───────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.38, ease }}
        >
          {/* Headline + subtext */}
          <div className="mb-10 max-w-2xl">
            <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-forest mb-3 leading-snug">
              {tab.headline}
            </h3>
            <p className="text-muted-foreground text-base leading-relaxed">
              {tab.sub}
            </p>
          </div>

          {/* Feature cards — 3-column clean grid, no images */}
          <div className="grid sm:grid-cols-3 gap-5">
            {tab.features.map((f, i) => (
              <div
                key={f.title}
                className="bg-white rounded-2xl border border-border p-6
                           hover:shadow-lg hover:border-forest/20 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-lime/20 border border-lime-dark/20
                                flex items-center justify-center mb-5 group-hover:bg-lime/30
                                transition-colors">
                  <span className="font-mono text-sm font-bold text-lime-dark">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <h4 className="font-bold text-forest text-base mb-2 leading-snug">
                  {f.title}
                </h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {f.body}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8">
            <Link
              href={tab.cta.href}
              className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-white
                         font-bold text-sm rounded-xl hover:bg-forest-dark transition-colors
                         shadow-lg shadow-forest/15"
            >
              {tab.cta.label}
              <svg viewBox="0 0 16 16" width="13" height="13" fill="none"
                   stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4"/>
              </svg>
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
