import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalListings, activeListings, pendingOrders, thisMonthOrders, revenueResult] = await Promise.all([
    prisma.listing.count({ where: { sellerId: profile.id } }),
    prisma.listing.count({ where: { sellerId: profile.id, status: 'active' } }),
    prisma.order.count({ where: { sellerId: profile.id, trackingStatus: 'pending' } }),
    prisma.order.count({ where: { sellerId: profile.id, createdAt: { gte: monthStart } } }),
    prisma.order.aggregate({
      where:  { sellerId: profile.id, trackingStatus: 'delivered' },
      _sum:   { totalAmount: true },
    }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      totalListings,
      activeListings,
      pendingOrders,
      thisMonthOrders,
      totalRevenue: Number(revenueResult._sum.totalAmount ?? 0),
    },
  })
}
