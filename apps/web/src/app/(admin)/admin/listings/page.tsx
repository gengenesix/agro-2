'use client'

import Link              from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { api }           from '@/lib/api'
import { SectorChip }    from '@/components/shared/sector-chip'
import { SearchIcon, EyeIcon } from '@/components/shared/icons'
import { formatGHS, formatRelative } from '@/lib/format'

interface Listing {
  id:        string
  slug:      string
  title:     string
  sector:    string
  status:    string
  pricePerUnit: number
  unit:      string
  sellerName: string
  regionName: string
  createdAt: string
  viewsCount: number
}

const STATUS_CFG: Record<string, string> = {
  active:   'bg-lime/20 text-forest',
  paused:   'bg-cream-dark text-muted-foreground',
  sold_out: 'bg-red-50 text-red-600',
  expired:  'bg-cream-dark text-muted-foreground',
  draft:    'bg-harvest-gold/15 text-harvest-gold',
}

export default function AdminListingsPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    api.get(`/admin/listings?${params}`)
      .then(r => { setListings(r.data.data.listings ?? []); setTotal(r.data.data.total ?? 0) })
      .finally(() => setLoading(false))
  }, [page, search])

  useEffect(() => { load() }, [load])

  async function toggleStatus(id: string, currentStatus: string) {
    const next = currentStatus === 'active' ? 'paused' : 'active'
    await api.put(`/admin/listings/${id}/status`, { status: next })
    load()
  }

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-bold text-forest text-lg">Listings</h1>
            <p className="text-xs text-muted-foreground">{total.toLocaleString('en-GH')} total</p>
          </div>
          <div className="relative">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search listings…"
              className="pl-9 pr-4 py-2 text-sm border border-border rounded-xl bg-cream
                         focus:border-forest focus:outline-none w-56" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-cream/50">
                  {['Listing', 'Sector', 'Price', 'Seller', 'Status', 'Views', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i}>
                      {[1, 2, 3, 4, 5, 6, 7].map(j => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-cream-dark rounded animate-pulse" style={{ width: `${50 + j * 7}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : listings.map(l => (
                  <tr key={l.id} className="hover:bg-cream/40 transition-colors">
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="font-display text-sm font-semibold text-forest truncate">{l.title}</p>
                      <p className="text-[10px] text-muted-foreground">{formatRelative(l.createdAt)}</p>
                    </td>
                    <td className="px-4 py-3"><SectorChip sector={l.sector as any} label={l.sector} size="sm" /></td>
                    <td className="px-4 py-3 font-mono text-sm font-bold text-forest">
                      {formatGHS(l.pricePerUnit)}/{l.unit}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{l.sellerName}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize
                                        ${STATUS_CFG[l.status] ?? ''}`}>
                        {l.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground flex items-center gap-1">
                      <EyeIcon size={11} />
                      {(l.viewsCount ?? 0).toLocaleString('en-GH')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/produce/${l.slug}`}
                          className="text-[10px] font-bold px-2.5 py-1 rounded-lg border border-border
                                     text-forest hover:bg-cream transition-colors">
                          View
                        </Link>
                        <button onClick={() => toggleStatus(l.id, l.status)}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors
                            ${l.status === 'active'
                              ? 'border-red-300 text-red-600 hover:bg-red-50'
                              : 'border-lime/50 text-forest hover:bg-lime/10'}`}>
                          {l.status === 'active' ? 'Pause' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {total > 20 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-cream/30">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-cream transition-colors disabled:opacity-40">
                  Previous
                </button>
                <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}
                  className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg hover:bg-cream transition-colors disabled:opacity-40">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
