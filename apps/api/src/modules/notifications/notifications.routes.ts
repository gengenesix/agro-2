import type { FastifyInstance } from 'fastify'
import { prisma } from '../../config/database.js'
import { AuthError } from '../../lib/errors.js'

export default async function notificationsRoutes(app: FastifyInstance) {
  app.get('/', async (req) => {
    if (!req.user) throw new AuthError()
    const page  = Number((req.query as Record<string, string>)['page'] ?? '1')
    const limit = 20
    const skip  = (page - 1) * limit

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where:   { userId: req.user.id },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where: { userId: req.user.id } }),
      prisma.notification.count({ where: { userId: req.user.id, isRead: false } }),
    ])

    return { success: true, data: notifications, unreadCount, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
  })

  app.patch('/:id/read', async (req) => {
    if (!req.user) throw new AuthError()
    const { id } = req.params as { id: string }
    await prisma.notification.updateMany({
      where: { id, userId: req.user.id },
      data:  { isRead: true },
    })
    return { success: true }
  })

  app.post('/read-all', async (req) => {
    if (!req.user) throw new AuthError()
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data:  { isRead: true },
    })
    return { success: true }
  })
}
