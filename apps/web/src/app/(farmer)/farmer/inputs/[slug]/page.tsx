import { notFound } from 'next/navigation'
import { Suspense }  from 'react'
import Image         from 'next/image'
import Link          from 'next/link'
import { SectorChip }  from '@/components/shared/sector-chip'
import { BnplBadge }   from '@/components/listings/bnpl-badge'
import { PhotoGallery } from '@/components/listings/photo-gallery'
import { OrderForm }   from '@/components/listings/order-form'
import { SellerCard }  from '@/components/listings/seller-card'
import {
  MapPinIcon, ChevronRightIcon, TruckIcon, PayAtHarvestIcon,
} from '@/components/shared/icons'
import { formatGHS, formatDate, formatQuantity } from '@/lib/format'
import { prisma } from '@/lib/prisma'
import type { ListingDetail } from '@/lib/types'

async function fetchListing(slug: string): Promise<ListingDetail | null> {
  try {
    const row = await prisma.listing.findFirst({
      where: { slug, status: 'active' },
      include: {
        category: { select: { name: true, sector: true, slug: true } },
        unit:     { select: { name: true, abbreviation: true } },
        seller: {
          select: {
            id: true, fullName: true, avatarUrl: true,
            verificationLevel: true, agroScore: true, createdAt: true,
          },
        },
        region:   { select: { name: true, code: true } },
        district: { select: { name: true } },
      },
    })
    if (!row || row.category.sector !== 'inputs') return null

    prisma.listing.update({ where: { id: row.id }, data: { viewsCount: { increment: 1 } } })
      .catch(() => undefined)

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
      allowNegotiation:    row.allowNegotiation,
      photos:              row.photos,
      farmingMethod:       row.farmingMethod ?? null,
      freshnessDays:       row.freshnessDays ?? null,
      deliveryOptions:     row.deliveryOptions,
      deliveryCostPerKm:   row.deliveryCostPerKm ? Number(row.deliveryCostPerKm) : null,
      expectedHarvestDate: null,
      depositPercentage:   row.depositPercentage,
      harvestWindowDays:   row.harvestWindowDays,
      pledgeStatus:        null,
      bnplAvailable:       row.bnplAvailable,
      viewsCount:          row.viewsCount + 1,
      createdAt:           row.createdAt.toISOString(),
      community:           row.community ?? null,
      gpsLat:              row.gpsLat ? Number(row.gpsLat) : null,
      gpsLng:              row.gpsLng ? Number(row.gpsLng) : null,
      brand:               row.brand        ?? null,
      manufacturer:        row.manufacturer ?? null,
      category:            row.category,
      unit:                row.unit,
      seller: {
        id:                row.seller.id,
        fullName:          row.seller.fullName,
        avatarUrl:         row.seller.avatarUrl ?? null,
        verificationLevel: row.seller.verificationLevel,
        agroScore:         row.seller.agroScore,
      },
      region:   row.region,
      district: row.district,
    }
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const listing  = await fetchListing(slug)
  if (!listing) return { title: 'Product not found' }
  return {
    title:       `${listing.title} — AgroConnect Inputs`,
    description: listing.description?.slice(0, 155),
    openGraph: {
      title:  listing.title,
      images: listing.photos?.[0] ? [listing.photos[0]] : [],
    },
  }
}

export default async function FarmerInputDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const listing  = await fetchListing(slug)
  if (!listing) notFound()

  const details: { label: string; value: string | null | undefined }[] = [
    { label: 'Category',     value: listing.category.name },
    { label: 'Brand',        value: listing.brand },
    { label: 'Manufacturer', value: listing.manufacturer },
    { label: 'Unit',         value: listing.unit.name },
    { label: 'Region',       value: listing.region?.name },
    { label: 'District',     value: listing.district?.name },
    { label: 'Listed',       value: formatDate(listing.createdAt) },
    { label: 'Views',        value: listing.viewsCount?.toLocaleString('en-GH') },
  ].filter((d): d is { label: string; value: string } => Boolean(d.value))

  return (
    <main className="min-h-screen bg-cream pb-24 lg:pb-0">
      {/* Breadcrumb — links back into the farmer portal shell */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/farmer/inputs" className="hover:text-forest transition-colors">Inputs Market</Link>
          <ChevronRightIcon size={12} />
          <SectorChip sector="inputs" label={listing.category.name} size="sm" />
          <ChevronRightIcon size={12} />
          <span className="text-forest font-semibold truncate max-w-[200px]">{listing.title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left column */}
          <div className="space-y-6">
            <Suspense fallback={<div className="aspect-video bg-cream-dark rounded-2xl animate-pulse" />}>
              <PhotoGallery photos={listing.photos ?? []} title={listing.title} />
            </Suspense>

            {/* Title block */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <SectorChip sector="inputs" label={listing.category.name} />
                {listing.bnplAvailable && <BnplBadge size="md" />}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-forest leading-tight mb-2">
                {listing.title}
              </h1>
              {(listing.brand || listing.manufacturer) && (
                <p className="text-sm text-muted-foreground mb-2">
                  {[listing.brand, listing.manufacturer].filter(Boolean).join(' · ')}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPinIcon size={13} />
                  {listing.region?.name}
                  {listing.district?.name && `, ${listing.district.name}`}
                </span>
              </div>
            </div>

            {/* Price + stock block */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <div className="flex items-end justify-between flex-wrap gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Price per unit</p>
                  <p className="font-mono text-3xl font-bold text-forest">
                    {formatGHS(listing.pricePerUnit)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">per {listing.unit.abbreviation}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">In stock</p>
                  <p className={`font-mono text-xl font-bold ${listing.quantityAvailable > 0 ? 'text-forest' : 'text-red-500'}`}>
                    {listing.quantityAvailable > 0
                      ? formatQuantity(listing.quantityAvailable, listing.unit.abbreviation)
                      : 'Out of stock'}
                  </p>
                  {listing.minOrderQuantity > 1 && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Min. order: {listing.minOrderQuantity} {listing.unit.abbreviation}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-border/60">
                {[
                  { Icon: TruckIcon,        label: 'Delivery available',    show: true },
                  { Icon: PayAtHarvestIcon, label: 'BNPL — Pay at Harvest', show: listing.bnplAvailable },
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
                  <div key={label} className="flex justify-between items-center py-1 border-b border-border/50 last:border-0">
                    <dt className="text-xs text-muted-foreground">{label}</dt>
                    <dd className="text-xs font-semibold text-forest">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Right column — order form + seller card */}
          <div className="space-y-4 lg:sticky lg:top-6 h-fit overflow-y-auto">
            <Suspense fallback={<div className="h-64 bg-white rounded-2xl border border-border animate-pulse" />}>
              <OrderForm listing={listing} />
            </Suspense>

            {listing.seller && (
              <Suspense fallback={null}>
                <SellerCard seller={{
                  id:                listing.seller.id,
                  name:              listing.seller.fullName,
                  avatar:            listing.seller.avatarUrl ?? undefined,
                  verificationLevel: listing.seller.verificationLevel,
                  agroScore:         listing.seller.agroScore,
                }} />
              </Suspense>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
