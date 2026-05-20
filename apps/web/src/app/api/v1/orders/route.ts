import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const COMMISSION_RATES = {
  direct_purchase: 0.030,
  harvest_pledge:  0.025,
  input_purchase:  0.015,
  input_bnpl:      0,
} as const

const createOrderSchema = z.object({
  listingId:       z.string().uuid(),
  quantity:        z.coerce.number().positive(),
  deliveryOption:  z.enum(['pickup', 'farmer_delivery', 'logistics']),
  deliveryAddress: z.string().max(500).optional(),
  buyerNotes:      z.string().max(1000).optional(),
})

function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const hex  = randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()
  return `AGR-${date}-${hex}`
}

export async function POST(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch { body = {} }

  const parsed = createOrderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const d = parsed.data

  const listing = await prisma.listing.findFirst({
    where: { id: d.listingId, status: 'active' },
    include: { category: true, unit: true },
  })

  if (!listing) {
    return NextResponse.json(
      { success: false, error: 'Listing not found or no longer available' },
      { status: 404 },
    )
  }
  if (listing.sellerId === profile.id) {
    return NextResponse.json(
      { success: false, error: 'You cannot order your own listing' },
      { status: 400 },
    )
  }
  if (Number(listing.quantityAvailable) < d.quantity) {
    return NextResponse.json(
      { success: false, error: `Only ${Number(listing.quantityAvailable)} ${listing.unit.name} available` },
      { status: 400 },
    )
  }
  if (d.quantity < Number(listing.minOrderQuantity)) {
    return NextResponse.json(
      { success: false, error: `Minimum order is ${Number(listing.minOrderQuantity)} ${listing.unit.name}` },
      { status: 400 },
    )
  }

  const orderType: 'direct_purchase' | 'harvest_pledge' | 'input_purchase' =
    listing.category.sector === 'inputs'
      ? 'input_purchase'
      : listing.listingType === 'harvest_pledge'
      ? 'harvest_pledge'
      : 'direct_purchase'

  const subtotal            = d.quantity * Number(listing.pricePerUnit)
  const platformCommission  = subtotal * COMMISSION_RATES[orderType]
  const totalAmount         = subtotal // delivery cost tracked separately

  const isHarvestPledge = orderType === 'harvest_pledge'
  const depositAmount   = isHarvestPledge
    ? parseFloat((totalAmount * (listing.depositPercentage / 100)).toFixed(2))
    : null
  const balanceAmount   = isHarvestPledge && depositAmount !== null
    ? parseFloat((totalAmount - depositAmount).toFixed(2))
    : null

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber:        generateOrderNumber(),
        buyerId:            profile.id,
        sellerId:           listing.sellerId,
        listingId:          listing.id,
        orderType,
        quantity:           d.quantity,
        unitPrice:          Number(listing.pricePerUnit),
        subtotal,
        deliveryCost:       0,
        platformCommission,
        totalAmount,
        depositAmount,
        balanceAmount,
        deliveryOption:     d.deliveryOption,
        deliveryAddress:    d.deliveryAddress ?? null,
        buyerNotes:         d.buyerNotes ?? null,
        pledgeProgress:     isHarvestPledge ? 'planted' : null,
        trackingStatus:     'pending',
      },
    })

    const remaining = Number(listing.quantityAvailable) - d.quantity
    await tx.listing.update({
      where: { id: listing.id },
      data:  {
        quantityAvailable: { decrement: d.quantity },
        ...(remaining <= 0 ? { status: 'inactive' } : {}),
      },
    })

    return created
  })

  return NextResponse.json({
    success: true,
    data: {
      id:                 order.id,
      orderNumber:        order.orderNumber,
      orderType:          order.orderType,
      quantity:           Number(order.quantity),
      unitPrice:          Number(order.unitPrice),
      subtotal:           Number(order.subtotal),
      platformCommission: Number(order.platformCommission),
      totalAmount:        Number(order.totalAmount),
      depositAmount:      order.depositAmount ? Number(order.depositAmount) : null,
      balanceAmount:      order.balanceAmount ? Number(order.balanceAmount) : null,
      trackingStatus:     order.trackingStatus,
      createdAt:          order.createdAt.toISOString(),
    },
  }, { status: 201 })
}

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
    }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      orders: orders.map(o => ({
        id:             o.id,
        orderNumber:    o.orderNumber,
        buyerId:        o.buyerId,
        sellerId:       o.sellerId,
        listingId:      o.listingId,
        orderType:      o.orderType,
        quantity:       Number(o.quantity),
        unitPrice:      Number(o.unitPrice),
        subtotal:       Number(o.subtotal),
        deliveryCost:   Number(o.deliveryCost),
        platformCommission: Number(o.platformCommission),
        totalAmount:    Number(o.totalAmount),
        depositAmount:  o.depositAmount ? Number(o.depositAmount) : null,
        balanceAmount:  o.balanceAmount ? Number(o.balanceAmount) : null,
        trackingStatus: o.trackingStatus,
        pledgeProgress: o.pledgeProgress,
        deliveryOption: o.deliveryOption,
        createdAt:      o.createdAt.toISOString(),
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  })
}
