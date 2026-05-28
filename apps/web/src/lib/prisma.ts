import { PrismaClient } from '@/generated/prisma'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

// ── Real client ───────────────────────────────────────────────────────────────

function buildRealClient(url: string): PrismaClient {
  return new PrismaClient({
    datasources: { db: { url } },
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'warn', 'error']
      : ['warn', 'error'],
  })
}

// ── Mock client (no DATABASE_URL) ─────────────────────────────────────────────
// Returns safe empty results for every Prisma operation so the app renders
// without a real database (demo / preview deployments).

function buildMockClient(): PrismaClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const modelProxy: any = new Proxy({}, {
    get(_, method: string) {
      if (method === 'then') return undefined
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (..._args: any[]) => {
        if (method === 'findMany')   return Promise.resolve([])
        if (method === 'findUnique') return Promise.resolve(null)
        if (method === 'findFirst')  return Promise.resolve(null)
        if (method === 'count')      return Promise.resolve(0)
        if (method === 'aggregate')  return Promise.resolve({ _avg: {}, _count: 0, _sum: {}, _min: {}, _max: {} })
        if (method === 'groupBy')    return Promise.resolve([])
        if (method === 'create')     return Promise.resolve({ id: 'mock', createdAt: new Date(), updatedAt: new Date() })
        if (method === 'createMany') return Promise.resolve({ count: 0 })
        if (method === 'update')     return Promise.resolve({ id: 'mock', createdAt: new Date(), updatedAt: new Date() })
        if (method === 'updateMany') return Promise.resolve({ count: 0 })
        if (method === 'upsert')     return Promise.resolve({ id: 'mock', createdAt: new Date(), updatedAt: new Date() })
        if (method === 'delete')     return Promise.resolve(null)
        if (method === 'deleteMany') return Promise.resolve({ count: 0 })
        return Promise.resolve(null)
      }
    },
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Proxy({} as PrismaClient, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    get(_: any, prop: string) {
      if (prop === 'then')         return undefined
      if (prop === '$connect')     return () => Promise.resolve()
      if (prop === '$disconnect')  return () => Promise.resolve()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (prop === '$transaction') return (fn: (c: any) => Promise<any>) => fn(modelProxy)
      return modelProxy
    },
  })
}

// ── Lazy singleton ────────────────────────────────────────────────────────────

function getClient(): PrismaClient {
  if (globalThis.__prisma) return globalThis.__prisma
  const url    = process.env.DATABASE_URL
  const client = url ? buildRealClient(url) : buildMockClient()
  if (process.env.NODE_ENV !== 'production') {
    globalThis.__prisma = client
  }
  return client
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return Reflect.get(getClient(), prop)
  },
})
