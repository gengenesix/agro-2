import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { prisma } from '@/lib/prisma'

interface PaystackEvent {
  event: string
  data: {
    id:        number
    reference: string
    status:    string
    amount:    number
    metadata?: Record<string, unknown>
  }
}

const COMMISSION_RATES: Record<string, number> = {
  direct_purchase: 0.030,
  harvest_pledge:  0.025,
  input_purchase:  0.015,
  input_bnpl:      0,
}

export async function POST(req: NextRequest) {
  const rawBody  = await req.text()
  const signature = req.headers.get('x-paystack-signature') ?? ''
  const secret   = process.env.PAYSTACK_SECRET_KEY ?? ''

  const expectedHash = createHmac('sha512', secret).update(rawBody).digest('hex')
  if (expectedHash !== signature) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 })
  }

  let event: PaystackEvent
  try {
    event = JSON.parse(rawBody) as PaystackEvent
  } catch {
    return NextResponse.json({ message: 'Invalid JSON' }, { status: 400 })
  }

  // We only act on successful charges — acknowledge all other events with 200
  if (event.event !== 'charge.success') {
    return NextResponse.json({ message: 'ok' })
  }

  const { reference, amount, id: paystackTransactionId } = event.data
  const amountGhs = amount / 100

  const payment = await prisma.payment.findUnique({ where: { paystackReference: reference } })

  // Idempotent: already processed or unknown reference
  if (!payment || payment.status === 'success') {
    return NextResponse.json({ message: 'ok' })
  }

  const order = await prisma.order.findUnique({ where: { id: payment.orderId } })
  if (!order) {
    return NextResponse.json({ message: 'ok' })
  }

  const commissionRate = COMMISSION_RATES[order.orderType] ?? 0.030
  const sellerAmount   = amountGhs * (1 - commissionRate)

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status:                 'success',
        completedAt:            new Date(),
        paystackTransactionId:  String(paystackTransactionId),
      },
    })

    await tx.order.update({
      where: { id: order.id },
      data: {
        trackingStatus: 'confirmed',
        confirmedAt:    new Date(),
        ...(payment.paymentType === 'deposit'  ? { depositPaidAt: new Date() }  : {}),
        ...(payment.paymentType === 'balance'  ? { balancePaidAt: new Date() }  : {}),
        ...(payment.paymentType === 'full'     ? { depositPaidAt: new Date(), balancePaidAt: new Date() } : {}),
      },
    })

    // Credit seller's pending balance (held in escrow until delivery confirmed)
    let wallet = await tx.wallet.findUnique({ where: { userId: order.sellerId } })
    if (!wallet) {
      wallet = await tx.wallet.create({ data: { userId: order.sellerId } })
    }

    const newPendingBalance = Number(wallet.pendingBalance) + sellerAmount

    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        pendingBalance: newPendingBalance,
        totalEarned:    { increment: sellerAmount },
      },
    })

    await tx.walletTransaction.create({
      data: {
        walletId:     wallet.id,
        type:         'escrow_hold',
        amount:       sellerAmount,
        balanceAfter: Number(wallet.balance),
        reference,
        description:  `Escrow: payment for order ${order.orderNumber}`,
      },
    })
  })

  return NextResponse.json({ message: 'ok' })
}
