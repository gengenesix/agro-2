import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { checkOTP, signToken } from '@/lib/otp-store'
import type { Profile, Role } from '@/lib/types'

const schema = z.object({
  phone: z.string(),
  otp:   z.string().length(6).regex(/^\d{6}$/),
})

export async function POST(req: NextRequest) {
  let body: unknown
  try { body = await req.json() } catch { body = {} }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }

  const { phone, otp } = parsed.data
  const role = checkOTP(phone, otp)

  if (!role) {
    return NextResponse.json(
      { success: false, error: 'Invalid or expired OTP. Please try again.' },
      { status: 400 },
    )
  }

  const profile: Profile = {
    id:                randomUUID(),
    phone,
    email:             null,
    fullName:          '',
    role:              role as Role,
    language:          'en',
    regionId:          null,
    districtId:        null,
    community:         null,
    avatarUrl:         null,
    isActive:          true,
    agroScore:         20,
    verificationLevel: 'unverified',
    createdAt:         new Date().toISOString(),
  }

  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 60 * 60 * 24 * 30
  const accessToken = signToken({ ...profile, iat, exp })

  const res = NextResponse.json({
    success: true,
    data: { access_token: accessToken, profile, isNewUser: true },
  })

  res.cookies.set('agro_access_token', accessToken, {
    httpOnly: true,
    path:     '/',
    maxAge:   60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
  })
  res.cookies.set('agro_role', role, {
    httpOnly: false,
    path:     '/',
    maxAge:   60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
  })

  return res
}
