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
    // Input orders the farmer placed that are now dispatched / in transit — needs their attention
    badgeCount = await prisma.order.count({
      where: {
        buyerId:        profile.id,
        orderType:      'input_purchase',
        trackingStatus: { in: ['dispatched', 'in_transit'] },
      },
    })
  } else if (profile.role === 'field_agent') {
    // Unverified farmers in the agent's region waiting for field verification
    badgeCount = await prisma.profile.count({
      where: {
        role:              'farmer',
        verificationLevel: 'unverified',
        ...(profile.regionId ? { regionId: profile.regionId } : {}),
      },
    })
  }

  return NextResponse.json({ success: true, data: { badgeCount } })
}
