import { PrismaClient } from '@/generated/prisma'

// In serverless (Vercel) each function instance gets its own globalThis.
// The singleton prevents re-instantiation across hot-reloads in dev only.
// In production each cold start creates exactly one client — correct behaviour.

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

function buildClient(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      '[prisma] DATABASE_URL is not set. ' +
      'Add it to Vercel Environment Variables → ' +
      'postgresql://...@aws-0-eu-west-1.pooler.supabase.com:6543/postgres' +
      '?pgbouncer=true&connection_limit=1',
    )
  }

  return new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'warn', 'error']
      : ['warn', 'error'],
  })
}

export const prisma = globalThis.__prisma ?? buildClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}
