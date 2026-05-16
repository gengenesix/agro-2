import Link  from 'next/link'
import Image from 'next/image'
import { SectorChip }         from '@/components/shared/sector-chip'
import { VerificationBadge }  from '@/components/shared/verification-badge'
import { PriceDisplay }       from '@/components/shared/price-display'
import { AgroScoreIcon, MapPinIcon, EyeIcon, HarvestPledgeIcon } from '@/components/shared/icons'
import { formatDate }         from '@/lib/format'
import type { ListingSummary } from '@/lib/types'

interface ListingCardProps {
  listing: ListingSummary
  variant?: 'produce' | 'pledge' | 'input'
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80&fit=crop'

export function ListingCard({ listing }: ListingCardProps) {
  const isPledge = listing.listingType === 'harvest_pledge'

  return (
    <Link
      href={`/produce/${listing.slug}`}
      className={`group block bg-card rounded-2xl overflow-hidden border card-lift
        ${isPledge
          ? 'border-l-4 border-harvest-gold border-b border-r border-t border-border'
          : 'border-border'
        }`}
    >
      {/* Photo */}
      <div className="relative aspect-video overflow-hidden bg-cream-dark">
        <Image
          src={listing.photos[0] ?? PLACEHOLDER}
          alt={listing.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          draggable={false}
        />

        {/* Sector chip */}
        <div className="absolute top-3 left-3">
          <SectorChip sector={listing.category.sector} label={listing.category.name} />
        </div>

        {/* Pledge badge */}
        {isPledge && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 bg-harvest-gold/90 backdrop-blur-sm
                             text-white text-[9px] font-bold rounded-full px-2 py-1 uppercase tracking-wide">
              <HarvestPledgeIcon size={9} />
              Harvest Pledge
            </span>
          </div>
        )}

        {/* Organic badge */}
        {listing.farmingMethod === 'organic' || listing.farmingMethod === 'certified_organic' ? (
          <div className="absolute bottom-3 left-3">
            <span className="bg-lime/95 text-forest text-[9px] font-bold rounded-full px-2 py-0.5 uppercase tracking-wide">
              Organic
            </span>
          </div>
        ) : null}
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-display text-base font-bold text-forest leading-snug line-clamp-2 mb-2
                       group-hover:text-forest-dark transition-colors">
          {listing.title}
        </h3>

        {/* Seller + location */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <div className="w-5 h-5 rounded-full bg-cream-dark overflow-hidden flex-shrink-0 border border-border">
              {listing.seller.avatarUrl ? (
                <Image src={listing.seller.avatarUrl} alt="" width={20} height={20}
                  className="object-cover" draggable={false} />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[8px] font-bold text-muted-foreground">
                  {listing.seller.fullName.charAt(0)}
                </span>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground truncate">{listing.seller.fullName}</span>
            <VerificationBadge level={listing.seller.verificationLevel} size="xs" />
          </div>
          {listing.region && (
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <MapPinIcon size={11} className="text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">{listing.region.name}</span>
            </div>
          )}
        </div>

        {/* Price + quantity */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <PriceDisplay amount={listing.pricePerUnit} unit={listing.unit.abbreviation} size="lg" />
            {listing.bnplAvailable && (
              <span className="inline-flex items-center gap-1 mt-1 bg-lime/20 text-forest text-[9px]
                               font-bold rounded-full px-2 py-0.5 uppercase tracking-wide">
                Pay at Harvest
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="font-mono text-sm font-bold text-forest">
              {Number(listing.quantityAvailable).toLocaleString()}
            </span>
            <span className="text-[11px] text-muted-foreground ml-1">{listing.unit.abbreviation}</span>
          </div>
        </div>

        {/* Harvest date (pledge only) */}
        {isPledge && listing.expectedHarvestDate && (
          <div className="flex items-center gap-1.5 py-2 px-3 bg-harvest-gold/10
                          rounded-xl border border-harvest-gold/20 mb-3">
            <HarvestPledgeIcon size={13} className="text-harvest-gold flex-shrink-0" />
            <span className="text-xs font-semibold text-harvest-gold">
              Harvest: {formatDate(listing.expectedHarvestDate)}
            </span>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-1">
            <AgroScoreIcon size={12} className="text-muted-foreground" />
            <span className="text-[11px] font-semibold text-forest">{listing.seller.agroScore}</span>
            <span className="text-[11px] text-muted-foreground">AgroScore</span>
          </div>
          <div className="flex items-center gap-1">
            <EyeIcon size={12} className="text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground">{listing.viewsCount}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
