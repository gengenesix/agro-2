'use client'

import { useEffect, useState } from 'react'
import Link                     from 'next/link'
import Image                    from 'next/image'
import { api }                  from '@/lib/api'
import { formatGHS }            from '@/lib/format'
import { SectorChip }           from '@/components/shared/sector-chip'

interface Listing {
  id:           string
  slug:         string
  title:        string
  sector:       string
  pricePerUnit: number
  unit:         string
  photos:       string[]
  region:       string
  seller:       { fullName: string; verificationLevel: string }
}

const CATEGORIES = [
  { label: 'All',        value: ''           },
  { label: 'Tomatoes',   value: 'tomato'     },
  { label: 'Maize',      value: 'maize'      },
  { label: 'Cassava',    value: 'cassava'    },
  { label: 'Yam',        value: 'yam'        },
  { label: 'Fish',       value: 'tilapia'    },
  { label: 'Chicken',    value: 'broiler_chicken' },
  { label: 'Eggs',       value: 'eggs'       },
  { label: 'Vegetables', value: 'vegetable'  },
  { label: 'Fruits',     value: 'mango'      },
]

export default function ConsumerHomePage() {
  const [listings, setListings]   = useState<Listing[]>([])
  const [loading, setLoading]     = useState(true)
  const [category, setCategory]   = useState('')
  const [search, setSearch]       = useState('')
  const [query, setQuery]         = useState('')

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams({ sector: 'crops,poultry,fisheries,livestock', limit: '20' })
    if (category) params.set('category', category)
    if (query)    params.set('search',   query)

    api.get(`/listings?${params}`).then(res => {
      setListings(res.data.data?.listings ?? [])
    }).finally(() => setLoading(false))
  }, [category, query])

  return (
    <div className="space-y-5">
      {/* Search */}
      <div className="relative">
        <svg viewBox="0 0 24 24" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                                            text-muted-foreground fill-current pointer-events-none">
          <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
        </svg>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setQuery(search)}
          placeholder="Search produce, fish, eggs…"
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-border bg-white
                     focus:outline-none focus:ring-2 focus:ring-lime text-sm"
        />
      </div>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
        {CATEGORIES.map(c => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold border transition-colors ${
              category === c.value
                ? 'bg-forest text-white border-forest'
                : 'bg-white text-muted-foreground border-border hover:border-forest/30'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Hero banner */}
      {!category && !query && (
        <Link href="/produce"
          className="block rounded-2xl overflow-hidden relative h-36 bg-forest">
          <Image
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80&fit=crop"
            alt="Fresh farm produce"
            fill className="object-cover opacity-60"
            sizes="(max-width:512px)100vw,512px"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <p className="text-lime text-xs font-bold tracking-widest uppercase">Direct from farms</p>
            <p className="text-white font-display text-lg font-bold leading-tight">
              Fresh produce from<br/>Ghana's best farmers
            </p>
          </div>
        </Link>
      )}

      {/* Listings grid */}
      <div>
        <h2 className="font-semibold text-sm text-forest mb-3">
          {query ? `Results for "${query}"` : category ? CATEGORIES.find(c => c.value === category)?.label : 'All produce'}
        </h2>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-cream-dark rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">No listings found.</p>
            {(category || query) && (
              <button
                onClick={() => { setCategory(''); setSearch(''); setQuery('') }}
                className="mt-3 text-xs font-semibold text-forest underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {listings.map(listing => (
              <Link
                key={listing.id}
                href={`/produce/${listing.slug}`}
                className="bg-white rounded-2xl border border-border overflow-hidden
                           hover:border-forest/30 transition-colors active:scale-[0.98]"
              >
                <div className="relative h-32 bg-cream-dark">
                  {listing.photos[0] ? (
                    <Image
                      src={listing.photos[0]}
                      alt={listing.title}
                      fill className="object-cover"
                      sizes="50vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-8 h-8 text-muted-foreground/30 fill-current">
                        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-13 6.5S11.5 20 11.5 20"/>
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <SectorChip sector={listing.sector as any} label={listing.sector} size="sm" />
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="font-display text-xs font-semibold text-forest line-clamp-2 leading-tight">
                    {listing.title}
                  </p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-mono text-sm font-bold text-forest">
                      {formatGHS(listing.pricePerUnit)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">/{listing.unit}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{listing.region}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {listings.length > 0 && (
        <Link href="/produce"
          className="block text-center py-3.5 bg-white border border-border rounded-2xl
                     text-sm font-bold text-forest hover:border-forest/30 transition-colors">
          View all listings
        </Link>
      )}
    </div>
  )
}
