'use client'

import { useState } from 'react'
import Image        from 'next/image'

const TABS = [
  {
    id:    'farmers',
    label: 'Farmers',
    img1:  'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=500',
    img2:  'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&q=80&fit=crop',
    tall:  'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=600',
    features: [
      {
        title: 'Harvest Pledge Contracts',
        body:  'Lock in buyers before planting season. Receive a deposit into escrow at signing — you plant with confirmed payment.',
      },
      {
        title: 'BNPL Input Credit',
        body:  'AgroScore above 50 unlocks Buy Now Pay Later credit for seeds, fertilisers, and chemicals. Repayment aligns with harvest.',
      },
      {
        title: 'Field Agent Verification',
        body:  'A certified agent GPS-stamps your farm and produce. Verified listings attract premium buyers across all 16 regions.',
      },
    ],
  },
  {
    id:    'dealers',
    label: 'Input Dealers',
    img1:  'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&q=80&w=500',
    img2:  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80&fit=crop',
    tall:  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
    features: [
      {
        title: 'Escrow-Secured Orders',
        body:  'Farmer payment is collected and held at order creation. Your stock ships only against confirmed payment in escrow.',
      },
      {
        title: 'Regional Demand Forecasting',
        body:  'See aggregate demand for NPK, urea, and pesticides in Techiman, Tamale, and Sunyani before stocking.',
      },
      {
        title: 'BNPL Distribution Network',
        body:  'Extend credit-backed sales to farmers without carrying the credit risk yourself — AgroConnect manages the BNPL ledger.',
      },
    ],
  },
  {
    id:    'buyers',
    label: 'Buyers & Consumers',
    img1:  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=500',
    img2:  'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&q=80&w=600',
    tall:  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80&fit=crop',
    features: [
      {
        title: 'Forward Contract Reservations',
        body:  'Reserve unharvested produce months before the season ends. Deposit holds your price — balance paid on confirmed delivery.',
      },
      {
        title: 'Field-Verified Provenance',
        body:  'Every listing carries a verification tier. Blue badge = GPS-confirmed farm. Green star = lab-tested quality.',
      },
      {
        title: 'Direct Farm Ordering',
        body:  'Source tilapia from Volta Lake, maize from Bono East, or broilers from Eastern Region — no middlemen, clear pricing.',
      },
    ],
  },
]

export function PortalTabs() {
  const [active, setActive] = useState('farmers')
  const tab = TABS.find(t => t.id === active) ?? TABS[0]!

  return (
    <div>
      {/* Tab selector */}
      <div className="flex gap-2 mb-10 flex-wrap">
        {TABS.map(t => (
          <button key={t.id} type="button" onClick={() => setActive(t.id)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-colors
              ${active === t.id
                ? 'bg-forest text-white'
                : 'bg-cream border border-border text-muted-foreground hover:text-forest hover:bg-cream-dark'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid md:grid-cols-2 gap-8 items-start">

        {/* Left: two stacked photos */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/5]">
            <Image src={tab.img1} alt={tab.label} fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover" />
          </div>
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden aspect-square">
              <Image src={tab.img2} alt={tab.label} fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover" />
            </div>
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <Image src={tab.tall} alt={tab.label} fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover" />
            </div>
          </div>
        </div>

        {/* Right: feature bullets */}
        <div className="space-y-6 py-2">
          {tab.features.map((f, i) => (
            <div key={f.title} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-lime/20 border border-lime-dark/20
                              flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-mono text-xs font-bold text-lime-dark">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div>
                <p className="font-bold text-forest text-base mb-1">{f.title}</p>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
