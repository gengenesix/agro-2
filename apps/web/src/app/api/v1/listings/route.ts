import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const createSchema = z.object({
  title:             z.string().min(5),
  description:       z.string().max(1000).optional(),
  sector:            z.enum(['crops', 'livestock', 'poultry', 'fisheries', 'inputs']),
  category:          z.string().min(1),
  listingType:       z.enum(['available_now', 'harvest_pledge']),
  quantity:          z.coerce.number().min(0.1),
  unit:              z.string().min(1),
  pricePerUnit:      z.coerce.number().min(0.01),
  minimumOrder:      z.coerce.number().optional(),
  farmingMethod:     z.enum(['conventional', 'organic', 'certified_organic']).optional(),
  harvestDate:       z.string().optional(),
  depositPercent:    z.coerce.number().min(5).max(50).optional(),
  regionId:          z.coerce.number().min(1),
  district:          z.string().min(2),
  bnplEligible:      z.boolean().optional(),
  deliveryAvailable: z.boolean().optional(),
  photos:            z.array(z.string()).optional(),
})

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
    + '-' + Date.now().toString(36)
}

async function getOrCreateCategory(name: string, sector: string) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  let cat = await prisma.productCategory.findUnique({ where: { slug } })
  if (!cat) {
    cat = await prisma.productCategory.create({
      data: { name, sector: sector as 'crops' | 'livestock' | 'poultry' | 'fisheries' | 'inputs', slug },
    })
  }
  return cat
}

async function getOrCreateUnit(name: string, sector: string) {
  let unit = await prisma.unitOfMeasure.findFirst({ where: { name } })
  if (!unit) {
    unit = await prisma.unitOfMeasure.create({
      data: { name, abbreviation: name.split(' ')[0] ?? name, applicableSectors: [sector] },
    })
  }
  return unit
}

export async function POST(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch { body = {} }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const d = parsed.data

  const [category, unit] = await Promise.all([
    getOrCreateCategory(d.category, d.sector),
    getOrCreateUnit(d.unit, d.sector),
  ])

  const regionId = Math.trunc(d.regionId)

  const listing = await prisma.listing.create({
    data: {
      sellerId:           profile.id,
      categoryId:         category.id,
      unitId:             unit.id,
      title:              d.title,
      slug:               toSlug(d.title),
      description:        d.description ?? null,
      listingType:        d.listingType,
      quantityAvailable:  d.quantity,
      pricePerUnit:       d.pricePerUnit,
      minOrderQuantity:   d.minimumOrder ?? 1,
      regionId:           regionId > 0 ? regionId : null,
      community:          d.district,
      farmingMethod:      d.farmingMethod ?? null,
      expectedHarvestDate: d.harvestDate ? new Date(d.harvestDate) : null,
      depositPercentage:  Math.trunc(d.depositPercent ?? 20),
      photos:             d.photos ?? [],
      bnplAvailable:      d.bnplEligible ?? false,
      deliveryOptions:    d.deliveryAvailable ? ['farmer_delivery', 'pickup'] : ['pickup'],
      status:             'active',
      pledgeStatus:       d.listingType === 'harvest_pledge' ? 'open' : null,
    },
    include: {
      category: { select: { name: true, sector: true, slug: true } },
      unit:     { select: { name: true, abbreviation: true } },
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      id:    listing.id,
      slug:  listing.slug,
      title: listing.title,
    },
  }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const url         = new URL(req.url)
  const sector      = url.searchParams.get('sector') ?? undefined
  const listingType = url.searchParams.get('listingType') ?? undefined
  const search      = url.searchParams.get('q') ?? undefined
  const regionId    = url.searchParams.get('regionId') ? Number(url.searchParams.get('regionId')) : undefined
  const page        = Math.max(1, Number(url.searchParams.get('page') ?? 1))
  const limit       = Math.min(50, Number(url.searchParams.get('limit') ?? 20))

  const where = {
    status: 'active' as const,
    ...(sector      ? { category: { sector: sector as 'crops' | 'livestock' | 'poultry' | 'fisheries' | 'inputs' } } : {}),
    ...(listingType ? { listingType: listingType as 'available_now' | 'harvest_pledge' } : {}),
    ...(regionId    ? { regionId } : {}),
    ...(search      ? { title: { contains: search, mode: 'insensitive' as const } } : {}),
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
        seller:   { select: { id: true, fullName: true, avatarUrl: true, verificationLevel: true, agroScore: true } },
        region:   { select: { name: true, code: true } },
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
        seller:             l.seller,
        region:             l.region,
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  })
}
