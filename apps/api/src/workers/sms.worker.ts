import { Worker } from 'bullmq'
import { redis }   from '../config/redis.js'
import { sendSMS, sendBulkSMS } from '../lib/arkesel.js'
import { logger }  from '../config/logger.js'

export function startSMSWorker() {
  const worker = new Worker('sms', async (job) => {
    if (job.data.recipients) {
      await sendBulkSMS({ recipients: job.data.recipients, message: job.data.message })
    } else if (job.data.to) {
      await sendSMS({ to: job.data.to, message: job.data.message })
    }
  }, { connection: redis, concurrency: 10 })

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'SMS job failed')
  })

  logger.info('SMS worker started')
  return worker
}
