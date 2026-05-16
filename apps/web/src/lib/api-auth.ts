import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/otp-store'
import { prisma } from '@/lib/prisma'
import type { NextRequest } from 'next/server'

export async function getAuthProfile(req?: NextRequest) {
  // Server-side: read HttpOnly cookie
  const cookieStore = await cookies()
  const token =
    cookieStore.get('agro_access_token')?.value ??
    req?.headers.get('authorization')?.replace(/^Bearer\s+/, '')

  if (!token) return null

  const payload = verifyToken(token)
  if (!payload || typeof payload.id !== 'string') return null

  return prisma.profile.findUnique({ where: { id: payload.id } })
}
