import type { FastifyInstance } from 'fastify'
import { prisma }  from '../../config/database.js'
import { createReviewSchema } from '@agroconnect/validators'
import { AuthError, BusinessError, NotFoundError } from '../../lib/errors.js'

export default async function reviewsRoutes(app: FastifyInstance) {
  app.post('/', async (req, reply) => {
    if (!req.user) throw new AuthError()
    const { orderId, rating, comment, tags } = createReviewSchema.parse(req.body)

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) throw new NotFoundError('Order')
    if (order.buyerId !== req.user.id) throw new BusinessError('Only the buyer can review this order.')
    if (order.trackingStatus !== 'delivered') throw new BusinessError('Can only review delivered orders.')

    const review = await prisma.review.create({
      data: {
        reviewerId: req.user.id,
        revieweeId: order.sellerId,
        orderId,
        rating,
        comment,
        tags: tags ?? [],
      },
    })

    return reply.status(201).send({ success: true, data: review })
  })

  app.get('/user/:id', async (req) => {
    const { id }  = req.params as { id: string }
    const page    = Number((req.query as Record<string, string>)['page'] ?? '1')
    const limit   = 10
    const skip    = (page - 1) * limit

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where:   { revieweeId: id, isPublic: true },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { reviewer: { select: { fullName: true, avatarUrl: true } } },
      }),
      prisma.review.count({ where: { revieweeId: id, isPublic: true } }),
    ])

    const avgRating = reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0

    return { success: true, data: reviews, avgRating, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
  })
}
