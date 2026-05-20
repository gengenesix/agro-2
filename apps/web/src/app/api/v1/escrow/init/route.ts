import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  orderId: z.string().uuid(),
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

  const { orderId } = parsed.data

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { id: true, buyerId: true, sellerId: true, totalAmount: true, trackingStatus: true },
  })

  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
  }

  // Only the buyer on the order or an admin may initialise escrow
  if (profile.id !== order.buyerId && profile.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  // Idempotency guard — one escrow record per order
  const existing = await prisma.escrowTransaction.findUnique({ where: { orderId } })
  if (existing) {
    return NextResponse.json(
      { success: false, error: 'Escrow already initialised for this order', data: { escrowId: existing.id } },
      { status: 409 },
    )
  }

  // ── Decimal-safe fee calculation (integer pesewa arithmetic) ─────────────────
  // Work entirely in pesewas (1 GHS = 100 pesewas) to avoid IEEE-754 drift.
  const totalPesewas     = Math.round(Number(order.totalAmount) * 100)
  const feePesewas       = Math.round(totalPesewas * 0.03)          // 3% platform cut
  const payoutPesewas    = totalPesewas - feePesewas

  const amount        = totalPesewas  / 100
  const platformFee   = feePesewas    / 100
  const payoutAmount  = payoutPesewas / 100

  const escrow = await prisma.escrowTransaction.create({
    data: {
      orderId,
      buyerId:      order.buyerId,
      farmerId:     order.sellerId,
      amount,
      platformFee,
      payoutAmount,
      status:       'HELD',
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      escrowId:     escrow.id,
      orderId:      escrow.orderId,
      amount,
      platformFee,
      payoutAmount,
      status:       escrow.status,
      createdAt:    escrow.createdAt.toISOString(),
    },
  }, { status: 201 })
}
