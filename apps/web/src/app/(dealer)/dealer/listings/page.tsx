'use client'

import Link              from 'next/link'
import Image             from 'next/image'
import { useEffect, useState } from 'react'
import { api }           from '@/lib/api'
import { SectorChip }    from '@/components/shared/sector-chip'
import { ListingGridSkeleton } from '@/components/shared/skeleton'
import { EmptyState }    from '@/components/shared/empty-state'
import { formatGHS }     from '@/lib/format'
import { PlusIcon, ListProduceIcon, EyeIcon, ChevronRightIcon } from '@/components/shared/icons'
import type { Sector } from '@/lib/types'

const VALID_SECTORS = new Set<string>(['crops', 'livestock', 'poultry', 'fisheries', 'inputs'])
function safeSector(s: unknown): Sector {
  return (typeof s === 'string' && VALID_SECTORS.has(s)) ? (s as Sector) : 'inputs'
}

export default function DealerListingsPage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [fetchError, setFetchError] = useState(false)

  useEffect(() => {
    api.get('/listings/mine')
      .then(r => setListings(r.data?.data?.listings ?? []))
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="font-bold text-forest text-lg">Products</h1>
          <Link href="/dealer/listings/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-forest text-white text-xs font-bold
                       rounded-xl hover:bg-forest-dark transition-colors">
            <PlusIcon size={14} />
            Add product
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {loading ? (
          <ListingGridSkeleton count={6} />
        ) : fetchError ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center">
            <p className="text-sm font-semibold text-forest">Could not load products</p>
            <p className="text-xs text-muted-foreground mt-1">Check your connection and refresh the page.</p>
          </div>
        ) : listings.length === 0 ? (
          <EmptyState
            icon={<ListProduceIcon size={32} />}
            title="No products yet"
            description="Add your first product to start receiving orders from farmers."
            action={
              <Link href="/dealer/listings/new"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-forest text-white
                           text-sm font-bold rounded-xl hover:bg-forest-dark transition-colors">
                <PlusIcon size={15} />
                Add product
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {listings.map((l: any) => {
              const sector    = safeSector(l.category?.sector)
              const unitLabel = l.unit?.abbreviation ?? l.unit?.name ?? ''
              return (
                <div key={l.id}
                     className="bg-white rounded-2xl border border-border flex items-center gap-4 p-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0">
                    {l.photos?.[0] ? (
                      <Image src={l.photos[0]} alt="" fill sizes="64px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ListProduceIcon size={20} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <SectorChip sector={sector} label={l.category?.name ?? sector} size="sm" />
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize
                        ${l.status === 'active' ? 'bg-lime/20 text-forest' : 'bg-cream-dark text-muted-foreground'}`}>
                        {l.status ?? 'unknown'}
                      </span>
                    </div>
                    <p className="font-display text-sm font-semibold text-forest truncate">{l.title ?? '—'}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-mono text-xs font-bold text-forest">
                        {formatGHS(l.pricePerUnit ?? 0)}{unitLabel ? `/${unitLabel}` : ''}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(l.quantityAvailable ?? 0).toLocaleString()}{unitLabel ? ` ${unitLabel}` : ''} in stock
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/dealer/listings/${l.id}/preview`}
                      className="p-2 rounded-xl border border-border text-muted-foreground hover:text-forest hover:bg-cream transition-colors">
                      <EyeIcon size={15} />
                    </Link>
                    <Link href={`/dealer/listings/${l.id}/edit`}
                      className="p-2 rounded-xl border border-border text-muted-foreground hover:text-forest hover:bg-cream transition-colors">
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
