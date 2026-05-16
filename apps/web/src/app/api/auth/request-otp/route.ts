import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { randomInt } from 'crypto'
import { storeOTP } from '@/lib/otp-store'
import { normalizePhone } from '@/lib/format'

const schema = z.object({
  phone: z.string().regex(/^(\+233|0)[0-9]{9}$/, 'Enter a valid Ghana phone number'),
  role:  z.enum(['farmer', 'dealer', 'buyer', 'consumer', 'field_agent']).default('farmer'),
})

async function sendArkeselSMS(phone: string, message: string): Promise<void> {
  const apiKey = process.env.ARKESEL_API_KEY
  if (!apiKey) return

  await fetch('https://sms.arkesel.com/api/v2/sms/send', {
    method:  'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender:     process.env.ARKESEL_SENDER_ID ?? 'AGROCON',
      message,
      recipients: [phone],
    }),
  })
}

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { body = {} }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.errors[0]?.message ?? 'Invalid request' },
      { status: 400 },
    )
  }

  const phone = normalizePhone(parsed.data.phone)
  const { role } = parsed.data
  const code = String(randomInt(100000, 999999))

  storeOTP(phone, code, role)

  const isDev = process.env.NODE_ENV === 'development'
  const hasArkesel = Boolean(process.env.ARKESEL_API_KEY)

  if (hasArkesel) {
    // Fire-and-forget — SMS failure doesn't break the OTP flow
    sendArkeselSMS(
      phone,
      `Your AgroConnect OTP is ${code}. Valid for 10 minutes. Do not share this code.`,
    ).catch(() => undefined)
  }

  return NextResponse.json({
    success: true,
    message: hasArkesel ? 'OTP sent to your phone.' : 'OTP generated.',
    // Always include in dev so the browser can show it as a toast
    ...(isDev && { devOtp: code }),
  })
}
