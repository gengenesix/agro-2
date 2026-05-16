import { createHmac, randomUUID } from 'crypto'
import type { Profile } from '@agroconnect/types'

// ─── OTP store ────────────────────────────────────────────────────────────────

interface OTPEntry {
  code:      string
  role:      string
  expiresAt: number
}

const g = globalThis as typeof globalThis & { __otpStore?: Map<string, OTPEntry> }
const otpMap = (g.__otpStore ??= new Map<string, OTPEntry>())

export function storeOTP(phone: string, code: string, role: string, ttlMs = 600_000): void {
  otpMap.set(phone, { code, role, expiresAt: Date.now() + ttlMs })
}

export function checkOTP(phone: string, code: string): string | null {
  const entry = otpMap.get(phone)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) { otpMap.delete(phone); return null }
  if (entry.code !== code) return null
  otpMap.delete(phone)
  return entry.role
}

// ─── Session store ─────────────────────────────────────────────────────────────

const gs = globalThis as typeof globalThis & { __sessionStore?: Map<string, Profile> }
const sessionMap = (gs.__sessionStore ??= new Map<string, Profile>())

export function storeSession(token: string, profile: Profile): void {
  sessionMap.set(token, profile)
}

export function getSession(token: string): Profile | null {
  return sessionMap.get(token) ?? null
}

// ─── HMAC-JWT helpers ──────────────────────────────────────────────────────────

const SECRET = process.env.JWT_SECRET ?? 'dev-secret-agroconnect-change-in-prod'

function b64(s: string): string {
  return Buffer.from(s).toString('base64url')
}

export function signToken(payload: Record<string, unknown>): string {
  const header = b64(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body   = b64(JSON.stringify(payload))
  const sig    = createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url')
  return `${header}.${body}.${sig}`
}

export function verifyToken(token: string): Record<string, unknown> | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const [header, body, sig] = parts as [string, string, string]
  const expected = createHmac('sha256', SECRET).update(`${header}.${body}`).digest('base64url')
  if (sig !== expected) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as Record<string, unknown>
    if (typeof payload.exp === 'number' && payload.exp < Date.now() / 1000) return null
    return payload
  } catch {
    return null
  }
}

export { randomUUID }
