import { startSMSWorker }     from './sms.worker.js'
import { startEmailWorker }   from './email.worker.js'
import { startScoreWorker }   from './score.worker.js'
import { startWeatherWorker } from './weather.worker.js'
import { startListingWorker } from './listing.worker.js'
import { startPaymentWorker } from './payment.worker.js'
import { startDigestWorker }          from './digest.worker.js'
import { startBNPLRemindersWorker }   from './bnpl-reminders.worker.js'
import { startPledgeRemindersWorker } from './pledge-reminders.worker.js'
import { startPriceFeedWorker }       from './price-feed.worker.js'
import {
  scoreQueue, weatherQueue, listingExpiryQueue, paymentQueue,
  digestQueue, bnplRemindersQueue, pledgeRemindersQueue, priceFeedQueue,
} from './queues.js'
import { logger } from '../config/logger.js'

export async function startAllWorkers() {
  startSMSWorker()
  startEmailWorker()
  startScoreWorker()
  startWeatherWorker()
  startListingWorker()
  startPaymentWorker()
  startDigestWorker()
  startBNPLRemindersWorker()
  startPledgeRemindersWorker()
  startPriceFeedWorker()

  // Schedule nightly score recalculation
  await scoreQueue.upsertJobScheduler(
    'nightly-recalculation',
    { pattern: '0 1 * * *' },
    { name: 'nightly-recalculation', data: {} },
  )

  // Schedule weather check every 6 hours
  await weatherQueue.upsertJobScheduler(
    'fetch-alerts',
    { pattern: '0 */6 * * *' },
    { name: 'fetch-alerts', data: {} },
  )

  // Schedule daily listing expiry check
  await listingExpiryQueue.upsertJobScheduler(
    'expire-stale',
    { pattern: '0 2 * * *' },
    { name: 'expire-stale', data: {} },
  )

  // Payment verification poll every 2 minutes
  await paymentQueue.upsertJobScheduler(
    'poll-pending',
    { pattern: '*/2 * * * *' },
    { name: 'poll-pending', data: { scheduled: true } },
  )

  // Weekly buyer digest every Sunday at 8am Ghana time (UTC+0)
  await digestQueue.upsertJobScheduler(
    'weekly-digest',
    { pattern: '0 8 * * 0' },
    { name: 'weekly-digest', data: {} },
  )

  // BNPL due-date reminders — daily at 7am
  await bnplRemindersQueue.upsertJobScheduler(
    'bnpl-daily-check',
    { pattern: '0 7 * * *' },
    { name: 'bnpl-daily-check', data: {} },
  )

  // Pledge status reminders — every Wednesday at 9am
  await pledgeRemindersQueue.upsertJobScheduler(
    'pledge-weekly-reminder',
    { pattern: '0 9 * * 3' },
    { name: 'pledge-weekly-reminder', data: {} },
  )

  // Market price feed — daily at 6am
  await priceFeedQueue.upsertJobScheduler(
    'daily-price-update',
    { pattern: '0 6 * * *' },
    { name: 'daily-price-update', data: {} },
  )

  logger.info('All background workers scheduled')
}
