import type { FastifyInstance } from 'fastify'
import { prisma } from '../../config/database.js'
import { cache }  from '../../lib/cache.js'
import { getDistrictForecast, assessFarmingConditions } from '../../lib/open-meteo.js'
import { pestReportSchema } from '@agroconnect/validators'
import { AuthError, NotFoundError } from '../../lib/errors.js'

export default async function intelligenceRoutes(app: FastifyInstance) {
  // Weather for a district
  app.get('/weather/:districtId', async (req) => {
    const { districtId } = req.params as { districtId: string }
    const cacheKey       = `weather:district:${districtId}`
    const cached         = await cache.getJSON<unknown>(cacheKey)
    if (cached) return { success: true, data: cached }

    const district = await prisma.district.findUnique({
      where: { id: parseInt(districtId) },
      include: { region: { select: { name: true } } },
    })
    if (!district || !district.centerLat || !district.centerLng) {
      throw new NotFoundError('District weather data')
    }

    const forecast   = await getDistrictForecast(Number(district.centerLat), Number(district.centerLng))
    const assessment = assessFarmingConditions(forecast)

    const result = {
      district: { id: district.id, name: district.name, region: district.region.name },
      forecast,
      assessment,
    }

    await cache.setJSON(cacheKey, result, 10_800)
    return { success: true, data: result }
  })

  // Market prices
  app.get('/prices/:categorySlug', async (req) => {
    const { categorySlug } = req.params as { categorySlug: string }
    const { regionId, period = '30d' } = req.query as { regionId?: string; period?: string }

    const days = { '7d': 7, '30d': 30, '90d': 90 }[period] ?? 30
    const since = new Date()
    since.setDate(since.getDate() - days)

    const category = await prisma.productCategory.findUnique({ where: { slug: categorySlug } })
    if (!category) throw new NotFoundError('Category')

    const prices = await prisma.marketPrice.findMany({
      where: {
        categoryId: category.id,
        recordedAt: { gte: since },
        ...(regionId && { regionId: parseInt(regionId) }),
      },
      orderBy: { recordedAt: 'asc' },
      include: { region: { select: { name: true } }, unit: { select: { abbreviation: true } } },
    })

    return { success: true, data: { category, prices } }
  })

  // Price trends
  app.get('/prices/trends/:slug', async (req) => {
    const { slug }   = req.params as { slug: string }
    const category   = await prisma.productCategory.findUnique({ where: { slug } })
    if (!category) throw new NotFoundError('Category')

    const since = new Date()
    since.setDate(since.getDate() - 90)

    const prices = await prisma.marketPrice.findMany({
      where:   { categoryId: category.id, recordedAt: { gte: since } },
      orderBy: { recordedAt: 'asc' },
      select:  { recordedAt: true, pricePerUnit: true, region: { select: { name: true } } },
    })

    return { success: true, data: prices }
  })

  // Submit pest report
  app.post('/pest-report', async (req, reply) => {
    if (!req.user) throw new AuthError()
    const body   = pestReportSchema.parse(req.body)
    const report = await prisma.pestReport.create({
      data: { ...body, reporterId: req.user.id },
    })
    return reply.status(201).send({ success: true, data: report })
  })

  // Price alerts — list
  app.get('/alerts', async (req) => {
    if (!req.user) throw new AuthError()
    const alerts = await prisma.priceAlert.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { region: { select: { name: true } } },
    })
    return {
      success: true,
      data:    {
        alerts: alerts.map(a => ({
          ...a,
          region: a.region?.name ?? null,
        })),
      },
    }
  })

  // Price alerts — create
  app.post('/alerts', async (req, reply) => {
    if (!req.user) throw new AuthError()
    const { crop, regionId, condition, targetPrice } = req.body as {
      crop: string; regionId: number; condition: 'above' | 'below'; targetPrice: number
    }
    const alert = await prisma.priceAlert.create({
      data: { userId: req.user.id, crop, regionId: regionId || null, condition, targetPrice },
    })
    return reply.status(201).send({ success: true, data: alert })
  })

  // Price alerts — delete
  app.delete('/alerts/:id', async (req) => {
    if (!req.user) throw new AuthError()
    const { id } = req.params as { id: string }
    const alert  = await prisma.priceAlert.findUnique({ where: { id } })
    if (!alert || alert.userId !== req.user.id) {
      throw new Error('Alert not found or access denied')
    }
    await prisma.priceAlert.delete({ where: { id } })
    return { success: true }
  })

  // Pest alerts for a region
  app.get('/pest-alerts/:regionId', async (req) => {
    const { regionId } = req.params as { regionId: string }
    const alerts       = await prisma.pestReport.findMany({
      where:   { regionId: parseInt(regionId), isVerified: true },
      orderBy: { createdAt: 'desc' },
      take:    20,
      include: {
        category: { select: { name: true } },
        region:   { select: { name: true } },
      },
    })
    return { success: true, data: alerts }
  })
}
