import { Worker } from 'bullmq'
import { redis }  from '../config/redis.js'
import { prisma } from '../config/database.js'
import { logger } from '../config/logger.js'

export function startListingWorker() {
  const worker = new Worker('listing-expiry', async (job) => {
    if (job.name === 'expire-stale') {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - 90)

      const result = await prisma.listing.updateMany({
        where: {
          status:    'active',
          updatedAt: { lt: cutoff },
        },
        data: { status: 'expired' },
      })

      logger.info({ count: result.count }, 'Expired stale listings')
    }
  }, { connection: redis, concurrency: 1 })

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Listing expiry job failed')
  })

  return worker
}
