import { NextRequest, NextResponse } from 'next/server'
import { signToken } from '@/lib/otp-store'

// Demo mode: skip real OAuth — create a mock session immediately.
export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin

  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 60 * 60 * 24 * 30

  const profile = {
    id:                'demo-00000000-0000-0000-0000-000000000001',
    phone:             'demo@agroconnect.io',
    email:             'demo@agroconnect.io',
    fullName:          'Demo User',
    role:              'farmer',
    language:          'en',
    regionId:          2,
    districtId:        null,
    community:         'Kumasi',
    avatarUrl:         null,
    isActive:          true,
    agroScore:         72,
    verificationLevel: 'field_verified',
    createdAt:         '2025-01-01T00:00:00.000Z',
  }

  const token = signToken({ ...profile, iat, exp })

  const response = NextResponse.redirect(new URL('/onboarding/role', origin))
  response.cookies.set('agro_access_token', token, {
    httpOnly: true,
    path:     '/',
    maxAge:   60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
  })
  response.cookies.set('agro_role', 'farmer', {
    httpOnly: false,
    path:     '/',
    maxAge:   60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
  })
  return response
}
