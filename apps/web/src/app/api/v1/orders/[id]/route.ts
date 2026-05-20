import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  let order
  try {
    order = await prisma.order.findFirst({
      where: {
        id,
        OR: [{ buyerId: profile.id }, { sellerId: profile.id }],
      },
      include: {
        listing: {
          select: {
            title: true, slug: true, photos: true,
            expectedHarvestDate: true, depositPercentage: true,
            category: { select: { name: true, sector: true } },
            unit:     { select: { name: true, abbreviation: true } },
            region:   { select: { name: true } },
            district: { select: { name: true } },
          },
        },
        buyer:  { select: { id: true, fullName: true, phone: true } },
        seller: { select: { id: true, fullName: true, phone: true } },
      },
    })
  } catch (err) {
    console.error('[GET /orders/:id] DB error:', err)
    return NextResponse.json({ success: false, error: 'Failed to load order' }, { status: 500 })
  }

  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
  }

  const l = order.listing
  return NextResponse.json({
    success: true,
    data: {
      id:                 order.id,
      orderNumber:        order.orderNumber,
      orderType:          order.orderType,
      buyerId:            order.buyerId,
      sellerId:           order.sellerId,
      quantity:           Number(order.quantity),
      unitPrice:          Number(order.unitPrice),
      subtotal:           Number(order.subtotal),
      deliveryCost:       Number(order.deliveryCost),
      platformCommission: Number(order.platformCommission),
      totalAmount:        Number(order.totalAmount),
      depositAmount:      order.depositAmount  ? Number(order.depositAmount)  : null,
      balanceAmount:      order.balanceAmount  ? Number(order.balanceAmount)  : null,
      trackingStatus:     order.trackingStatus,
      pledgeProgress:     order.pledgeProgress,
      deliveryOption:     order.deliveryOption,
      deliveryAddress:    order.deliveryAddress,
      buyerNotes:         order.buyerNotes,
      sellerNotes:        order.sellerNotes,
      createdAt:          order.createdAt.toISOString(),
      confirmedAt:        order.confirmedAt?.toISOString()  ?? null,
      deliveredAt:        order.deliveredAt?.toISOString()  ?? null,
      completedAt:        order.completedAt?.toISOString()  ?? null,
      listing: l ? {
        title:               l.title,
        slug:                l.slug,
        photos:              l.photos,
        sector:              l.category.sector,
        category:            { name: l.category.name },
        unit:                l.unit.abbreviation,
        region:              l.region?.name ?? null,
        district:            l.district?.name ?? null,
        expectedHarvestDate: l.expectedHarvestDate?.toISOString() ?? null,
        depositPercentage:   l.depositPercentage,
      } : null,
      buyer:  order.buyer,
      seller: order.seller,
    },
  })
}
