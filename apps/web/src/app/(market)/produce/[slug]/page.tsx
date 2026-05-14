import { notFound }            from 'next/navigation'
import { Suspense }             from 'next/navigation'
import Image                   from 'next/image'
import Link                    from 'next/link'
import { Suspense as RSuspense } from 'react'
import { SectorChip }           from '@/components/shared/sector-chip'
import { BnplBadge }            from '@/components/listings/bnpl-badge'
import { AgroScoreBar }         from '@/components/shared/agro-score-bar'
import { PhotoGallery }         from '@/components/listings/photo-gallery'
import { OrderForm }            from '@/components/listings/order-form'
import { SellerCard }           from '@/components/listings/seller-card'
import { ReviewList }           from '@/components/listings/review-list'
import {
  MapPinIcon, CalendarIcon, VerifiedBlueIcon, ChevronRightIcon,
  TruckIcon, PayAtHarvestIcon, AgroScoreIcon,
} from '@/components/shared/icons'
import { formatGHS, formatDate, formatQuantity } from '@/lib/format'
import type { ListingDetail } from '@agroconnect/types'

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'

async function fetchListing(slug: string): Promise<ListingDetail | null> {
  try {
    const res = await fetch(`${API}/listings/${slug}`, { next: { revalidate: 120 } })
    if (!res.ok) return null
    const json = await res.json()
    return json.data as ListingDetail
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const listing  = await fetchListing(slug)
  if (!listing) return { title: 'Listing not found' }
  return {
    title:       `${listing.title} — AgroConnect`,
    description: listing.description?.slice(0, 155),
    openGraph: {
      title:  listing.title,
      images: listing.photos?.[0] ? [listing.photos[0]] : [],
    },
  }
}

export default async function ListingDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const listing  = await fetchListing(slug)
  if (!listing) notFound()

  const isPledge = listing.listingType === 'harvest_pledge'

  return (
    <main className="min-h-screen bg-cream pb-24 lg:pb-0">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/produce" className="hover:text-forest transition-colors">Marketplace</Link>
          <ChevronRightIcon size={12} />
          <SectorChip sector={listing.sector} size="sm" />
          <ChevronRightIcon size={12} />
          <span className="text-forest font-semibold truncate max-w-[200px]">{listing.title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Left column */}
          <div className="space-y-6">
            {/* Photo gallery */}
            <RSuspense fallback={
              <div className="aspect-video bg-cream-dark rounded-2xl animate-pulse" />
            }>
              <PhotoGallery photos={listing.photos ?? []} title={listing.title} />
            </RSuspense>

            {/* Title block */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <SectorChip sector={listing.sector} />
                {isPledge && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-harvest-gold/15 text-harvest-gold border border-harvest-gold/25">
                    Harvest Pledge
                  </span>
                )}
                {listing.bnplEligible && <BnplBadge size="md" />}
                {listing.farmingMethod && listing.farmingMethod !== 'conventional' && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-lime/20 text-forest border border-lime/30 capitalize">
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
                  {listing.regionName}
                  {listing.district && `, ${listing.district}`}
                </span>
                {listing.harvestDate && (
                  <span className="flex items-center gap-1">
                    <CalendarIcon size={13} />
                    Harvest: {formatDate(listing.harvestDate)}
                  </span>
                )}
              </div>
            </div>

            {/* Price block */}
            <div className={`rounded-2xl p-5 ${isPledge ? 'bg-harvest-gold/8 border border-harvest-gold/20' : 'bg-white border border-border'}`}>
              <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {isPledge ? 'Pledge price' : 'Price per unit'}
                  </p>
                  <p className="font-mono text-3xl font-bold text-forest">
                    {formatGHS(listing.pricePerUnit)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">per {listing.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Available quantity</p>
                  <p className="font-mono text-xl font-bold text-forest">
                    {formatQuantity(listing.quantityAvailable, listing.unit)}
                  </p>
                  {listing.minimumOrder && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Min. order: {listing.minimumOrder} {listing.unit}
                    </p>
                  )}
                </div>
              </div>

              {/* Assurances */}
              <div className="grid sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-border/60">
                {[
                  { Icon: TruckIcon,         label: 'Delivery available',         show: true },
                  { Icon: PayAtHarvestIcon,  label: 'Pay at Harvest (BNPL)',       show: listing.bnplEligible },
                  { Icon: AgroScoreIcon,     label: 'AgroScore-verified seller',   show: (listing.seller?.agroScore ?? 0) >= 50 },
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
                  { label: 'Category',       value: listing.category },
                  { label: 'Sector',         value: listing.sector },
                  { label: 'Farming method', value: listing.farmingMethod?.replace('_', ' ') },
                  { label: 'Region',         value: listing.regionName },
                  { label: 'District',       value: listing.district },
                  { label: 'Harvest date',   value: listing.harvestDate ? formatDate(listing.harvestDate) : null },
                  { label: 'Listed',         value: formatDate(listing.createdAt) },
                  { label: 'Views',          value: listing.viewsCount?.toLocaleString('en-GH') },
                ].filter(d => d.value).map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="text-xs font-semibold text-forest capitalize">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Reviews */}
            {listing.reviews && listing.reviews.length > 0 && (
              <RSuspense fallback={null}>
                <ReviewList reviews={listing.reviews} averageRating={listing.averageRating} />
              </RSuspense>
            )}
          </div>

          {/* Right column — sticky order form + seller card */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {/* Order / pledge form */}
            <RSuspense fallback={<div className="h-64 bg-white rounded-2xl border border-border animate-pulse" />}>
              <OrderForm listing={listing} />
            </RSuspense>

            {/* Seller card */}
            {listing.seller && (
              <RSuspense fallback={null}>
                <SellerCard seller={listing.seller} />
              </RSuspense>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
