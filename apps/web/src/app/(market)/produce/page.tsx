export const dynamic   = 'force-dynamic'
export const revalidate = 0

import { Suspense }         from 'react'
import { ListingFilters }   from '@/components/listings/listing-filters'
import { ListingGrid }      from '@/components/listings/listing-grid'
import { ListingGridSkeleton } from '@/components/shared/skeleton'
import { MapViewToggle }    from '@/components/listings/map-view-toggle'
import { prisma }           from '@/lib/prisma'
import type { ListingSummary } from '@/lib/types'
import type { ListingFilters as Filters } from '@/lib/validators'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function fetchListings(filters: Filters) {
  try {
    const where = {
      status: 'active' as const,
      ...(filters.sector
        ? { category: { sector: filters.sector as 'crops' | 'livestock' | 'poultry' | 'fisheries' | 'inputs' } }
        : {}),
      ...(filters.listingType
        ? { listingType: filters.listingType as 'available_now' | 'harvest_pledge' }
        : {}),
      ...(filters.regionId
        ? { regionId: Number(filters.regionId) }
        : {}),
      ...(filters.farmingMethod
        ? { farmingMethod: filters.farmingMethod as 'conventional' | 'organic' | 'certified_organic' }
        : {}),
      ...(filters.bnplOnly     ? { bnplAvailable: true } : {}),
      ...(filters.verifiedOnly
        ? { seller: { verificationLevel: { in: ['field_verified', 'premium'] as ('field_verified' | 'premium')[] } } }
        : {}),
      ...(filters.search
        ? { title: { contains: filters.search, mode: 'insensitive' as const } }
        : {}),
    }

    const ORDER_MAP: Record<string, { [col: string]: 'asc' | 'desc' }> = {
      newest:          { createdAt:           'desc' },
      price_low:       { pricePerUnit:        'asc'  },
      price_high:      { pricePerUnit:        'desc' },
      most_viewed:     { viewsCount:          'desc' },
      harvest_soonest: { expectedHarvestDate: 'asc'  },
      top_rated:       { viewsCount:          'desc' },
    }
    const orderBy = ORDER_MAP[filters.sortBy ?? 'newest'] ?? ORDER_MAP['newest']

    const page  = Math.max(1, filters.page  ?? 1)
    const limit = Math.min(50, filters.limit ?? 24)

    const [total, rows] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        orderBy,
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

export default async function ProducePage({ searchParams }: PageProps) {
  const sp = await searchParams
  const filters: Filters = {
    page:          Number(sp['page'] ?? 1),
    limit:         24,
    sortBy:        (sp['sortBy'] as any) ?? 'newest',
    sector:        sp['sector'] as any,
    regionId:      sp['regionId'] as any,
    listingType:   sp['listingType'] as any,
    farmingMethod: sp['farmingMethod'] as any,
    verifiedOnly:  sp['verifiedOnly'] === 'true',
    bnplOnly:      sp['bnplOnly'] === 'true',
    search:        sp['search'] as string | undefined,
  }

  const { listings, totalPages, total } = await fetchListings(filters)

  return (
    <main className="min-h-screen bg-cream">
      {/* Page header */}
      <div className="bg-white border-b border-border sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-bold text-forest text-lg leading-tight">Marketplace</h1>
              {total > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {total.toLocaleString('en-GH')} listings
                </p>
              )}
            </div>
            <Suspense fallback={null}>
              <MapViewToggle />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Search bar */}
        <Suspense fallback={null}>
          <ProduceSearch initialValue={String(sp['search'] ?? '')} />
        </Suspense>

        {/* Filters */}
        <Suspense fallback={null}>
          <ListingFilters />
        </Suspense>

        {/* Grid */}
        <Suspense fallback={<ListingGridSkeleton count={24} />}>
          <ListingGrid
            listings={listings}
            totalPages={totalPages}
            page={filters.page}
          />
        </Suspense>
      </div>
    </main>
  )
}

/* ── Inline search component (client) ── */
import { ProduceSearch } from '@/components/listings/produce-search'
