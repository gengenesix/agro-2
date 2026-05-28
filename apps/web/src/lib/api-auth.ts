import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/otp-store'
import type { NextRequest } from 'next/server'
import type { Profile } from '@/lib/types'

export async function getAuthProfile(req?: NextRequest): Promise<Profile | null> {
  let token: string | undefined

  if (req) {
    token =
      req.cookies.get('agro_access_token')?.value ??
      req.headers.get('authorization')?.replace(/^Bearer\s+/, '')
  }

  if (!token) {
    try {
      const cookieStore = await cookies()
      token = cookieStore.get('agro_access_token')?.value
    } catch {
      // Silent — cookies() not available outside async context
    }
  }

  if (!token) return null

  const payload = verifyToken(token)
  if (!payload || typeof payload.id !== 'string') return null

  // Profile is embedded in the JWT payload (no DB required)
  return {
    id:                payload.id,
    phone:             (payload.phone as string) ?? '',
    email:             (payload.email as string | null) ?? null,
    fullName:          (payload.fullName as string) ?? 'Demo User',
    role:              (payload.role as Profile['role']) ?? 'farmer',
    language:          (payload.language as Profile['language']) ?? 'en',
    regionId:          (payload.regionId as number | null) ?? null,
    districtId:        (payload.districtId as number | null) ?? null,
    community:         (payload.community as string | null) ?? null,
    avatarUrl:         (payload.avatarUrl as string | null) ?? null,
    isActive:          (payload.isActive as boolean) ?? true,
    agroScore:         (payload.agroScore as number) ?? 45,
    verificationLevel: (payload.verificationLevel as Profile['verificationLevel']) ?? 'unverified',
    createdAt:         (payload.createdAt as string) ?? new Date().toISOString(),
  }
}
