import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  orderId: z.string().uuid(),
  reason:  z.string().min(10, 'Reason must be at least 10 characters').max(500),
})

export async function POST(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
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

  const { orderId, reason } = parsed.data

  const escrow = await prisma.escrowTransaction.findUnique({ where: { orderId } })

  if (!escrow) {
    return NextResponse.json({ success: false, error: 'No escrow found for this order' }, { status: 404 })
  }

  // Only the buyer on the order or an admin may raise a dispute
  if (profile.id !== escrow.buyerId && profile.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  if (escrow.status === 'RELEASED') {
    return NextResponse.json(
      { success: false, error: 'Cannot dispute an escrow that has already been released' },
      { status: 422 },
    )
  }

  if (escrow.status === 'REFUNDED') {
    return NextResponse.json(
      { success: false, error: 'Cannot dispute an already refunded escrow' },
      { status: 422 },
    )
  }

  if (escrow.status === 'DISPUTED') {
    return NextResponse.json(
      { success: false, error: 'Escrow is already under dispute', data: { escrowId: escrow.id } },
      { status: 409 },
    )
  }

  const updated = await prisma.escrowTransaction.update({
    where: { id: escrow.id },
    data:  { status: 'DISPUTED' },
  })

  // Notify the farmer-seller that their escrow is under dispute — fire-and-forget
  prisma.notification.create({
    data: {
      userId:  escrow.farmerId,
      type:    'escrow_disputed',
      title:   'Escrow dispute raised',
      body:    `A dispute has been raised on order ${orderId}: ${reason}`,
      data:    { actionUrl: '/orders' },
      channel: 'in_app',
    },
  }).catch(() => undefined)

  return NextResponse.json({
    success: true,
    data: {
      escrowId:   updated.id,
      orderId,
      status:     updated.status,
      reason,
      disputedAt: updated.updatedAt.toISOString(),
    },
  })
}
