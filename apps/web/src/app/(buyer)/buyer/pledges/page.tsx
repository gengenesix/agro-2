import { Suspense }           from 'react'
import { PledgeCard }          from '@/components/listings/pledge-card'
import { ListingGridSkeleton } from '@/components/shared/skeleton'
import { EmptyState }          from '@/components/shared/empty-state'
import { PledgeIcon }          from '@/components/shared/icons'
import { prisma }              from '@/lib/prisma'
import type { ListingSummary } from '@/lib/types'
import Link                    from 'next/link'

async function fetchPledges(page: number) {
  try {
    const where = { status: 'active' as const, listingType: 'harvest_pledge' as const }
    const limit = 24
    const [total, rows] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        orderBy: { expectedHarvestDate: 'asc' },
        skip:  (page - 1) * limit,
        take:  limit,
        include: {
          category: { select: { name: true, sector: true, slug: true } },
          unit:     { select: { name: true, abbreviation: true } },
          seller:   { select: { id: true, fullName: true, avatarUrl: true, verificationLevel: true, agroScore: true } },
          region:   { select: { name: true, code: true } },
          district: { select: { name: true } },
        },
      }),
    ])
    return {
      listings: rows.map(l => ({
        id:                  l.id,
        title:               l.title,
        slug:                l.slug,
        listingType:         l.listingType,
        status:              l.status,
        quantityAvailable:   Number(l.quantityAvailable),
        pricePerUnit:        Number(l.pricePerUnit),
        minOrderQuantity:    Number(l.minOrderQuantity),
        photos:              l.photos,
        farmingMethod:       l.farmingMethod ?? null,
        expectedHarvestDate: l.expectedHarvestDate?.toISOString() ?? null,
        depositPercentage:   l.depositPercentage,
        pledgeStatus:        l.pledgeStatus ?? null,
        bnplAvailable:       l.bnplAvailable,
        viewsCount:          l.viewsCount,
        createdAt:           l.createdAt.toISOString(),
        unit:                l.unit,
        category:            l.category,
        region:              l.region,
        district:            l.district,
        seller:              l.seller,
      })) as ListingSummary[],
      total,
      totalPages: Math.ceil(total / limit),
    }
  } catch {
    return { listings: [], totalPages: 1, total: 0 }
  }
}

export const metadata = {
  title: 'Harvest Pledges — AgroConnect',
  description: "Reserve future harvests from Ghana's verified farmers. Escrow-protected, pay at harvest.",
}

export default async function BuyerPledgesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp   = await searchParams
  const page = Math.max(1, Number(sp['page'] ?? 1))
  const { listings, totalPages, total } = await fetchPledges(page)

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-forest">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-harvest-gold/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <PledgeIcon size={24} className="text-harvest-gold" />
            </div>
            <div>
              <h1 className="font-bold text-white text-2xl">Harvest Pledges</h1>
              <p className="text-white/70 text-sm mt-1 max-w-lg">
                Reserve unharvested produce directly from farmers. Escrow-protected — your deposit is
                fully refunded if the farmer fails to deliver.
              </p>
              {total > 0 && (
                <p className="text-harvest-gold text-xs font-bold mt-3">
                  {total} active pledges available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Suspense fallback={<ListingGridSkeleton count={12} />}>
          {listings.length === 0 ? (
            <EmptyState
              icon={<PledgeIcon size={32} />}
              title="No harvest pledges available"
              description="New harvest pledges are added as farmers prepare their fields. Check back soon."
              action={
                <Link
                  href="/buyer/marketplace"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-forest text-white
                             text-sm font-bold rounded-xl hover:bg-forest-dark transition-colors"
                >
                  Browse available produce
                </Link>
              }
            />
          ) : (
            <div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {listings.map(listing => (
                  <PledgeCard key={listing.id} listing={listing} basePath="/buyer/pledges" />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => {
                    const p = i + 1
                    return (
                      <Link
                        key={p}
                        href={`?page=${p}`}
                        className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-colors
                          ${p === page
                            ? 'bg-forest text-white'
                            : 'bg-white border border-border text-muted-foreground hover:text-forest'}`}
                      >
                        {p}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </Suspense>
      </div>
    </main>
  )
}
