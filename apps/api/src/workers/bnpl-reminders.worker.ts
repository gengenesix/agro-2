import { Worker }   from 'bullmq'
import { redis }    from '../config/redis.js'
import { prisma }   from '../config/database.js'
import { addSMSJob } from './queues.js'
import { logger }   from '../config/logger.js'

function daysFromNow(n: number): { gte: Date; lt: Date } {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() + n)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)
  return { gte: start, lt: end }
}

export function startBNPLRemindersWorker() {
  const worker = new Worker(
    'bnpl-reminders',
    async (job) => {
      logger.info({ jobId: job.id }, 'Running BNPL due-date reminders')

      let smsSent = 0

      for (const daysAhead of [7, 3, 1]) {
        const window = daysFromNow(daysAhead)

        const dueApplications = await prisma.bNPLApplication.findMany({
          where: {
            status:  'disbursed',
            dueDate: window,
          },
          include: {
            farmer: { select: { phone: true, fullName: true } },
          },
        })

        for (const app of dueApplications) {
          const amount   = Number(app.totalRepayable ?? app.amountApproved ?? app.amountRequested)
          const dueLabel = daysAhead === 1 ? 'tomorrow' : `in ${daysAhead} days`

          await addSMSJob({
            to:      app.farmer.phone,
            message: `AgroConnect BNPL Reminder: Hi ${app.farmer.fullName}, your repayment of GHS ${amount.toFixed(2)} is due ${dueLabel}. Please ensure your Mobile Money wallet is funded. Dial *800*456# to manage your account.`,
          })

          smsSent++
        }
      }

      logger.info({ smsSent }, 'BNPL reminders sent')
    },
    { connection: redis, concurrency: 1 },
  )

  worker.on('failed', (job, err) =>
    logger.error({ jobId: job?.id, err }, 'BNPL reminders worker failed'),
  )

  return worker
}
