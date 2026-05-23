import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

// Seller-allowed forward transitions. Each status maps to a set of valid next states,
// allowing dealers to skip intermediate steps (e.g. pending → dispatched directly).
const SELLER_TRANSITIONS: Partial<Record<string, string[]>> = {
  pending:    ['confirmed', 'dispatched'],
  confirmed:  ['preparing', 'dispatched'],
  preparing:  ['dispatched'],
  dispatched: ['in_transit'],
}

// 'completed' is a logical state stored via completedAt, not a TrackingStatus enum value
const schema = z.object({
  status:      z.enum(['confirmed', 'preparing', 'dispatched', 'in_transit', 'completed']),
  sellerNotes: z.string().max(500).optional(),
})

// Route actionUrl based on order type so the notification deep-links to the right portal
function buyerActionUrl(orderType: string): string {
  if (orderType === 'input_purchase') return '/farmer/orders'
  if (orderType === 'harvest_pledge') return '/buyer/orders'
  return '/consumer/orders'
}

// Seller-side actionUrl — input_purchase sellers are always dealers; all others are farmers
function sellerActionUrl(orderType: string): string {
  if (orderType === 'input_purchase') return '/dealer/wallet'
  return '/wallet'
}

// Notification config for each buyer-facing status transition
const BUYER_NOTIFICATION: Partial<Record<string, {
  type:  string
  title: string
  body:  (listingTitle: string, orderNumber: string) => string
}>> = {
  confirmed: {
    type:  'ORDER_CONFIRMED',
    title: 'Order confirmed',
    body:  (t) => `Your order for "${t}" has been confirmed by the seller and is being prepared.`,
  },
  dispatched: {
    type:  'ORDER_SHIPPED',
    title: 'Order dispatched',
    body:  (t, n) => `Your order for "${t}" (${n}) has been dispatched and is on its way to you.`,
  },
  in_transit: {
    type:  'ORDER_IN_TRANSIT',
    title: 'Order in transit',
    body:  (t, n) => `Your order for "${t}" (${n}) is in transit and will arrive soon.`,
  },
}

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
    where:   { id, sellerId: profile.id },
    include: { listing: { select: { title: true } } },
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

  // ── completed path ────────────────────────────────────────────────────────
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

    const now             = new Date()
    const isPledge        = order.orderType === 'harvest_pledge'
    const platformFee     = Number(order.platformCommission)

    // Pledges: only the deposit has been escrowed — releasing totalAmount would overdraw
    const settlementAmount = isPledge ? Number(order.depositAmount ?? 0) : Number(order.totalAmount)
    const farmerPayout     = settlementAmount - platformFee

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

    const buyerNewPending  = Math.max(0, Number(buyerWallet.pendingBalance) - settlementAmount)
    const sellerNewBalance = Number(sellerWallet.balance) + farmerPayout

    const [updated] = await prisma.$transaction([
      // 1. Stamp completedAt on the order
      prisma.order.update({
        where: { id: order.id },
        data: {
          completedAt: now,
          ...(sellerNotes ? { sellerNotes } : {}),
        },
      }),

      // 2. Release escrowed amount from buyer's pendingBalance
      prisma.wallet.update({
        where: { userId: order.buyerId },
        data:  { pendingBalance: { decrement: settlementAmount } },
      }),

      // 3. Credit farmer payout into seller's available balance
      prisma.wallet.update({
        where: { userId: order.sellerId },
        data: {
          balance:     { increment: farmerPayout },
          totalEarned: { increment: farmerPayout },
        },
      }),

      // 4. Buyer ledger row — escrow released
      prisma.walletTransaction.create({
        data: {
          walletId:     buyerWallet.id,
          type:         'escrow_release',
          amount:       settlementAmount,
          balanceAfter: buyerNewPending,
          reference:    order.orderNumber,
          description:  `Escrow released — order ${order.orderNumber}`,
          orderId:      order.id,
        },
      }),

      // 5. Seller ledger row — order revenue credited
      prisma.walletTransaction.create({
        data: {
          walletId:     sellerWallet.id,
          type:         'credit',
          amount:       farmerPayout,
          balanceAfter: sellerNewBalance,
          reference:    order.orderNumber,
          description:  `Payment received — order ${order.orderNumber}`,
          orderId:      order.id,
        },
      }),
    ])

    // Notify both parties after the financial transaction commits.
    // Fire-and-forget: a notification failure must never roll back the payment.
    await Promise.allSettled([
      prisma.notification.create({
        data: {
          userId:  order.buyerId,
          type:    'ORDER_COMPLETED',
          title:   'Order complete',
          body:    `Your order "${order.listing.title}" (${order.orderNumber}) has been completed. Thank you!`,
          data:    { actionUrl: buyerActionUrl(order.orderType) },
          channel: 'in_app',
        },
      }),
      prisma.notification.create({
        data: {
          userId:  order.sellerId,
          type:    'PAYMENT_RECEIVED',
          title:   'Payment received',
          body:    `Payment for order ${order.orderNumber} has been credited to your wallet.`,
          data:    { actionUrl: sellerActionUrl(order.orderType) },
          channel: 'in_app',
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

  // ── regular status transition path ────────────────────────────────────────
  const allowedTargets = SELLER_TRANSITIONS[order.trackingStatus]
  if (!allowedTargets?.includes(status)) {
    return NextResponse.json(
      {
        success: false,
        error:   `Cannot transition from '${order.trackingStatus}' to '${status}'. Allowed: [${allowedTargets?.join(', ') ?? 'none'}].`,
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

  // Insert a notification row for every buyer-facing transition.
  // 'preparing' is an internal seller state — no buyer notification.
  // Fire-and-forget: notification failure must never roll back the status update.
  const notifConfig = BUYER_NOTIFICATION[status]
  if (notifConfig) {
    prisma.notification.create({
      data: {
        userId:  order.buyerId,
        type:    notifConfig.type,
        title:   notifConfig.title,
        body:    notifConfig.body(order.listing.title, order.orderNumber),
        data:    { actionUrl: buyerActionUrl(order.orderType) },
        channel: 'in_app',
      },
    }).catch(() => {})
  }

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
