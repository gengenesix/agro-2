import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { signToken, storeSession } from '@/lib/otp-store'
import type { Profile } from '@/lib/types'

// Role → dashboard path
const ROLE_HOME: Record<string, string> = {
  farmer:      '/dashboard',
  dealer:      '/dealer/dashboard',
  buyer:       '/buyer/dashboard',
  consumer:    '/consumer',
  field_agent: '/field-agent/dashboard',
  admin:       '/admin/dashboard',
}

export async function GET(request: NextRequest) {
  const requestUrl  = new URL(request.url)
  const code        = requestUrl.searchParams.get('code')
  const oauthError  = requestUrl.searchParams.get('error')

  if (oauthError) {
    const msg = encodeURIComponent(oauthError)
    return NextResponse.redirect(new URL(`/login?error=${msg}`, requestUrl.origin))
  }
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=missing_code', requestUrl.origin))
  }

  const cookieStore = await cookies()

  // Collect any session cookies Supabase writes during the exchange.
  // We apply them to the final redirect response so they reach the browser.
  const pendingCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach((c) => pendingCookies.push(c))
        },
      },
    },
  )

  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError || !data.session) {
    const msg = encodeURIComponent(exchangeError?.message ?? 'session_error')
    return NextResponse.redirect(new URL(`/login?error=${msg}`, requestUrl.origin))
  }

  const { user } = data.session
  const email    = user.email ?? ''
  const fullName = (user.user_metadata?.full_name  as string | undefined) ?? ''
  const avatar   = (user.user_metadata?.avatar_url as string | undefined) ?? null

  // ── Find or create Profile ─────────────────────────────────────────────────
  let profileRow = await prisma.profile.findUnique({ where: { id: user.id } })
  let isNewUser  = false

  if (!profileRow) {
    isNewUser  = true
    profileRow = await prisma.profile.create({
      data: {
        id:        user.id,
        phone:     email,   // used as unique key for OAuth users (no phone number yet)
        email:     email,
        fullName:  fullName,
        role:      'farmer',
        avatarUrl: avatar,
      },
    })
    await prisma.wallet.create({ data: { userId: profileRow.id } })
  } else {
    // Backfill email + avatar for existing OAuth profiles that predate the email column
    const needsUpdate = (!profileRow.avatarUrl && avatar) || (!profileRow.email && email)
    if (needsUpdate) {
      profileRow = await prisma.profile.update({
        where: { id: profileRow.id },
        data:  {
          ...((!profileRow.avatarUrl && avatar) ? { avatarUrl: avatar } : {}),
          ...((!profileRow.email && email)      ? { email }              : {}),
        },
      })
    }
  }

  // ── Build our platform profile object ─────────────────────────────────────
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

  // ── Issue our platform JWT ─────────────────────────────────────────────────
  const iat         = Math.floor(Date.now() / 1000)
  const exp         = iat + 60 * 60 * 24 * 30  // 30 days
  const accessToken = signToken({ id: profile.id, phone: profile.phone, role: profile.role, iat, exp })
  storeSession(accessToken, profile)

  // ── Decide where to send the user ─────────────────────────────────────────
  // New users or users who haven't set their full name yet go through onboarding.
  // Existing users with a complete profile go directly to their dashboard.
  const needsOnboarding = isNewUser || !profileRow.fullName
  const destination     = needsOnboarding
    ? '/onboarding/role'
    : (ROLE_HOME[profile.role] ?? '/dashboard')

  const response = NextResponse.redirect(new URL(destination, requestUrl.origin))

  // Apply Supabase session cookies
  pendingCookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]),
  )

  // Apply our platform access token
  response.cookies.set('agro_access_token', accessToken, {
    httpOnly: true,
    path:     '/',
    maxAge:   60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
  })

  return response
}
