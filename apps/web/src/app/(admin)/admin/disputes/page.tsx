'use client'

import { useEffect, useState, useCallback } from 'react'
import { api }              from '@/lib/api'
import { DisputesQueue }    from '@/components/admin/disputes-queue'
import { SearchIcon }       from '@/components/shared/icons'

const TABS = [
  { value: 'disputed',  label: 'Active disputes'  },
  { value: 'resolved',  label: 'Resolved'         },
] as const

type Tab = (typeof TABS)[number]['value']

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState<Tab>('disputed')
  const [search, setSearch]     = useState('')
  const [total, setTotal]       = useState(0)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ status: tab, limit: '30' })
    if (search) params.set('search', search)
    api.get(`/admin/orders?${params}`)
      .then(r => {
        setDisputes(r.data.data?.orders ?? [])
        setTotal(r.data.data?.total ?? 0)
      })
      .finally(() => setLoading(false))
  }, [tab, search])

  useEffect(() => { load() }, [load])

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-bold text-forest text-lg">Disputes</h1>
              <p className="text-xs text-muted-foreground">{total} {tab === 'disputed' ? 'active' : 'resolved'}</p>
            </div>
            <div className="relative">
              <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value) }}
                placeholder="Order number or user…"
                className="pl-9 pr-4 py-2 text-sm border border-border rounded-xl bg-cream
                           focus:border-forest focus:outline-none w-52"
              />
            </div>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex gap-1 pb-1">
          {TABS.map(t => (
            <button key={t.value} onClick={() => setTab(t.value)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-xl border-b-2 transition-colors whitespace-nowrap
                ${tab === t.value
                  ? 'border-red-400 text-red-600'
                  : 'border-transparent text-muted-foreground hover:text-forest'}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-5">
        <DisputesQueue disputes={disputes} loading={loading} onRefresh={load} />
      </div>
    </main>
  )
}
