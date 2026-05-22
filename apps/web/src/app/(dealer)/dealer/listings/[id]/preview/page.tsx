import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { PhotoGallery }  from '@/components/listings/photo-gallery'
import { SectorChip }   from '@/components/shared/sector-chip'
import { BnplBadge }    from '@/components/listings/bnpl-badge'
import {
  ChevronRightIcon, MapPinIcon, TruckIcon, PayAtHarvestIcon,
} from '@/components/shared/icons'
import { formatGHS, formatDate, formatQuantity } from '@/lib/format'
import { prisma } from '@/lib/prisma'
import type { Sector } from '@/lib/types'

const VALID_SECTORS = new Set(['crops', 'livestock', 'poultry', 'fisheries', 'inputs'])

async function fetchListing(id: string) {
  try {
    return await prisma.listing.findFirst({
      where: { id },
      include: {
        category: { select: { name: true, sector: true, slug: true } },
        unit:     { select: { name: true, abbreviation: true } },
        seller:   { select: { id: true, fullName: true, avatarUrl: true, verificationLevel: true, agroScore: true } },
        region:   { select: { name: true, code: true } },
        district: { select: { name: true } },
      },
    })
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const listing = await fetchListing(id)
  if (!listing) return { title: 'Listing not found' }
  return { title: `Preview: ${listing.title} — Dealer Portal` }
}

export default async function DealerListingPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const listing = await fetchListing(id)
  if (!listing) notFound()

  const safeSector = VALID_SECTORS.has(listing.category.sector)
    ? listing.category.sector as Sector
    : 'inputs'

  const qty    = Number(listing.quantityAvailable)
  const price  = Number(listing.pricePerUnit)
  const minQty = Number(listing.minOrderQuantity)

  const details: { label: string; value: string }[] = [
    { label: 'Category',   value: listing.category.name },
    { label: 'Unit',       value: listing.unit.name },
    { label: 'Min. order', value: `${minQty} ${listing.unit.abbreviation}` },
    { label: 'Region',     value: listing.region?.name ?? '' },
    { label: 'District',   value: listing.district?.name ?? '' },
    { label: 'Listed',     value: formatDate(listing.createdAt) },
    { label: 'Views',      value: listing.viewsCount.toLocaleString('en-GH') },
  ].filter(d => Boolean(d.value))

  return (
    <main className="min-h-screen bg-cream pb-10">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/dealer/listings" className="hover:text-forest transition-colors">
            Products
          </Link>
          <ChevronRightIcon size={12} />
          <SectorChip sector={safeSector} label={listing.category.name} size="sm" />
          <ChevronRightIcon size={12} />
          <span className="text-forest font-semibold truncate max-w-[200px]">{listing.title}</span>
          <span className="ml-auto px-2 py-0.5 text-[10px] font-bold rounded-full bg-cream-dark text-muted-foreground uppercase tracking-wide">
            Preview
          </span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">

          {/* ── Left column ───────────────────────────────────────────────── */}
          <div className="space-y-6">
            <Suspense fallback={<div className="aspect-video bg-cream-dark rounded-2xl animate-pulse" />}>
              <PhotoGallery photos={listing.photos ?? []} title={listing.title} />
            </Suspense>

            {/* Title block */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <SectorChip sector={safeSector} label={listing.category.name} />
                {listing.bnplAvailable && <BnplBadge size="md" />}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize
                  ${listing.status === 'active'
                    ? 'bg-lime/20 text-forest'
                    : 'bg-cream-dark text-muted-foreground'}`}>
                  {listing.status}
                </span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-forest leading-tight mb-2">
                {listing.title}
              </h1>
              {(listing.region || listing.district) && (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPinIcon size={13} />
                  {[listing.district?.name, listing.region?.name].filter(Boolean).join(', ')}
                </span>
              )}
            </div>

            {/* Price + stock */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Price per unit</p>
                  <p className="font-mono text-3xl font-bold text-forest">{formatGHS(price)}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">per {listing.unit.abbreviation}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">In stock</p>
                  <p className={`font-mono text-xl font-bold ${qty > 0 ? 'text-forest' : 'text-red-500'}`}>
                    {qty > 0 ? formatQuantity(qty, listing.unit.abbreviation) : 'Out of stock'}
                  </p>
                  {minQty > 1 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Min. order: {minQty} {listing.unit.abbreviation}
                    </p>
                  )}
                </div>
              </div>

              {(listing.deliveryOptions?.length > 0 || listing.bnplAvailable) && (
                <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-border/60">
                  {listing.deliveryOptions?.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-forest font-medium">
                      <TruckIcon size={14} className="flex-shrink-0" />
                      Delivery available
                    </div>
                  )}
                  {listing.bnplAvailable && (
                    <div className="flex items-center gap-2 text-xs text-forest font-medium">
                      <PayAtHarvestIcon size={14} className="flex-shrink-0" />
                      BNPL — Pay at Harvest
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-2xl border border-border p-5">
                <h2 className="font-bold text-forest text-sm mb-3">Product description</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Specifications */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="font-bold text-forest text-sm mb-4">Product details</h2>
              <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
                {details.map(({ label, value }) => (
                  <div key={label}
                       className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="text-xs font-semibold text-forest">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* ── Right column — Seller Management Panel ────────────────────── */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border bg-cream/50">
                <h2 className="font-bold text-forest text-sm">Seller Management View</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  This is how buyers see your listing.
                </p>
              </div>

              <div className="p-5 space-y-4">
                {/* Live stats */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Views',  value: listing.viewsCount.toLocaleString('en-GH') },
                    { label: 'Stock',  value: formatQuantity(qty, listing.unit.abbreviation) },
                    { label: 'Status', value: listing.status },
                  ].map(({ label, value }) => (
                    <div key={label} className="text-center p-3 bg-cream rounded-xl">
                      <p className="font-mono text-xs font-bold text-forest capitalize truncate">{value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/dealer/listings/${listing.id}/edit`}
                  className="flex items-center justify-center gap-1.5 w-full py-3 bg-forest text-white
                             text-sm font-bold rounded-xl hover:bg-forest-dark transition-colors"
                >
                  Edit listing <ChevronRightIcon size={14} />
                </Link>

                <Link
                  href="/dealer/listings"
                  className="flex items-center justify-center w-full py-2.5 text-sm font-semibold
                             border border-border text-muted-foreground rounded-xl hover:bg-cream
                             hover:text-forest transition-colors"
                >
                  Back to Products
                </Link>
              </div>
            </div>

            {/* Delivery options */}
            {listing.deliveryOptions?.length > 0 && (
              <div className="bg-white rounded-2xl border border-border p-5">
                <h2 className="font-bold text-forest text-sm mb-3">Delivery options</h2>
                <div className="space-y-2">
                  {listing.deliveryOptions.map(opt => (
                    <div key={opt} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-lime flex-shrink-0" />
                      {opt.replace(/_/g, ' ')}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </main>
  )
}
