import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let badgeCount = 0

  if (profile.role === 'dealer') {
    // Pending orders sitting in the dealer's queue awaiting confirmation
    badgeCount = await prisma.order.count({
      where: {
        sellerId:       profile.id,
        trackingStatus: 'pending',
      },
    })
  } else if (profile.role === 'farmer') {
    // Two concurrent signals for farmers:
    // (a) input orders they placed that are now dispatched / in transit — incoming deliveries
    // (b) produce orders where they're the seller and a buyer is waiting — pending sales to dispatch
    const [incomingDeliveries, pendingSales] = await Promise.all([
      prisma.order.count({
        where: {
          buyerId:        profile.id,
          orderType:      'input_purchase',
          trackingStatus: { in: ['dispatched', 'in_transit'] },
        },
      }),
      prisma.order.count({
        where: {
          sellerId:       profile.id,
          orderType:      { not: 'input_purchase' },
          trackingStatus: 'pending',
        },
      }),
    ])
    badgeCount = incomingDeliveries + pendingSales
  } else if (profile.role === 'consumer') {
    // Produce orders that are on the way — consumer needs to confirm receipt
    badgeCount = await prisma.order.count({
      where: {
        buyerId:        profile.id,
        trackingStatus: { in: ['dispatched', 'in_transit'] },
      },
    })
  } else if (profile.role === 'buyer') {
    // Same signal for enterprise buyers — active shipments awaiting confirmation
    badgeCount = await prisma.order.count({
      where: {
        buyerId:        profile.id,
        trackingStatus: { in: ['dispatched', 'in_transit'] },
      },
    })
  } else if (profile.role === 'field_agent') {
    // Farmers who explicitly requested a field visit — highest-priority queue for agents
    badgeCount = await prisma.farmerProfile.count({
      where: {
        verificationRequestedAt: { not: null },
        user: {
          role:              'farmer',
          verificationLevel: 'unverified',
          ...(profile.regionId ? { regionId: profile.regionId } : {}),
        },
      },
    })
  }

  return NextResponse.json({ success: true, data: { badgeCount } })
}
