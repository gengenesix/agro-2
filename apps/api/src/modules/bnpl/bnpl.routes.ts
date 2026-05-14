import type { FastifyInstance } from 'fastify'
import { prisma }  from '../../config/database.js'
import { cache }   from '../../lib/cache.js'
import { sendSMS } from '../../lib/arkesel.js'
import { recalculateAgroScore, getBNPLTier } from '../../lib/score.js'
import { bnplApplySchema } from '@agroconnect/validators'
import { AuthError, ForbiddenError, BusinessError, NotFoundError } from '../../lib/errors.js'

export default async function bnplRoutes(app: FastifyInstance) {
  // Check eligibility
  app.get('/eligibility', async (req) => {
    if (!req.user) throw new AuthError()
    if (req.user.role !== 'farmer') throw new ForbiddenError('BNPL is available to farmers only.')

    const cacheKey = `bnpl:eligibility:${req.user.id}`
    const cached   = await cache.getJSON<unknown>(cacheKey)
    if (cached) return { success: true, data: cached }

    const score = await recalculateAgroScore(req.user.id)
    const tier  = getBNPLTier(score)

    const result = tier
      ? { eligible: true, tier: tier.tier, maxAmount: tier.maxAmount, interestRate: tier.interestRate, score }
      : { eligible: false, score, reason: 'AgroScore below 20. Complete your profile to qualify.' }

    await cache.setJSON(cacheKey, result, 300)
    return { success: true, data: result }
  })

  // Apply for BNPL
  app.post('/apply', async (req, reply) => {
    if (!req.user) throw new AuthError()
    if (req.user.role !== 'farmer') throw new ForbiddenError()

    const { orderId, amountRequested } = bnplApplySchema.parse(req.body)

    // Re-check eligibility server-side
    const score = await recalculateAgroScore(req.user.id)
    const tier  = getBNPLTier(score)

    if (!tier) throw new BusinessError('Your AgroScore does not qualify for BNPL at this time.')
    if (amountRequested > tier.maxAmount) {
      throw new BusinessError(`Request exceeds your GHS ${tier.maxAmount} credit limit.`)
    }

    // Check for active defaults
    const activeDefault = await prisma.bNPLApplication.findFirst({
      where: { farmerId: req.user.id, status: { in: ['disbursed', 'defaulted'] } },
    })
    if (activeDefault) {
      throw new BusinessError('You have an active or defaulted BNPL loan. Resolve it before applying.')
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) throw new NotFoundError('Order')

    const application = await prisma.bNPLApplication.create({
      data: {
        farmerId:              req.user.id,
        orderId,
        amountRequested,
        creditTier:            tier.tier as never,
        interestRate:          tier.interestRate,
        status:                'pending',
        agroScoreAtApplication: score,
      },
    })

    await cache.del(`bnpl:eligibility:${req.user.id}`)

    return reply.status(201).send({
      success: true,
      data:    application,
      message: 'BNPL application submitted. Response within 24 hours.',
    })
  })

  // My BNPL status
  app.get('/status', async (req) => {
    if (!req.user) throw new AuthError()
    const applications = await prisma.bNPLApplication.findMany({
      where:   { farmerId: req.user.id },
      orderBy: { appliedAt: 'desc' },
      include: { repayments: true, order: { select: { orderNumber: true } } },
    })
    return { success: true, data: applications }
  })

  // Manual repayment
  app.post('/repay', async (req) => {
    if (!req.user) throw new AuthError()
    const { applicationId, amount } = req.body as { applicationId: string; amount: number }

    const application = await prisma.bNPLApplication.findFirst({
      where: { id: applicationId, farmerId: req.user.id, status: 'disbursed' },
    })
    if (!application) throw new NotFoundError('BNPL application')

    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } })
    if (!wallet || Number(wallet.balance) < amount) {
      throw new BusinessError('Insufficient wallet balance for repayment.')
    }

    const totalRepaid = await prisma.bNPLRepayment.aggregate({
      where: { applicationId },
      _sum:  { amount: true },
    })

    const repaidSoFar  = Number(totalRepaid._sum.amount ?? 0)
    const outstanding  = Number(application.totalRepayable ?? application.amountRequested) - repaidSoFar
    const actualAmount = Math.min(amount, outstanding)

    await prisma.$transaction(async (tx) => {
      await tx.bNPLRepayment.create({
        data: { applicationId, farmerId: req.user!.id, amount: actualAmount, repaymentMethod: 'wallet' },
      })

      await tx.wallet.update({
        where: { userId: req.user!.id },
        data:  { balance: { decrement: actualAmount } },
      })

      if (actualAmount >= outstanding) {
        await tx.bNPLApplication.update({
          where: { id: applicationId },
          data:  { status: 'repaid', repaidAt: new Date() },
        })
      }
    })

    return { success: true, message: `GHS ${actualAmount.toFixed(2)} repayment recorded.` }
  })
}
