import Image          from 'next/image'
import Link           from 'next/link'
import { SectorChip } from '@/components/shared/sector-chip'
import { PriceDisplay } from '@/components/shared/price-display'
import { MapPinIcon, ChevronRightIcon, HarvestPledgeIcon } from '@/components/shared/icons'
import type { Sector } from '@/lib/types'

const MOCK_ROWS = [
  { id: 'lst-001', title: 'Fresh Organic Tomatoes — Kumasi Farm', slug: 'fresh-organic-tomatoes-kumasi-farm', listingType: 'available_now', pricePerUnit: 2.50, quantityAvailable: 500, photos: ['https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&q=80'], seller: { fullName: 'Kwame Asante Boateng', verificationLevel: 'field_verified' }, category: { name: 'Tomato', sector: 'crops' }, unit: { abbreviation: 'kg' }, region: { name: 'Ashanti' } },
  { id: 'lst-002', title: '2-Month Maize Harvest — 5 Tonnes Reserved', slug: 'maize-harvest-5-tonnes-eastern', listingType: 'harvest_pledge', pricePerUnit: 1.80, quantityAvailable: 5000, photos: ['https://images.unsplash.com/photo-1568219557405-376e23e4f7cf?w=600&q=80'], seller: { fullName: 'Abena Owusu Mensah', verificationLevel: 'premium' }, category: { name: 'Maize', sector: 'crops' }, unit: { abbreviation: 'kg' }, region: { name: 'Eastern' } },
  { id: 'lst-003', title: 'NPK 15-15-15 Fertilizer — 50kg Bags', slug: 'npk-fertilizer-50kg-bags', listingType: 'available_now', pricePerUnit: 180.00, quantityAvailable: 200, photos: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80'], seller: { fullName: 'Agro Solutions Ltd', verificationLevel: 'premium' }, category: { name: 'Fertilizer', sector: 'inputs' }, unit: { abbreviation: 'bag' }, region: { name: 'Greater Accra' } },
  { id: 'lst-004', title: 'Live Broiler Chickens — Farm Gate', slug: 'live-broiler-chickens-eastern', listingType: 'available_now', pricePerUnit: 35.00, quantityAvailable: 300, photos: ['https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&q=80'], seller: { fullName: 'Emmanuel Tetteh', verificationLevel: 'field_verified' }, category: { name: 'Broiler Chicken', sector: 'poultry' }, unit: { abbreviation: 'hd' }, region: { name: 'Eastern' } },
  { id: 'lst-005', title: 'Live Tilapia — Volta Lake Farm', slug: 'live-tilapia-volta-lake', listingType: 'available_now', pricePerUnit: 22.00, quantityAvailable: 800, photos: ['https://images.unsplash.com/photo-1570367823578-74b3ef1eba96?w=600&q=80'], seller: { fullName: 'Yaw Darko Asante', verificationLevel: 'self_declared' }, category: { name: 'Tilapia', sector: 'fisheries' }, unit: { abbreviation: 'kg' }, region: { name: 'Volta' } },
  { id: 'lst-006', title: 'Cocoa Beans — Certified Fine Flavour', slug: 'cocoa-beans-certified-western', listingType: 'harvest_pledge', pricePerUnit: 12.50, quantityAvailable: 3000, photos: ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&q=80'], seller: { fullName: 'Akosua Frimpong', verificationLevel: 'premium' }, category: { name: 'Cocoa', sector: 'crops' }, unit: { abbreviation: 'kg' }, region: { name: 'Western' } },
]

export default async function FeaturedListings() {
  const rows = MOCK_ROWS

  if (rows.length === 0) {
    return (
      <section className="bg-cream py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl font-extrabold text-forest mb-2">Featured Listings</h2>
          <p className="text-muted-foreground text-sm mb-6">
            No listings yet. Be the first to post your produce.
          </p>
          <Link
            href="/listings/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-forest text-white
                       font-bold text-sm rounded-xl hover:bg-forest-dark transition-colors"
          >
            List your produce
            <ChevronRightIcon size={15} />
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-cream py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-forest">Featured Listings</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Fresh produce and inputs from verified farmers.
            </p>
          </div>
          <Link
            href="/produce"
            className="flex items-center gap-1 text-sm font-semibold text-forest hover:text-forest-dark"
          >
            View all
            <ChevronRightIcon size={16} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rows.map((listing) => {
            const price    = Number(listing.pricePerUnit)
            const qty      = Number(listing.quantityAvailable)
            const isPledge = listing.listingType === 'harvest_pledge'
            const photo    = listing.photos[0] ?? null

            return (
              <Link
                key={listing.id}
                href={`/produce/${listing.slug}`}
                className={`group block bg-white rounded-2xl overflow-hidden border card-lift
                  ${isPledge
                    ? 'border-l-4 border-harvest-gold border-b border-r border-t border-border'
                    : 'border-border'}`}
              >
                <div className="relative aspect-video overflow-hidden bg-cream-dark">
                  {photo ? (
                    <Image
                      src={photo}
                      alt={listing.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl opacity-20">
                        {listing.category.sector === 'crops'     ? '🌾' :
                         listing.category.sector === 'livestock' ? '🐄' :
                         listing.category.sector === 'poultry'   ? '🐓' :
                         listing.category.sector === 'fisheries' ? '🐟' : '🌱'}
                      </span>
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <SectorChip
                      sector={listing.category.sector as Sector}
                      label={listing.category.name}
                    />
                  </div>
                  {isPledge && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 bg-harvest-gold/90
                                       text-white text-[9px] font-bold rounded-full px-2 py-1
                                       uppercase tracking-wide">
                        <HarvestPledgeIcon size={9} />
                        Pledge
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-display text-base font-bold text-forest leading-snug
                                 line-clamp-2 mb-2 group-hover:text-forest-dark transition-colors">
                    {listing.title}
                  </h3>
                  <div className="flex items-center gap-1 mb-3">
                    <MapPinIcon size={11} className="text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground">
                      {listing.region?.name ?? 'Ghana'}
                    </span>
                    <span className="text-muted-foreground/40 mx-1">·</span>
                    <span className="text-[11px] text-muted-foreground">
                      {listing.seller.fullName || 'Verified Farmer'}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <PriceDisplay amount={price} unit={listing.unit.abbreviation} size="lg" />
                    <span className="font-mono text-sm font-bold text-forest">
                      {qty.toLocaleString()}
                      <span className="text-[11px] font-normal text-muted-foreground ml-1">
                        {listing.unit.abbreviation}
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
