import Redis from 'ioredis'
import { env } from './env.js'
import { logger } from './logger.js'

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck:     false,
  lazyConnect:          true,
})

redis.on('error',   (err: Error) => logger.error({ err }, 'Redis error'))
redis.on('connect', ()    => logger.info('Redis connected'))

export async function connectRedis(): Promise<void> {
  await redis.connect()
}
