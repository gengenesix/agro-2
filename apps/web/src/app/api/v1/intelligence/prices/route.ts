import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const url      = new URL(req.url)
  const regionId = url.searchParams.get('regionId') ? Number(url.searchParams.get('regionId')) : undefined

  const prices = await prisma.marketPrice.findMany({
    where:   regionId ? { regionId } : {},
    orderBy: { recordedAt: 'desc' },
    take:    50,
    include: {
      category: { select: { name: true, sector: true } },
      unit:     { select: { abbreviation: true } },
      region:   { select: { name: true } },
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      prices: prices.map(p => ({
        id:           p.id,
        category:     p.category.name,
        sector:       p.category.sector,
        pricePerUnit: Number(p.pricePerUnit),
        unit:         p.unit.abbreviation,
        region:       p.region?.name ?? 'National',
        recordedAt:   p.recordedAt.toISOString(),
        source:       p.source,
      })),
    },
  })
}
