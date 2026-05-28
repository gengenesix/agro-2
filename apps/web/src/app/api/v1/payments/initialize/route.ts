import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  orderId:       z.string().uuid(),
  paymentType:   z.enum(['deposit', 'full', 'balance']),
  paymentMethod: z.enum(['mtn_momo', 'vodafone_cash', 'airteltigo_money', 'card', 'bank']).default('mtn_momo'),
})

interface PaystackInitResponse {
  status:  boolean
  message: string
  data:    { authorization_url: string; access_code: string; reference: string }
}

async function initializePaystack(params: {
  email:      string
  amountKobo: number
  reference:  string
  callbackUrl: string
  metadata:   Record<string, unknown>
}): Promise<{ authorizationUrl: string; reference: string }> {
  const res = await fetch('https://api.paystack.co/transaction/initialize', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email:        params.email,
      amount:       params.amountKobo,
      reference:    params.reference,
      callback_url: params.callbackUrl,
      metadata:     params.metadata,
      currency:     'GHS',
    }),
  })

  const json = await res.json() as PaystackInitResponse
  if (!json.status) throw new Error(`Paystack init failed: ${json.message}`)
  return { authorizationUrl: json.data.authorization_url, reference: json.data.reference }
}

export async function POST(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
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

  const { orderId, paymentType, paymentMethod } = parsed.data

  const order = await prisma.order.findUnique({ where: { id: orderId } })
  if (!order) {
    return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 })
  }
  if (order.buyerId !== profile.id) {
    return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
  }

  // Idempotency: if a pending payment already exists for this order + type, return it
  const existing = await prisma.payment.findFirst({
    where: { orderId, paymentType, status: 'pending' },
  })
  if (existing?.paystackReference) {
    return NextResponse.json({
      success: true,
      data: {
        reference:         existing.paystackReference,
        alreadyInitialized: true,
      },
    })
  }

  const amount =
    paymentType === 'deposit' ? Number(order.depositAmount ?? order.totalAmount)
    : paymentType === 'balance' ? Number(order.balanceAmount ?? order.totalAmount)
    : Number(order.totalAmount)

  const reference  = `AGR-${order.id.split('-')[0]!}-${Date.now().toString(36).toUpperCase()}`
  const email      = `${profile.phone.replace(/\D/g, '')}@pay.agroconnect.io`
  const appUrl     = process.env.NEXT_PUBLIC_APP_URL ?? 'https://agroconnect.io'
  const callbackUrl = `${appUrl}/payment/verify?reference=${reference}`

  // Persist the payment record before calling Paystack so we have idempotency on retry
  await prisma.payment.create({
    data: {
      orderId,
      payerId:           profile.id,
      payeeId:           order.sellerId,
      paymentType:       paymentType as 'deposit' | 'full' | 'balance',
      amount,
      paymentMethod:     paymentMethod as 'mtn_momo' | 'vodafone_cash' | 'airteltigo_money' | 'card' | 'bank',
      paystackReference: reference,
      status:            'pending',
    },
  })

  const paystackData = await initializePaystack({
    email,
    amountKobo: Math.round(amount * 100),
    reference,
    callbackUrl,
    metadata: { orderId, paymentType, buyerId: profile.id },
  })

  return NextResponse.json({
    success: true,
    data: {
      authorizationUrl: paystackData.authorizationUrl,
      reference:        paystackData.reference,
      amount,
      orderNumber:      order.orderNumber,
    },
  })
}
