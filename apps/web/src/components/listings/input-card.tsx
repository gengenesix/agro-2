import Link from 'next/link'
import Image from 'next/image'
import { SectorChip }  from '@/components/shared/sector-chip'
import { MapPinIcon, VerifiedBlueIcon } from '@/components/shared/icons'
import { formatGHS }   from '@/lib/format'
import type { ListingSummary } from '@agroconnect/types'

interface InputCardProps {
  listing: ListingSummary
}

export function InputCard({ listing }: InputCardProps) {
  const photo = listing.photos?.[0] ?? '/placeholder-input.jpg'

  return (
    <Link
      href={`/produce/${listing.slug}`}
      className="group block bg-white rounded-2xl border border-border overflow-hidden
                 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Photo */}
      <div className="relative aspect-video overflow-hidden bg-cream-dark">
        <Image
          src={photo}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2.5 left-2.5">
          <SectorChip sector={listing.category.sector} label={listing.category.name} size="sm" />
        </div>
        {/* In stock indicator */}
        {listing.quantityAvailable > 0 && (
          <div className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5
                          rounded-full bg-lime/90 text-forest">
            In Stock
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-display text-sm font-semibold text-forest leading-snug line-clamp-2 mb-1">
          {listing.title}
        </h3>

        {/* Seller row */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          {listing.seller.verificationLevel !== 'unverified' && <VerifiedBlueIcon size={12} />}
          <span className="truncate">{listing.seller.fullName}</span>
          <span className="text-border mx-0.5">·</span>
          <MapPinIcon size={11} />
          <span className="truncate">{listing.region?.name}</span>
        </div>

        {/* Price + stock */}
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-base font-bold text-forest">
              {formatGHS(listing.pricePerUnit)}
              <span className="text-xs font-normal text-muted-foreground ml-1">/{listing.unit.abbreviation}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground mb-0.5">Stock</p>
            <p className="font-mono text-sm font-semibold text-forest">
              {listing.quantityAvailable} {listing.unit.abbreviation}
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
