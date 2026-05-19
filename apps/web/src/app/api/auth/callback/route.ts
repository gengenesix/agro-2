import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createServerSupabaseClient } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { signToken, storeSession } from '@/lib/otp-store'
import type { Profile } from '@/lib/types'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code  = searchParams.get('code')
  const next  = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`)
  }
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const supabase = await createServerSupabaseClient()
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError || !data.session) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(exchangeError?.message ?? 'session_error')}`,
    )
  }

  const { user } = data.session
  const email    = user.email ?? ''
  const fullName = (user.user_metadata?.full_name as string | undefined) ?? ''
  const avatar   = (user.user_metadata?.avatar_url as string | undefined) ?? null

  // Upsert profile keyed on Supabase user ID (stored in our id field)
  let profileRow = await prisma.profile.findUnique({ where: { id: user.id } })
  let isNewUser  = false

  if (!profileRow) {
    isNewUser = true
    profileRow = await prisma.profile.create({
      data: {
        id:        user.id,
        phone:     email,   // email used as the phone/identifier field for OAuth users
        fullName:  fullName,
        role:      'farmer', // default role — user updates via onboarding
        avatarUrl: avatar,
      },
    })
    await prisma.wallet.create({ data: { userId: profileRow.id } })
  } else if (!profileRow.avatarUrl && avatar) {
    await prisma.profile.update({
      where: { id: profileRow.id },
      data:  { avatarUrl: avatar },
    })
    profileRow = { ...profileRow, avatarUrl: avatar }
  }

  const profile: Profile = {
    id:                profileRow.id,
    phone:             profileRow.phone,
    fullName:          profileRow.fullName,
    role:              profileRow.role as Profile['role'],
    language:          profileRow.language as Profile['language'],
    regionId:          profileRow.regionId,
    districtId:        profileRow.districtId,
    community:         profileRow.community,
    avatarUrl:         profileRow.avatarUrl,
    isActive:          profileRow.isActive,
    agroScore:         profileRow.agroScore,
    verificationLevel: profileRow.verificationLevel as Profile['verificationLevel'],
    createdAt:         profileRow.createdAt.toISOString(),
  }

  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 60 * 60 * 24 * 30  // 30 days
  const accessToken = signToken({ id: profile.id, phone: profile.phone, role: profile.role, iat, exp })
  storeSession(accessToken, profile)

  const destination = isNewUser ? `${origin}/onboarding/role` : `${origin}${next}`
  const res = NextResponse.redirect(destination)

  res.cookies.set('agro_access_token', accessToken, {
    httpOnly: true,
    path:     '/',
    maxAge:   60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
  })

  return res
}
