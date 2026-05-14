import Fastify    from 'fastify'
import cors       from '@fastify/cors'
import helmet     from '@fastify/helmet'
import multipart  from '@fastify/multipart'
import swagger    from '@fastify/swagger'
import swaggerUi  from '@fastify/swagger-ui'
import { env }   from './config/env.js'
import { logger } from './config/logger.js'
import { AppError } from './lib/errors.js'
import authenticate from './plugins/authenticate.js'
import rateLimitPlugin from './plugins/rateLimit.js'

// Route modules
import authRoutes          from './modules/auth/auth.routes.js'
import usersRoutes         from './modules/users/users.routes.js'
import listingsRoutes      from './modules/listings/listings.routes.js'
import ordersRoutes        from './modules/orders/orders.routes.js'
import paymentsRoutes      from './modules/payments/payments.routes.js'
import bnplRoutes          from './modules/bnpl/bnpl.routes.js'
import intelligenceRoutes  from './modules/intelligence/intelligence.routes.js'
import reviewsRoutes       from './modules/reviews/reviews.routes.js'
import notificationsRoutes from './modules/notifications/notifications.routes.js'
import ussdRoutes          from './modules/ussd/ussd.routes.js'
import adminRoutes         from './modules/admin/admin.routes.js'
import dealerRoutes        from './modules/dealer/dealer.routes.js'
import buyerRoutes         from './modules/buyer/buyer.routes.js'
import uploadsRoutes       from './modules/uploads/uploads.routes.js'
import pledgesRoutes       from './modules/pledges/pledges.routes.js'
import fieldAgentRoutes    from './modules/field-agent/field-agent.routes.js'

export async function buildApp() {
  const app = Fastify({ logger: false })

  // CORS
  await app.register(cors, {
    origin: env.CORS_ORIGINS.split(','),
    credentials: true,
  })

  // Security headers
  await app.register(helmet, { contentSecurityPolicy: false })

  // Multipart (file uploads)
  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024 } })

  // Swagger docs
  await app.register(swagger, {
    openapi: {
      info: { title: 'AgroConnect API', version: '1.0.0', description: "Ghana's Agricultural Network API" },
      servers: [{ url: env.API_URL }],
    },
  })
  await app.register(swaggerUi, { routePrefix: '/docs' })

  // Auth + rate limit
  await app.register(authenticate)
  await app.register(rateLimitPlugin)

  // Health check
  app.get('/health', async () => ({
    status:    'ok',
    timestamp: new Date().toISOString(),
    version:   '1.0.0',
    env:       env.NODE_ENV,
  }))

  // API routes
  const prefix = '/api/v1'
  await app.register(authRoutes,          { prefix: `${prefix}/auth` })
  await app.register(usersRoutes,         { prefix: `${prefix}/users` })
  await app.register(listingsRoutes,      { prefix: `${prefix}/listings` })
  await app.register(ordersRoutes,        { prefix: `${prefix}/orders` })
  await app.register(paymentsRoutes,      { prefix: `${prefix}/payments` })
  await app.register(bnplRoutes,          { prefix: `${prefix}/bnpl` })
  await app.register(intelligenceRoutes,  { prefix: `${prefix}/intelligence` })
  await app.register(reviewsRoutes,       { prefix: `${prefix}/reviews` })
  await app.register(notificationsRoutes, { prefix: `${prefix}/notifications` })
  await app.register(ussdRoutes,          { prefix: `${prefix}/ussd` })
  await app.register(adminRoutes,         { prefix: `${prefix}/admin` })
  await app.register(dealerRoutes,        { prefix: `${prefix}/dealer` })
  await app.register(buyerRoutes,         { prefix: `${prefix}/buyer` })
  await app.register(uploadsRoutes,       { prefix: `${prefix}/uploads` })
  await app.register(pledgesRoutes,       { prefix: `${prefix}/pledges` })
  await app.register(fieldAgentRoutes,    { prefix: `${prefix}/field-agent` })

  // Global error handler
  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success:    false,
        error:      error.message,
        statusCode: error.statusCode,
        code:       error.code,
      })
    }

    logger.error({ err: error }, 'Unhandled error')
    return reply.status(500).send({
      success:    false,
      error:      'Internal server error',
      statusCode: 500,
    })
  })

  return app
}
