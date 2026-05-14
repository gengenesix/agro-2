import { prisma }   from '../../config/database.js'
import { supabase } from '../../config/supabase.js'
import { cache }    from '../../lib/cache.js'
import { sendSMS }  from '../../lib/arkesel.js'
import { AppError, ValidationError } from '../../lib/errors.js'
import { env }      from '../../config/env.js'

function normalizePhone(phone: string): string {
  return phone.startsWith('0') ? `+233${phone.slice(1)}` : phone
}

export async function requestOTP(rawPhone: string): Promise<{ message: string }> {
  const phone = normalizePhone(rawPhone)

  // Rate limit: 3 OTPs per phone per 10 min
  const rateLimitKey = `otp:ratelimit:${phone}`
  const attempts     = await cache.get(rateLimitKey)
  if (attempts && parseInt(attempts) >= 3) {
    throw new AppError('Too many OTP requests. Try again in 10 minutes.', 429)
  }

  const otp = Math.floor(100_000 + Math.random() * 900_000).toString()

  await cache.set(`otp:${phone}`, otp, 'EX', env.OTP_EXPIRY_SECONDS)
  await cache.set(rateLimitKey, String(Number(attempts ?? '0') + 1), 'EX', 600)

  await sendSMS({
    to:      phone,
    message: `Your AgroConnect code: ${otp}. Valid 10 minutes. Do not share.`,
  })

  return { message: 'OTP sent to your phone.' }
}

export async function verifyOTP(rawPhone: string, otp: string): Promise<{
  profile:   Record<string, unknown>
  session:   { access_token: string; refresh_token: string }
  isNewUser: boolean
}> {
  const phone  = normalizePhone(rawPhone)
  const stored = await cache.get(`otp:${phone}`)

  if (!stored || stored !== otp) {
    throw new ValidationError('Invalid or expired OTP. Request a new one.')
  }

  await cache.del(`otp:${phone}`)

  let profile   = await prisma.profile.findUnique({
    where:   { phone },
    include: { farmerProfile: true, dealerProfile: true, buyerProfile: true },
  })

  let isNewUser  = false
  let supabaseId = profile?.id

  if (!profile) {
    const { data: authUser, error } = await supabase.auth.admin.createUser({
      phone,
      phone_confirm:  true,
      user_metadata:  { phone },
    })

    if (error || !authUser.user) {
      throw new AppError('Failed to create user account.', 500)
    }

    supabaseId = authUser.user.id

    profile = await prisma.profile.create({
      data: {
        id:                supabaseId,
        phone,
        fullName:          'New User',
        role:              'farmer',
        verificationLevel: 'unverified',
        agroScore:         0,
        language:          'en',
      },
      include: { farmerProfile: true, dealerProfile: true, buyerProfile: true },
    })

    await prisma.wallet.create({ data: { userId: profile.id } })

    if (phone === env.SUPER_ADMIN_PHONE) {
      await prisma.profile.update({ where: { id: profile.id }, data: { role: 'admin' } })
    }

    isNewUser = true
  }

  // Create a real Supabase session so the JWT is valid for API calls
  const { data: sessionData, error: sessionError } =
    await supabase.auth.admin.createSession({ userId: supabaseId! })

  if (sessionError || !sessionData.session) {
    throw new AppError('Failed to create session.', 500)
  }

  return {
    profile:   profile as unknown as Record<string, unknown>,
    session:   {
      access_token:  sessionData.session.access_token,
      refresh_token: sessionData.session.refresh_token,
    },
    isNewUser,
  }
}

export async function getMe(userId: string) {
  return prisma.profile.findUnique({
    where:   { id: userId },
    include: { farmerProfile: true, dealerProfile: true, buyerProfile: true, region: true, district: true },
  })
}
