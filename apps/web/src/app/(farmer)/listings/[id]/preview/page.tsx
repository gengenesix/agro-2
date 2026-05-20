import { notFound }   from 'next/navigation'
import { Suspense }   from 'react'
import Link           from 'next/link'
import { SectorChip }           from '@/components/shared/sector-chip'
import { BnplBadge }            from '@/components/listings/bnpl-badge'
import { PhotoGallery }         from '@/components/listings/photo-gallery'
import {
  MapPinIcon, CalendarIcon, TruckIcon, PayAtHarvestIcon, AgroScoreIcon,
  ChevronRightIcon,
} from '@/components/shared/icons'
import { formatGHS, formatDate, formatQuantity } from '@/lib/format'
import { prisma } from '@/lib/prisma'

async function fetchListing(slug: string) {
  try {
    const row = await prisma.listing.findFirst({
      where: { slug },
      include: {
        category: { select: { name: true, sector: true, slug: true } },
        unit:     { select: { name: true, abbreviation: true } },
        seller:   { select: { id: true, fullName: true, avatarUrl: true, verificationLevel: true, agroScore: true } },
        region:   { select: { name: true, code: true } },
        district: { select: { name: true } },
      },
    })
    if (!row) return null
    return {
      id:                  row.id,
      slug:                row.slug,
      title:               row.title,
      description:         row.description ?? null,
      listingType:         row.listingType,
      status:              row.status,
      quantityAvailable:   Number(row.quantityAvailable),
      pricePerUnit:        Number(row.pricePerUnit),
      minOrderQuantity:    Number(row.minOrderQuantity),
      photos:              row.photos,
      farmingMethod:       row.farmingMethod ?? null,
      deliveryOptions:     row.deliveryOptions,
      expectedHarvestDate: row.expectedHarvestDate?.toISOString() ?? null,
      depositPercentage:   row.depositPercentage,
      bnplAvailable:       row.bnplAvailable,
      viewsCount:          row.viewsCount,
      createdAt:           row.createdAt.toISOString(),
      community:           row.community ?? null,
      category:            row.category,
      unit:                row.unit,
      seller:              { ...row.seller, avatarUrl: row.seller.avatarUrl ?? null },
      region:              row.region,
      district:            row.district,
    }
  } catch {
    return null
  }
}

export default async function ListingPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }   = await params
  const listing  = await fetchListing(id)
  if (!listing) notFound()

  const isPledge = listing.listingType === 'harvest_pledge'

  return (
    <main className="min-h-screen bg-cream pb-10">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/listings" className="hover:text-forest transition-colors">My Listings</Link>
          <ChevronRightIcon size={12} />
          <span className="text-forest font-semibold truncate max-w-[240px]">{listing.title}</span>
        </div>
      </div>

      {/* Preview banner */}
      <div className="bg-harvest-gold/10 border-b border-harvest-gold/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                 className="w-3.5 h-3.5 text-harvest-gold flex-shrink-0">
              <circle cx="8" cy="8" r="6" />
              <path d="M8 7v4M8 5.5v.5" strokeLinecap="round" />
            </svg>
            <p className="text-xs font-semibold text-harvest-gold">
              Preview — this is how buyers see your listing
            </p>
          </div>
          <Link
            href={`/listings/${listing.slug}/edit`}
            className="text-[10px] font-bold text-harvest-gold border border-harvest-gold/40
                       px-2.5 py-1 rounded-lg hover:bg-harvest-gold/10 transition-colors whitespace-nowrap"
          >
            Edit listing
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="space-y-6 max-w-3xl">
          {/* Photo gallery */}
          <Suspense fallback={
            <div className="aspect-video bg-cream-dark rounded-2xl animate-pulse" />
          }>
            <PhotoGallery photos={listing.photos ?? []} title={listing.title} />
          </Suspense>

          {/* Title block */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <SectorChip sector={listing.category.sector} label={listing.category.name} />
              {isPledge && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full
                                 bg-harvest-gold/15 text-harvest-gold border border-harvest-gold/25">
                  Harvest Pledge
                </span>
              )}
              {listing.bnplAvailable && <BnplBadge size="md" />}
              {listing.farmingMethod && listing.farmingMethod !== 'conventional' && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full
                                 bg-lime/20 text-forest border border-lime/30 capitalize">
                  {listing.farmingMethod.replace('_', ' ')}
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-forest leading-tight mb-2">
              {listing.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPinIcon size={13} />
                {listing.region?.name}
                {listing.district?.name && `, ${listing.district.name}`}
              </span>
              {listing.expectedHarvestDate && (
                <span className="flex items-center gap-1">
                  <CalendarIcon size={13} />
                  Harvest: {formatDate(listing.expectedHarvestDate)}
                </span>
              )}
            </div>
          </div>

          {/* Price block */}
          <div className={`rounded-2xl p-5
            ${isPledge
              ? 'bg-harvest-gold/8 border border-harvest-gold/20'
              : 'bg-white border border-border'}`}>
            <div className="flex items-end justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {isPledge ? 'Pledge price' : 'Price per unit'}
                </p>
                <p className="font-mono text-3xl font-bold text-forest">
                  {formatGHS(listing.pricePerUnit)}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  per {listing.unit.abbreviation}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground mb-1">Available quantity</p>
                <p className="font-mono text-xl font-bold text-forest">
                  {formatQuantity(listing.quantityAvailable, listing.unit.abbreviation)}
                </p>
                {listing.minOrderQuantity > 1 && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Min. order: {listing.minOrderQuantity} {listing.unit.abbreviation}
                  </p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-border/60">
              {[
                { Icon: TruckIcon,        label: 'Delivery available',       show: true },
                { Icon: PayAtHarvestIcon, label: 'Pay at Harvest (BNPL)',     show: listing.bnplAvailable },
                { Icon: AgroScoreIcon,    label: 'AgroScore-verified seller', show: (listing.seller?.agroScore ?? 0) >= 50 },
              ].filter(a => a.show).map(({ Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs text-forest font-medium">
                  <Icon size={14} className="text-forest flex-shrink-0" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="font-bold text-forest text-sm mb-3">About this listing</h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          )}

          {/* Details table */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h2 className="font-bold text-forest text-sm mb-4">Listing details</h2>
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
              {[
                { label: 'Category',       value: listing.category.name },
                { label: 'Sector',         value: listing.category.sector },
                { label: 'Farming method', value: listing.farmingMethod?.replace('_', ' ') },
                { label: 'Region',         value: listing.region?.name },
                { label: 'District',       value: listing.district?.name },
                { label: 'Harvest date',   value: listing.expectedHarvestDate ? formatDate(listing.expectedHarvestDate) : null },
                { label: 'Listed',         value: formatDate(listing.createdAt) },
                { label: 'Views',          value: listing.viewsCount?.toLocaleString('en-GH') },
                { label: 'Status',         value: listing.status },
              ].filter(d => d.value).map(({ label, value }) => (
                <div key={label}
                  className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="text-xs font-semibold text-forest capitalize">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </main>
  )
}
