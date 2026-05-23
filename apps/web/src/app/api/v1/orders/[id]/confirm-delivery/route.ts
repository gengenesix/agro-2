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

// Buyer confirms they received the goods → advances to 'delivered' and settles finances.
//
// For DIRECT / INPUT orders  — release seller escrow net of commission (single leg).
// For HARVEST PLEDGE orders  — two-leg settlement in one atomic transaction:
//   Leg 1: deposit already held in seller's pendingBalance → released net of commission.
//   Leg 2: remaining contract balance → debited from buyer's available balance,
//          credited net of commission to seller's available balance.
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

  const commissionRate = COMMISSION_RATES[order.orderType] ?? 0.030
  const now            = new Date()

  // ── HARVEST PLEDGE — dual-stage settlement ───────────────────────────────────
  if (isPledge) {
    const deposit     = parseFloat(Number(order.depositAmount ?? 0).toFixed(2))
    // balanceAmount is pre-stored on the order; fall back to totalAmount - deposit
    // to guard against older rows where the column was not yet populated.
    const balanceOwed = parseFloat(
      Number(order.balanceAmount ?? (Number(order.totalAmount) - deposit)).toFixed(2),
    )

    // Net payouts — commission applied to each leg independently
    const depositNetPayout  = parseFloat((deposit     * (1 - commissionRate)).toFixed(2))
    const balanceNetPayout  = parseFloat((balanceOwed * (1 - commissionRate)).toFixed(2))
    const totalSellerPayout = parseFloat((depositNetPayout + balanceNetPayout).toFixed(2))

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

    // Cap deposit release to what is actually in pendingBalance to prevent
    // overdrawing escrow on edge cases (e.g. partial pre-credits).
    const safeDepositRelease = parseFloat(
      Math.min(deposit, Number(sellerWallet.pendingBalance)).toFixed(2),
    )

    // Pre-compute balanceAfter snapshots for ledger records.
    // Derived from wallet state at read time — atomic increment/decrement
    // operators are used on the actual wallet rows to prevent race conditions.
    const sellerBalanceAfterEscrowRelease = parseFloat(
      (Number(sellerWallet.balance) + depositNetPayout).toFixed(2),
    )
    const sellerBalanceAfterCredit = parseFloat(
      (Number(sellerWallet.balance) + totalSellerPayout).toFixed(2),
    )
    const buyerBalanceAfterDebit = parseFloat(
      (Number(buyerWallet.balance) - balanceOwed).toFixed(2),
    )

    await prisma.$transaction(async (tx) => {
      // 1. Advance order state — stamp both deliveredAt and balancePaidAt
      await tx.order.update({
        where: { id: order.id },
        data: {
          trackingStatus: 'delivered',
          deliveredAt:    now,
          balancePaidAt:  now,
          pledgeProgress: 'delivered',
        },
      })

      // 2. Release deposit escrow from seller's pendingBalance;
      //    credit full two-leg payout to seller's available balance.
      await tx.wallet.update({
        where: { id: sellerWallet.id },
        data: {
          pendingBalance: { decrement: safeDepositRelease },
          balance:        { increment: totalSellerPayout },
          totalEarned:    { increment: totalSellerPayout },
        },
      })

      // 3. Debit the remaining contract balance from buyer's available balance.
      await tx.wallet.update({
        where: { id: buyerWallet.id },
        data: {
          balance: { decrement: balanceOwed },
        },
      })

      // 4. Seller ledger — deposit escrow release record
      await tx.walletTransaction.create({
        data: {
          walletId:     sellerWallet.id,
          type:         'escrow_release',
          amount:       depositNetPayout,
          balanceAfter: sellerBalanceAfterEscrowRelease,
          reference:    order.orderNumber,
          description:  `Deposit escrow released — order ${order.orderNumber}`,
          orderId:      order.id,
        },
      })

      // 5. Seller ledger — remaining balance received record
      await tx.walletTransaction.create({
        data: {
          walletId:     sellerWallet.id,
          type:         'credit',
          amount:       balanceNetPayout,
          balanceAfter: sellerBalanceAfterCredit,
          reference:    order.orderNumber,
          description:  `Balance payment received — order ${order.orderNumber}`,
          orderId:      order.id,
        },
      })

      // 6. Buyer ledger — remaining balance charged record
      await tx.walletTransaction.create({
        data: {
          walletId:     buyerWallet.id,
          type:         'debit',
          amount:       balanceOwed,
          balanceAfter: buyerBalanceAfterDebit,
          reference:    order.orderNumber,
          description:  `Balance payment settled — order ${order.orderNumber}`,
          orderId:      order.id,
        },
      })
    })

    await Promise.allSettled([
      prisma.notification.create({
        data: {
          userId:  order.sellerId,
          type:    'ORDER_DELIVERED',
          title:   'Delivery confirmed',
          body:    `Buyer confirmed receipt of order ${order.orderNumber}. Full contract settled — GHS ${totalSellerPayout.toFixed(2)} credited to your wallet.`,
          data:    { actionUrl: recipientActionUrl(order.seller.role, order.orderType, 'seller') },
          channel: 'in_app',
        },
      }),
      prisma.notification.create({
        data: {
          userId:  order.buyerId,
          type:    'ORDER_DELIVERED',
          title:   'Receipt confirmed',
          body:    `You confirmed receipt of order ${order.orderNumber}. Remaining balance of GHS ${balanceOwed.toFixed(2)} has been settled. Thank you for your purchase.`,
          data:    { actionUrl: recipientActionUrl(order.buyer.role, order.orderType, 'buyer') },
          channel: 'in_app',
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        orderId:          order.id,
        orderNumber:      order.orderNumber,
        trackingStatus:   'delivered',
        pledgeProgress:   'delivered',
        deliveredAt:      now.toISOString(),
        depositReleased:  depositNetPayout,
        balanceSettled:   balanceOwed,
        totalSellerPayout,
      },
    })
  }

  // ── DIRECT / INPUT ORDERS — release seller escrow net of commission ──────────
  //
  // All payments are collected upfront via Paystack and held in the seller's
  // pendingBalance. Sum actual successful payment records to derive the exact
  // amount to release — never rely on order.totalAmount alone.
  const sellerWallet = await prisma.wallet.upsert({
    where:  { userId: order.sellerId },
    create: { userId: order.sellerId, balance: 0, pendingBalance: 0, totalEarned: 0, totalWithdrawn: 0 },
    update: {},
  })

  const payments = await prisma.payment.findMany({
    where: { orderId: order.id, status: 'success' },
  })
  const totalPaid     = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const releaseAmount = parseFloat((totalPaid * (1 - commissionRate)).toFixed(2))

  const currentPending = Number(sellerWallet.pendingBalance)
  const safeRelease    = parseFloat(Math.min(releaseAmount, currentPending).toFixed(2))
  const newBalance     = parseFloat((Number(sellerWallet.balance) + safeRelease).toFixed(2))

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        trackingStatus: 'delivered',
        deliveredAt:    now,
      },
    })

    await tx.wallet.update({
      where: { id: sellerWallet.id },
      data: {
        pendingBalance: { decrement: safeRelease },
        balance:        { increment: safeRelease },
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
      pledgeProgress: order.pledgeProgress,
      deliveredAt:    now.toISOString(),
      escrowReleased: releaseAmount,
    },
  })
}
