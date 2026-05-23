import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const EMPTY = {
  totalOrders:   0,
  activePledges: 0,
  activeOrders:  0,
  totalSpent:    0,
  savedSearches: 0,
}

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // All four counts run concurrently — no serial awaits.
    const [totalOrders, activePledges, spentResult, activeOrders] = await Promise.all([
      prisma.order.count({
        where: { buyerId: profile.id },
      }),
      prisma.order.count({
        where: {
          buyerId:        profile.id,
          orderType:      'harvest_pledge',
          trackingStatus: { notIn: ['delivered', 'cancelled'] },
        },
      }),
      prisma.order.aggregate({
        where: { buyerId: profile.id, trackingStatus: 'delivered' },
        _sum:  { totalAmount: true },
      }),
      prisma.order.count({
        where: {
          buyerId:        profile.id,
          trackingStatus: { notIn: ['delivered', 'cancelled'] },
        },
      }),
    ])

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
  } catch {
    // Return safe zeros rather than letting a DB error freeze the dashboard skeleton.
    return NextResponse.json({ success: true, data: EMPTY })
  }
}