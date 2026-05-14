'use client'

import Link              from 'next/link'
import Image             from 'next/image'
import { useEffect, useState } from 'react'
import { api }           from '@/lib/api'
import { SectorChip }    from '@/components/shared/sector-chip'
import { ListingGridSkeleton } from '@/components/shared/skeleton'
import { EmptyState }    from '@/components/shared/empty-state'
import { formatGHS, formatDate } from '@/lib/format'
import {
  PlusIcon, ListProduceIcon, EyeIcon, ChevronRightIcon,
} from '@/components/shared/icons'
import type { ListingSummary } from '@agroconnect/types'

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  active:   { label: 'Active',   cls: 'bg-lime/20 text-forest' },
  paused:   { label: 'Paused',   cls: 'bg-cream-dark text-muted-foreground' },
  sold_out: { label: 'Sold out', cls: 'bg-red-50 text-red-600' },
  expired:  { label: 'Expired',  cls: 'bg-cream-dark text-muted-foreground' },
  draft:    { label: 'Draft',    cls: 'bg-harvest-gold/15 text-harvest-gold' },
}

export default function MyListingsPage() {
  const [listings, setListings] = useState<ListingSummary[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    api.get('/listings/mine')
      .then(r => setListings(r.data.data.listings ?? []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-cream pb-10">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="font-bold text-forest text-lg">My Listings</h1>
          <Link
            href="/listings/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-forest text-white text-xs font-bold
                       rounded-xl hover:bg-forest-dark transition-colors"
          >
            <PlusIcon size={14} />
            New listing
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <ListingGridSkeleton count={6} />
        ) : listings.length === 0 ? (
          <EmptyState
            icon={<ListProduceIcon size={32} />}
            title="No listings yet"
            description="Create your first listing to start selling your produce on AgroConnect."
            action={
              <Link href="/listings/new"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-forest text-white
                           text-sm font-bold rounded-xl hover:bg-forest-dark transition-colors">
                <PlusIcon size={15} />
                Create listing
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {listings.map(listing => {
              const status = STATUS_LABELS[(listing as any).status ?? 'active']
              return (
                <div key={listing.id}
                     className="bg-white rounded-2xl border border-border flex items-center gap-4 p-4
                                hover:shadow-md transition-shadow">
                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0">
                    {listing.photos?.[0] ? (
                      <Image src={listing.photos[0]} alt={listing.title} fill sizes="64px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ListProduceIcon size={20} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <SectorChip sector={listing.sector} size="sm" />
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.cls}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="font-display text-sm font-semibold text-forest truncate">{listing.title}</p>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <span className="font-mono text-xs font-bold text-forest">{formatGHS(listing.pricePerUnit)}/{listing.unit}</span>
                      <span className="text-xs text-muted-foreground">{listing.quantityAvailable} {listing.unit} left</span>
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <EyeIcon size={11} />
                        {listing.viewsCount ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/produce/${listing.slug}`}
                      className="p-2 rounded-xl border border-border text-muted-foreground hover:text-forest
                                 hover:bg-cream transition-colors"
                      title="Preview"
                    >
                      <EyeIcon size={15} />
                    </Link>
                    <Link
                      href={`/listings/${listing.id}/edit`}
                      className="p-2 rounded-xl border border-border text-muted-foreground hover:text-forest
                                 hover:bg-cream transition-colors"
                      title="Edit"
                    >
                      <ChevronRightIcon size={15} />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
