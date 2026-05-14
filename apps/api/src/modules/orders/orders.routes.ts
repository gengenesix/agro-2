import type { FastifyInstance } from 'fastify'
import { prisma }  from '../../config/database.js'
import { env }     from '../../config/env.js'
import { sendSMS } from '../../lib/arkesel.js'
import { AuthError, ForbiddenError, NotFoundError, BusinessError } from '../../lib/errors.js'
import { createOrderSchema } from '@agroconnect/validators'
import { COMMISSION_RATES }  from '@agroconnect/types'

function generateOrderNumber(): string {
  const y   = new Date().getFullYear()
  const seq = Math.floor(Math.random() * 99_999).toString().padStart(5, '0')
  return `AC-${y}-${seq}`
}

const PROGRESS_LABELS: Record<string, string> = {
  planted:          'Crop has been planted',
  growing:          'Crop is growing well',
  ready_to_harvest: 'Crop is ready to harvest',
  harvested:        'Crop has been harvested',
  dispatched:       'Produce dispatched to you',
  delivered:        'Produce delivered',
}

export default async function ordersRoutes(app: FastifyInstance) {
  // Create order
  app.post('/', async (req, reply) => {
    if (!req.user) throw new AuthError()

    const body    = createOrderSchema.parse(req.body)
    const listing = await prisma.listing.findUnique({
      where:   { id: body.listingId, status: 'active' },
      include: { seller: { select: { id: true, phone: true, fullName: true } } },
    })

    if (!listing) throw new NotFoundError('Listing')
    if (Number(listing.quantityAvailable) < body.quantity) {
      throw new BusinessError('Requested quantity exceeds available stock.')
    }

    const subtotal    = Number(listing.pricePerUnit) * body.quantity
    const commission  = subtotal * (
      listing.listingType === 'harvest_pledge'
        ? COMMISSION_RATES.harvest_pledge
        : listing.category ? COMMISSION_RATES.direct_purchase : COMMISSION_RATES.input_purchase
    )
    const totalAmount  = subtotal + commission
    const depositAmount = listing.listingType === 'harvest_pledge'
      ? totalAmount * (listing.depositPercentage / 100)
      : null

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber:        generateOrderNumber(),
          buyerId:            req.user!.id,
          sellerId:           listing.sellerId,
          listingId:          listing.id,
          orderType:          listing.listingType === 'harvest_pledge' ? 'harvest_pledge' : 'direct_purchase',
          quantity:           body.quantity,
          unitPrice:          listing.pricePerUnit,
          subtotal,
          platformCommission: commission,
          totalAmount,
          depositAmount,
          balanceAmount:      depositAmount ? totalAmount - depositAmount : null,
          deliveryOption:     body.deliveryOption,
          deliveryAddress:    body.deliveryAddress,
          buyerNotes:         body.buyerNotes,
          pledgeProgress:     listing.listingType === 'harvest_pledge' ? 'planted' : null,
          trackingStatus:     'pending',
        },
      })

      await tx.listing.update({
        where: { id: listing.id },
        data:  { quantityAvailable: { decrement: body.quantity } },
      })

      return created
    })

    return reply.status(201).send({ success: true, data: order })
  })

  // List own orders (/orders or /orders/mine)
  async function listOwnOrders(req: any) {
    if (!req.user) throw new AuthError()
    const q     = req.query as Record<string, string>
    const page  = Number(q['page'] ?? '1')
    const limit = Number(q['limit'] ?? '10')
    const skip  = (page - 1) * limit

    const where: Record<string, unknown> = {
      OR: [{ buyerId: req.user.id }, { sellerId: req.user.id }],
    }
    if (q['orderType'])       where['orderType']      = q['orderType']
    if (q['status'])          where['trackingStatus'] = q['status']

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: { select: { title: true, slug: true, photos: true, sector: true, unit: true } },
          buyer:   { select: { fullName: true, avatarUrl: true } },
          seller:  { select: { fullName: true, avatarUrl: true } },
        },
      }),
      prisma.order.count({ where }),
    ])

    return {
      success:    true,
      data:       { orders, total },
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }
  }

  app.get('/',     async (req) => listOwnOrders(req))
  app.get('/mine', async (req) => listOwnOrders(req))

  // Order detail
  app.get('/:id', async (req) => {
    if (!req.user) throw new AuthError()
    const { id }  = req.params as { id: string }
    const order   = await prisma.order.findUnique({
      where:   { id },
      include: {
        listing: true, payments: true,
        buyer:   { select: { id: true, fullName: true, avatarUrl: true, phone: true } },
        seller:  { select: { id: true, fullName: true, avatarUrl: true, phone: true } },
      },
    })
    if (!order) throw new NotFoundError('Order')
    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenError()
    }
    return { success: true, data: order }
  })

  // Confirm delivery (buyer)
  app.post('/:id/confirm-delivery', async (req) => {
    if (!req.user) throw new AuthError()
    const { id } = req.params as { id: string }

    const order = await prisma.order.findUnique({
      where:   { id },
      include: { seller: { select: { phone: true } } },
    })
    if (!order) throw new NotFoundError('Order')
    if (order.buyerId !== req.user.id) throw new ForbiddenError()
    if (order.trackingStatus !== 'in_transit' && order.trackingStatus !== 'dispatched') {
      throw new BusinessError('Order is not in a deliverable state.')
    }

    const sellerEarnings = Number(order.totalAmount) - Number(order.platformCommission)

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data:  { trackingStatus: 'delivered', deliveredAt: new Date() },
      })

      await tx.wallet.update({
        where: { userId: order.sellerId },
        data: {
          balance:        { increment: sellerEarnings },
          pendingBalance: { decrement: sellerEarnings },
          totalEarned:    { increment: sellerEarnings },
        },
      })
    })

    await sendSMS({
      to:      order.seller.phone,
      message: `AgroConnect: Order ${order.orderNumber} delivered. GHS ${sellerEarnings.toFixed(2)} credited to your wallet.`,
    })

    return { success: true, message: 'Delivery confirmed. Funds released to seller.' }
  })

  // Update pledge progress (seller)
  app.post('/:id/pledge-update', async (req) => {
    if (!req.user) throw new AuthError()
    const { id }       = req.params as { id: string }
    const { progress } = req.body as { progress: string }

    const order = await prisma.order.findFirst({
      where:   { id, sellerId: req.user.id, orderType: 'harvest_pledge' },
      include: { buyer: { select: { phone: true } } },
    })
    if (!order) throw new NotFoundError('Order')

    const updated = await prisma.order.update({
      where: { id },
      data:  { pledgeProgress: progress as never },
    })

    await sendSMS({
      to:      order.buyer.phone,
      message: `AgroConnect: Pledge order ${order.orderNumber} update: ${PROGRESS_LABELS[progress] ?? progress}. Track at agroconnect.com.gh`,
    })

    return { success: true, data: updated }
  })

  // Cancel order
  app.post('/:id/cancel', async (req) => {
    if (!req.user) throw new AuthError()
    const { id }     = req.params as { id: string }
    const { reason } = req.body as { reason: string }

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) throw new NotFoundError('Order')
    if (order.buyerId !== req.user.id && order.sellerId !== req.user.id) throw new ForbiddenError()
    if (!['pending', 'confirmed'].includes(order.trackingStatus)) {
      throw new BusinessError('Cannot cancel an order that is already in transit or delivered.')
    }

    await prisma.order.update({
      where: { id },
      data:  { trackingStatus: 'cancelled', cancelledAt: new Date(), cancellationReason: reason },
    })

    return { success: true, message: 'Order cancelled.' }
  })
}
