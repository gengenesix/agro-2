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

// Explicit context type satisfying Next.js 15 App Router's async params contract.
// All mutating handlers destructure params through this type so the shape is
// declared once and any future segment rename is caught at compile time.
type RouteContext = { params: Promise<{ slug: string }> }

export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const profile = await getAuthProfile(req)
    if (!profile) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Accept both UUID (dealer flow) and slug (farmer flow).
    const { slug: id } = await context.params

    // PostgreSQL UUID columns reject non-UUID strings at the driver level —
    // passing a slug like 'fresh-tomatoes-abc123' against the `id` column
    // throws "invalid input syntax for type uuid". Guard the id arm so it
    // is only included when the param is a well-formed UUID.
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    const existing = await prisma.listing.findFirst({
      where: {
        sellerId: profile.id,
        OR: isUuid
          ? [{ id }, { slug: id }]
          : [{ slug: id }],
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

    // Accept both naming conventions from the client.
    const bnplEnabled     = d.isBnplAvailable    ?? d.bnplEligible     ?? false
    const deliveryEnabled = d.isDeliveryAvailable ?? d.deliveryAvailable ?? false
    const regionId        = Math.trunc(d.regionId)

    const [category, unit] = await Promise.all([
      getOrCreateCategory(d.category, d.sector),
      getOrCreateUnit(d.unit, d.sector),
    ])

    // Always update by UUID — existing.id is always the UUID regardless of
    // whether the route param contained a slug or a UUID.
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
        community:           d.district || null,
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
  } catch (err) {
    console.error('[PUT /listings] failed:', err)
    const message = err instanceof Error ? err.message : 'Database error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

// PATCH is an alias for PUT — both verbs reach identical update logic.
export async function PATCH(req: NextRequest, context: RouteContext) {
  return PUT(req, context)
}

// Soft-delete: sets status → 'removed', preserving FK references from orders.
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const profile = await getAuthProfile(req)
    if (!profile) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { slug: id } = await context.params

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    const existing = await prisma.listing.findFirst({
      where: {
        sellerId: profile.id,
        OR: isUuid
          ? [{ id }, { slug: id }]
          : [{ slug: id }],
      },
    })
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Listing not found' }, { status: 404 })
    }

    // Block deletion while any order is still in progress.
    const activeOrderCount = await prisma.order.count({
      where: {
        listingId:      existing.id,
        trackingStatus: { notIn: ['delivered', 'cancelled'] },
      },
    })
    if (activeOrderCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete: ${activeOrderCount} active order${activeOrderCount > 1 ? 's' : ''} still in progress. Complete or cancel them first.`,
        },
        { status: 409 },
      )
    }

    await prisma.listing.update({
      where: { id: existing.id },
      data:  { status: 'removed' },
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /listings] failed:', err)
    const message = err instanceof Error ? err.message : 'Database error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
