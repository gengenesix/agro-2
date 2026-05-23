import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const COMMISSION_RATES: Record<string, number> = {
  direct_purchase: 0.030,
  harvest_pledge:  0.025,
  input_purchase:  0.015,
  input_bnpl:      0,
}

// ── Notification path dictionary ──────────────────────────────────────────────
// Mirrors the same ROLE_PATHS table in status/route.ts.
// Kept co-located so this file is self-contained and independently auditable.
const ROLE_PATHS: Record<string, Record<'orders' | 'wallet', string>> = {
  farmer:      { orders: '/farmer/orders', wallet: '/wallet'          },
  dealer:      { orders: '/dealer/orders', wallet: '/dealer/wallet'   },
  buyer:       { orders: '/buyer/orders',  wallet: '/buyer/wallet'    },
  consumer:    { orders: '/consumer/orders', wallet: '/consumer/orders' },
  field_agent: { orders: '/field-agent/dashboard', wallet: '/field-agent/earnings' },
}

function rolePath(role: string, tab: 'orders' | 'wallet'): string {
  return ROLE_PATHS[role]?.[tab] ?? '/'
}

// Seller role is fully determined by order type.
// input_purchase sellers are always dealers; all other sellers are farmers.
function orderSellerRole(orderType: string): string {
  return orderType === 'input_purchase' ? 'dealer' : 'farmer'
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

  const order = await prisma.order.findFirst({
    where: { id, buyerId: profile.id },
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

  // Notify the seller that the buyer confirmed receipt and escrow is on the way.
  // Fire-and-forget: notification failure must never block the delivery confirmation response.
  prisma.notification.create({
    data: {
      userId:  order.sellerId,
      type:    'ORDER_DELIVERED',
      title:   'Delivery confirmed',
      body:    `Your buyer confirmed receipt of order ${order.orderNumber}. Escrow funds are being released to your wallet.`,
      data:    { actionUrl: rolePath(orderSellerRole(order.orderType), 'wallet') },
      channel: 'in_app',
    },
  }).catch(() => {})

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