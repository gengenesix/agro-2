import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import rateLimit from '@fastify/rate-limit'
import { redis } from '../config/redis.js'
import { env }   from '../config/env.js'

export default fp(async function rateLimitPlugin(app: FastifyInstance) {
  await app.register(rateLimit, {
    redis,
    max:       env.RATE_LIMIT_PUBLIC,
    timeWindow: 60_000,
    keyGenerator: (req) => req.user?.id ?? req.ip,
    errorResponseBuilder: () => ({
      success:    false,
      error:      'Too many requests. Please wait before trying again.',
      statusCode: 429,
    }),
  })
})
