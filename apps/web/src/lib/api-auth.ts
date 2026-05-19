import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/otp-store'
import { prisma } from '@/lib/prisma'
import type { NextRequest } from 'next/server'

export async function getAuthProfile(req?: NextRequest) {
  let token: string | undefined

  // ── 1. Route Handler context: read directly from the request object ────────
  // req.cookies is the authoritative source inside Route Handlers (Next.js 15).
  // cookies() from next/headers is designed for Server Components / Actions and
  // is not reliably populated in the Route Handler execution context.
  if (req) {
    token =
      req.cookies.get('agro_access_token')?.value ??
      req.headers.get('authorization')?.replace(/^Bearer\s+/, '')
  }

  // ── 2. Server Component / Server Action fallback ────────────────────────────
  if (!token) {
    try {
      const cookieStore = await cookies()
      token = cookieStore.get('agro_access_token')?.value
    } catch {
      // cookies() throws when called outside a supported async context.
      // Silently swallow so Route Handlers that already found a token don't fail.
    }
  }

  if (!token) return null

  // ── 3. Verify HMAC signature and expiry ────────────────────────────────────
  const payload = verifyToken(token)
  if (!payload || typeof payload.id !== 'string') return null

  // ── 4. Load live profile from DB (single source of truth) ──────────────────
  return prisma.profile.findUnique({ where: { id: payload.id } })
}
