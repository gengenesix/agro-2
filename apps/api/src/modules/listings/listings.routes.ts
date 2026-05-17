import type { FastifyInstance } from 'fastify'
import { searchListings, getListing, createListing, getMapListings } from './listings.service.js'
import { listingFiltersSchema, createListingSchema } from '@agroconnect/validators'
import { AuthError, ForbiddenError, NotFoundError } from '../../lib/errors.js'
import { prisma } from '../../config/database.js'
import { cache }  from '../../lib/cache.js'

export default async function listingsRoutes(app: FastifyInstance) {
  // Browse listings
  app.get('/', async (req) => {
    const filters = listingFiltersSchema.parse(req.query)
    const result  = await searchListings(filters)
    return { success: true, ...result }
  })

  // Harvest pledges only
  app.get('/pledges', async (req) => {
    const filters = listingFiltersSchema.parse({ ...(req.query as Record<string, unknown>), listingType: 'harvest_pledge' })
    const result  = await searchListings(filters)
    return { success: true, ...result }
  })

  // Inputs only
  app.get('/inputs', async (req) => {
    const filters = listingFiltersSchema.parse({ ...(req.query as Record<string, unknown>), sector: 'inputs' })
    const result  = await searchListings(filters)
    return { success: true, ...result }
  })

  // Map view
  app.get('/map', async () => {
    const data = await getMapListings()
    return { success: true, data }
  })

  // Categories tree
  app.get('/categories', async () => {
    const categories = await prisma.productCategory.findMany({
      where:   { isActive: true, parentId: null },
      include: { children: { where: { isActive: true } } },
      orderBy: { name: 'asc' },
    })
    return { success: true, data: categories }
  })

  // Listing detail
  app.get('/:slug', async (req) => {
    const { slug } = req.params as { slug: string }
    const listing  = await getListing(slug)
    if (!listing) throw new NotFoundError('Listing')
    return { success: true, data: listing }
  })

  // Create listing
  app.post('/', async (req, reply) => {
    if (!req.user) throw new AuthError()
    if (!['farmer', 'dealer', 'admin'].includes(req.user.role)) {
      throw new ForbiddenError('Only farmers and dealers can create listings.')
    }
    const body    = createListingSchema.parse(req.body)
    const listing = await createListing(req.user.id, body as never)
    return reply.status(201).send({ success: true, data: listing })
  })

  // Update listing
  app.patch('/:id', async (req, reply) => {
    if (!req.user) throw new AuthError()
    const { id }  = req.params as { id: string }
    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) throw new NotFoundError('Listing')
    if (listing.sellerId !== req.user.id && req.user.role !== 'admin') {
      throw new ForbiddenError()
    }
    const updated = await prisma.listing.update({ where: { id }, data: req.body as never })
    await cache.del(`listing:${listing.slug}`)
    await cache.invalidatePattern('listings:search:*')
    return reply.send({ success: true, data: updated })
  })

  // Activate listing
  app.post('/:id/activate', async (req) => {
    if (!req.user) throw new AuthError()
    const { id }  = req.params as { id: string }
    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) throw new NotFoundError('Listing')
    if (listing.sellerId !== req.user.id) throw new ForbiddenError()
    const updated = await prisma.listing.update({ where: { id }, data: { status: 'active' } })
    await cache.invalidatePattern('listings:search:*')
    return { success: true, data: updated }
  })

  // Pause listing
  app.post('/:id/pause', async (req) => {
    if (!req.user) throw new AuthError()
    const { id }  = req.params as { id: string }
    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) throw new NotFoundError('Listing')
    if (listing.sellerId !== req.user.id) throw new ForbiddenError()
    const updated = await prisma.listing.update({ where: { id }, data: { status: 'paused' } })
    await cache.del(`listing:${listing.slug}`)
    return { success: true, data: updated }
  })

  // Upload photos
  app.post('/:id/photos', async (req, reply) => {
    if (!req.user) throw new AuthError()
    const { id }  = req.params as { id: string }
    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) throw new NotFoundError('Listing')
    if (listing.sellerId !== req.user.id) throw new ForbiddenError()
    return reply.send({ success: true, message: 'Use Supabase Storage directly for uploads.' })
  })
}
