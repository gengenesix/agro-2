import { Worker } from 'bullmq'
import { redis }   from '../config/redis.js'
import { prisma }  from '../config/database.js'
import { verifyTransaction } from '../lib/paystack.js'
import { logger }  from '../config/logger.js'

export function startPaymentWorker() {
  const worker = new Worker('payment-verify', async (job) => {
    const { paymentId, reference } = job.data as { paymentId: string; reference: string }

    const result = await verifyTransaction(reference)

    const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
    if (!payment || payment.status !== 'pending') return

    if (result.status === 'success') {
      await prisma.$transaction(async (tx: any) => {
        await tx.payment.update({
          where: { id: paymentId },
          data:  { status: 'completed', paidAt: new Date() },
        })

        if (payment.orderId) {
          await tx.order.update({
            where: { id: payment.orderId },
            data:  { trackingStatus: 'confirmed', paymentStatus: 'paid' },
          })
        }

        if (payment.userId) {
          await tx.wallet.update({
            where: { userId: payment.userId },
            data:  { pendingBalance: { increment: payment.amount } },
          })
        }
      })

      logger.info({ paymentId, reference }, 'Payment verified and order confirmed')
    } else if (result.status === 'failed') {
      await prisma.payment.update({
        where: { id: paymentId },
        data:  { status: 'failed' },
      })
      logger.warn({ paymentId, reference }, 'Payment failed on Paystack')
    }
  }, { connection: redis, concurrency: 20 })

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Payment verification job failed')
  })

  logger.info('Payment verification worker started')
  return worker
}
