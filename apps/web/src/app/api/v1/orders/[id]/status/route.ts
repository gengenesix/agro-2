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

// ── Notification URL matrix ────────────────────────────────────────────────────
//
// Hard rule: the recipient's role is read from the database Profile row FIRST.
// The switch maps each role to an absolute, hardcoded path string.
// There are no string templates, no dynamic concatenation, no inference from
// orderType for non-farmer roles — only literal return values inside case blocks.
//
// Guarantee: a user with role='dealer' can NEVER receive a path containing
// '/farmer/'. A user with role='buyer' can NEVER receive a path containing
// '/dealer/'. Each case is independently auditable.
//
// 'side' = 'buyer'  → notification is sent to the party who placed the order
// 'side' = 'seller' → notification is sent to the party fulfilling the order
function recipientActionUrl(
  role: string,
  orderType: string,
  side: 'buyer' | 'seller',
): string {
  switch (role) {
    case 'dealer':
      // Dealers are always sellers. On completion they want their wallet;
      // on mid-state updates they want their orders list.
      return side === 'seller' ? '/dealer/wallet' : '/dealer/orders'

    case 'buyer':
      // Corporate/enterprise buyers — always routed to their orders hub.
      return '/buyer/orders'

    case 'consumer':
      // Individual consumers — single orders destination.
      return '/consumer/orders'

    case 'field_agent':
      // Field agents are never an order party; fallback to their dashboard.
      return '/field-agent/dashboard'

    case 'farmer': {
      // Farmers appear on BOTH sides of different order types.
      // As buyer: they purchased agro-inputs → show their input orders tab.
      // As seller: they sold produce → show their general orders page.
      if (side === 'buyer' && orderType === 'input_purchase') return '/farmer/orders'
      return '/orders'
    }

    default:
      return '/'
  }
}

// ── Per-transition notification copy ──────────────────────────────────────────
// 'preparing' is an internal seller state — no outbound notifications are sent.

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

const SELLER_NOTIFICATION: Partial<Record<string, {
  type:  string
  title: string
  body:  (orderNumber: string) => string
}>> = {
  confirmed: {
    type:  'ORDER_CONFIRMED',
    title: 'Order confirmed',
    body:  (n) => `You confirmed order ${n}. Prepare it for dispatch.`,
  },
  dispatched: {
    type:  'ORDER_SHIPPED',
    title: 'Order dispatched',
    body:  (n) => `Order ${n} has been marked dispatched. The buyer has been notified.`,
  },
  in_transit: {
    type:  'ORDER_IN_TRANSIT',
    title: 'Order in transit',
    body:  (n) => `Order ${n} is now in transit.`,
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

  // Fetch buyer and seller roles from the database so notification URLs are
  // determined by the actual profile record, not inferred from order metadata.
  const order = await prisma.order.findFirst({
    where:   { id, sellerId: profile.id },
    include: {
      listing: { select: { title: true } },
      buyer:   { select: { role: true } },
      seller:  { select: { role: true } },
    },
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

      // 3. Credit seller payout into their available balance
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

    // Notify BOTH parties after the financial transaction commits.
    // Buyer role and seller role are read from DB — no orderType inference.
    // Fire-and-forget: a notification failure must never roll back the payment.
    await Promise.allSettled([
      prisma.notification.create({
        data: {
          userId:  order.buyerId,
          type:    'ORDER_COMPLETED',
          title:   'Order complete',
          body:    `Your order "${order.listing.title}" (${order.orderNumber}) has been completed. Thank you!`,
          data:    { actionUrl: recipientActionUrl(order.buyer.role, order.orderType, 'buyer') },
          channel: 'in_app',
        },
      }),
      prisma.notification.create({
        data: {
          userId:  order.sellerId,
          type:    'PAYMENT_RECEIVED',
          title:   'Payment received',
          body:    `Payment for order ${order.orderNumber} has been credited to your wallet.`,
          data:    { actionUrl: recipientActionUrl(order.seller.role, order.orderType, 'seller') },
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

  // Notify BOTH the buyer and the seller for every visible state change.
  // 'preparing' is an internal state — neither BUYER_NOTIFICATION nor
  // SELLER_NOTIFICATION has an entry for it, so no records are written.
  // Fire-and-forget: notification failures must never roll back the status update.
  const buyerNotif  = BUYER_NOTIFICATION[status]
  const sellerNotif = SELLER_NOTIFICATION[status]

  if (buyerNotif) {
    prisma.notification.create({
      data: {
        userId:  order.buyerId,
        type:    buyerNotif.type,
        title:   buyerNotif.title,
        body:    buyerNotif.body(order.listing.title, order.orderNumber),
        data:    { actionUrl: recipientActionUrl(order.buyer.role, order.orderType, 'buyer') },
        channel: 'in_app',
      },
    }).catch(() => {})
  }

  if (sellerNotif) {
    prisma.notification.create({
      data: {
        userId:  order.sellerId,
        type:    sellerNotif.type,
        title:   sellerNotif.title,
        body:    sellerNotif.body(order.orderNumber),
        data:    { actionUrl: recipientActionUrl(order.seller.role, order.orderType, 'seller') },
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