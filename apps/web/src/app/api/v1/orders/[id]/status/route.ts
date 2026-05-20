import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

// Seller-allowed forward transitions for trackingStatus (enum values only)
const SELLER_TRANSITIONS: Partial<Record<string, string>> = {
  pending:    'confirmed',
  confirmed:  'preparing',
  preparing:  'dispatched',
  dispatched: 'in_transit',
}

// 'completed' is a logical state stored via completedAt, not a TrackingStatus enum value
const schema = z.object({
  status:      z.enum(['confirmed', 'preparing', 'dispatched', 'in_transit', 'completed']),
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

  // 'completed' closes the order via completedAt — not a TrackingStatus enum value
  if (status === 'completed') {
    if (order.trackingStatus !== 'delivered') {
      return NextResponse.json(
        { success: false, error: 'Order must be in delivered state before it can be completed.' },
        { status: 400 },
      )
    }
    if (order.completedAt) {
      return NextResponse.json(
        { success: false, error: 'Order is already completed.' },
        { status: 400 },
      )
    }

    const now         = new Date()
    const totalAmount = Number(order.totalAmount)
    const platformFee = Number(order.platformCommission)
    const netEarnings = totalAmount - platformFee

    // Ensure both wallets exist before the transaction so we have their IDs
    const [buyerWallet, sellerWallet] = await Promise.all([
      prisma.wallet.upsert({
        where:  { userId: order.buyerId },
        create: { userId: order.buyerId,  balance: 0, pendingBalance: 0, totalEarned: 0, totalWithdrawn: 0 },
        update: {},
      }),
      prisma.wallet.upsert({
        where:  { userId: order.sellerId },
        create: { userId: order.sellerId, balance: 0, pendingBalance: 0, totalEarned: 0, totalWithdrawn: 0 },
        update: {},
      }),
    ])

    const buyerNewPending  = Math.max(0, Number(buyerWallet.pendingBalance)  - totalAmount)
    const sellerNewBalance = Number(sellerWallet.balance) + netEarnings

    const [updated] = await prisma.$transaction([
      // 1. Stamp completedAt on the order
      prisma.order.update({
        where: { id: order.id },
        data: {
          completedAt: now,
          ...(sellerNotes ? { sellerNotes } : {}),
        },
      }),

      // 2. Release escrow from buyer's pendingBalance
      prisma.wallet.update({
        where: { userId: order.buyerId },
        data:  { pendingBalance: { decrement: totalAmount } },
      }),

      // 3. Credit net earnings into seller's available balance
      prisma.wallet.update({
        where: { userId: order.sellerId },
        data: {
          balance:     { increment: netEarnings },
          totalEarned: { increment: netEarnings },
        },
      }),

      // 4. Buyer ledger row — escrow released
      prisma.walletTransaction.create({
        data: {
          walletId:    buyerWallet.id,
          type:        'escrow_release',
          amount:      totalAmount,
          balanceAfter: buyerNewPending,
          reference:   order.orderNumber,
          description: `Escrow released — order ${order.orderNumber}`,
          orderId:     order.id,
        },
      }),

      // 5. Seller ledger row — order revenue credited
      prisma.walletTransaction.create({
        data: {
          walletId:    sellerWallet.id,
          type:        'credit',
          amount:      netEarnings,
          balanceAfter: sellerNewBalance,
          reference:   order.orderNumber,
          description: `Payment received — order ${order.orderNumber}`,
          orderId:     order.id,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        id:             updated.id,
        orderNumber:    updated.orderNumber,
        trackingStatus: updated.trackingStatus,
        completedAt:    now.toISOString(),
        sellerNotes:    updated.sellerNotes,
      },
    })
  }

  const allowedNext = SELLER_TRANSITIONS[order.trackingStatus]
  if (allowedNext !== status) {
    return NextResponse.json(
      {
        success: false,
        error:   `Cannot transition from '${order.trackingStatus}' to '${status}'. Expected next: '${allowedNext ?? 'none'}'.`,
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
      completedAt:    updated.completedAt?.toISOString() ?? null,
      sellerNotes:    updated.sellerNotes,
    },
  })
}
