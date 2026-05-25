import type { Metadata } from 'next'
import Image             from 'next/image'
import Link              from 'next/link'

export const metadata: Metadata = {
  title: 'About AgroConnect — Our Mission',
  description:
    "How AgroConnect is building the financial and logistical backbone for Ghanaian agriculture — from the smallholder farmer in Bono East to the wholesale buyer in Makola.",
}

const PILLARS = [
  {
    title: 'Verified Transactions',
    body:  'Every listing is either field-agent GPS-stamped or escrow-backed. No listing ships without payment certainty. No payment clears without delivery confirmation.',
  },
  {
    title: 'BNPL Input Credit',
    body:  'Farmers with an AgroScore above 50 unlock Buy Now Pay Later credit for seeds, fertiliser, and agro-chemicals. Repayment is structured against the next harvest cycle.',
  },
  {
    title: 'All-Region Reach',
    body:  'Our field agents operate in all 16 regions — from the coastal fisheries of Volta and Western to the dry-season markets of Savannah and Upper East.',
  },
  {
    title: 'Open-Channel Intelligence',
    body:  'Daily market prices from the Ghana Statistical Service, 6-hourly Open-Meteo weather alerts, and regional pest advisories — available to every registered user, including USSD on *800*456#.',
  },
]

const REGIONS = [
  'Greater Accra', 'Ashanti', 'Eastern', 'Western', 'Central', 'Volta',
  'Northern', 'Savannah', 'North East', 'Upper East', 'Upper West',
  'Bono', 'Bono East', 'Ahafo', 'Oti', 'Western North',
]

export default function AboutPage() {
  return (
    <main>

      {/* ── Mission hero ──────────────────────────────────────────────────── */}
      <section className="relative bg-forest py-24 lg:py-32 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1600&q=80&fit=crop"
          alt="Ghana farmland at dusk"
          fill
          priority
          className="object-cover opacity-20"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest/80 to-forest/60" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-lime text-xs font-bold uppercase tracking-widest mb-5">
            About AgroConnect
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white
                         leading-tight mb-6">
            Agricultural infrastructure built for Ghana.
          </h1>
          <p className="text-white/65 text-lg leading-relaxed">
            AgroConnect is not a simple marketplace. It is the financial and logistical
            backbone of Ghanaian agriculture — the platform through which inputs are
            distributed, harvests are pledged, payments are settled via Mobile Money,
            and market intelligence flows to every actor in the chain.
          </p>
        </div>
      </section>

      {/* ── Story ─────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-bold text-forest uppercase tracking-widest mb-4">
                Why We Exist
              </p>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-forest
                             leading-snug mb-6">
                The trust gap is the market gap.
              </h2>
              <div className="space-y-4 text-muted-foreground text-base leading-relaxed">
                <p>
                  Ghana produces 8+ million tonnes of food crops each year, yet smallholder
                  farmers routinely sell below cost because they have no way to confirm buyer
                  commitment before planting. Buyers overpay middlemen because direct farm
                  provenance is unverifiable. Dealers extend dangerous informal credit because
                  no credit score exists for agricultural operators.
                </p>
                <p>
                  AgroConnect closes these gaps with three tools: a field-agent verification
                  network that geo-stamps every farm and listing, an escrow settlement engine
                  that holds and releases payments on delivery confirmation, and an
                  AgroScore credit profile that converts repayment history into BNPL
                  eligibility.
                </p>
                <p>
                  We are piloting in Eastern, Greater Accra, and Ashanti, with active field
                  agent coverage in Bono East, Techiman, Sunyani, Tamale, and Makola.
                </p>
              </div>
            </div>
            <div className="relative rounded-2xl overflow-hidden h-80 lg:h-full min-h-[340px]">
              <Image
                src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800"
                alt="Ghanaian farmer inspecting crop"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Pillars ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl font-extrabold text-forest mb-10">
            How the platform works
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {PILLARS.map((p) => (
              <div key={p.title}
                className="bg-white rounded-2xl border border-border p-7">
                <h3 className="font-bold text-forest text-base mb-2">{p.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Regional coverage ─────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h2 className="font-display text-3xl font-extrabold text-forest mb-2">
              All 16 regions. No exceptions.
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl">
              Our USSD channel (*800*456#) ensures coverage extends beyond smartphone users
              to feature-phone farmers in Northern and Upper West regions.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {REGIONS.map((r) => (
              <span key={r}
                className="px-3 py-1.5 bg-cream border border-border rounded-full
                           text-xs font-semibold text-forest">
                {r}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-forest py-20 text-center px-4">
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-5">
          Join the network.
        </h2>
        <p className="text-white/60 text-base mb-8 max-w-md mx-auto">
          Register as a farmer, dealer, buyer, or field agent in under two minutes.
        </p>
        <Link href="/login"
          className="inline-flex px-8 py-4 bg-lime text-forest font-bold text-sm
                     rounded-2xl hover:bg-lime-dark transition-colors">
          Get Started Free
        </Link>
      </section>

    </main>
  )
}
