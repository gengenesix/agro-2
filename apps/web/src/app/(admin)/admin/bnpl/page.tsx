'use client'

import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { formatGHS, formatDate } from '@/lib/format'
import { LoadingIcon } from '@/components/shared/icons'

interface BNPLApp {
  id:          string
  userId:      string
  userName:    string
  userPhone:   string
  amount:      number
  purpose:     string
  status:      string
  agroScore:   number
  tier:        string
  createdAt:   string
}

const STATUS_CFG: Record<string, string> = {
  pending:   'bg-harvest-gold/15 text-harvest-gold',
  approved:  'bg-lime/20 text-forest',
  active:    'bg-forest/10 text-forest',
  repaid:    'bg-cream-dark text-muted-foreground',
  defaulted: 'bg-red-50 text-red-600',
  rejected:  'bg-red-50 text-red-600',
}

export default function AdminBNPLPage() {
  const [apps, setApps]       = useState<BNPLApp[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState('pending')
  const [acting, setActing]   = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    api.get(`/admin/bnpl?status=${filter}`)
      .then(r => setApps(r.data.data.applications ?? []))
      .finally(() => setLoading(false))
  }, [filter])

  useEffect(() => { load() }, [load])

  async function decide(id: string, approve: boolean) {
    setActing(id)
    try {
      await api.put(`/admin/bnpl/${id}/${approve ? 'approve' : 'reject'}`)
      load()
    } finally {
      setActing(null)
    }
  }

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="font-bold text-forest text-lg mb-3">BNPL Applications</h1>
          <div className="flex gap-2">
            {['pending', 'approved', 'active', 'defaulted', 'all'].map(s => (
              <button key={s} onClick={() => setFilter(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-colors capitalize
                  ${filter === s ? 'bg-forest text-white border-forest' : 'bg-white text-forest border-border hover:bg-cream'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <LoadingIcon size={28} className="animate-spin text-forest" />
          </div>
        ) : apps.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border px-5 py-10 text-center">
            <p className="text-sm text-muted-foreground">No {filter} applications</p>
          </div>
        ) : apps.map(app => (
          <div key={app.id} className="bg-white rounded-2xl border border-border p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_CFG[app.status] ?? ''}`}>
                    {app.status}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cream-dark text-muted-foreground capitalize">
                    {app.tier}
                  </span>
                </div>
                <p className="font-bold text-forest">{app.userName}</p>
                <p className="font-mono text-xs text-muted-foreground">{app.userPhone}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xl font-bold text-forest">{formatGHS(app.amount)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{app.purpose}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4 mb-4">
              <div className="bg-cream rounded-xl p-3 text-center">
                <p className="text-[10px] text-muted-foreground">AgroScore</p>
                <p className="font-mono text-sm font-bold text-forest mt-0.5">{app.agroScore}/110</p>
              </div>
              <div className="bg-cream rounded-xl p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Applied</p>
                <p className="text-xs font-semibold text-forest mt-0.5">{formatDate(app.createdAt)}</p>
              </div>
              <div className="bg-cream rounded-xl p-3 text-center">
                <p className="text-[10px] text-muted-foreground">Tier</p>
                <p className="text-xs font-semibold text-forest capitalize mt-0.5">{app.tier}</p>
              </div>
            </div>

            {app.status === 'pending' && (
              <div className="flex gap-3">
                <button onClick={() => decide(app.id, false)} disabled={acting === app.id}
                  className="flex-1 py-2.5 border border-red-300 text-red-600 text-sm font-bold rounded-xl
                             hover:bg-red-50 transition-colors disabled:opacity-50">
                  Reject
                </button>
                <button onClick={() => decide(app.id, true)} disabled={acting === app.id}
                  className="flex-1 py-2.5 bg-forest text-white text-sm font-bold rounded-xl
                             hover:bg-forest-dark transition-colors disabled:opacity-50
                             flex items-center justify-center gap-2">
                  {acting === app.id ? <LoadingIcon size={14} className="animate-spin" /> : null}
                  Approve
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
