'use client'

import { useEffect, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { api }           from '@/lib/api'
import { DashboardStatsSkeleton } from '@/components/shared/skeleton'
import { EmptyState } from '@/components/shared/empty-state'
import { BuyInputsIcon } from '@/components/shared/icons'
import { formatGHS, formatGHSCompact } from '@/lib/format'

interface AnalyticsData {
  totalRevenue:    number
  totalOrders:     number
  avgOrderValue:   number
  completionRate:  number
  monthlyRevenue:  { month: string; revenue: number; orders: number }[]
  topProducts:     { title: string; revenue: number; orders: number }[]
  statusBreakdown: { status: string; count: number }[]
}

const STATUS_COLORS: Record<string, string> = {
  pending:    'oklch(0.75 0.18 80)',
  confirmed:  'oklch(0.88 0.22 120)',
  dispatched: 'oklch(0.48 0.16 240)',
  delivered:  'oklch(0.55 0.18 145)',
  completed:  'oklch(0.28 0.07 145)',
  cancelled:  'oklch(0.52 0.20 30)',
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-border rounded-xl p-3 shadow-lg text-xs">
      <p className="font-bold text-forest mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="text-muted-foreground">
          {p.name}:{' '}
          <span className="font-mono font-bold text-forest">
            {p.dataKey === 'revenue' ? formatGHSCompact(p.value) : p.value}
          </span>
        </p>
      ))}
    </div>
  )
}

export default function DealerAnalyticsPage() {
  const [data, setData]     = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/dealer/analytics')
      .then(r => setData(r.data.data ?? null))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-cream p-4 sm:p-6">
        <DashboardStatsSkeleton />
      </main>
    )
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-cream">
        <div className="bg-white border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
            <h1 className="font-bold text-forest text-lg">Analytics</h1>
            <p className="text-xs text-muted-foreground">Sales performance overview</p>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <EmptyState
            icon={<BuyInputsIcon size={32} />}
            title="No analytics data yet"
            description="Analytics will appear here once you receive and complete your first orders."
          />
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="font-bold text-forest text-lg">Analytics</h1>
          <p className="text-xs text-muted-foreground">Sales performance overview</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total revenue',    value: formatGHSCompact(data.totalRevenue),      mono: true  },
            { label: 'Total orders',     value: data.totalOrders.toLocaleString('en-GH'), mono: false },
            { label: 'Avg order value',  value: formatGHS(data.avgOrderValue),            mono: true  },
            { label: 'Completion rate',  value: `${(data.completionRate * 100).toFixed(0)}%`,        mono: false },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-border p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-xl font-bold text-forest mt-1 ${s.mono ? 'font-mono text-base' : ''}`}>
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {/* Monthly revenue chart */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-bold text-forest text-sm mb-4">Monthly revenue</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyRevenue} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.02 100)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'oklch(0.52 0.03 145)' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => formatGHSCompact(v)} tick={{ fontSize: 10, fill: 'oklch(0.52 0.03 145)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" name="Revenue" fill="oklch(0.28 0.07 145)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders trend */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="font-bold text-forest text-sm mb-4">Order volume trend</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.02 100)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'oklch(0.52 0.03 145)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'oklch(0.52 0.03 145)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone" dataKey="orders" name="Orders"
                  stroke="oklch(0.88 0.22 120)" strokeWidth={2.5}
                  dot={{ fill: 'oklch(0.28 0.07 145)', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {/* Top products */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h2 className="font-bold text-forest text-sm mb-4">Top products by revenue</h2>
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={p.title} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-forest/10 text-forest text-[10px] font-bold
                                   flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-forest truncate">{p.title}</p>
                    <p className="text-[10px] text-muted-foreground">{p.orders} orders</p>
                  </div>
                  <span className="font-mono text-xs font-bold text-forest flex-shrink-0">
                    {formatGHSCompact(p.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Status breakdown */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h2 className="font-bold text-forest text-sm mb-4">Order status</h2>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.statusBreakdown} layout="vertical" barSize={18}>
                  <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="status" tick={{ fontSize: 11, fill: 'oklch(0.52 0.03 145)' }}
                    axisLine={false} tickLine={false} width={75} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Orders" radius={[0, 4, 4, 0]}>
                    {data.statusBreakdown.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? 'oklch(0.28 0.07 145)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
