import { Worker } from 'bullmq'
import { redis }   from '../config/redis.js'
import { sendEmail } from '../lib/resend.js'
import { logger }  from '../config/logger.js'

export function startEmailWorker() {
  const worker = new Worker('email', async (job) => {
    const { to, subject, html } = job.data as { to: string; subject: string; html: string }
    await sendEmail({ to, subject, html })
  }, { connection: redis, concurrency: 5 })

  worker.on('completed', (job) => {
    logger.debug({ jobId: job.id, to: job.data.to }, 'Email sent')
  })

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, to: job?.data?.to, err }, 'Email job failed')
  })

  logger.info('Email worker started')
  return worker
}
