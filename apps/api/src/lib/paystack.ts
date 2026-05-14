import axios from 'axios'
import { createHmac } from 'crypto'
import { env } from '../config/env.js'

const paystackClient = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization:  `Bearer ${env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 30_000,
})

export interface PaystackInitResult {
  authorizationUrl: string
  accessCode: string
  reference: string
}

export async function initializeTransaction(params: {
  email:       string
  amountGHS:   number
  reference:   string
  callbackUrl: string
  metadata?:   Record<string, unknown>
}): Promise<PaystackInitResult> {
  const { data } = await paystackClient.post('/transaction/initialize', {
    email:        params.email,
    amount:       Math.round(params.amountGHS * 100),
    reference:    params.reference,
    callback_url: params.callbackUrl,
    currency:     'GHS',
    channels:     ['mobile_money', 'card', 'bank'],
    metadata:     params.metadata,
  })

  return {
    authorizationUrl: data.data.authorization_url,
    accessCode:       data.data.access_code,
    reference:        data.data.reference,
  }
}

export async function verifyTransaction(reference: string): Promise<{
  status: string
  amount: number
  channel: string
  metadata: Record<string, unknown>
}> {
  const { data } = await paystackClient.get(`/transaction/verify/${reference}`)
  return {
    status:   data.data.status,
    amount:   data.data.amount / 100,
    channel:  data.data.channel,
    metadata: data.data.metadata ?? {},
  }
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const hash = createHmac('sha512', env.PAYSTACK_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')
  return hash === signature
}

export async function initiateTransfer(params: {
  amount:        number
  recipient:     string
  reference:     string
  reason:        string
}): Promise<{ transferCode: string }> {
  const { data } = await paystackClient.post('/transfer', {
    source:    'balance',
    amount:    Math.round(params.amount * 100),
    recipient: params.recipient,
    reference: params.reference,
    reason:    params.reason,
    currency:  'GHS',
  })
  return { transferCode: data.data.transfer_code }
}
