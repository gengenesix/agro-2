import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const COMMISSION_RATES: Record<string, number> = {
  direct_purchase: 0.030,
  harvest_pledge:  0.025,
  input_purchase:  0.015,
  input_bnpl:      0,
}

// ── Notification URL matrix ────────────────────────────────────────────────────
//
// Identical contract to status/route.ts — co-located so this file is fully
// self-contained and independently auditable without cross-file dependencies.
//
// Hard rule: the recipient's role is read from the database Profile row.
// The switch returns ONLY literal hardcoded strings — no string templates,
// no dynamic building, no orderType inference for non-farmer roles.
//
// 'side' = 'buyer'  → party who placed the order
// 'side' = 'seller' → party fulfilling / receiving payment
function recipientActionUrl(
  role: string,
  orderType: string,
  side: 'buyer' | 'seller',
): string {
  switch (role) {
    case 'dealer':
      return side === 'seller' ? '/dealer/wallet' : '/dealer/orders'

    case 'buyer':
      return '/buyer/orders'

    case 'consumer':
      return '/consumer/orders'

    case 'field_agent':
      return '/field-agent/dashboard'

    case 'farmer': {
      if (side === 'buyer' && orderType === 'input_purchase') return '/farmer/orders'
      return '/orders'
    }

    default:
      return '/'
  }
}

// Buyer confirms they received the goods → advances to 'delivered' and releases escrow
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Include both profile roles so every notification URL is derived from
  // the actual DB role, not inferred from order metadata.
  const order = await prisma.order.findFirst({
    where:   { id, buyerId: profile.id },
    include: {
      buyer:  { select: { role: true } },
      seller: { select: { role: true } },
    },
  })

  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
  }

  if (order.trackingStatus === 'delivered' && order.deliveredAt) {
    return NextResponse.json(
      { success: false, error: 'Delivery has already been confirmed.' },
      { status: 400 },
    )
  }

  const isPledge = order.orderType === 'harvest_pledge'

  // Pledge orders track dispatch via pledgeProgress; direct orders use trackingStatus
  if (isPledge) {
    if (order.pledgeProgress !== 'dispatched') {
      return NextResponse.json(
        {
          success: false,
          error:   `Delivery cannot be confirmed until the pledge is marked dispatched. Current progress: '${order.pledgeProgress ?? 'none'}'.`,
        },
        { status: 400 },
      )
    }
  } else {
    const validStatuses = ['dispatched', 'in_transit'] as const
    if (!validStatuses.includes(order.trackingStatus as typeof validStatuses[number])) {
      return NextResponse.json(
        {
          success: false,
          error:   `Delivery cannot be confirmed when order status is '${order.trackingStatus}'.`,
        },
        { status: 400 },
      )
    }
  }

  const sellerWallet = await prisma.wallet.upsert({
    where:  { userId: order.sellerId },
    create: { userId: order.sellerId, balance: 0, pendingBalance: 0, totalEarned: 0, totalWithdrawn: 0 },
    update: {},
  })

  const commissionRate = COMMISSION_RATES[order.orderType] ?? 0.030

  // Pledges: only the deposit has cleared into escrow — releasing the full subtotal would
  // overdraw pending balance. Direct orders: sum actual successful payments.
  let releaseAmount: number
  if (isPledge) {
    const deposit = Number(order.depositAmount ?? 0)
    releaseAmount = parseFloat((deposit * (1 - commissionRate)).toFixed(2))
  } else {
    const payments = await prisma.payment.findMany({
      where: { orderId: order.id, status: 'success' },
    })
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0)
    releaseAmount = parseFloat((totalPaid * (1 - commissionRate)).toFixed(2))
  }

  const now = new Date()

  await prisma.$transaction(async (tx) => {
    // Advance order state — pledges also update pledgeProgress
    await tx.order.update({
      where: { id: order.id },
      data: {
        trackingStatus: 'delivered',
        deliveredAt:    now,
        ...(isPledge ? { pledgeProgress: 'delivered' } : {}),
      },
    })

    const currentPending = Number(sellerWallet.pendingBalance)
    const safeRelease    = parseFloat(Math.min(releaseAmount, currentPending).toFixed(2))
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
        description:  `Delivery confirmed — order ${order.orderNumber}`,
        orderId:      order.id,
      },
    })
  })

  // Notify BOTH parties after escrow is released.
  // Roles are read from DB — actionUrls are resolved through the switch matrix above.
  // Fire-and-forget: notification failures must never block the delivery response.
  await Promise.allSettled([
    prisma.notification.create({
      data: {
        userId:  order.sellerId,
        type:    'ORDER_DELIVERED',
        title:   'Delivery confirmed',
        body:    `Your buyer confirmed receipt of order ${order.orderNumber}. Escrow funds are being released to your wallet.`,
        data:    { actionUrl: recipientActionUrl(order.seller.role, order.orderType, 'seller') },
        channel: 'in_app',
      },
    }),
    prisma.notification.create({
      data: {
        userId:  order.buyerId,
        type:    'ORDER_DELIVERED',
        title:   'Receipt confirmed',
        body:    `You confirmed receipt of order ${order.orderNumber}. Thank you for your purchase.`,
        data:    { actionUrl: recipientActionUrl(order.buyer.role, order.orderType, 'buyer') },
        channel: 'in_app',
      },
    }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      orderId:        order.id,
      orderNumber:    order.orderNumber,
      trackingStatus: 'delivered',
      pledgeProgress: isPledge ? 'delivered' : order.pledgeProgress,
      deliveredAt:    now.toISOString(),
      escrowReleased: releaseAmount,
    },
  })
}