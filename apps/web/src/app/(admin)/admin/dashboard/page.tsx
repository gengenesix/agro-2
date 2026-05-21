'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import {
  ProfileIcon, ListProduceIcon, OrdersIcon, AdminIcon, ChevronRightIcon,
} from '@/components/shared/icons'
import { formatGHSCompact } from '@/lib/format'

interface AdminStats {
  totalGMV:       number
  totalFarmers:   number
  totalDealers:   number
  totalBuyers:    number
  activeListings: number
  activePledges:  number
  bnplDisbursed:  number
  pendingBNPL:    number
  pendingVerify:  number
}

const ZERO: AdminStats = {
  totalGMV:       0,
  totalFarmers:   0,
  totalDealers:   0,
  totalBuyers:    0,
  activeListings: 0,
  activePledges:  0,
  bnplDisbursed:  0,
  pendingBNPL:    0,
  pendingVerify:  0,
}

export default function AdminDashboardPage() {
  const [stats, setStats]     = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data.data ?? ZERO))
      .catch(() => setStats(ZERO))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-white/10 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/10 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const s = stats ?? ZERO

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-white">Platform Dashboard</h1>
        <p className="text-white/50 text-sm mt-1">AgroConnect Ghana — Admin Overview</p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total GMV',       value: formatGHSCompact(s.totalGMV),              color: 'text-lime'  },
          { label: 'Active Farmers',  value: s.totalFarmers.toLocaleString('en-GH'),    color: 'text-white' },
          { label: 'Active Listings', value: s.activeListings.toLocaleString('en-GH'),  color: 'text-white' },
          { label: 'BNPL Disbursed',  value: formatGHSCompact(s.bnplDisbursed),         color: 'text-lime'  },
        ].map(k => (
          <div key={k.label} className="bg-white/10 rounded-2xl p-5 border border-white/10">
            <p className="text-white/50 text-xs font-medium uppercase tracking-wide mb-2">{k.label}</p>
            <p className={`text-2xl font-extrabold font-mono ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Action queues */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {[
          { href: '/admin/bnpl',     label: 'BNPL Queue',            count: s.pendingBNPL,   urgent: true,  Icon: OrdersIcon      },
          { href: '/admin/users',    label: 'Pending Verifications', count: s.pendingVerify, urgent: true,  Icon: ProfileIcon     },
          { href: '/admin/listings', label: 'Active Pledges',        count: s.activePledges, urgent: false, Icon: ListProduceIcon },
        ].map(q => (
          <Link
            key={q.href}
            href={q.href}
            className="flex items-center justify-between p-5 bg-white/10 border border-white/10
                       rounded-2xl hover:bg-white/15 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="p-2.5 bg-white/10 rounded-xl">
                <q.Icon size={20} className="text-white" />
              </span>
              <div>
                <p className="text-white text-sm font-semibold">{q.label}</p>
                <p className={`text-xl font-extrabold font-mono ${q.urgent ? 'text-lime' : 'text-white/70'}`}>
                  {q.count}
                </p>
              </div>
            </div>
            <ChevronRightIcon size={18} className="text-white/30" />
          </Link>
        ))}
      </div>

      {/* Role breakdown */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: 'Farmers', value: s.totalFarmers },
          { label: 'Dealers', value: s.totalDealers },
          { label: 'Buyers',  value: s.totalBuyers  },
        ].map(r => (
          <div key={r.label} className="bg-white/5 rounded-2xl p-4 border border-white/10 text-center">
            <p className="text-white font-extrabold font-mono text-2xl">{r.value.toLocaleString('en-GH')}</p>
            <p className="text-white/50 text-xs font-medium mt-1">{r.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
