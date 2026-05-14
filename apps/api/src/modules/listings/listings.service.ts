import { prisma } from '../../config/database.js'
import { cache }  from '../../lib/cache.js'
import { env }    from '../../config/env.js'
import type { ListingFilters } from '@agroconnect/validators'

function generateSlug(title: string, suffix: string): string {
  return `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${suffix}`
}

export async function searchListings(filters: ListingFilters) {
  const cacheKey = `listings:search:${JSON.stringify(filters)}`
  const cached   = await cache.getJSON<unknown>(cacheKey)
  if (cached) return cached

  const {
    page = 1, limit = 12, sector, categorySlug,
    regionId, listingType, maxPrice, farmingMethod,
    verifiedOnly, bnplOnly, search,
    sortBy = 'newest',
  } = filters

  const where: Record<string, unknown> = {
    status: 'active',
    ...(sector       && { category: { sector } }),
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(regionId     && { regionId }),
    ...(listingType  && { listingType }),
    ...(maxPrice     && { pricePerUnit: { lte: maxPrice } }),
    ...(farmingMethod && { farmingMethod }),
    ...(bnplOnly     && { bnplAvailable: true }),
    ...(verifiedOnly && { seller: { verificationLevel: { not: 'unverified' } } }),
    ...(search && {
      OR: [
        { title:       { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ],
    }),
  }

  const orderByMap: Record<string, unknown> = {
    newest:          { createdAt: 'desc' },
    price_low:       { pricePerUnit: 'asc' },
    price_high:      { pricePerUnit: 'desc' },
    most_viewed:     { viewsCount: 'desc' },
    harvest_soonest: { expectedHarvestDate: 'asc' },
    top_rated:       { seller: { agroScore: 'desc' } },
  }

  const skip = (page - 1) * limit

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      skip,
      take:    limit,
      orderBy: orderByMap[sortBy] as never,
      select: {
        id: true, title: true, slug: true, listingType: true,
        quantityAvailable: true, pricePerUnit: true, photos: true,
        farmingMethod: true, expectedHarvestDate: true,
        depositPercentage: true, pledgeStatus: true, status: true,
        bnplAvailable: true, viewsCount: true, createdAt: true,
        unit:     { select: { name: true, abbreviation: true } },
        category: { select: { name: true, sector: true, slug: true } },
        region:   { select: { name: true, code: true } },
        district: { select: { name: true } },
        seller: {
          select: {
            id: true, fullName: true, avatarUrl: true,
            verificationLevel: true, agroScore: true,
          },
        },
      },
    }),
    prisma.listing.count({ where }),
  ])

  const result = {
    listings,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }

  await cache.setJSON(cacheKey, result, 180)
  return result
}

export async function getListing(slug: string) {
  const cacheKey = `listing:${slug}`
  const cached   = await cache.getJSON<unknown>(cacheKey)
  if (cached) return cached

  const listing = await prisma.listing.findUnique({
    where: { slug },
    include: {
      unit: true, category: true, region: true, district: true,
      seller: {
        select: {
          id: true, fullName: true, avatarUrl: true,
          verificationLevel: true, agroScore: true,
          _count: { select: { reviewsReceived: true, ordersAsSeller: true } },
          farmerProfile: { select: { farmName: true, farmSizeAcres: true, sectors: true } },
        },
      },
    },
  })

  if (!listing || listing.status !== 'active') return null

  prisma.listing.update({ where: { slug }, data: { viewsCount: { increment: 1 } } }).catch(() => null)
  await cache.setJSON(cacheKey, listing, 300)
  return listing
}

export async function createListing(sellerId: string, data: Record<string, unknown>) {
  const suffix = Math.random().toString(36).slice(2, 7)
  const slug   = generateSlug(String(data['title']), suffix)

  const listing = await prisma.listing.create({
    data: {
      sellerId,
      slug,
      ...(data as never),
    },
  })

  await cache.invalidatePattern('listings:search:*')
  return listing
}

export async function getMapListings() {
  const cacheKey = 'listings:map'
  const cached   = await cache.getJSON<unknown>(cacheKey)
  if (cached) return cached

  const listings = await prisma.listing.findMany({
    where: { status: 'active', gpsLat: { not: null }, gpsLng: { not: null } },
    select: {
      id: true, slug: true, title: true,
      gpsLat: true, gpsLng: true,
      pricePerUnit: true,
      category: { select: { sector: true } },
      seller:   { select: { verificationLevel: true } },
    },
  })

  await cache.setJSON(cacheKey, listings, 300)
  return listings
}
