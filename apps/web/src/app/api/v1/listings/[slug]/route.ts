import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const updateSchema = z.object({
  title:                z.string().min(5),
  description:          z.string().max(1000).optional(),
  sector:               z.enum(['crops', 'livestock', 'poultry', 'fisheries', 'inputs']),
  category:             z.string().min(1),
  listingType:          z.enum(['available_now', 'harvest_pledge']),
  quantity:             z.coerce.number().min(0.1),
  unit:                 z.string().min(1),
  pricePerUnit:         z.coerce.number().min(0.01),
  minimumOrder:         z.coerce.number().optional(),
  farmingMethod:        z.enum(['conventional', 'organic', 'certified_organic']).optional(),
  harvestDate:          z.string().optional(),
  depositPercent:       z.coerce.number().min(5).max(50).optional(),
  regionId:             z.coerce.number().min(1),
  district:             z.string().min(1),
  // Primary field names used by CreateListingForm
  bnplEligible:         z.boolean().optional(),
  deliveryAvailable:    z.boolean().optional(),
  // Alternate prefixed names — accepted so either naming convention works
  isBnplAvailable:      z.boolean().optional(),
  isDeliveryAvailable:  z.boolean().optional(),
  photos:               z.array(z.string()).optional(),
})

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

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params

  const listing = await prisma.listing.findFirst({
    where: { slug, status: 'active' },
    include: {
      category: { select: { name: true, sector: true, slug: true } },
      unit:     { select: { name: true, abbreviation: true } },
      seller: {
        select: {
          id: true,
          fullName: true,
          avatarUrl: true,
          verificationLevel: true,
          agroScore: true,
          createdAt: true,
        },
      },
      region:   { select: { name: true, code: true } },
      district: { select: { name: true } },
    },
  })

  if (!listing) {
    return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 })
  }

  // Increment view count — fire and forget, never block the response
  prisma.listing.update({
    where: { id: listing.id },
    data:  { viewsCount: { increment: 1 } },
  }).catch(() => undefined)

  return NextResponse.json({
    success: true,
    data: {
      id:                  listing.id,
      slug:                listing.slug,
      title:               listing.title,
      description:         listing.description,
      listingType:         listing.listingType,
      status:              listing.status,
      quantityAvailable:   Number(listing.quantityAvailable),
      pricePerUnit:        Number(listing.pricePerUnit),
      minOrderQuantity:    Number(listing.minOrderQuantity),
      allowNegotiation:    listing.allowNegotiation,
      photos:              listing.photos,
      farmingMethod:       listing.farmingMethod,
      freshnessDays:       listing.freshnessDays,
      deliveryOptions:     listing.deliveryOptions,
      expectedHarvestDate: listing.expectedHarvestDate?.toISOString() ?? null,
      depositPercentage:   listing.depositPercentage,
      pledgeStatus:        listing.pledgeStatus,
      bnplAvailable:       listing.bnplAvailable,
      viewsCount:          listing.viewsCount + 1,
      createdAt:           listing.createdAt.toISOString(),
      category:            listing.category,
      unit:                listing.unit,
      seller: {
        id:                listing.seller.id,
        fullName:          listing.seller.fullName,
        avatarUrl:         listing.seller.avatarUrl,
        verificationLevel: listing.seller.verificationLevel,
        agroScore:         listing.seller.agroScore,
        memberSince:       listing.seller.createdAt.toISOString(),
      },
      region:   listing.region,
      district: listing.district,
    },
  })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { slug: id } = await params

  // Accept both UUID (dealer flow) and slug (farmer flow) — the route parameter
  // carries a slug when navigated from the farmer listings page, and a UUID when
  // navigated from the dealer listings page.
  const existing = await prisma.listing.findFirst({
    where: {
      OR: [
        { id,   sellerId: profile.id },
        { slug: id, sellerId: profile.id },
      ],
    },
  })
  if (!existing) {
    return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 })
  }

  let body: unknown
  try { body = await req.json() } catch { body = {} }

  const parsed = updateSchema.safeParse(body)
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

  // Resolve boolean toggles — accept both the primary field name and the
  // is-prefixed alias so either naming convention from the client works.
  const bnplEnabled     = d.isBnplAvailable     ?? d.bnplEligible     ?? false
  const deliveryEnabled = d.isDeliveryAvailable  ?? d.deliveryAvailable ?? false

  // Always update by the UUID primary key regardless of what the route
  // parameter contained (slug vs UUID). existing.id is always the UUID.
  const updated = await prisma.listing.update({
    where: { id: existing.id },
    data: {
      categoryId:          category.id,
      unitId:              unit.id,
      title:               d.title,
      description:         d.description ?? null,
      listingType:         d.listingType,
      quantityAvailable:   d.quantity,
      pricePerUnit:        d.pricePerUnit,
      minOrderQuantity:    d.minimumOrder ?? 1,
      regionId:            regionId > 0 ? regionId : null,
      community:           d.district,
      farmingMethod:       d.farmingMethod ?? null,
      expectedHarvestDate: d.harvestDate ? new Date(d.harvestDate) : null,
      depositPercentage:   Math.trunc(d.depositPercent ?? existing.depositPercentage ?? 20),
      photos:              d.photos ?? existing.photos,
      bnplAvailable:       bnplEnabled,
      deliveryOptions:     deliveryEnabled ? ['farmer_delivery', 'pickup'] : ['pickup'],
      pledgeStatus:        d.listingType === 'harvest_pledge' ? (existing.pledgeStatus ?? 'open') : null,
    },
  })

  return NextResponse.json({
    success: true,
    data: { id: updated.id, slug: updated.slug, title: updated.title },
  })
}
