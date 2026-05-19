import { CreateListingForm } from '@/components/listings/create-listing-form'
import Link                  from 'next/link'
import { ArrowLeftIcon }     from '@/components/shared/icons'
import { notFound }          from 'next/navigation'

const BASE = process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000'

async function fetchListing(id: string) {
  try {
    const res = await fetch(`${BASE}/api/v1/listings/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    const json = await res.json()
    return json.data
  } catch { return null }
}

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const listing = await fetchListing(id)
  if (!listing) notFound()

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
            description:       listing.description,
            sector:            listing.sector,
            category:          listing.category,
            listingType:       listing.listingType,
            quantity:          listing.quantityTotal,
            unit:              listing.unit,
            pricePerUnit:      listing.pricePerUnit,
            minimumOrder:      listing.minimumOrder,
            farmingMethod:     listing.farmingMethod,
            harvestDate:       listing.harvestDate,
            depositPercent:    listing.depositPercent,
            regionId:          listing.regionId,
            district:          listing.district,
            bnplEligible:      listing.bnplEligible,
            deliveryAvailable: listing.deliveryAvailable,
          }}
        />
      </div>
    </main>
  )
}
