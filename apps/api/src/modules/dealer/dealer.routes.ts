import type { FastifyInstance } from 'fastify'
import { prisma }   from '../../config/database.js'
import { AuthError, ForbiddenError } from '../../lib/errors.js'

export default async function dealerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', async (req) => {
    if (!req.user) throw new AuthError()
    if (!['dealer', 'admin'].includes(req.user.role)) throw new ForbiddenError('Dealer access required.')
  })

  app.get('/stats', async (req) => {
    const dealerId = req.user!.id

    const [totalListings, activeListings, orders, thisMonth] = await Promise.all([
      prisma.listing.count({ where: { sellerId: dealerId } }),
      prisma.listing.count({ where: { sellerId: dealerId, status: 'active' } }),
      prisma.order.findMany({
        where:  { sellerId: dealerId },
        select: { totalAmount: true, status: true, createdAt: true },
      }),
      prisma.order.count({
        where: {
          sellerId:  dealerId,
          status:    { in: ['pending', 'confirmed', 'dispatched'] },
          createdAt: { gte: new Date(new Date().setDate(1)) },
        },
      }),
    ])

    const pendingOrders  = orders.filter(o => ['pending', 'confirmed', 'dispatched'].includes(o.status)).length
    const totalRevenue   = orders
      .filter(o => ['completed', 'delivered'].includes(o.status))
      .reduce((s, o) => s + Number(o.totalAmount), 0)

    return {
      success: true,
      data: { totalListings, activeListings, pendingOrders, totalRevenue, thisMonthOrders: thisMonth },
    }
  })

  app.get('/analytics', async (req) => {
    const dealerId = req.user!.id

    const allOrders = await prisma.order.findMany({
      where:   { sellerId: dealerId },
      select:  { totalAmount: true, trackingStatus: true, createdAt: true, listingId: true },
      orderBy: { createdAt: 'asc' },
    })

    const completed  = allOrders.filter(o => ['completed', 'delivered'].includes(o.trackingStatus))
    const totalRevenue   = completed.reduce((s, o) => s + Number(o.totalAmount), 0)
    const avgOrderValue  = completed.length ? totalRevenue / completed.length : 0
    const completionRate = allOrders.length ? completed.length / allOrders.length : 0

    // Monthly revenue (last 7 months)
    const monthlyMap = new Map<string, { revenue: number; orders: number }>()
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const d   = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = d.toLocaleString('en-GB', { month: 'short' })
      monthlyMap.set(key, { revenue: 0, orders: 0 })
    }
    for (const o of completed) {
      const key = new Date(o.createdAt).toLocaleString('en-GB', { month: 'short' })
      if (monthlyMap.has(key)) {
        monthlyMap.get(key)!.revenue += Number(o.totalAmount)
        monthlyMap.get(key)!.orders  += 1
      }
    }
    const monthlyRevenue = Array.from(monthlyMap.entries()).map(([month, v]) => ({ month, ...v }))

    // Top products
    const listingRevMap = new Map<string, { title: string; revenue: number; orders: number }>()
    const listings = await prisma.listing.findMany({
      where: { sellerId: dealerId },
      select: { id: true, title: true },
    })
    for (const l of listings) listingRevMap.set(l.id, { title: l.title, revenue: 0, orders: 0 })
    for (const o of completed) {
      if (o.listingId && listingRevMap.has(o.listingId)) {
        listingRevMap.get(o.listingId)!.revenue += Number(o.totalAmount)
        listingRevMap.get(o.listingId)!.orders  += 1
      }
    }
    const topProducts = Array.from(listingRevMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // Status breakdown
    const statusMap = new Map<string, number>()
    for (const o of allOrders) {
      statusMap.set(o.trackingStatus, (statusMap.get(o.trackingStatus) ?? 0) + 1)
    }
    const statusBreakdown = Array.from(statusMap.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count)

    return {
      success: true,
      data: {
        totalRevenue, totalOrders: allOrders.length,
        avgOrderValue, completionRate,
        monthlyRevenue, topProducts, statusBreakdown,
      },
    }
  })
}
