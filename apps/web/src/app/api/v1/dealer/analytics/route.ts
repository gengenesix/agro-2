import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

// Build the 12-month label array ending at `anchor` (inclusive), oldest first.
function last12MonthLabels(anchor: Date): string[] {
  const labels: string[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - i, 1)
    labels.push(d.toLocaleString('en-GH', { month: 'short', year: '2-digit' }))
  }
  return labels
}

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now        = new Date()
    const windowStart = new Date(now.getFullYear(), now.getMonth() - 11, 1)

    // All three queries run concurrently.
    const [allOrders, deliveredOrders, statusGroups] = await Promise.all([
      // Total order count across all statuses
      prisma.order.count({
        where: { sellerId: profile.id },
      }),

      // Delivered orders with listing titles and amounts for revenue aggregation
      prisma.order.findMany({
        where: {
          sellerId:       profile.id,
          trackingStatus: 'delivered',
        },
        select: {
          totalAmount:  true,
          deliveredAt:  true,
          listing: { select: { title: true } },
        },
      }),

      // Per-status counts for the breakdown chart
      prisma.order.groupBy({
        by:    ['trackingStatus'],
        where: { sellerId: profile.id },
        _count: { _all: true },
      }),
    ])

    // ── Revenue aggregations ───────────────────────────────────────────────────
    const totalRevenue = deliveredOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0)
    const totalDelivered = deliveredOrders.length
    const avgOrderValue  = totalDelivered > 0 ? totalRevenue / totalDelivered : 0
    const completionRate = allOrders > 0 ? totalDelivered / allOrders : 0

    // ── Monthly revenue (last 12 months, all months present) ───────────────────
    const monthlyMap = new Map<string, { revenue: number; orders: number }>()
    const labels = last12MonthLabels(now)
    for (const label of labels) {
      monthlyMap.set(label, { revenue: 0, orders: 0 })
    }

    for (const o of deliveredOrders) {
      if (!o.deliveredAt) continue
      const d = new Date(o.deliveredAt)
      if (d < windowStart) continue
      const label = d.toLocaleString('en-GH', { month: 'short', year: '2-digit' })
      const slot  = monthlyMap.get(label)
      if (slot) {
        slot.revenue += Number(o.totalAmount)
        slot.orders  += 1
      }
    }

    const monthlyRevenue = labels.map(month => ({
      month,
      revenue: parseFloat((monthlyMap.get(month)?.revenue ?? 0).toFixed(2)),
      orders:  monthlyMap.get(month)?.orders ?? 0,
    }))

    // ── Top 5 products by revenue ─────────────────────────────────────────────
    const productMap = new Map<string, { revenue: number; orders: number }>()
    for (const o of deliveredOrders) {
      const title = o.listing.title
      const entry = productMap.get(title) ?? { revenue: 0, orders: 0 }
      entry.revenue += Number(o.totalAmount)
      entry.orders  += 1
      productMap.set(title, entry)
    }

    const topProducts = [...productMap.entries()]
      .map(([title, { revenue, orders }]) => ({ title, revenue: parseFloat(revenue.toFixed(2)), orders }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // ── Status breakdown ──────────────────────────────────────────────────────
    const statusBreakdown = statusGroups.map(g => ({
      status: g.trackingStatus,
      count:  g._count._all,
    }))

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue:    parseFloat(totalRevenue.toFixed(2)),
        totalOrders:     allOrders,
        avgOrderValue:   parseFloat(avgOrderValue.toFixed(2)),
        completionRate:  parseFloat(completionRate.toFixed(4)),
        monthlyRevenue,
        topProducts,
        statusBreakdown,
      },
    })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to load analytics' }, { status: 500 })
  }
}
