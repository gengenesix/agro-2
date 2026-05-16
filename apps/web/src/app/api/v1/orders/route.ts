import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const url   = new URL(req.url)
  const page  = Math.max(1, Number(url.searchParams.get('page') ?? 1))
  const limit = Math.min(50, Number(url.searchParams.get('limit') ?? 20))

  const where = profile.role === 'buyer' || profile.role === 'consumer'
    ? { buyerId: profile.id }
    : { sellerId: profile.id }

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      orders: orders.map(o => ({
        id:             o.id,
        orderNumber:    o.orderNumber,
        buyerId:        o.buyerId,
        sellerId:       o.sellerId,
        listingId:      o.listingId,
        orderType:      o.orderType,
        quantity:       Number(o.quantity),
        unitPrice:      Number(o.unitPrice),
        subtotal:       Number(o.subtotal),
        deliveryCost:   Number(o.deliveryCost),
        platformCommission: Number(o.platformCommission),
        totalAmount:    Number(o.totalAmount),
        depositAmount:  o.depositAmount ? Number(o.depositAmount) : null,
        balanceAmount:  o.balanceAmount ? Number(o.balanceAmount) : null,
        trackingStatus: o.trackingStatus,
        pledgeProgress: o.pledgeProgress,
        deliveryOption: o.deliveryOption,
        createdAt:      o.createdAt.toISOString(),
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  })
}
