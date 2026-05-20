import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  reason: z.string().min(5).max(500),
})

// Statuses that can still be cancelled (payment not yet cleared = no escrow to unwind)
const CANCELLABLE = new Set(['pending', 'confirmed'])

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const order = await prisma.order.findFirst({
    where: {
      id,
      OR: [{ buyerId: profile.id }, { sellerId: profile.id }],
    },
  })

  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
  }

  if (!CANCELLABLE.has(order.trackingStatus)) {
    return NextResponse.json(
      {
        success: false,
        error:   `Order cannot be cancelled once payment is confirmed. Current status: '${order.trackingStatus}'. Please raise a dispute instead.`,
      },
      { status: 400 },
    )
  }

  let body: unknown
  try { body = await req.json() } catch { body = {} }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'A cancellation reason is required (min 5 characters).' },
      { status: 400 },
    )
  }

  const now = new Date()

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      trackingStatus:     'cancelled',
      cancelledAt:        now,
      cancellationReason: parsed.data.reason,
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      id:                 updated.id,
      orderNumber:        updated.orderNumber,
      trackingStatus:     updated.trackingStatus,
      cancellationReason: updated.cancellationReason,
      cancelledAt:        now.toISOString(),
    },
  })
}
