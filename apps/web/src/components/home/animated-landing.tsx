'use client'

import Link  from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  CropsIcon, LivestockIcon, PoultryIcon, FisheriesIcon, InputsIcon,
  SearchIcon, ChevronRightIcon, MapPinIcon, WeatherIcon, PricesIcon,
  HarvestPledgeIcon,
} from '@/components/shared/icons'
import { SectorChip }  from '@/components/shared/sector-chip'
import { PriceDisplay } from '@/components/shared/price-display'

// ─── Motion variants ──────────────────────────────────────────────────────────

const fadeUp = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
}

const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

const scaleIn = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
}

const stagger = (delay = 0.07) => ({
  hidden:  {},
  visible: { transition: { staggerChildren: delay } },
})

// ─── Data ─────────────────────────────────────────────────────────────────────

const SECTORS = [
  { id: 'crops',     label: 'Crops',     Icon: CropsIcon,     count: '12,400+', desc: 'Maize, Tomato, Cassava & more' },
  { id: 'livestock', label: 'Livestock', Icon: LivestockIcon,  count: '3,200+',  desc: 'Cattle, Goats, Sheep & more'  },
  { id: 'poultry',   label: 'Poultry',   Icon: PoultryIcon,   count: '5,800+',  desc: 'Broilers, Layers, Eggs'       },
  { id: 'fisheries', label: 'Fisheries', Icon: FisheriesIcon, count: '1,900+',  desc: 'Tilapia, Catfish, Shrimp'     },
  { id: 'inputs',    label: 'Inputs',    Icon: InputsIcon,    count: '8,100+',  desc: 'Seeds, Fertilizers, Equipment'},
] as const

const STATS = [
  { label: 'Active Farmers',   value: '24,000+' },
  { label: 'Live Listings',    value: '18,500+' },
  { label: 'Regions Covered',  value: '16/16'   },
  { label: 'BNPL Disbursed',   value: 'GHS 4.2M' },
]

const ACTIONS = [
  { href: '/produce',      label: 'Browse Produce',  Icon: CropsIcon,         color: 'text-sector-crops'     },
  { href: '/pledges',      label: 'Harvest Pledges', Icon: HarvestPledgeIcon, color: 'text-harvest-gold'     },
  { href: '/intelligence', label: 'Market Prices',   Icon: PricesIcon,        color: 'text-forest'           },
  { href: '/intelligence', label: 'Weather Alerts',  Icon: WeatherIcon,       color: 'text-sector-fisheries' },
]

const FEATURED = [
  {
    slug:     'fresh-organic-tomatoes-kumasi',
    title:    'Fresh Organic Tomatoes — Kumasi Farm',
    seller:   'Kwame A. Boateng',
    region:   'Ashanti',
    price:    2.50,
    unit:     'kg',
    qty:      500,
    sector:   'crops'     as const,
    category: 'Tomato',
    photo:    'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=80&fit=crop',
    score:    87,
    organic:  true,
  },
  {
    slug:     'maize-harvest-pledge-eastern',
    title:    '2-Month Maize Harvest — 5 Tonnes Reserved',
    seller:   'Abena Owusu Mensah',
    region:   'Eastern',
    price:    1.80,
    unit:     'kg',
    qty:      5000,
    sector:   'crops'     as const,
    category: 'Maize',
    photo:    'https://images.unsplash.com/photo-1568219557405-376e23e4f7cf?w=800&q=80&fit=crop',
    score:    72,
    pledge:   true,
    harvest:  '2025-09-15',
  },
  {
    slug:     'live-tilapia-volta-lake',
    title:    'Live Tilapia — Volta Lake Farm',
    seller:   'Yaw Darko Asante',
    region:   'Volta',
    price:    22.00,
    unit:     'kg',
    qty:      800,
    sector:   'fisheries' as const,
    category: 'Tilapia',
    photo:    'https://images.unsplash.com/photo-1570367823578-74b3ef1eba96?w=800&q=80&fit=crop',
    score:    65,
  },
] as const

