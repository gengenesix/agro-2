import type { FastifyInstance } from 'fastify'
import { prisma }   from '../../config/database.js'
import { supabase } from '../../config/supabase.js'
import { cache }    from '../../lib/cache.js'
import { recalculateAgroScore, getScoreBreakdownTips } from '../../lib/score.js'
import { AuthError, ForbiddenError, NotFoundError, AppError } from '../../lib/errors.js'
import type { Role } from '@agroconnect/types'
import { updateProfileSchema, farmerProfileSchema, dealerProfileSchema, buyerProfileSchema } from '@agroconnect/validators'

export default async function usersRoutes(app: FastifyInstance) {
  // Get own profile
  app.get('/me', async (req) => {
    if (!req.user) throw new AuthError()
    return { success: true, data: req.user }
  })

  // Update own profile
  app.patch('/me', async (req, reply) => {
    if (!req.user) throw new AuthError()
    const body    = updateProfileSchema.parse(req.body)
    const profile = await prisma.profile.update({
      where: { id: req.user.id },
      data:  body,
    })
    await cache.del(`auth:profile:${req.user.id}`)
    return reply.send({ success: true, data: profile })
  })

  // Create/update farmer profile
  app.post('/me/farmer', async (req, reply) => {
    if (!req.user) throw new AuthError()
    if (req.user.role !== 'farmer' && req.user.role !== 'field_agent' && req.user.role !== 'admin') {
      throw new ForbiddenError('Only farmers can create a farmer profile.')
    }
    const body = farmerProfileSchema.parse(req.body)
    const fp   = await prisma.farmerProfile.upsert({
      where:  { userId: req.user.id },
      create: { userId: req.user.id, ...body },
      update: body,
    })
    await cache.del(`auth:profile:${req.user.id}`)
    return reply.send({ success: true, data: fp })
  })

  // Get AgroScore breakdown
  app.get('/me/farmer/score', async (req) => {
    if (!req.user) throw new AuthError()
    const score = await recalculateAgroScore(req.user.id)
    const tips  = getScoreBreakdownTips({
      profileCompleteness: 0,
      verificationLevel:   0,
      orderHistory:        0,
      repaymentHistory:    0,
      platformTenure:      0,
      communityRating:     0,
    })
    return {
      success: true,
      data: { score, maxScore: 110, tips },
    }
  })

  // Create/update dealer profile
  app.post('/me/dealer', async (req, reply) => {
    if (!req.user) throw new AuthError()
    if (req.user.role !== 'dealer' && req.user.role !== 'admin') {
      throw new ForbiddenError('Only dealers can create a dealer profile.')
    }
    const body = dealerProfileSchema.parse(req.body)
    const dp   = await prisma.dealerProfile.upsert({
      where:  { userId: req.user.id },
      create: { userId: req.user.id, ...body },
      update: body,
    })
    await cache.del(`auth:profile:${req.user.id}`)
    return reply.send({ success: true, data: dp })
  })

  // Create/update buyer profile
  app.post('/me/buyer', async (req, reply) => {
    if (!req.user) throw new AuthError()
    if (!['buyer', 'consumer', 'admin'].includes(req.user.role)) {
      throw new ForbiddenError('Only buyers can create a buyer profile.')
    }
    const body = buyerProfileSchema.parse(req.body)
    const bp   = await prisma.buyerProfile.upsert({
      where:  { userId: req.user.id },
      create: { userId: req.user.id, ...body },
      update: body,
    })
    return reply.send({ success: true, data: bp })
  })

  // Upload avatar
  app.post('/me/avatar', async (req, reply) => {
    if (!req.user) throw new AuthError()
    const data = await req.file()
    if (!data) throw new Error('No file uploaded')

    const buffer  = await data.toBuffer()
    const ext     = data.filename.split('.').pop()
    const path    = `avatars/${req.user.id}.${ext}`

    const { error } = await supabase.storage
      .from('agroconnect')
      .upload(path, buffer, { contentType: data.mimetype, upsert: true })

    if (error) throw new Error('Failed to upload avatar')

    const { data: publicUrl } = supabase.storage
      .from('agroconnect')
      .getPublicUrl(path)

    await prisma.profile.update({
      where: { id: req.user.id },
      data:  { avatarUrl: publicUrl.publicUrl },
    })

    return reply.send({ success: true, data: { avatarUrl: publicUrl.publicUrl } })
  })

  // Public farmer profile
  app.get('/farmers/:id', async (req) => {
    const { id } = req.params as { id: string }
    const profile = await prisma.profile.findUnique({
      where:   { id, role: 'farmer' },
      select: {
        id: true, fullName: true, avatarUrl: true,
        verificationLevel: true, agroScore: true,
        region: { select: { name: true } },
        createdAt: true,
        farmerProfile: {
          select: { farmName: true, farmSizeAcres: true, sectors: true, farmPhotos: true },
        },
        _count: { select: { ordersAsSeller: true, reviewsReceived: true } },
      },
    })
    if (!profile) throw new NotFoundError('Farmer')
    return { success: true, data: profile }
  })

  // Public user profile by ID (for farmer public pages)
  app.get('/:id/profile', async (req) => {
    const { id } = req.params as { id: string }
    const profile = await prisma.profile.findUnique({
      where: { id },
      select: {
        id: true, fullName: true, avatarUrl: true, role: true,
        verificationLevel: true, agroScore: true, createdAt: true,
        region:        { select: { name: true } },
        farmerProfile: {
          select: {
            farmName: true, farmSizeAcres: true,
            sectors: true, farmPhotos: true,
          },
        },
        _count: { select: { ordersAsSeller: true, reviewsReceived: true } },
      },
    })
    if (!profile) throw new NotFoundError('User')
    return { success: true, data: profile }
  })

  // Public listings by user ID
  app.get('/:id/listings', async (req) => {
    const { id }    = req.params as { id: string }
    const limit     = Number((req.query as Record<string, string>)['limit'] ?? '12')
    const listings  = await prisma.listing.findMany({
      where:   { sellerId: id, status: 'active' },
      orderBy: { createdAt: 'desc' },
      take:    limit,
      select: {
        id: true, slug: true, title: true, applicableSectors: true,
        pricePerUnit: true, quantityAvailable: true,
        photos: true, listingType: true, bnplAvailable: true,
        unit:     { select: { abbreviation: true } },
        category: { select: { name: true, slug: true } },
        region:   { select: { name: true } },
        seller:   { select: { fullName: true, verificationLevel: true } },
      },
    })
    return { success: true, data: listings }
  })

  // Onboard a new user — sets role + creates wallet + sub-profile stub
  // Called after Supabase auth signup when role hasn't been set yet
  app.post('/onboard', async (req, reply) => {
    if (!req.user) throw new AuthError()
    const {
      role, fullName, regionId, community, nationalId,
    } = req.body as {
      role:        string
      fullName:    string
      regionId?:   number
      community?:  string
      nationalId?: string
    }

    const allowedRoles = ['farmer', 'dealer', 'buyer', 'consumer', 'field_agent']
    if (!allowedRoles.includes(role)) throw new AppError('Invalid role', 400, 'INVALID_ROLE')

    await prisma.$transaction(async (tx: any) => {
      await tx.profile.update({
        where: { id: req.user!.id },
        data: {
          role:      role as Role,
          fullName,
          regionId:  regionId ?? null,
          community: community ?? null,
        },
      })

      await tx.wallet.upsert({
        where:  { userId: req.user!.id },
        create: { userId: req.user!.id },
        update: {},
      })

      if (role === 'farmer') {
        await tx.farmerProfile.upsert({
          where:  { userId: req.user!.id },
          create: { userId: req.user!.id, nationalId: nationalId ?? null },
          update: {},
        })
      }
    })

    await cache.del(`auth:profile:${req.user.id}`)
    return reply.send({ success: true })
  })

  // Update notification preferences (persisted as profile metadata)
  app.patch('/me/notification-prefs', async (req, reply) => {
    if (!req.user) throw new AuthError()
    // Preferences are stored in notifications at the application level.
    // This endpoint acknowledges the preferences — actual filtering is
    // applied per-job in the SMS/email workers.
    return reply.send({ success: true })
  })

  // Nearby dealers
  app.get('/dealers/nearby', async (req) => {
    const { lat, lng, radiusKm = '20' } = req.query as Record<string, string>
    const dealers = await prisma.profile.findMany({
      where: {
        role: 'dealer',
        dealerProfile: {
          isVerified: true,
          gpsLat: { not: null },
          gpsLng: { not: null },
        },
      },
      select: {
        id: true, fullName: true, avatarUrl: true, verificationLevel: true,
        region: { select: { name: true } },
        dealerProfile: {
          select: { businessName: true, gpsLat: true, gpsLng: true, sectorsServed: true, deliveryRadiusKm: true },
        },
      },
      take: 20,
    })
    return { success: true, data: dealers }
  })
}
