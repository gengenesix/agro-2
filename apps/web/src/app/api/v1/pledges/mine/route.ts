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
    ? { buyerId: profile.id, orderType: 'harvest_pledge' as const }
    : { sellerId: profile.id, orderType: 'harvest_pledge' as const }

  const [total, pledges] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
      include: { listing: { select: { title: true, category: { select: { sector: true } } } } },
    }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      pledges: pledges.map(p => ({
        id:            p.id,
        orderNumber:   p.orderNumber,
        totalAmount:   Number(p.totalAmount),
        depositAmount: p.depositAmount ? Number(p.depositAmount) : null,
        pledgeStatus:  p.pledgeProgress,
        trackingStatus:p.trackingStatus,
        createdAt:     p.createdAt.toISOString(),
        listing:       p.listing ? { title: p.listing.title, sector: p.listing.category.sector } : null,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  })
}
