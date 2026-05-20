import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
        region:            listing.seller.region,
        memberSince:       listing.seller.createdAt.toISOString(),
      },
      region:   listing.region,
      district: listing.district,
    },
  })
}
