import type { FastifyInstance, RawRequestDefaultExpression } from 'fastify'
import { prisma }   from '../../config/database.js'
import { sendSMS }  from '../../lib/arkesel.js'
import { cache }    from '../../lib/cache.js'
import { initPaymentSchema } from '@agroconnect/validators'
import {
  initializeTransaction,
  verifyTransaction,
  verifyWebhookSignature,
} from '../../lib/paystack.js'
import { AuthError, NotFoundError, BusinessError, AppError } from '../../lib/errors.js'

export default async function paymentsRoutes(app: FastifyInstance) {
  // Initialize Paystack transaction
  app.post('/initialize', async (req, reply) => {
    if (!req.user) throw new AuthError()

    const { orderId, amount, paymentType } = initPaymentSchema.parse(req.body)
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { buyer: { select: { phone: true } } },
    })
    if (!order) throw new NotFoundError('Order')
    if (order.buyerId !== req.user.id) throw new BusinessError('You are not the buyer of this order.')

    const reference = `AC_${orderId.slice(0, 8)}_${Date.now()}`

    await prisma.payment.create({
      data: {
        orderId,
        payerId:          req.user.id,
        payeeId:          order.sellerId,
        paymentType,
        amount,
        status:           'pending',
        paymentMethod:    'mtn_momo',
        paystackReference: reference,
      },
    })

    const result = await initializeTransaction({
      email:       `${req.user.phone.replace('+', '')}@agroconnect.phone`,
      amountGHS:   amount,
      reference,
      callbackUrl: `${process.env['WEB_URL']}/payments/verify?ref=${reference}`,
      metadata:    { orderId, payerId: req.user.id, paymentType },
    })

    return reply.send({ success: true, data: result })
  })

  // Verify after redirect
  app.get('/verify', async (req) => {
    if (!req.user) throw new AuthError()
    const { reference } = req.query as { reference: string }
    const result = await verifyTransaction(reference)
    return { success: true, data: result }
  })

  // Paystack webhook — no JWT
  app.post('/webhook', {
    config: { rawBody: true },
  }, async (req, reply) => {
    const signature = req.headers['x-paystack-signature'] as string
    const rawBody   = (req as unknown as { rawBody: Buffer }).rawBody?.toString()

    if (!rawBody || !verifyWebhookSignature(rawBody, signature)) {
      return reply.status(400).send({ error: 'Invalid signature' })
    }

    const event = req.body as { event: string; data: Record<string, unknown> }

    if (event.event === 'charge.success') {
      const { reference, amount, channel, metadata } = event.data as {
        reference: string
        amount:    number
        channel:   string
        metadata:  { orderId: string; payerId: string; paymentType: string }
      }

      const existing = await prisma.payment.findUnique({
        where: { paystackReference: reference },
      })
      if (existing?.status === 'success') {
        return reply.send({ received: true })
      }

      const amountGHS   = amount / 100
      const channelMap: Record<string, string> = {
        mobile_money: 'mtn_momo',
        card:         'card',
        bank:         'bank',
      }

      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { paystackReference: reference },
          data: {
            status:        'success',
            paymentMethod: channelMap[channel] as never ?? 'card',
            completedAt:   new Date(),
          },
        })

        await tx.order.update({
          where: { id: metadata.orderId },
          data:  { trackingStatus: 'confirmed', confirmedAt: new Date() },
        })

        const order = await tx.order.findUnique({
          where:   { id: metadata.orderId },
          select: { sellerId: true, platformCommission: true },
        })

        if (order) {
          const sellerEscrow = amountGHS - Number(order.platformCommission)
          await tx.wallet.update({
            where: { userId: order.sellerId },
            data:  { pendingBalance: { increment: sellerEscrow } },
          })
        }
      })
    }

    return reply.send({ received: true })
  })

  // Wallet balance
  app.get('/wallet', async (req) => {
    if (!req.user) throw new AuthError()
    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } })
    if (!wallet) throw new NotFoundError('Wallet')
    return { success: true, data: wallet }
  })

  // Wallet transactions
  app.get('/wallet/transactions', async (req) => {
    if (!req.user) throw new AuthError()
    const page  = Number((req.query as Record<string, string>)['page'] ?? '1')
    const limit = 20
    const skip  = (page - 1) * limit

    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } })
    if (!wallet) throw new NotFoundError('Wallet')

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where:   { walletId: wallet.id },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
    ])

    return {
      success: true,
      data: transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }
  })

  // Withdraw to MoMo
  app.post('/wallet/withdraw', async (req, reply) => {
    if (!req.user) throw new AuthError()
    const { amount, mobileMoneyNumber, mobileMoneyNetwork } = req.body as {
      amount: number; mobileMoneyNumber: string; mobileMoneyNetwork: string
    }

    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } })
    if (!wallet) throw new NotFoundError('Wallet')
    if (Number(wallet.balance) < amount) throw new BusinessError('Insufficient wallet balance.')
    if (amount < 1) throw new BusinessError('Minimum withdrawal is GHS 1.00.')

    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId: req.user!.id },
        data: {
          balance:        { decrement: amount },
          totalWithdrawn: { increment: amount },
        },
      })

      await tx.walletTransaction.create({
        data: {
          walletId:    wallet.id,
          type:        'withdrawal',
          amount,
          balanceAfter: Number(wallet.balance) - amount,
          description: `Withdrawal to ${mobileMoneyNetwork} ${mobileMoneyNumber}`,
        },
      })
    })

    await sendSMS({
      to:      req.user.phone,
      message: `AgroConnect: GHS ${amount.toFixed(2)} withdrawal initiated to ${mobileMoneyNumber}. Processing 1–3 minutes.`,
    })

    return reply.send({ success: true, message: 'Withdrawal initiated.' })
  })
}