const sectorClass: Record<string, string> = {
  crops:     'bg-sector-crops-bg     text-sector-crops',
  livestock: 'bg-sector-livestock-bg text-sector-livestock',
  poultry:   'bg-sector-poultry-bg   text-sector-poultry',
  fisheries: 'bg-sector-fisheries-bg text-sector-fisheries',
  inputs:    'bg-sector-inputs-bg    text-sector-inputs',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AnimatedLanding() {
  return (
    <main>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative bg-forest overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&q=80&fit=crop"
            alt="Ghana farmland"
            fill
            className="object-cover opacity-20"
            priority
            draggable={false}
          />
        </div>
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-20 lg:py-32">
          <motion.div
            className="max-w-2xl"
            initial="hidden"
            animate="visible"
            variants={stagger(0.1)}
          >
            <motion.p
              variants={fadeUp}
              className="inline-flex items-center gap-2 text-lime text-xs font-bold uppercase
                         tracking-widest mb-6 bg-white/10 px-3 py-1.5 rounded-full"
            >
              <MapPinIcon size={12} className="text-lime" />
              All 16 Regions of Ghana
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white
                         leading-tight mb-6"
            >
              From Seed to Sale.
              <br />
              <span className="text-lime">Every Farmer.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-white/70 text-lg leading-relaxed mb-8 max-w-xl"
            >
              Ghana&apos;s agricultural operating system. Buy produce, pledge harvests, access BNPL credit,
              and get real-time weather and market intelligence.
            </motion.p>

            <motion.div variants={fadeUp} className="flex gap-2 max-w-lg">
              <div className="flex-1 relative">
                <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tomatoes, fertilizer, tilapia..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-white text-forest text-sm
                             font-medium placeholder:text-muted-foreground/60 focus:outline-none
                             focus:ring-2 ring-lime"
                />
              </div>
              <Link
                href="/produce"
                className="flex items-center gap-1.5 px-6 py-4 bg-lime text-forest font-bold text-sm
                           rounded-xl hover:bg-lime-dark transition-colors whitespace-nowrap"
              >
                Browse
                <ChevronRightIcon size={16} />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-white/10"
            initial="hidden"
            animate="visible"
            variants={stagger(0.06)}
          >
            {STATS.map((s) => (
              <motion.div key={s.label} variants={fadeUp}>
                <p className="text-white font-mono font-extrabold text-2xl">{s.value}</p>
                <p className="text-white/50 text-xs font-medium">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Quick actions ────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            variants={stagger(0.06)}
          >
            {ACTIONS.map((a) => (
              <motion.div key={a.href + a.label} variants={scaleIn}>
                <Link
                  href={a.href}
                  className="flex items-center gap-3 p-3.5 rounded-xl bg-cream hover:bg-cream-dark
                             transition-colors border border-border group"
                >
                  <span className={`p-2 rounded-lg bg-white border border-border ${a.color}
                                   group-hover:scale-105 transition-transform`}>
                    <a.Icon size={18} />
                  </span>
                  <span className="text-sm font-semibold text-forest">{a.label}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Sectors ─────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          className="flex items-end justify-between mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div>
            <h2 className="text-2xl font-extrabold text-forest">Browse by Sector</h2>
            <p className="text-muted-foreground text-sm mt-1">All agricultural categories in one place.</p>
          </div>
        </motion.div>

        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger(0.07)}
        >
          {SECTORS.map((s) => (
            <motion.div key={s.id} variants={scaleIn}>
              <Link
                href={`/produce?sector=${s.id}`}
                className="group flex flex-col items-center text-center p-5 rounded-2xl bg-white
                           border border-border card-lift h-full"
              >
                <div className={`p-3.5 rounded-xl mb-3 transition-transform group-hover:scale-110
                  ${sectorClass[s.id] ?? ''}`}>
                  <s.Icon size={28} />
                </div>
                <p className="font-bold text-forest text-sm">{s.label}</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">{s.desc}</p>
                <p className="text-xs font-mono font-semibold text-forest mt-2">{s.count}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Featured listings ────────────────────────────────────────────── */}
      <section className="bg-cream py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            className="flex items-end justify-between mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <div>
              <h2 className="text-2xl font-extrabold text-forest">Featured Listings</h2>
              <p className="text-muted-foreground text-sm mt-1">Fresh produce and inputs from verified farmers.</p>
            </div>
            <Link
              href="/produce"
              className="flex items-center gap-1 text-sm font-semibold text-forest hover:text-forest-dark"
            >
              View all
              <ChevronRightIcon size={16} />
            </Link>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger(0.1)}
          >
            {FEATURED.map((listing) => (
              <motion.div key={listing.slug} variants={fadeUp}>
                <Link
                  href={`/produce/${listing.slug}`}
                  className={`group block bg-white rounded-2xl overflow-hidden border card-lift
                    ${'pledge' in listing && listing.pledge
                      ? 'border-l-4 border-harvest-gold border-b border-r border-t border-border'
                      : 'border-border'}`}
                >
                  <div className="relative aspect-video overflow-hidden bg-cream-dark">
                    <Image
                      src={listing.photo}
                      alt={listing.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      draggable={false}
                    />
                    <div className="absolute top-3 left-3">
                      <SectorChip sector={listing.sector} label={listing.category} />
                    </div>
                    {'pledge' in listing && listing.pledge && (
                      <div className="absolute top-3 right-3">
                        <span className="inline-flex items-center gap-1 bg-harvest-gold/90 backdrop-blur-sm
                                         text-white text-[9px] font-bold rounded-full px-2 py-1 uppercase tracking-wide">
                          <HarvestPledgeIcon size={9} />
                          Pledge
                        </span>
                      </div>
                    )}
                    {'organic' in listing && listing.organic && (
                      <div className="absolute bottom-3 left-3">
                        <span className="bg-lime/95 text-forest text-[9px] font-bold rounded-full px-2 py-0.5 uppercase tracking-wide">
                          Organic
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-display text-base font-bold text-forest leading-snug line-clamp-2 mb-2
                                   group-hover:text-forest-dark transition-colors">
                      {listing.title}
                    </h3>
                    <div className="flex items-center gap-1 mb-3">
                      <MapPinIcon size={11} className="text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">{listing.region}</span>
                      <span className="text-muted-foreground/40 mx-1">·</span>
                      <span className="text-[11px] text-muted-foreground">{listing.seller}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <PriceDisplay amount={listing.price} unit={listing.unit} size="lg" />
                      <span className="font-mono text-sm font-bold text-forest">
                        {listing.qty.toLocaleString()}
                        <span className="text-[11px] font-normal text-muted-foreground ml-1">{listing.unit}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <motion.section
        className="bg-forest py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <motion.div
          className="max-w-2xl mx-auto text-center px-4"
          variants={fadeUp}
        >
          <h2 className="font-display text-4xl font-extrabold text-white mb-4">
            Ready to grow with Ghana?
          </h2>
          <p className="text-white/70 text-lg mb-8">
            Join 24,000+ farmers, dealers, and buyers on AgroConnect.
            Access credit, sell faster, buy smarter.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-lime text-forest font-bold text-sm rounded-2xl
                         hover:bg-lime-dark transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/produce"
              className="px-8 py-4 bg-white/10 text-white font-bold text-sm rounded-2xl
                         hover:bg-white/20 transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        </motion.div>
      </motion.section>
    </main>
  )
}
