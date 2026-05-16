import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const url    = new URL(req.url)
  const page   = Math.max(1, Number(url.searchParams.get('page') ?? 1))
  const limit  = Math.min(50, Number(url.searchParams.get('limit') ?? 20))
  const status = url.searchParams.get('status') ?? undefined

  const where = {
    sellerId: profile.id,
    ...(status ? { status: status as 'active' | 'paused' | 'draft' | 'sold_out' | 'expired' | 'removed' } : {}),
  }

  const [total, listings] = await Promise.all([
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
      include: {
        category: { select: { name: true, sector: true, slug: true } },
        unit:     { select: { name: true, abbreviation: true } },
      },
    }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      listings: listings.map(l => ({
        id:                 l.id,
        title:              l.title,
        slug:               l.slug,
        listingType:        l.listingType,
        status:             l.status,
        quantityAvailable:  Number(l.quantityAvailable),
        pricePerUnit:       Number(l.pricePerUnit),
        photos:             l.photos,
        farmingMethod:      l.farmingMethod,
        expectedHarvestDate: l.expectedHarvestDate?.toISOString() ?? null,
        depositPercentage:  l.depositPercentage,
        pledgeStatus:       l.pledgeStatus,
        bnplAvailable:      l.bnplAvailable,
        viewsCount:         l.viewsCount,
        createdAt:          l.createdAt.toISOString(),
        category:           l.category,
        unit:               l.unit,
        seller: {
          id:                profile.id,
          fullName:          profile.fullName,
          avatarUrl:         profile.avatarUrl,
          verificationLevel: profile.verificationLevel,
          agroScore:         profile.agroScore,
        },
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  })
}
