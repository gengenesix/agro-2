import type { FastifyInstance } from 'fastify'
import { prisma }  from '../../config/database.js'
import { cache }   from '../../lib/cache.js'
import { sendSMS, sendBulkSMS } from '../../lib/arkesel.js'
import { broadcastSchema }  from '@agroconnect/validators'
import { AuthError, ForbiddenError, NotFoundError } from '../../lib/errors.js'

function requireAdmin(req: { user: { role: string } | null }) {
  if (!req.user) throw new AuthError()
  if (req.user.role !== 'admin') throw new ForbiddenError('Admin access required.')
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}

export default async function adminRoutes(app: FastifyInstance) {
  // Platform stats
  app.get('/stats', async (req) => {
    requireAdmin(req)
    const [farmers, dealers, buyers, listings, orders, pledges] = await Promise.all([
      prisma.profile.count({ where: { role: 'farmer' } }),
      prisma.profile.count({ where: { role: 'dealer' } }),
      prisma.profile.count({ where: { role: 'buyer' } }),
      prisma.listing.count({ where: { status: 'active' } }),
      prisma.order.count(),
      prisma.listing.count({ where: { listingType: 'harvest_pledge', pledgeStatus: { in: ['open', 'partially_pledged'] } } }),
    ])

    const gmvResult = await prisma.order.aggregate({ _sum: { totalAmount: true } })

    return {
      success: true,
      data: {
        totalFarmers:   farmers,
        totalDealers:   dealers,
        totalBuyers:    buyers,
        activeListings: listings,
        totalOrders:    orders,
        activePledges:  pledges,
        totalGMV:       Number(gmvResult._sum.totalAmount ?? 0),
      },
    }
  })

  // List users (with search + role filter)
  app.get('/users', async (req) => {
    requireAdmin(req)
    const q      = req.query as Record<string, string>
    const page   = Number(q['page'] ?? '1')
    const limit  = 20
    const skip   = (page - 1) * limit
    const { role, verified, search } = q
    const where: Record<string, unknown> = {}
    if (role)     where['role']              = role
    if (verified) where['verificationLevel'] = verified
    if (search)   where['OR'] = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { phone:    { contains: search } },
    ]
    const [users, total] = await Promise.all([
      prisma.profile.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, phone: true, fullName: true, role: true, avatarUrl: true,
          verificationLevel: true, agroScore: true, isActive: true, isBanned: true,
          createdAt: true,
        },
      }),
      prisma.profile.count({ where }),
    ])
    return { success: true, data: { users, total } }
  })

  // Update verification (used by admin users page PUT)
  app.put('/users/:id/verification', async (req) => {
    requireAdmin(req)
    const { id }               = req.params as { id: string }
    const { verificationLevel } = req.body as { verificationLevel: string }
    await prisma.profile.update({ where: { id }, data: { verificationLevel: verificationLevel as never } })
    await cache.del(`auth:profile:${id}`)
    return { success: true }
  })

  // Ban/unban user (used by admin users page PUT)
  app.put('/users/:id/ban', async (req) => {
    requireAdmin(req)
    const { id }     = req.params as { id: string }
    const { banned } = req.body as { banned: boolean }
    await prisma.profile.update({ where: { id }, data: { isBanned: banned } })
    await cache.del(`auth:profile:${id}`)
    return { success: true }
  })

  // Legacy PATCH /users/:id/verify
  app.patch('/users/:id/verify', async (req) => {
    requireAdmin(req)
    const { id }   = req.params as { id: string }
    const { level } = req.body as { level: string }
    const profile  = await prisma.profile.update({
      where: { id }, data: { verificationLevel: level as never },
    })
    await cache.del(`auth:profile:${id}`)
    return { success: true, data: profile }
  })

  // Legacy PATCH /users/:id/ban
  app.patch('/users/:id/ban', async (req) => {
    requireAdmin(req)
    const { id }     = req.params as { id: string }
    const { reason } = req.body as { reason: string }
    await prisma.profile.update({ where: { id }, data: { isBanned: true, banReason: reason } })
    await cache.del(`auth:profile:${id}`)
    return { success: true }
  })

  // BNPL applications
  app.get('/bnpl', async (req) => {
    requireAdmin(req)
    const applications = await prisma.bNPLApplication.findMany({
      where:   { status: 'pending' },
      orderBy: { appliedAt: 'asc' },
      include: {
        farmer: { select: { fullName: true, phone: true, agroScore: true, verificationLevel: true } },
        order:  { select: { orderNumber: true, totalAmount: true } },
      },
    })
    return { success: true, data: applications }
  })

  // Approve BNPL
  app.patch('/bnpl/:id/approve', async (req) => {
    requireAdmin(req)
    const { id } = req.params as { id: string }
    const { amountApproved, dueDate } = req.body as { amountApproved: number; dueDate: string }

    const application = await prisma.bNPLApplication.findUnique({
      where:   { id },
      include: { farmer: { select: { phone: true } }, order: { select: { sellerId: true } } },
    })
    if (!application) throw new NotFoundError('BNPL application')

    const totalRepayable = amountApproved * (1 + Number(application.interestRate))

    await prisma.$transaction(async (tx) => {
      await tx.bNPLApplication.update({
        where: { id },
        data:  {
          status: 'approved', amountApproved, dueDate: new Date(dueDate),
          totalRepayable, approvedAt: new Date(),
        },
      })

      await tx.wallet.update({
        where: { userId: application.order.sellerId },
        data:  { balance: { increment: amountApproved } },
      })
    })

    await sendSMS({
      to:      application.farmer.phone,
      message: `AgroConnect: GHS ${amountApproved.toFixed(2)} BNPL approved. Repay by ${dueDate}. Buy inputs now at agroconnect.com.gh`,
    })

    return { success: true }
  })

  // Reject BNPL
  app.patch('/bnpl/:id/reject', async (req) => {
    requireAdmin(req)
    const { id }    = req.params as { id: string }
    const { reason } = req.body as { reason: string }

    const application = await prisma.bNPLApplication.findUnique({
      where: { id }, include: { farmer: { select: { phone: true } } },
    })
    if (!application) throw new NotFoundError('BNPL application')

    await prisma.bNPLApplication.update({
      where: { id },
      data:  { status: 'rejected', rejectionReason: reason },
    })

    await sendSMS({
      to:      application.farmer.phone,
      message: `AgroConnect: Your BNPL application was not approved. Reason: ${reason}. Improve your AgroScore and reapply.`,
    })

    return { success: true }
  })

  // Broadcast message
  app.post('/broadcast', async (req) => {
    requireAdmin(req)
    const { message, channels, filter } = broadcastSchema.parse(req.body)

    const users = await prisma.profile.findMany({
      where: {
        isActive: true,
        isBanned: false,
        ...(filter?.roles?.length     && { role:     { in: filter.roles as never[] } }),
        ...(filter?.regionIds?.length && { regionId: { in: filter.regionIds } }),
      },
      select: { id: true, phone: true },
    })

    if (channels.includes('sms')) {
      const phones = users.map(u => u.phone)
      const chunks = chunkArray(phones, 100)
      for (const chunk of chunks) {
        await sendBulkSMS({ recipients: chunk, message })
      }
    }

    if (channels.includes('push')) {
      await prisma.notification.createMany({
        data: users.map(u => ({
          userId:  u.id,
          type:    'system',
          title:   'AgroConnect',
          body:    message,
          channel: 'in_app',
        })),
      })
    }

    return { success: true, data: { recipientCount: users.length } }
  })

  // List all orders (with filters)
  app.get('/orders', async (req) => {
    requireAdmin(req)
    const q      = req.query as Record<string, string>
    const page   = Number(q['page'] ?? '1')
    const limit  = Number(q['limit'] ?? '25')
    const skip   = (page - 1) * limit
    const status = q['status']
    const search = q['search']

    const where: Record<string, unknown> = {}
    if (status) where['trackingStatus'] = status
    if (search) {
      where['OR'] = [
        { orderNumber:  { contains: search, mode: 'insensitive' } },
        { buyer:  { fullName: { contains: search, mode: 'insensitive' } } },
        { seller: { fullName: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: { select: { title: true, sector: true, unit: true } },
          buyer:   { select: { fullName: true, phone: true } },
          seller:  { select: { fullName: true, phone: true } },
        },
      }),
      prisma.order.count({ where }),
    ])

    return { success: true, data: { orders, total }, pagination: { page, limit, total } }
  })

  // Update order status
  app.put('/orders/:id/status', async (req) => {
    requireAdmin(req)
    const { id }     = req.params as { id: string }
    const { status } = req.body as { status: string }

    const order = await prisma.order.update({
      where: { id },
      data:  { trackingStatus: status as never },
    })
    return { success: true, data: order }
  })

  // Resolve dispute
  app.post('/orders/:id/resolve-dispute', async (req) => {
    requireAdmin(req)
    const { id }         = req.params as { id: string }
    const { resolution, notes } = req.body as { resolution: string; notes?: string }

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) throw new NotFoundError('Order')

    const totalAmount = Number(order.totalAmount)
    const deposit     = Number(order.depositAmount ?? order.totalAmount)

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data:  { trackingStatus: 'cancelled', cancellationReason: `Admin: ${resolution}. ${notes ?? ''}` },
      })

      if (resolution === 'full_refund') {
        await tx.wallet.update({
          where: { userId: order.buyerId },
          data:  { balance: { increment: deposit } },
        })
      } else if (resolution === 'partial_refund') {
        const half = deposit / 2
        await tx.wallet.update({ where: { userId: order.buyerId  }, data: { balance: { increment: half } } })
        await tx.wallet.update({ where: { userId: order.sellerId }, data: { balance: { increment: half } } })
      } else if (resolution === 'release_to_seller') {
        const earnings = totalAmount - Number(order.platformCommission)
        await tx.wallet.update({
          where: { userId: order.sellerId },
          data:  { balance: { increment: earnings } },
        })
      }
    })

    return { success: true, message: `Dispute resolved: ${resolution}` }
  })

  // Pest report verification
  app.get('/pest-reports', async (req) => {
    requireAdmin(req)
    const reports = await prisma.pestReport.findMany({
      where:   { isVerified: false },
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: { select: { fullName: true, phone: true } },
        region:   { select: { name: true } },
      },
    })
    return { success: true, data: reports }
  })

  app.patch('/pest-reports/:id/verify', async (req) => {
    requireAdmin(req)
    const { id }                 = req.params as { id: string }
    const { verified, adminNote } = req.body as { verified: boolean; adminNote?: string }
    await prisma.pestReport.update({ where: { id }, data: { isVerified: verified, adminNote } })
    return { success: true }
  })
}
