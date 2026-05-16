import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const [totalOrders, activePledges, spentResult] = await Promise.all([
    prisma.order.count({ where: { buyerId: profile.id } }),
    prisma.order.count({
      where: {
        buyerId:   profile.id,
        orderType: 'harvest_pledge',
        trackingStatus: { notIn: ['delivered', 'cancelled'] },
      },
    }),
    prisma.order.aggregate({
      where: { buyerId: profile.id, trackingStatus: 'delivered' },
      _sum:  { totalAmount: true },
    }),
  ])

  const activeOrders = await prisma.order.count({
    where: { buyerId: profile.id, trackingStatus: { notIn: ['delivered', 'cancelled'] } },
  })

  return NextResponse.json({
    success: true,
    data: {
      totalOrders,
      activePledges,
      activeOrders,
      totalSpent:    Number(spentResult._sum.totalAmount ?? 0),
      savedSearches: 0,
    },
  })
}
