import type { Profile } from '@agroconnect/types'
import 'fastify'

declare module 'fastify' {
  interface FastifyRequest {
    user: (Profile & { farmerProfile?: unknown; dealerProfile?: unknown; buyerProfile?: unknown }) | null
  }
}
