import { ListingCard }        from './listing-card'
import { EmptyState }         from '@/components/shared/empty-state'
import { ListingGridSkeleton } from '@/components/shared/skeleton'
import { MarketIcon, ChevronRightIcon } from '@/components/shared/icons'
import type { ListingSummary } from '@agroconnect/types'
import Link from 'next/link'

interface ListingGridProps {
  listings:   ListingSummary[]
  loading?:   boolean
  totalPages?: number
  page?:       number
}

export function ListingGrid({ listings, loading, totalPages = 1, page = 1 }: ListingGridProps) {
  if (loading) return <ListingGridSkeleton count={12} />

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={<MarketIcon size={32} />}
        title="No listings found"
        description="Try adjusting your filters or search terms. New listings are added daily."
        action={
          <Link
            href="/produce"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-forest text-white
                       text-sm font-bold rounded-xl hover:bg-forest-dark transition-colors"
          >
            Browse all
            <ChevronRightIcon size={15} />
          </Link>
        }
      />
    )
  }

  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {listings.map(listing => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => {
            const p    = i + 1
            const href = `?page=${p}`
            return (
              <Link
                key={p}
                href={href}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold
                            transition-colors
                  ${p === page
                    ? 'bg-forest text-white'
                    : 'bg-white border border-border text-muted-foreground hover:text-forest'}`}
              >
                {p}
              </Link>
            )
          })}
          {totalPages > 10 && (
            <span className="text-sm text-muted-foreground">... {totalPages} pages</span>
          )}
        </div>
      )}
    </div>
  )
}
