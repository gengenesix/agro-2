import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import { checkOTP, storeSession, signToken } from '@/lib/otp-store'
import { prisma } from '@/lib/prisma'
import type { Profile, Role } from '@agroconnect/types'

const schema = z.object({
  phone: z.string(),
  otp:   z.string().length(6).regex(/^\d{6}$/),
})

function toProfile(row: {
  id: string; phone: string; fullName: string; role: string;
  language: string; regionId: number | null; districtId: number | null;
  community: string | null; avatarUrl: string | null; isActive: boolean;
  agroScore: number; verificationLevel: string; createdAt: Date
}): Profile {
  return {
    id:                row.id,
    phone:             row.phone,
    fullName:          row.fullName,
    role:              row.role as Role,
    language:          row.language as Profile['language'],
    regionId:          row.regionId,
    districtId:        row.districtId,
    community:         row.community,
    avatarUrl:         row.avatarUrl,
    isActive:          row.isActive,
    agroScore:         row.agroScore,
    verificationLevel: row.verificationLevel as Profile['verificationLevel'],
    createdAt:         row.createdAt.toISOString(),
  }
}

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

  // Find or create profile in DB
  let profileRow = await prisma.profile.findUnique({ where: { phone } })
  let isNewUser = false

  if (!profileRow) {
    isNewUser = true
    profileRow = await prisma.profile.create({
      data: {
        id:    randomUUID(),
        phone,
        fullName: '',
        role:  role as Role,
      },
    })
    // Create wallet for the new user
    await prisma.wallet.create({ data: { userId: profileRow.id } })
  }

  const profile = toProfile(profileRow)

  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 60 * 60 * 24 * 30 // 30 days
  const accessToken = signToken({ id: profile.id, phone, role: profile.role, iat, exp })

  storeSession(accessToken, profile)

  const res = NextResponse.json({
    success: true,
    data: { access_token: accessToken, profile, isNewUser },
  })

  res.cookies.set('agro_access_token', accessToken, {
    httpOnly: true,
    path:     '/',
    maxAge:   60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
  })

  return res
}
