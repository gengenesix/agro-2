import axios from 'axios'
import { env } from '../config/env.js'
import { logger } from '../config/logger.js'

const arkeselClient = axios.create({
  baseURL:  'https://sms.arkesel.com/api/v2',
  headers: {
    'api-key':      env.ARKESEL_API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 10_000,
})

export async function sendSMS(params: { to: string; message: string }): Promise<void> {
  try {
    await arkeselClient.post('/sms/send', {
      sender:     env.ARKESEL_SENDER_ID,
      message:    params.message,
      recipients: [params.to],
    })
  } catch (err) {
    logger.error({ err, phone: params.to }, 'Failed to send SMS')
  }
}

export async function sendBulkSMS(params: { recipients: string[]; message: string }): Promise<void> {
  try {
    await arkeselClient.post('/sms/send', {
      sender:     env.ARKESEL_SENDER_ID,
      message:    params.message,
      recipients: params.recipients,
    })
  } catch (err) {
    logger.error({ err }, 'Failed to send bulk SMS')
  }
}
