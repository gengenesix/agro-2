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
        <div className="h-10 w-64 bg-white/10 rounded-xl animate-pulse mb-8" />
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
  const today = new Date().toLocaleDateString('en-GH', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1
            className="font-display font-bold text-white leading-tight"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.03em' }}
          >
            Platform Dashboard
          </h1>
          <p className="text-white/40 text-sm mt-1">AgroConnect · {today}</p>
        </div>
        <div
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold
                     uppercase tracking-[0.13em] text-forest"
          style={{
            backgroundColor: 'var(--lime)',
            clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-forest/60 animate-pulse" />
          Live
        </div>
      </div>

      {/* ── Primary KPIs ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Total GMV',
            value: formatGHSCompact(s.totalGMV),
            accent: true,
            sub:   'All-time gross value',
          },
          {
            label: 'Active Farmers',
            value: s.totalFarmers.toLocaleString('en-GH'),
            accent: false,
            sub:   'Registered producers',
          },
          {
            label: 'Active Listings',
            value: s.activeListings.toLocaleString('en-GH'),
            accent: false,
            sub:   'Live on marketplace',
          },
          {
            label: 'BNPL Disbursed',
            value: formatGHSCompact(s.bnplDisbursed),
            accent: true,
            sub:   'Total credit issued',
          },
        ].map(k => (
          <div
            key={k.label}
            className="rounded-2xl p-5 border border-white/10 overflow-hidden relative"
            style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
          >
            {k.accent && (
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{ backgroundColor: 'var(--lime)' }}
              />
            )}
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.13em] mb-3">
              {k.label}
            </p>
            <p
              className={`font-mono font-extrabold leading-none ${k.accent ? 'text-lime' : 'text-white'}`}
              style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)' }}
            >
              {k.value}
            </p>
            <p className="text-white/30 text-[10px] mt-1.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Action Queues ────────────────────────────────────── */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            href:   '/admin/bnpl',
            label:  'BNPL Queue',
            sub:    'Awaiting approval',
            count:  s.pendingBNPL,
            urgent: true,
            Icon:   OrdersIcon,
          },
          {
            href:   '/admin/users',
            label:  'Pending Verifications',
            sub:    'Users to verify',
            count:  s.pendingVerify,
            urgent: true,
            Icon:   ProfileIcon,
          },
          {
            href:   '/admin/listings',
            label:  'Active Pledges',
            sub:    'In progress',
            count:  s.activePledges,
            urgent: false,
            Icon:   ListProduceIcon,
          },
        ].map(q => (
          <Link
            key={q.href}
            href={q.href}
            className="flex items-center justify-between p-5 rounded-2xl border border-white/10
                       transition-colors group"
            style={{ backgroundColor: 'rgba(255,255,255,0.07)' }}
          >
            <div className="flex items-center gap-3.5">
              <span
                className="p-2.5 flex items-center justify-center"
                style={{
                  backgroundColor: q.urgent ? 'rgba(var(--lime-rgb, 180,140,60),0.15)' : 'rgba(255,255,255,0.1)',
                  clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))',
                }}
              >
                <q.Icon size={18} className="text-white" />
              </span>
              <div>
                <p className="text-white text-sm font-bold leading-tight">{q.label}</p>
                <p className="text-white/35 text-[11px] mt-0.5">{q.sub}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0 ml-3">
              <p
                className="font-mono font-extrabold leading-none"
                style={{
                  fontSize: 'clamp(1.5rem, 3vw, 1.9rem)',
                  color: q.urgent && q.count > 0 ? 'var(--lime)' : 'rgba(255,255,255,0.5)',
                }}
              >
                {q.count}
              </p>
              <ChevronRightIcon
                size={14}
                className="text-white/20 group-hover:text-white/50 transition-colors mt-1 ml-auto"
              />
            </div>
          </Link>
        ))}
      </div>

      {/* ── Role Breakdown ───────────────────────────────────── */}
      <div>
        <h2
          className="font-display font-bold text-white/50 text-xs uppercase tracking-[0.13em] mb-3"
        >
          Platform Members
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            {
              label:    'Farmers',
              value:    s.totalFarmers,
              href:     '/admin/users?role=farmer',
              accent:   'var(--sector-crops)',
              accentBg: 'rgba(53,180,100,0.1)',
            },
            {
              label:    'Dealers',
              value:    s.totalDealers,
              href:     '/admin/users?role=dealer',
              accent:   'var(--sector-inputs)',
              accentBg: 'rgba(120,100,200,0.1)',
            },
            {
              label:    'Buyers',
              value:    s.totalBuyers,
              href:     '/admin/users?role=buyer',
              accent:   'var(--sector-fisheries)',
              accentBg: 'rgba(60,120,220,0.1)',
            },
          ].map(r => (
            <Link
              key={r.label}
              href={r.href}
              className="rounded-2xl p-5 border border-white/10 text-center
                         hover:border-white/20 transition-colors group overflow-hidden relative"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <div
                className="absolute bottom-0 left-0 right-0 h-[3px]"
                style={{ backgroundColor: r.accent }}
              />
              <p
                className="font-mono font-extrabold text-white leading-none"
                style={{ fontSize: 'clamp(1.75rem, 4vw, 2.2rem)' }}
              >
                {r.value.toLocaleString('en-GH')}
              </p>
              <p className="text-white/40 text-xs font-bold uppercase tracking-[0.12em] mt-2">
                {r.label}
              </p>
              <div className="flex items-center justify-center gap-1 mt-2 text-white/20
                              group-hover:text-white/40 transition-colors">
                <span className="text-[10px] font-semibold">View all</span>
                <ChevronRightIcon size={10} />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Broadcast CTA ────────────────────────────────────── */}
      <div className="mt-6">
        <Link
          href="/admin/broadcast"
          className="flex items-center gap-4 p-5 transition-opacity hover:opacity-90"
          style={{
            backgroundColor: 'rgba(255,255,255,0.07)',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <span
            className="p-3 flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: 'var(--lime)',
              clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
            }}
          >
            <AdminIcon size={20} style={{ color: 'var(--forest)' }} />
          </span>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">Send Platform Broadcast</p>
            <p className="text-white/40 text-xs mt-0.5">
              Push SMS or in-app notifications to all users or by role
            </p>
          </div>
          <ChevronRightIcon size={18} className="text-white/30 flex-shrink-0" />
        </Link>
      </div>

    </div>
  )
}
