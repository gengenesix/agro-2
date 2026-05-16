import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const order = await prisma.order.findFirst({
    where: {
      id,
      OR: [{ buyerId: profile.id }, { sellerId: profile.id }],
    },
    include: {
      listing: {
        select: {
          title: true, slug: true, photos: true,
          category: { select: { name: true, sector: true } },
          unit:     { select: { name: true, abbreviation: true } },
          region:   { select: { name: true } },
        },
      },
      buyer:  { select: { id: true, fullName: true, phone: true } },
      seller: { select: { id: true, fullName: true, phone: true } },
    },
  })

  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json({
    success: true,
    data: {
      id:              order.id,
      orderNumber:     order.orderNumber,
      orderType:       order.orderType,
      quantity:        Number(order.quantity),
      unitPrice:       Number(order.unitPrice),
      subtotal:        Number(order.subtotal),
      deliveryCost:    Number(order.deliveryCost),
      totalAmount:     Number(order.totalAmount),
      depositAmount:   order.depositAmount   ? Number(order.depositAmount)  : null,
      balanceAmount:   order.balanceAmount   ? Number(order.balanceAmount)  : null,
      trackingStatus:  order.trackingStatus,
      pledgeProgress:  order.pledgeProgress,
      deliveryOption:  order.deliveryOption,
      deliveryAddress: order.deliveryAddress,
      buyerNotes:      order.buyerNotes,
      sellerNotes:     order.sellerNotes,
      createdAt:       order.createdAt.toISOString(),
      confirmedAt:     order.confirmedAt?.toISOString()  ?? null,
      deliveredAt:     order.deliveredAt?.toISOString()  ?? null,
      listing:         order.listing,
      buyer:           order.buyer,
      seller:          order.seller,
    },
  })
}
