'use client'

import Link  from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  CropsIcon, LivestockIcon, PoultryIcon, FisheriesIcon, InputsIcon,
  SearchIcon, ChevronRightIcon, MapPinIcon, WeatherIcon, PricesIcon,
  HarvestPledgeIcon,
} from '@/components/shared/icons'
import { useAuth } from '@/context/auth-context'

const ROLE_HOME: Record<string, string> = {
  farmer:      '/dashboard',
  dealer:      '/dealer/dashboard',
  buyer:       '/buyer/dashboard',
  consumer:    '/consumer',
  field_agent: '/field-agent/dashboard',
  admin:       '/admin/dashboard',
}

// ─── Motion variants ──────────────────────────────────────────────────────────

const fadeUp = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
}

const scaleIn = {
  hidden:  { opacity: 0, scale: 0.90 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
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
  { label: 'Regions Covered',  value: '16 / 16' },
  { label: 'Escrow Secured',   value: 'GHS 4.2M' },
]

const ACTIONS = [
  { href: '/produce',      label: 'Browse Produce',  Icon: CropsIcon,         accent: 'var(--sector-crops)'     },
  { href: '/pledges',      label: 'Harvest Pledges', Icon: HarvestPledgeIcon, accent: 'var(--harvest-gold)'     },
  { href: '/intelligence', label: 'Market Prices',   Icon: PricesIcon,        accent: 'var(--forest)'           },
  { href: '/intelligence', label: 'Weather Alerts',  Icon: WeatherIcon,       accent: 'var(--sector-fisheries)' },
]

const sectorBg: Record<string, string> = {
  crops:     'var(--sector-crops-bg)',
  livestock: 'var(--sector-livestock-bg)',
  poultry:   'var(--sector-poultry-bg)',
  fisheries: 'var(--sector-fisheries-bg)',
  inputs:    'var(--sector-inputs-bg)',
}

const sectorColor: Record<string, string> = {
  crops:     'var(--sector-crops)',
  livestock: 'var(--sector-livestock)',
  poultry:   'var(--sector-poultry)',
  fisheries: 'var(--sector-fisheries)',
  inputs:    'var(--sector-inputs)',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  featuredSection?: React.ReactNode
}

export default function AnimatedLanding({ featuredSection }: Props) {
  const { user, loading } = useAuth()
  const dashboardPath = ROLE_HOME[user?.role ?? ''] ?? '/dashboard'

  return (
    <main>
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ backgroundColor: 'var(--forest)' }}>
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&q=80&fit=crop"
            alt="Ghana farmland"
            fill
            className="object-cover"
            style={{ opacity: 0.18 }}
            priority
            draggable={false}
          />
        </div>

        {/* Lime accent edge */}
        <div className="absolute top-0 right-0 bottom-0 w-1.5" style={{ backgroundColor: 'var(--lime)', opacity: 0.5 }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 py-20 lg:py-28">
          <motion.div
            className="max-w-3xl"
            initial="hidden"
            animate="visible"
            variants={stagger(0.1)}
          >
            <motion.div variants={fadeIn}>
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em]
                           px-3 py-1.5 mb-8 inline-block"
                style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--forest)' }} />
                Global Platform · Piloting in Ghana
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-display font-bold text-white leading-[0.93] mb-6"
              style={{
                fontSize: 'clamp(2.8rem, 7vw, 5.5rem)',
                letterSpacing: '-0.04em',
              }}
            >
              From Seed to Sale.<br />
              <span style={{ color: 'var(--lime)' }}>Every Farmer.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-lg leading-relaxed mb-10 max-w-xl"
              style={{ color: 'rgba(255,255,255,0.60)' }}
            >
              Ghana&apos;s agricultural operating system. Buy produce, pledge harvests,
              access BNPL credit, and get real-time weather and market intelligence.
            </motion.p>

            {!loading && user ? (
              <motion.div
                key="hero-cta-auth"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex gap-3"
              >
                <Link
                  href={dashboardPath}
                  className="inline-flex items-center gap-2.5 px-8 py-4 font-bold text-sm
                             transition-all hover:scale-[1.03] active:scale-[0.97]"
                  style={{
                    backgroundColor: 'var(--lime)',
                    color: 'var(--forest)',
                    clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                  }}
                >
                  Go to Dashboard
                  <ChevronRightIcon size={16} />
                </Link>
                <Link
                  href="/produce"
                  className="inline-flex items-center gap-2 px-6 py-4 font-bold text-sm
                             text-white transition-all hover:bg-white/10"
                  style={{ border: '1.5px solid rgba(255,255,255,0.25)' }}
                >
                  Browse Marketplace
                </Link>
              </motion.div>
            ) : !loading ? (
              <motion.div key="hero-cta-guest" variants={fadeUp} className="flex gap-2 max-w-lg">
                <div className="flex-1 relative">
                  <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: 'rgba(25,60,30,0.4)' }} />
                  <input
                    type="text"
                    placeholder="Search tomatoes, fertilizer, tilapia..."
                    className="w-full pl-12 pr-4 py-4 text-sm font-medium bg-white
                               focus:outline-none focus:ring-2 focus:ring-lime"
                    style={{ color: 'var(--forest)' }}
                  />
                </div>
                <Link
                  href="/produce"
                  className="inline-flex items-center gap-1.5 px-7 py-4 font-bold text-sm
                             transition-all hover:opacity-90 whitespace-nowrap"
                  style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}
                >
                  Browse
                  <ChevronRightIcon size={15} />
                </Link>
              </motion.div>
            ) : null}
          </motion.div>

          {/* Stats strip */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-0 mt-14 pt-10"
            style={{ borderTop: '1px solid rgba(255,255,255,0.12)' }}
            initial="hidden"
            animate="visible"
            variants={stagger(0.06)}
          >
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                variants={fadeUp}
                className="py-2 pr-6"
                style={{ paddingLeft: i > 0 ? '1.5rem' : '0',
                         borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.10)' : 'none' }}
              >
                <p className="font-mono font-extrabold text-2xl leading-none mb-1.5"
                   style={{ color: 'var(--lime)' }}>
                  {s.value}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-widest"
                   style={{ color: 'rgba(255,255,255,0.38)' }}>
                  {s.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Quick actions ────────────────────────────────────────────── */}
      <section style={{ backgroundColor: 'white', borderBottom: '1px solid rgba(25,60,30,0.08)' }}>
        <div className="max-w-6xl mx-auto px-6 sm:px-8 py-5">
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
                  className="flex items-center gap-3 p-4 transition-all group hover:-translate-y-0.5"
                  style={{
                    backgroundColor: 'var(--cream)',
                    border: '1.5px solid rgba(25,60,30,0.10)',
                    borderLeft: `4px solid ${a.accent}`,
                  }}
                >
                  <span
                    className="p-2.5 flex-shrink-0 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${a.accent}20`, color: a.accent }}
                  >
                    <a.Icon size={18} />
                  </span>
                  <span className="text-sm font-bold" style={{ color: 'var(--forest)' }}>
                    {a.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Sectors ─────────────────────────────────────────────────── */}
      <section className="py-20 max-w-6xl mx-auto px-6 sm:px-8">
        <motion.div
          className="flex items-end justify-between mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeIn}
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-3"
               style={{ color: 'rgba(25,60,30,0.40)' }}>
              Browse by Sector
            </p>
            <h2
              className="font-display font-bold leading-[0.95]"
              style={{
                fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)',
                letterSpacing: '-0.04em',
                color: 'var(--forest)',
              }}
            >
              All agricultural categories.
            </h2>
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
                className="group flex flex-col items-center text-center p-6 transition-all
                           hover:-translate-y-1"
                style={{
                  backgroundColor: 'white',
                  border: '1.5px solid rgba(25,60,30,0.10)',
                  borderBottom: `4px solid ${sectorColor[s.id] ?? 'var(--forest)'}`,
                }}
              >
                <div
                  className="p-4 mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: sectorBg[s.id] ?? 'var(--cream)', color: sectorColor[s.id] ?? 'var(--forest)' }}
                >
                  <s.Icon size={30} />
                </div>
                <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--forest)' }}>
                  {s.label}
                </p>
                <p className="text-[11px] mb-2" style={{ color: 'rgba(25,60,30,0.50)' }}>
                  {s.desc}
                </p>
                <p className="font-mono font-extrabold text-xs" style={{ color: sectorColor[s.id] ?? 'var(--forest)' }}>
                  {s.count}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Featured listings ────────────────────────────────────────── */}
      {featuredSection}

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <motion.section
        className="py-24 relative overflow-hidden"
        style={{ backgroundColor: '#0a1a0d' }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1200&q=60&fit=crop"
            alt="" fill className="object-cover" style={{ opacity: 0.10 }}
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: 'var(--lime)', opacity: 0.4 }} />

        <motion.div
          className="relative z-10 max-w-2xl mx-auto text-center px-6"
          variants={fadeUp}
        >
          <h2
            className="font-display font-bold text-white leading-[0.94] mb-5"
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.8rem)',
              letterSpacing: '-0.04em',
            }}
          >
            Ready to grow with{' '}
            <em className="not-italic" style={{ color: 'var(--lime)' }}>Ghana?</em>
          </h2>
          <p className="text-lg mb-10 leading-relaxed" style={{ color: 'rgba(255,255,255,0.50)' }}>
            Join 24,000+ farmers, dealers, and buyers.
            Access credit, sell faster, buy smarter.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!loading && user ? (
              <Link
                href={dashboardPath}
                className="inline-flex items-center justify-center gap-2 px-10 py-4
                           font-bold text-sm transition-all hover:scale-[1.03]"
                style={{
                  backgroundColor: 'var(--lime)',
                  color: 'var(--forest)',
                  clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                }}
              >
                Go to Dashboard
                <ChevronRightIcon size={16} />
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-10 py-4 font-bold text-sm transition-all hover:scale-[1.03]"
                style={{
                  backgroundColor: 'var(--lime)',
                  color: 'var(--forest)',
                  clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                }}
              >
                Get Started Free
              </Link>
            )}
            <Link
              href="/produce"
              className="px-10 py-4 font-bold text-sm text-white transition-all hover:bg-white/10"
              style={{ border: '1.5px solid rgba(255,255,255,0.25)' }}
            >
              Browse Marketplace
            </Link>
          </div>
        </motion.div>
      </motion.section>
    </main>
  )
}
