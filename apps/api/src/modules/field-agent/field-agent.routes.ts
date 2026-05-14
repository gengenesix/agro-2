import type { FastifyInstance } from 'fastify'
import { prisma }               from '../../config/database.js'
import { AuthError, AppError }  from '../../lib/errors.js'
import { addSMSJob }            from '../../workers/queues.js'

const EARN_PER_VERIFICATION_GHS = 10

export default async function fieldAgentRoutes(app: FastifyInstance) {

  // GET /field-agent/stats
  app.get('/stats', async (req) => {
    if (!req.user) throw new AuthError()
    if (req.user.role !== 'field_agent') throw new AppError('Forbidden', 403, 'FORBIDDEN')

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const [totalVerified, verifiedThisMonth, pendingInRegion, wallet] = await Promise.all([
      prisma.farmerProfile.count({ where: { fieldAgentId: req.user.id } }),
      prisma.farmerProfile.count({
        where: {
          fieldAgentId:     req.user.id,
          fieldVerifiedAt:  { gte: startOfMonth },
        },
      }),
      prisma.farmerProfile.count({
        where: {
          fieldVerifiedAt: null,
          user: {
            regionId: req.user.regionId ?? undefined,
            role:     'farmer',
            isActive: true,
          },
        },
      }),
      prisma.wallet.findUnique({ where: { userId: req.user.id } }),
    ])

    const earningsThisMonth = verifiedThisMonth * EARN_PER_VERIFICATION_GHS

    return {
      success: true,
      data: {
        totalVerified,
        verifiedThisMonth,
        pendingInRegion,
        earningsThisMonth,
        walletBalance: Number(wallet?.balance ?? 0),
      },
    }
  })

  // GET /field-agent/farmers
  // Farmers to visit — unverified farmers in this agent's region
  app.get('/farmers', async (req) => {
    if (!req.user) throw new AuthError()
    if (req.user.role !== 'field_agent') throw new AppError('Forbidden', 403, 'FORBIDDEN')

    const qs     = req.query as Record<string, string>
    const filter = qs['filter'] ?? 'pending'  // 'pending' | 'verified-by-me' | 'all'
    const page   = Number(qs['page'] ?? '1')
    const limit  = 20
    const skip   = (page - 1) * limit

    const where =
      filter === 'verified-by-me'
        ? { fieldAgentId: req.user.id }
        : filter === 'pending'
          ? {
              fieldVerifiedAt: null,
              user: {
                regionId: req.user.regionId ?? undefined,
                role:     'farmer' as const,
                isActive: true,
              },
            }
          : {
              user: {
                regionId: req.user.regionId ?? undefined,
                role:     'farmer' as const,
              },
            }

    const [farmers, total] = await Promise.all([
      prisma.farmerProfile.findMany({
        where,
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true, fullName: true, phone: true,
              verificationLevel: true, community: true,
              region: { select: { name: true } },
              district: { select: { name: true } },
            },
          },
        },
      }),
      prisma.farmerProfile.count({ where }),
    ])

    return {
      success: true,
      data:    { farmers, total },
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }
  })

  // POST /field-agent/register-farmer
  // Offline farmer registration — agent registers on behalf of a farmer
  app.post('/register-farmer', async (req) => {
    if (!req.user) throw new AuthError()
    if (req.user.role !== 'field_agent') throw new AppError('Forbidden', 403, 'FORBIDDEN')

    const {
      phone, fullName, community, regionId, districtId,
      farmName, farmSizeAcres, sectors, gpsLat, gpsLng,
      mobileMoneyNumber, mobileMoneyNetwork, nationalId,
    } = req.body as {
      phone:               string
      fullName:            string
      community?:          string
      regionId?:           number
      districtId?:         number
      farmName?:           string
      farmSizeAcres?:      number
      sectors?:            string[]
      gpsLat?:             number
      gpsLng?:             number
      mobileMoneyNumber?:  string
      mobileMoneyNetwork?: string
      nationalId?:         string
    }

    const existing = await prisma.profile.findUnique({ where: { phone } })
    if (existing) throw new AppError('A user with this phone number already exists', 409, 'DUPLICATE_PHONE')

    const { v4: uuidv4 } = await import('crypto').then(m => ({ v4: () => m.randomUUID() }))
    const farmerId = uuidv4()

    const profile = await prisma.$transaction(async (tx) => {
      const p = await tx.profile.create({
        data: {
          id:                farmerId,
          phone,
          fullName,
          role:              'farmer',
          community:         community ?? null,
          regionId:          regionId ?? req.user!.regionId ?? null,
          districtId:        districtId ?? null,
          verificationLevel: 'self_declared',
        },
      })

      await tx.farmerProfile.create({
        data: {
          userId:             farmerId,
          farmName:           farmName ?? null,
          farmSizeAcres:      farmSizeAcres ?? null,
          gpsLat:             gpsLat ?? null,
          gpsLng:             gpsLng ?? null,
          sectors:            sectors ?? [],
          mobileMoneyNumber:  mobileMoneyNumber ?? null,
          mobileMoneyNetwork: mobileMoneyNetwork ?? null,
          nationalId:         nationalId ?? null,
        },
      })

      await tx.wallet.create({ data: { userId: farmerId } })

      return p
    })

    await addSMSJob({
      to:      phone,
      message: `Welcome to AgroConnect, ${fullName}! Your account has been registered by a GENE agent. Dial *800*456# or visit agroconnect.com.gh to continue.`,
    })

    return { success: true, data: { farmerId: profile.id, phone: profile.phone } }
  })

  // POST /field-agent/verify-farm/:farmerId
  // GPS field verification — upgrades farmer to field_verified, credits agent wallet
  app.post('/verify-farm/:farmerId', async (req) => {
    if (!req.user) throw new AuthError()
    if (req.user.role !== 'field_agent') throw new AppError('Forbidden', 403, 'FORBIDDEN')

    const { farmerId } = req.params as { farmerId: string }
    const {
      gpsLat, gpsLng, farmPhotos, verificationNotes,
    } = req.body as {
      gpsLat:              number
      gpsLng:              number
      farmPhotos?:         string[]
      verificationNotes?:  string
    }

    const farmerProfile = await prisma.farmerProfile.findUnique({
      where:   { userId: farmerId },
      include: { user: { select: { fullName: true, phone: true, verificationLevel: true } } },
    })

    if (!farmerProfile) throw new AppError('Farmer not found', 404, 'NOT_FOUND')
    if (farmerProfile.user.verificationLevel === 'field_verified' || farmerProfile.user.verificationLevel === 'premium') {
      throw new AppError('Farm is already verified', 409, 'ALREADY_VERIFIED')
    }

    await prisma.$transaction(async (tx) => {
      await tx.farmerProfile.update({
        where: { userId: farmerId },
        data:  {
          gpsLat:          gpsLat,
          gpsLng:          gpsLng,
          farmPhotos:      farmPhotos?.length ? farmPhotos : farmerProfile.farmPhotos,
          fieldVerifiedAt: new Date(),
          fieldAgentId:    req.user!.id,
        },
      })

      await tx.profile.update({
        where: { id: farmerId },
        data:  { verificationLevel: 'field_verified' },
      })

      // Credit the field agent's wallet
      const agentWallet = await tx.wallet.upsert({
        where:  { userId: req.user!.id },
        create: { userId: req.user!.id },
        update: {},
      })

      const newBalance = Number(agentWallet.balance) + EARN_PER_VERIFICATION_GHS

      await tx.wallet.update({
        where: { userId: req.user!.id },
        data: {
          balance:     newBalance,
          totalEarned: { increment: EARN_PER_VERIFICATION_GHS },
        },
      })

      await tx.walletTransaction.create({
        data: {
          walletId:     agentWallet.id,
          type:         'credit',
          amount:       EARN_PER_VERIFICATION_GHS,
          balanceAfter: newBalance,
          description:  `Field verification: ${farmerProfile.user.fullName}`,
          reference:    `verify-${farmerId}`,
        },
      })
    })

    await addSMSJob({
      to:      farmerProfile.user.phone,
      message: `Congratulations ${farmerProfile.user.fullName}! Your farm has been field-verified by a GENE agent. Your AgroScore has been upgraded. You now qualify for higher BNPL credit limits.`,
    })

    return { success: true, data: { farmerId, verifiedAt: new Date() } }
  })

  // GET /field-agent/earnings
  app.get('/earnings', async (req) => {
    if (!req.user) throw new AuthError()
    if (req.user.role !== 'field_agent') throw new AppError('Forbidden', 403, 'FORBIDDEN')

    const page  = Number((req.query as Record<string, string>)['page'] ?? '1')
    const limit = 20
    const skip  = (page - 1) * limit

    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } })
    if (!wallet) {
      return { success: true, data: { transactions: [], total: 0, walletBalance: 0 }, pagination: { page, limit, total: 0, pages: 0 } }
    }

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where:   { walletId: wallet.id },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
    ])

    return {
      success: true,
      data:    { transactions, total, walletBalance: Number(wallet.balance) },
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    }
  })
}
