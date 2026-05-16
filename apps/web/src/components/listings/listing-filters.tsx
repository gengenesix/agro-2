'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useState }       from 'react'
import { FilterIcon, CloseIcon, ChevronDownIcon } from '@/components/shared/icons'
import { GHANA_REGIONS } from '@/lib/types'

const SECTORS = [
  { value: 'crops',     label: 'Crops'     },
  { value: 'livestock', label: 'Livestock' },
  { value: 'poultry',   label: 'Poultry'   },
  { value: 'fisheries', label: 'Fisheries' },
  { value: 'inputs',    label: 'Inputs'    },
]

const SORT_OPTIONS = [
  { value: 'newest',          label: 'Newest First'    },
  { value: 'price_low',       label: 'Price: Low–High' },
  { value: 'price_high',      label: 'Price: High–Low' },
  { value: 'most_viewed',     label: 'Most Viewed'     },
  { value: 'harvest_soonest', label: 'Harvest Soonest' },
  { value: 'top_rated',       label: 'Top Rated'       },
]

export function ListingFilters() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  function getParam(key: string) {
    return searchParams.get(key) ?? ''
  }

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  const clearAll = useCallback(() => {
    router.push('?')
  }, [router])

  const hasFilters = ['sector', 'regionId', 'listingType', 'farmingMethod', 'verifiedOnly', 'bnplOnly'].some(
    k => searchParams.has(k)
  )

  return (
    <div className="space-y-3">
      {/* Sort + filter toggle row */}
      <div className="flex items-center gap-2">
        {/* Sort */}
        <div className="relative flex-1 max-w-[200px]">
          <select
            value={getParam('sortBy') || 'newest'}
            onChange={e => updateFilter('sortBy', e.target.value)}
            className="w-full appearance-none px-4 py-2.5 pr-9 bg-white border border-border
                       rounded-xl text-sm font-semibold text-forest focus:border-forest focus:outline-none
                       cursor-pointer"
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDownIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setOpen(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold
                      transition-colors ${open || hasFilters
                        ? 'bg-forest text-white border-forest'
                        : 'bg-white text-forest border-border hover:bg-cream'}`}
        >
          <FilterIcon size={15} />
          Filters
          {hasFilters && (
            <span className="w-2 h-2 rounded-full bg-lime" />
          )}
        </button>

        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 px-3 py-2.5 text-sm font-semibold
                       text-muted-foreground hover:text-forest transition-colors"
          >
            <CloseIcon size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Filter panel */}
      {open && (
        <div className="bg-white border border-border rounded-2xl p-5 space-y-5">
          {/* Sector */}
          <div>
            <p className="text-xs font-bold text-forest uppercase tracking-wider mb-2.5">Sector</p>
            <div className="flex flex-wrap gap-2">
              {SECTORS.map(s => {
                const active = getParam('sector') === s.value
                return (
                  <button
                    key={s.value}
                    onClick={() => updateFilter('sector', active ? '' : s.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors
                      ${active
                        ? 'bg-forest text-white border-forest'
                        : 'bg-white text-muted-foreground border-border hover:border-forest hover:text-forest'}`}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Listing type */}
          <div>
            <p className="text-xs font-bold text-forest uppercase tracking-wider mb-2.5">Type</p>
            <div className="flex gap-2">
              {[
                { value: '', label: 'All' },
                { value: 'available_now', label: 'Available Now' },
                { value: 'harvest_pledge', label: 'Harvest Pledges' },
              ].map(t => {
                const active = getParam('listingType') === t.value
                return (
                  <button
                    key={t.value}
                    onClick={() => updateFilter('listingType', t.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors
                      ${active
                        ? 'bg-forest text-white border-forest'
                        : 'bg-white text-muted-foreground border-border hover:border-forest hover:text-forest'}`}
                  >
                    {t.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Region */}
          <div>
            <p className="text-xs font-bold text-forest uppercase tracking-wider mb-2.5">Region</p>
            <div className="relative">
              <select
                value={getParam('regionId')}
                onChange={e => updateFilter('regionId', e.target.value)}
                className="w-full appearance-none px-4 py-2.5 pr-9 bg-cream border border-border
                           rounded-xl text-sm font-medium text-forest focus:border-forest focus:outline-none"
              >
                <option value="">All regions</option>
                {GHANA_REGIONS.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              <ChevronDownIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Farming method */}
          <div>
            <p className="text-xs font-bold text-forest uppercase tracking-wider mb-2.5">Farming Method</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { value: '', label: 'Any' },
                { value: 'organic', label: 'Organic' },
                { value: 'certified_organic', label: 'Certified Organic' },
                { value: 'conventional', label: 'Conventional' },
              ].map(m => {
                const active = getParam('farmingMethod') === m.value
                return (
                  <button
                    key={m.value}
                    onClick={() => updateFilter('farmingMethod', m.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors
                      ${active
                        ? 'bg-forest text-white border-forest'
                        : 'bg-white text-muted-foreground border-border hover:border-forest hover:text-forest'}`}
                  >
                    {m.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-4 pt-1 border-t border-border">
            {[
              { key: 'verifiedOnly', label: 'Verified sellers only' },
              { key: 'bnplOnly',     label: 'BNPL available'         },
            ].map(t => {
              const active = getParam(t.key) === 'true'
              return (
                <label key={t.key} className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => updateFilter(t.key, active ? '' : 'true')}
                    className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer
                      ${active ? 'bg-forest' : 'bg-cream-dark border border-border'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform
                      ${active ? 'translate-x-4' : 'translate-x-0.5'}`}
                    />
                  </div>
                  <span className="text-sm font-medium text-forest">{t.label}</span>
                </label>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
