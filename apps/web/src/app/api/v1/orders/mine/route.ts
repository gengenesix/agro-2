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
      include: { listing: { select: { title: true, photos: true, category: { select: { name: true, sector: true } }, unit: { select: { abbreviation: true } } } } },
    }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      orders: orders.map(o => ({
        id:             o.id,
        orderNumber:    o.orderNumber,
        orderType:      o.orderType,
        quantity:       Number(o.quantity),
        totalAmount:    Number(o.totalAmount),
        trackingStatus: o.trackingStatus,
        pledgeProgress: o.pledgeProgress,
        createdAt:      o.createdAt.toISOString(),
        listing:        o.listing ? {
          title:       o.listing.title,
          photos:      o.listing.photos,
          sector:      o.listing.category.sector,
          sectorLabel: o.listing.category.name,
          unit:        o.listing.unit.abbreviation,
        } : null,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  })
}
