import { buildApp }     from './app.js'
import { env }          from './config/env.js'
import { logger }       from './config/logger.js'
import { connectRedis } from './config/redis.js'
import { prisma }       from './config/database.js'

async function start() {
  await connectRedis()
  await prisma.$connect()
  logger.info('Database connected')

  const app = await buildApp()

  await app.listen({ port: env.PORT, host: '0.0.0.0' })
  logger.info(`AgroConnect API listening on port ${env.PORT}`)
}

start().catch((err) => {
  logger.fatal({ err }, 'Failed to start server')
  process.exit(1)
})
