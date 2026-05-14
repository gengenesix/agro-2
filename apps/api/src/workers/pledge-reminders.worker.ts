import { Worker }    from 'bullmq'
import { redis }     from '../config/redis.js'
import { prisma }    from '../config/database.js'
import { addSMSJob } from './queues.js'
import { logger }    from '../config/logger.js'

const PROGRESS_LABELS: Record<string, string> = {
  planted:         'planted',
  growing:         'growing',
  ready_to_harvest:'ready to harvest',
  harvested:       'harvested',
  dispatched:      'dispatched',
}

export function startPledgeRemindersWorker() {
  const worker = new Worker(
    'pledge-reminders',
    async (job) => {
      logger.info({ jobId: job.id }, 'Running pledge status reminders')

      const sixtyDaysFromNow = new Date()
      sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60)

      // Pledge orders that are active (not yet delivered) and harvest date is within 60 days
      const pledgeOrders = await prisma.order.findMany({
        where: {
          orderType:      'harvest_pledge',
          trackingStatus: { in: ['pending', 'confirmed'] },
          listing: {
            expectedHarvestDate: { lte: sixtyDaysFromNow, not: null },
          },
        },
        include: {
          seller: { select: { phone: true, fullName: true } },
          listing: {
            select: {
              title: true,
              expectedHarvestDate: true,
            },
          },
        },
        take: 500,
      })

      let smsSent = 0

      for (const order of pledgeOrders) {
        const harvestDate = order.listing.expectedHarvestDate
        const progress    = order.pledgeProgress
          ? PROGRESS_LABELS[order.pledgeProgress] ?? order.pledgeProgress
          : 'not yet started'

        const daysToHarvest = harvestDate
          ? Math.ceil((harvestDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          : null

        const dateNote = daysToHarvest !== null
          ? ` Expected harvest: ${daysToHarvest} day${daysToHarvest !== 1 ? 's' : ''} away.`
          : ''

        await addSMSJob({
          to:      order.seller.phone,
          message: `AgroConnect Pledge Update: Hi ${order.seller.fullName}, please update the progress on your pledge for "${order.listing.title}". Current status: ${progress}.${dateNote} Update via the app or dial *800*456#.`,
        })

        smsSent++
      }

      logger.info({ smsSent }, 'Pledge reminders sent')
    },
    { connection: redis, concurrency: 1 },
  )

  worker.on('failed', (job, err) =>
    logger.error({ jobId: job?.id, err }, 'Pledge reminders worker failed'),
  )

  return worker
}
