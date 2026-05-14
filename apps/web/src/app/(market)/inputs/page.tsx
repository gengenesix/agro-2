'use client'

import { useEffect, useState, useCallback } from 'react'
import Link            from 'next/link'
import Image           from 'next/image'
import { api }         from '@/lib/api'
import { SectorChip }  from '@/components/shared/sector-chip'
import { BnplBadge }   from '@/components/listings/bnpl-badge'
import { EmptyState }  from '@/components/shared/empty-state'
import { ListingCardSkeleton } from '@/components/shared/skeleton'
import {
  SearchIcon, FilterIcon, MapPinIcon, InputsIcon, PayAtHarvestIcon,
} from '@/components/shared/icons'
import { formatGHS } from '@/lib/format'

interface InputListing {
  id:              string
  slug:            string
  title:           string
  sector:          string
  category:        string
  pricePerUnit:    number
  unit:            string
  quantityAvailable: number
  bnplEligible:    boolean
  photos:          string[]
  region:          string
  district:        string
  seller:          { fullName: string; businessName?: string }
}

const INPUT_CATEGORIES = [
  'All',
  'Seeds',
  'NPK Fertilizer',
  'Urea',
  'Organic Fertilizer',
  'Pesticide',
  'Herbicide',
  'Veterinary Drug',
  'Fish Feed',
  'Equipment',
  'Packaging',
]

export default function InputsMarketPage() {
  const [listings, setListings] = useState<InputListing[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('All')
  const [bnplOnly, setBnplOnly] = useState(false)
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({
      sector: 'inputs',
      page:   String(page),
      limit:  '24',
    })
    if (search)   params.set('search', search)
    if (category !== 'All') params.set('category', category)
    if (bnplOnly) params.set('bnplEligible', 'true')

    api.get(`/listings?${params}`)
      .then(r => {
        setListings(r.data.data ?? [])
        setTotal(r.data.pagination?.total ?? 0)
      })
      .finally(() => setLoading(false))
  }, [page, search, category, bnplOnly])

  useEffect(() => { load() }, [load])

  return (
    <main className="min-h-screen bg-cream pb-20">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                placeholder="Search seeds, fertilizers, equipment…"
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-xl bg-cream
                           focus:border-forest focus:outline-none"
              />
            </div>
            <button
              onClick={() => { setBnplOnly(b => !b); setPage(1) }}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-xl border transition-colors
                ${bnplOnly
                  ? 'bg-lime/20 border-forest text-forest'
                  : 'bg-white border-border text-muted-foreground hover:border-forest hover:text-forest'}`}
            >
              <PayAtHarvestIcon size={14} />
              BNPL
            </button>
          </div>

          {/* Category chips */}
          <div className="flex gap-2 mt-3 pb-1 overflow-x-auto scrollbar-none">
            {INPUT_CATEGORIES.map(cat => (
              <button key={cat}
                onClick={() => { setCategory(cat); setPage(1) }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap border transition-colors
                  ${category === cat
                    ? 'bg-forest text-white border-forest'
                    : 'bg-white text-muted-foreground border-border hover:border-forest hover:text-forest'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        {/* Count */}
        <p className="text-xs text-muted-foreground mb-4">
          {loading ? 'Loading…' : `${total.toLocaleString('en-GH')} input${total !== 1 ? 's' : ''} available`}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => <ListingCardSkeleton key={i} />)
          ) : listings.length === 0 ? (
            <div className="col-span-full">
              <EmptyState
                icon={<InputsIcon size={32} />}
                title="No inputs found"
                description="Try adjusting your search or browse all categories."
              />
            </div>
          ) : (
            listings.map(item => (
              <Link key={item.id} href={`/produce/${item.slug}`}
                className="bg-white rounded-2xl border border-border overflow-hidden hover:shadow-md transition-shadow group">
                {/* Photo */}
                <div className="relative aspect-[4/3] bg-cream-dark overflow-hidden">
                  {item.photos?.[0] ? (
                    <Image
                      src={item.photos[0]}
                      alt={item.title}
                      fill sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <InputsIcon size={32} className="text-muted-foreground/40" />
                    </div>
                  )}
                  {item.bnplEligible && (
                    <div className="absolute top-2 right-2">
                      <BnplBadge />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <SectorChip sector="inputs" size="sm" />
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="font-display text-sm font-semibold text-forest leading-tight line-clamp-2 mb-1">
                    {item.title}
                  </p>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="font-mono text-sm font-bold text-forest">{formatGHS(item.pricePerUnit)}</span>
                    <span className="text-xs text-muted-foreground">/{item.unit}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPinIcon size={11} />
                    <span className="truncate">{item.district}, {item.region}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {item.seller.businessName ?? item.seller.fullName}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Pagination */}
        {total > 24 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-4 py-2 text-sm font-semibold border border-border rounded-xl
                         hover:bg-cream transition-colors disabled:opacity-40">
              Previous
            </button>
            <span className="text-sm text-muted-foreground">Page {page} of {Math.ceil(total / 24)}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page * 24 >= total}
              className="px-4 py-2 text-sm font-semibold border border-border rounded-xl
                         hover:bg-cream transition-colors disabled:opacity-40">
              Next
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
