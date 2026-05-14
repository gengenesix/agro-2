import { Queue } from 'bullmq'
import { redis }  from '../config/redis.js'

const connection = { connection: redis }

export const smsQueue          = new Queue('sms',           connection)
export const emailQueue        = new Queue('email',         connection)
export const scoreQueue        = new Queue('score',         connection)
export const weatherQueue      = new Queue('weather',       connection)
export const paymentQueue      = new Queue('payment-verify', connection)
export const listingExpiryQueue = new Queue('listing-expiry', connection)
export const digestQueue         = new Queue('digest',          connection)
export const bnplRemindersQueue  = new Queue('bnpl-reminders',  connection)
export const pledgeRemindersQueue = new Queue('pledge-reminders', connection)
export const priceFeedQueue      = new Queue('price-feed',      connection)

export async function addSMSJob(data: { to?: string; recipients?: string[]; message: string }) {
  await smsQueue.add('send-sms', data, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } })
}

export async function addEmailJob(data: { to: string; subject: string; html: string }) {
  await emailQueue.add('send-email', data, { attempts: 3, backoff: { type: 'exponential', delay: 2000 } })
}

export async function addNotificationJob(data: {
  userId: string; type: string; title: string; body: string
}) {
  await smsQueue.add('in-app-notification', data)
}
