import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const url      = new URL(req.url)
  const regionId = url.searchParams.get('regionId') ? Number(url.searchParams.get('regionId')) : 1

  // Seed changes each hour — deterministic but not static
  const hourSeed = Math.floor(Date.now() / 3_600_000)

  try {
    const categories = await prisma.productCategory.findMany({
      where: {
        prices: { some: { regionId } },
        isActive: true,
      },
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' },
    })

    const rows = await Promise.all(
      categories.map(async (cat) => {
        const history = await prisma.marketPrice.findMany({
          where:   { categoryId: cat.id, regionId },
          orderBy: { recordedAt: 'asc' },
          take:    8,
          select: {
            id:           true,
            pricePerUnit: true,
            recordedAt:   true,
            regionId:     true,
            unit:         { select: { abbreviation: true } },
            region:       { select: { name: true } },
          },
        })

        if (history.length === 0) return null

        const latest    = history[history.length - 1]
        const base      = Number(latest.pricePerUnit)
        const variation = Math.sin(hourSeed * 1.618 + cat.id * 2.718) * 0.015
        const price     = Math.round(base * (1 + variation) * 100) / 100

        return {
          id:           latest.id,
          categoryId:   cat.id,
          regionId:     latest.regionId,
          pricePerUnit: price,
          recordedAt:   (latest.recordedAt as Date).toISOString(),
          category:     { name: cat.name, slug: cat.slug },
          region:       latest.region,
          unit:         latest.unit,
          priceHistory: history.map(h => Number(h.pricePerUnit)),
        }
      })
    )

    const prices = rows.filter(Boolean)

    return NextResponse.json({ success: true, data: { prices } })
  } catch {
    return NextResponse.json({ success: true, data: { prices: [] } })
  }
}
