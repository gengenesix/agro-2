'use client'

import { useEffect, useState, useCallback } from 'react'
import Image   from 'next/image'
import { api } from '@/lib/api'
import { VerifiedBlueIcon, PremiumGreenIcon, SearchIcon } from '@/components/shared/icons'
import { formatRelative } from '@/lib/format'

interface User {
  id:                string
  phone:             string
  fullName:          string
  role:              string
  verificationLevel: string
  avatarUrl?:        string
  createdAt:         string
  banned:            boolean
}

const ROLE_COLORS: Record<string, string> = {
  farmer:       'bg-sector-crops-bg text-sector-crops',
  dealer:       'bg-sector-inputs-bg text-sector-inputs',
  buyer:        'bg-sector-fisheries-bg text-sector-fisheries',
  consumer:     'bg-cream-dark text-muted-foreground',
  field_agent:  'bg-sector-poultry-bg text-sector-poultry',
  admin:        'bg-forest/10 text-forest',
}

export default function AdminUsersPage() {
  const [users, setUsers]   = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [role, setRole]     = useState('')
  const [page, setPage]     = useState(1)
  const [total, setTotal]   = useState(0)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    if (role)   params.set('role', role)
    api.get(`/admin/users?${params}`)
      .then(r => { setUsers(r.data.data.users ?? []); setTotal(r.data.data.total ?? 0) })
      .finally(() => setLoading(false))
  }, [page, search, role])

  useEffect(() => { load() }, [load])

  async function updateVerification(userId: string, level: string) {
    await api.put(`/admin/users/${userId}/verification`, { verificationLevel: level })
    load()
  }

  async function toggleBan(userId: string, banned: boolean) {
    await api.put(`/admin/users/${userId}/ban`, { banned })
    load()
  }

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-bold text-forest text-lg">Users</h1>
              <p className="text-xs text-muted-foreground">{total.toLocaleString('en-GH')} total</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Search name or phone…"
                  className="pl-9 pr-4 py-2 text-sm border border-border rounded-xl bg-cream
                             focus:border-forest focus:outline-none w-56"
                />
              </div>
              <select value={role} onChange={e => { setRole(e.target.value); setPage(1) }}
                className="py-2 px-3 text-sm border border-border rounded-xl bg-white focus:border-forest focus:outline-none">
                <option value="">All roles</option>
                {['farmer', 'dealer', 'buyer', 'consumer', 'field_agent'].map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1).replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5">
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-cream/50">
                  {['User', 'Role', 'Verification', 'Joined', 'Actions'].map(h => (
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
                      {[1, 2, 3, 4, 5].map(j => (
                        <td key={j} className="px-4 py-3">
                          <div className="h-4 bg-cream-dark rounded animate-pulse" style={{ width: `${60 + j * 10}%` }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.map(u => (
                  <tr key={u.id} className={`hover:bg-cream/40 transition-colors ${u.banned ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cream-dark overflow-hidden flex-shrink-0">
                          {u.avatarUrl
                            ? <Image src={u.avatarUrl} alt="" width={32} height={32} className="object-cover" />
                            : <div className="w-full h-full flex items-center justify-center bg-forest text-lime text-xs font-bold">
                                {(u.fullName || u.phone).charAt(0).toUpperCase()}
                              </div>
                          }
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-forest">{u.fullName || '—'}</p>
                          <p className="font-mono text-xs text-muted-foreground">{u.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize
                                        ${ROLE_COLORS[u.role] ?? 'bg-cream-dark text-muted-foreground'}`}>
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.verificationLevel}
                        onChange={e => updateVerification(u.id, e.target.value)}
                        className="text-xs border border-border rounded-lg px-2 py-1 bg-white focus:outline-none"
                      >
                        {['unverified', 'self_declared', 'verified', 'premium'].map(l => (
                          <option key={l} value={l}>{l.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatRelative(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleBan(u.id, !u.banned)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors
                          ${u.banned
                            ? 'border-forest text-forest hover:bg-forest hover:text-white'
                            : 'border-red-300 text-red-600 hover:bg-red-50'}`}
                      >
                        {u.banned ? 'Unban' : 'Ban'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-cream/30">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg
                             hover:bg-cream transition-colors disabled:opacity-40">
                  Previous
                </button>
                <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total}
                  className="px-3 py-1.5 text-xs font-semibold border border-border rounded-lg
                             hover:bg-cream transition-colors disabled:opacity-40">
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
