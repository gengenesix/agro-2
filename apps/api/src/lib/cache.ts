import { redis } from '../config/redis.js'

export const cache = {
  async get(key: string): Promise<string | null> {
    return redis.get(key)
  },

  async set(key: string, value: string, mode: 'EX', seconds: number): Promise<void> {
    await redis.set(key, value, mode, seconds)
  },

  async del(key: string): Promise<void> {
    await redis.del(key)
  },

  async getJSON<T>(key: string): Promise<T | null> {
    const raw = await redis.get(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  },

  async setJSON<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  },

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  },
}
