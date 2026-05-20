import { CreateListingForm } from '@/components/listings/create-listing-form'
import Link                  from 'next/link'
import { ArrowLeftIcon }     from '@/components/shared/icons'
import { notFound }          from 'next/navigation'
import { prisma }            from '@/lib/prisma'

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // `id` segment holds the slug (linked from listings page as /listings/[slug]/edit)
  const row = await prisma.listing.findFirst({
    where: { slug: id },
    select: {
      id: true, slug: true, title: true, description: true, listingType: true,
      quantityAvailable: true, pricePerUnit: true, minOrderQuantity: true,
      farmingMethod: true, expectedHarvestDate: true, depositPercentage: true,
      regionId: true, community: true, bnplAvailable: true, deliveryOptions: true,
      photos: true,
      category: { select: { name: true, sector: true } },
      unit:     { select: { name: true } },
    },
  }).catch(() => null)

  if (!row) notFound()

  const listing = {
    ...row,
    sector:            row.category.sector,
    category:          row.category.name,
    unit:              row.unit.name,
    quantityTotal:     Number(row.quantityAvailable),
    pricePerUnit:      Number(row.pricePerUnit),
    minimumOrder:      Number(row.minOrderQuantity),
    harvestDate:       row.expectedHarvestDate?.toISOString().slice(0, 10) ?? null,
    depositPercent:    row.depositPercentage,
    district:          row.community ?? '',
    bnplEligible:      row.bnplAvailable,
    deliveryAvailable: row.deliveryOptions.includes('farmer_delivery'),
  }

  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/listings" className="p-2 -ml-2 text-muted-foreground hover:text-forest transition-colors">
            <ArrowLeftIcon size={18} />
          </Link>
          <h1 className="font-bold text-forest text-lg">Edit Listing</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <CreateListingForm
          listingId={id}
          initialPhotos={listing.photos ?? []}
          initialData={{
            title:             listing.title,
            description:       listing.description      ?? undefined,
            sector:            listing.sector,
            category:          listing.category,
            listingType:       listing.listingType,
            quantity:          listing.quantityTotal,
            unit:              listing.unit,
            pricePerUnit:      listing.pricePerUnit,
            minimumOrder:      listing.minimumOrder      ?? undefined,
            farmingMethod:     listing.farmingMethod     ?? undefined,
            harvestDate:       listing.harvestDate       ?? undefined,
            depositPercent:    listing.depositPercent    ?? undefined,
            regionId:          listing.regionId          ?? undefined,
            district:          listing.district,
            bnplEligible:      listing.bnplEligible      ?? undefined,
            deliveryAvailable: listing.deliveryAvailable ?? undefined,
          }}
        />
      </div>
    </main>
  )
}
