import { Worker }  from 'bullmq'
import { redis }   from '../config/redis.js'
import { prisma }  from '../config/database.js'
import { logger }  from '../config/logger.js'

// Ghana Statistical Service market price feed
// Endpoint: https://statsghana.gov.gh (public data portal)
// Fallback: use internally recorded listing prices to derive market averages
async function fetchGSSPrices(): Promise<{
  categorySlug: string; regionCode: string; pricePerUnit: number
}[]> {
  try {
    // The GSS portal does not yet offer a stable public JSON API.
    // We derive market prices from recent completed AgroConnect transactions
    // as a proxy for ground-truth market rates.
    return []
  } catch {
    return []
  }
}

async function deriveMarketPricesFromListings() {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  // Average listing prices per category + region for the past 7 days
  const avgPrices = await prisma.$queryRaw<{
    category_id: number
    region_id:   number | null
    unit_id:     number
    avg_price:   number
    sample_size: number
  }[]>`
    SELECT
      category_id,
      region_id,
      unit_id,
      ROUND(AVG(price_per_unit)::numeric, 2)   AS avg_price,
      COUNT(*)::int                             AS sample_size
    FROM listings
    WHERE status = 'active'
      AND created_at >= ${sevenDaysAgo}
      AND price_per_unit > 0
    GROUP BY category_id, region_id, unit_id
    HAVING COUNT(*) >= 2
  `

  return avgPrices
}

export function startPriceFeedWorker() {
  const worker = new Worker(
    'price-feed',
    async (job) => {
      logger.info({ jobId: job.id }, 'Running price feed update')

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // 1. Try external GSS feed
      const externalPrices = await fetchGSSPrices()

      if (externalPrices.length > 0) {
        for (const price of externalPrices) {
          const category = await prisma.productCategory.findUnique({
            where: { slug: price.categorySlug },
          })
          const region = await prisma.region.findFirst({
            where: { code: price.regionCode },
          })
          if (!category) continue

          const defaultUnit = await prisma.unitOfMeasure.findFirst({
            where: { abbreviation: 'kg' },
          })
          if (!defaultUnit) continue

          await prisma.marketPrice.create({
            data: {
              categoryId:  category.id,
              regionId:    region?.id ?? null,
              pricePerUnit: price.pricePerUnit,
              unitId:      defaultUnit.id,
              source:      'GSS',
              recordedAt:  today,
            },
          })
        }
        logger.info({ count: externalPrices.length }, 'GSS prices ingested')
        return
      }

      // 2. Fallback: derive from AgroConnect listing averages
      const derived = await deriveMarketPricesFromListings()

      let upserted = 0
      for (const row of derived) {
        // Only insert if no record exists for this category+region today
        const exists = await prisma.marketPrice.findFirst({
          where: {
            categoryId: row.category_id,
            regionId:   row.region_id ?? null,
            recordedAt: today,
            source:     'agroconnect_avg',
          },
        })
        if (exists) continue

        await prisma.marketPrice.create({
          data: {
            categoryId:  row.category_id,
            regionId:    row.region_id ?? null,
            pricePerUnit: row.avg_price,
            unitId:      row.unit_id,
            source:      'agroconnect_avg',
            recordedAt:  today,
          },
        })
        upserted++
      }

      logger.info({ upserted }, 'Market prices updated from listing averages')
    },
    { connection: redis, concurrency: 1 },
  )

  worker.on('failed', (job, err) =>
    logger.error({ jobId: job?.id, err }, 'Price feed worker failed'),
  )

  return worker
}
