import type { FastifyInstance } from 'fastify'
import { prisma }   from '../../config/database.js'
import { AuthError, ForbiddenError } from '../../lib/errors.js'

export default async function pledgesRoutes(app: FastifyInstance) {
  // GET /pledges/mine — farmer's pledge orders (as seller)
  app.get('/mine', async (req) => {
    if (!req.user) throw new AuthError()

    const page  = Number((req.query as Record<string, string>)['page'] ?? '1')
    const limit = 10
    const skip  = (page - 1) * limit

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          sellerId:  req.user.id,
          orderType: 'harvest_pledge',
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: {
            select: {
              title: true, slug: true, photos: true, unit: true,
              expectedHarvestDate: true, depositPercentage: true,
            },
          },
          buyer: { select: { fullName: true, avatarUrl: true, phone: true } },
        },
      }),
      prisma.order.count({
        where: { sellerId: req.user.id, orderType: 'harvest_pledge' },
      }),
    ])

    return {
      success: true,
      data:    orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }
  })

  // GET /pledges/buying — buyer's active harvest pledges
  app.get('/buying', async (req) => {
    if (!req.user) throw new AuthError()

    const page  = Number((req.query as Record<string, string>)['page'] ?? '1')
    const limit = 10
    const skip  = (page - 1) * limit

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          buyerId:   req.user.id,
          orderType: 'harvest_pledge',
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: {
            select: {
              title: true, slug: true, photos: true, unit: true,
              expectedHarvestDate: true,
            },
          },
          seller: { select: { fullName: true, avatarUrl: true } },
        },
      }),
      prisma.order.count({
        where: { buyerId: req.user.id, orderType: 'harvest_pledge' },
      }),
    ])

    return {
      success: true,
      data:    orders,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }
  })

  // GET /pledges/:id — single pledge detail
  app.get('/:id', async (req) => {
    if (!req.user) throw new AuthError()
    const { id } = req.params as { id: string }

    const order = await prisma.order.findFirst({
      where: { id, orderType: 'harvest_pledge' },
      include: {
        listing:  true,
        buyer:    { select: { id: true, fullName: true, avatarUrl: true, phone: true } },
        seller:   { select: { id: true, fullName: true, avatarUrl: true, phone: true } },
        payments: true,
      },
    })

    if (!order) throw new Error('Pledge not found')
    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenError()
    }

    return { success: true, data: order }
  })
}
