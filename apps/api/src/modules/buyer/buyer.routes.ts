import type { FastifyInstance } from 'fastify'
import { prisma }   from '../../config/database.js'
import { AuthError, ForbiddenError } from '../../lib/errors.js'

export default async function buyerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (req) => {
    if (!req.user) throw new AuthError()
    if (!['buyer', 'consumer', 'admin'].includes(req.user.role)) {
      throw new ForbiddenError('Buyer access required.')
    }
  })

  app.get('/stats', async (req) => {
    const buyerId = req.user!.id

    const [totalOrders, activePledges, spentResult, savedSearches] = await Promise.all([
      prisma.order.count({ where: { buyerId } }),
      prisma.order.count({
        where: {
          buyerId,
          listing: { listingType: 'harvest_pledge' },
          status:  { in: ['confirmed', 'dispatched'] },
        },
      }),
      prisma.order.aggregate({
        _sum:  { totalAmount: true },
        where: { buyerId, status: { in: ['completed', 'delivered'] } },
      }),
      prisma.priceAlert.count({ where: { userId: buyerId } }).catch(() => 0),
    ])

    const activeOrders = await prisma.order.count({
      where: { buyerId, status: { in: ['pending', 'confirmed', 'dispatched'] } },
    })

    return {
      success: true,
      data: {
        totalOrders,
        activePledges,
        activeOrders,
        totalSpent:   Number(spentResult._sum.totalAmount ?? 0),
        savedSearches,
      },
    }
  })
}
