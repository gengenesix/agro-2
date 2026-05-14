import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV:                  z.enum(['development', 'test', 'production']),
  PORT:                      z.string().default('4000').transform(Number),
  API_URL:                   z.string().url(),
  WEB_URL:                   z.string().url(),
  DATABASE_URL:              z.string().min(1),
  REDIS_URL:                 z.string().min(1),
  SUPABASE_URL:              z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  PAYSTACK_SECRET_KEY:       z.string().startsWith('sk_'),
  PAYSTACK_WEBHOOK_SECRET:   z.string().min(1),
  ARKESEL_API_KEY:           z.string().min(1),
  ARKESEL_SENDER_ID:         z.string().default('AGROCON'),
  ARKESEL_USSD_SECRET:       z.string().optional(),
  RESEND_API_KEY:            z.string().startsWith('re_'),
  RESEND_FROM_EMAIL:         z.string().email().default('noreply@agroconnect.com.gh'),
  RESEND_FROM_NAME:          z.string().default('AgroConnect'),
  JWT_SECRET:                z.string().min(32),
  CORS_ORIGINS:              z.string().default('http://localhost:3000'),
  SUPER_ADMIN_PHONE:         z.string(),
  PLATFORM_FEE_DIRECT:       z.string().default('0.03').transform(Number),
  PLATFORM_FEE_PLEDGE:       z.string().default('0.025').transform(Number),
  PLATFORM_FEE_INPUT:        z.string().default('0.015').transform(Number),
  MAX_IMAGE_SIZE_MB:         z.string().default('5').transform(Number),
  OTP_EXPIRY_SECONDS:        z.string().default('600').transform(Number),
  RATE_LIMIT_PUBLIC:         z.string().default('100').transform(Number),
  RATE_LIMIT_AUTH:           z.string().default('10').transform(Number),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('[AgroConnect] Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
