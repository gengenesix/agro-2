import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

interface PaystackVerifyResponse {
  status: boolean
  data: {
    status: string
    amount: number
    reference: string
    metadata: { orderId: string; paymentType: string }
  }
}

async function verifyPaystack(reference: string): Promise<PaystackVerifyResponse['data']> {
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } },
  )
  const json = await res.json() as PaystackVerifyResponse
  if (!json.status) throw new Error('Paystack verify request failed')
  return json.data
}

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const reference = new URL(req.url).searchParams.get('reference')
  if (!reference) {
    return NextResponse.json({ success: false, error: 'reference query param is required' }, { status: 400 })
  }

  const payment = await prisma.payment.findUnique({ where: { paystackReference: reference } })
  if (!payment) {
    return NextResponse.json({ success: false, error: 'Payment not found' }, { status: 404 })
  }
  if (payment.payerId !== profile.id) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  // Return cached result if already confirmed — prevents duplicate processing
  if (payment.status === 'success') {
    return NextResponse.json({
      success: true,
      data: { status: 'success', orderId: payment.orderId, alreadyVerified: true },
    })
  }
  if (payment.status === 'failed') {
    return NextResponse.json({
      success: false,
      error: 'Payment failed',
      data: { status: 'failed', orderId: payment.orderId },
    })
  }

  const txData = await verifyPaystack(reference)

  if (txData.status !== 'success') {
    await prisma.payment.update({
      where: { id: payment.id },
      data:  { status: 'failed' },
    })
    return NextResponse.json({
      success: false,
      error: 'Payment was not completed',
      data: { status: txData.status, orderId: payment.orderId },
    })
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'success', completedAt: new Date() },
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      data: {
        trackingStatus: 'confirmed',
        confirmedAt:    new Date(),
        ...(payment.paymentType === 'deposit'  ? { depositPaidAt: new Date() }  : {}),
        ...(payment.paymentType === 'balance'  ? { balancePaidAt: new Date() }  : {}),
        ...(payment.paymentType === 'full'     ? { depositPaidAt: new Date(), balancePaidAt: new Date() } : {}),
      },
    }),
  ])

  return NextResponse.json({
    success: true,
    data: { status: 'success', orderId: payment.orderId },
  })
}
