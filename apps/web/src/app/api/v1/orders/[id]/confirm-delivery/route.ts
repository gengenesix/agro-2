import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

// Buyer confirms they received the goods → releases escrow to seller's spendable balance
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
    where: { id, buyerId: profile.id },
  })

  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
  }

  const validStatuses = ['dispatched', 'in_transit', 'delivered'] as const
  if (!validStatuses.includes(order.trackingStatus as typeof validStatuses[number])) {
    return NextResponse.json(
      {
        success: false,
        error:   `Delivery cannot be confirmed when order status is '${order.trackingStatus}'.`,
      },
      { status: 400 },
    )
  }

  if (order.trackingStatus === 'delivered' && order.deliveredAt) {
    return NextResponse.json(
      { success: false, error: 'Delivery has already been confirmed.' },
      { status: 400 },
    )
  }

  // Amount to release from escrow — the full order amount minus platform commission
  // pendingBalance already holds the net seller amount (set by webhook)
  const sellerWallet = await prisma.wallet.findUnique({ where: { userId: order.sellerId } })
  if (!sellerWallet) {
    return NextResponse.json(
      { success: false, error: 'Seller wallet not found.' },
      { status: 500 },
    )
  }

  // Determine how much to release: sum of all successful payments for this order,
  // net of commission, which equals what is sitting in pendingBalance for this order.
  // Simplification: release the full pendingBalance attributed to this order.
  // For a production system with concurrent orders, track per-order escrow amounts.
  const payments = await prisma.payment.findMany({
    where: { orderId: order.id, status: 'success' },
  })
  const commissionRates: Record<string, number> = {
    direct_purchase: 0.030,
    harvest_pledge:  0.025,
    input_purchase:  0.015,
    input_bnpl:      0,
  }
  const commissionRate = commissionRates[order.orderType] ?? 0.030
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const releaseAmount = parseFloat((totalPaid * (1 - commissionRate)).toFixed(2))

  const now = new Date()

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        trackingStatus: 'delivered',
        deliveredAt:    now,
      },
    })

    const currentPending = Number(sellerWallet.pendingBalance)
    const safeRelease    = Math.min(releaseAmount, currentPending)
    const newPending     = parseFloat((currentPending - safeRelease).toFixed(2))
    const newBalance     = parseFloat((Number(sellerWallet.balance) + safeRelease).toFixed(2))

    await tx.wallet.update({
      where: { id: sellerWallet.id },
      data: {
        balance:        newBalance,
        pendingBalance: newPending,
      },
    })

    await tx.walletTransaction.create({
      data: {
        walletId:     sellerWallet.id,
        type:         'escrow_release',
        amount:       safeRelease,
        balanceAfter: newBalance,
        reference:    order.orderNumber,
        description:  `Delivery confirmed for order ${order.orderNumber}`,
      },
    })
  })

  return NextResponse.json({
    success: true,
    data: {
      orderId:        order.id,
      orderNumber:    order.orderNumber,
      trackingStatus: 'delivered',
      deliveredAt:    now.toISOString(),
      escrowReleased: releaseAmount,
    },
  })
}
