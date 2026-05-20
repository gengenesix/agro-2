import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  escrowId: z.string().uuid().optional(),
  orderId:  z.string().uuid().optional(),
}).refine(d => d.escrowId ?? d.orderId, {
  message: 'Provide either escrowId or orderId',
})

export async function POST(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  // Only admins and field agents may trigger a payout release
  if (profile.role !== 'admin' && profile.role !== 'field_agent') {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
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

  const { escrowId, orderId } = parsed.data

  const escrow = await prisma.escrowTransaction.findFirst({
    where: escrowId ? { id: escrowId } : { orderId: orderId! },
  })

  if (!escrow) {
    return NextResponse.json({ success: false, error: 'Escrow transaction not found' }, { status: 404 })
  }

  if (escrow.status === 'RELEASED') {
    return NextResponse.json(
      { success: false, error: 'Funds already released', data: { escrowId: escrow.id } },
      { status: 409 },
    )
  }

  if (escrow.status === 'DISPUTED') {
    return NextResponse.json(
      { success: false, error: 'Cannot release a disputed escrow — resolve the dispute first' },
      { status: 422 },
    )
  }

  if (escrow.status === 'REFUNDED') {
    return NextResponse.json(
      { success: false, error: 'Escrow has already been refunded' },
      { status: 409 },
    )
  }

  // ── Atomic: mark RELEASED + credit farmer wallet in one transaction ──────────
  const [updated] = await prisma.$transaction([
    prisma.escrowTransaction.update({
      where: { id: escrow.id },
      data:  { status: 'RELEASED' },
    }),
    // Upsert wallet so farmers without an initialised wallet row still get credited
    prisma.wallet.upsert({
      where:  { userId: escrow.farmerId },
      update: {
        balance:      { increment: Number(escrow.payoutAmount) },
        totalEarned:  { increment: Number(escrow.payoutAmount) },
      },
      create: {
        userId:       escrow.farmerId,
        balance:      Number(escrow.payoutAmount),
        totalEarned:  Number(escrow.payoutAmount),
        pendingBalance: 0,
        totalWithdrawn: 0,
      },
    }),
  ])

  // Audit trail — fire-and-forget; never block the response
  prisma.wallet.findUnique({ where: { userId: escrow.farmerId } })
    .then(wallet => {
      if (!wallet) return
      return prisma.walletTransaction.create({
        data: {
          walletId:    wallet.id,
          type:        'escrow_release',
          amount:      Number(escrow.payoutAmount),
          balanceAfter: wallet.balance,
          reference:   escrow.id,
          description: `Escrow release for order ${escrow.orderId}`,
        },
      })
    })
    .catch(() => undefined)

  return NextResponse.json({
    success: true,
    data: {
      escrowId:    updated.id,
      status:      updated.status,
      payoutAmount: Number(escrow.payoutAmount),
      farmerId:    escrow.farmerId,
      releasedAt:  updated.updatedAt.toISOString(),
    },
  })
}
