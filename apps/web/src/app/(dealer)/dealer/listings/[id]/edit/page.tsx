import { notFound }        from 'next/navigation'
import Link                 from 'next/link'
import { CreateListingForm } from '@/components/listings/create-listing-form'
import { ChevronRightIcon }  from '@/components/shared/icons'
import { prisma }            from '@/lib/prisma'
import type { Sector }       from '@/lib/types'

const VALID_SECTORS = new Set(['crops', 'livestock', 'poultry', 'fisheries', 'inputs'])

async function fetchListing(id: string) {
  try {
    return await prisma.listing.findFirst({
      where: { id },
      include: {
        category: { select: { name: true, sector: true } },
        unit:     { select: { name: true } },
        region:   { select: { id: true, name: true } },
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
  return { title: `Edit: ${listing.title} — Dealer Portal` }
}

export default async function DealerListingEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id }  = await params
  const listing = await fetchListing(id)
  if (!listing) notFound()

  const sector = VALID_SECTORS.has(listing.category.sector)
    ? listing.category.sector as Sector
    : 'inputs'

  const initialData = {
    title:             listing.title,
    description:       listing.description ?? undefined,
    sector,
    category:          listing.category.name,
    listingType:       listing.listingType as 'available_now' | 'harvest_pledge',
    quantity:          Number(listing.quantityAvailable),
    unit:              listing.unit.name,
    pricePerUnit:      Number(listing.pricePerUnit),
    minimumOrder:      Number(listing.minOrderQuantity) > 1 ? Number(listing.minOrderQuantity) : undefined,
    farmingMethod:     (listing.farmingMethod ?? undefined) as 'conventional' | 'organic' | 'certified_organic' | undefined,
    harvestDate:       listing.expectedHarvestDate
                         ? listing.expectedHarvestDate.toISOString().split('T')[0]
                         : undefined,
    depositPercent:    listing.depositPercentage ?? undefined,
    regionId:          listing.regionId ?? undefined,
    district:          listing.community ?? '',
    bnplEligible:      listing.bnplAvailable,
    deliveryAvailable: listing.deliveryOptions?.includes('farmer_delivery') ?? false,
  }

  return (
    <main className="min-h-screen bg-cream pb-10">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/dealer/listings" className="hover:text-forest transition-colors">
            Products
          </Link>
          <ChevronRightIcon size={12} />
          <span className="text-forest font-semibold truncate max-w-[240px]">
            {listing.title}
          </span>
          <ChevronRightIcon size={12} />
          <span className="text-muted-foreground">Edit</span>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="mb-6">
          <h1 className="font-bold text-forest text-xl">Edit product</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Changes are saved immediately and visible to buyers.
          </p>
        </div>

        <CreateListingForm
          listingId={id}
          initialData={initialData}
          initialPhotos={listing.photos ?? []}
        />
      </div>
    </main>
  )
}
