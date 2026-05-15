import Link from 'next/link'
import Image from 'next/image'
import { SectorChip }       from '@/components/shared/sector-chip'
import { BnplBadge }        from './bnpl-badge'
import { MapPinIcon, CalendarIcon } from '@/components/shared/icons'
import { formatGHS }         from '@/lib/format'
import type { ListingSummary } from '@agroconnect/types'

interface PledgeCardProps {
  listing: ListingSummary
}

function daysUntil(dateStr: string): number {
  return Math.max(0, Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86_400_000))
}

function urgencyClass(days: number) {
  if (days <= 14)  return 'text-red-600 bg-red-50 border-red-200'
  if (days <= 30)  return 'text-harvest-gold bg-harvest-gold/10 border-harvest-gold/20'
  return 'text-forest bg-cream border-border'
}

export function PledgeCard({ listing }: PledgeCardProps) {
  const days = listing.expectedHarvestDate ? daysUntil(listing.expectedHarvestDate) : null
  const photo = listing.photos?.[0] ?? '/placeholder-farm.jpg'

  return (
    <Link
      href={`/produce/${listing.slug}`}
      className="group block bg-white rounded-2xl border border-border overflow-hidden
                 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200
                 border-l-4 border-l-harvest-gold"
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-dark">
        <Image
          src={photo}
          alt={listing.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Sector chip */}
        <div className="absolute top-2.5 left-2.5">
          <SectorChip sector={listing.category.sector} label={listing.category.name} size="sm" />
        </div>
        {/* BNPL badge */}
        {listing.bnplAvailable && (
          <div className="absolute top-2.5 right-2.5">
            <BnplBadge size="sm" />
          </div>
        )}
        {/* Harvest countdown */}
        {days !== null && (
          <div className={`absolute bottom-2.5 left-2.5 inline-flex items-center gap-1
                           text-[10px] font-bold px-2 py-0.5 rounded-full border ${urgencyClass(days)}`}>
            <CalendarIcon size={10} />
            {days === 0 ? 'Harvesting today' : `${days}d to harvest`}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-display text-sm font-semibold text-forest leading-snug line-clamp-2 mb-1">
          {listing.title}
        </h3>

        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <MapPinIcon size={11} />
          <span className="truncate">{listing.region?.name}</span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] text-muted-foreground mb-0.5">Pledge price</p>
            <p className="font-mono text-base font-bold text-forest">
              {formatGHS(listing.pricePerUnit)}
              <span className="text-xs font-normal text-muted-foreground ml-1">/{listing.unit.abbreviation}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground mb-0.5">Available</p>
            <p className="font-mono text-sm font-semibold text-forest">
              {listing.quantityAvailable} {listing.unit.abbreviation}
            </p>
          </div>
        </div>

        {/* Escrow assurance */}
        <div className="mt-3 pt-3 border-t border-border flex items-center gap-1.5">
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 text-forest flex-shrink-0"
               stroke="currentColor" strokeWidth="1.5">
            <path d="M8 1.5L2 4v4c0 3 2.5 5.5 6 6 3.5-.5 6-3 6-6V4L8 1.5z" />
            <path d="M5.5 8l1.5 1.5 3.5-3.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[10px] font-semibold text-forest">Escrow-protected pledge</span>
        </div>
      </div>
    </Link>
  )
}
