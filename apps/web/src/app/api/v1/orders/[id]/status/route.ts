import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

// Seller-allowed forward transitions only
const SELLER_TRANSITIONS: Partial<Record<string, string>> = {
  confirmed:  'preparing',
  preparing:  'dispatched',
  dispatched: 'in_transit',
}

const schema = z.object({
  status:      z.enum(['preparing', 'dispatched', 'in_transit']),
  sellerNotes: z.string().max(500).optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const order = await prisma.order.findFirst({
    where: { id, sellerId: profile.id },
  })

  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
  }

  let body: unknown
  try { body = await req.json() } catch { body = {} }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { status, sellerNotes } = parsed.data
  const allowedNext = SELLER_TRANSITIONS[order.trackingStatus]

  if (allowedNext !== status) {
    return NextResponse.json(
      {
        success: false,
        error:   `Cannot transition from '${order.trackingStatus}' to '${status}'. Expected next status: '${allowedNext ?? 'none'}'.`,
      },
      { status: 400 },
    )
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      trackingStatus: status,
      ...(sellerNotes ? { sellerNotes } : {}),
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      id:             updated.id,
      orderNumber:    updated.orderNumber,
      trackingStatus: updated.trackingStatus,
      sellerNotes:    updated.sellerNotes,
    },
  })
}
