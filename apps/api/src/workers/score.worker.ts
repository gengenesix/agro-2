import { Worker, Queue } from 'bullmq'
import { redis }  from '../config/redis.js'
import { prisma } from '../config/database.js'
import { recalculateAgroScore, getBNPLTier } from '../lib/score.js'
import { sendSMS } from '../lib/arkesel.js'
import { logger }  from '../config/logger.js'

export function startScoreWorker() {
  const worker = new Worker('score', async (job) => {
    if (job.name === 'nightly-recalculation') {
      logger.info('Starting nightly AgroScore recalculation')

      const farmers = await prisma.profile.findMany({
        where:  { role: 'farmer', isActive: true },
        select: { id: true, phone: true, agroScore: true },
      })

      let upgraded = 0

      for (let i = 0; i < farmers.length; i += 100) {
        const batch = farmers.slice(i, i + 100)
        await Promise.all(batch.map(async (farmer) => {
          try {
            const prevTier    = getBNPLTier(farmer.agroScore)
            const newScore    = await recalculateAgroScore(farmer.id)
            const newTier     = getBNPLTier(newScore)

            if (!prevTier && newTier) {
              upgraded++
              await sendSMS({
                to:      farmer.phone,
                message: `AgroConnect: Your AgroScore reached ${newScore}! You now qualify for up to GHS ${newTier.maxAmount} BNPL credit. Visit agroconnect.com.gh`,
              })
            }
          } catch (err) {
            logger.warn({ farmerId: farmer.id, err }, 'Score recalc failed for farmer')
          }
        }))
      }

      logger.info({ total: farmers.length, upgraded }, 'AgroScore recalculation complete')
    }
  }, { connection: redis, concurrency: 1 })

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Score job failed')
  })

  logger.info('Score worker started')
  return worker
}
