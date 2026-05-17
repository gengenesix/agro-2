import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { supabase } from '../config/supabase.js'
import { prisma }   from '../config/database.js'
import { cache }    from '../lib/cache.js'
import { logger }   from '../config/logger.js'

export default fp(async function authenticate(app: FastifyInstance) {
  app.decorateRequest('user', null)

  app.addHook('preHandler', async (request) => {
    const token = request.headers.authorization?.replace('Bearer ', '')
    if (!token) return

    try {
      const { data, error } = await supabase.auth.getUser(token)
      if (error || !data.user) return

      const uid      = data.user.id
      const cacheKey = `auth:profile:${uid}`
      const cached   = await cache.getJSON<NonNullable<typeof request.user>>(cacheKey)

      if (cached) {
        if (cached.isBanned) {
          request.user = null
          return
        }
        request.user = cached
        return
      }

      const profile = await prisma.profile.findUnique({
        where:   { id: uid },
        include: { farmerProfile: true, dealerProfile: true, buyerProfile: true },
      })

      if (!profile || !profile.isActive) return
      if (profile.isBanned) {
        logger.warn({ uid }, 'Banned user attempted access')
        return
      }

      await cache.setJSON(cacheKey, profile, 60)
      request.user = profile as unknown as NonNullable<typeof request.user>
    } catch (err) {
      logger.debug({ err }, 'Auth token validation failed')
    }
  })
})
