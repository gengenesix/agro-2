import { Suspense }         from 'react'
import { ListingFilters }   from '@/components/listings/listing-filters'
import { ListingGrid }      from '@/components/listings/listing-grid'
import { ListingGridSkeleton } from '@/components/shared/skeleton'
import { MapViewToggle }    from '@/components/listings/map-view-toggle'
import type { ListingSummary, ListingFilters as Filters } from '@agroconnect/types'

const API = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function fetchListings(filters: Filters) {
  const params = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    if (v !== undefined && v !== '') params.set(k, String(v))
  })
  try {
    const res = await fetch(`${API}/listings?${params}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return { listings: [], totalPages: 1 }
    const json = await res.json()
    return {
      listings:   (json.data?.listings   ?? []) as ListingSummary[],
      totalPages: (json.data?.totalPages ?? 1)  as number,
      total:      (json.data?.total      ?? 0)  as number,
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
      <div className="bg-white border-b border-border sticky top-0 z-20">
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
