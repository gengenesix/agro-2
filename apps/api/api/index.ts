import type { IncomingMessage, ServerResponse } from 'node:http'
import { buildApp } from '../src/app.js'
import { connectRedis } from '../src/config/redis.js'
import { prisma } from '../src/config/database.js'

type FastifyApp = Awaited<ReturnType<typeof buildApp>>

let _app: FastifyApp | null = null

async function getApp(): Promise<FastifyApp> {
  if (_app) return _app
  await connectRedis()
  await prisma.$connect()
  _app = await buildApp()
  await _app.ready()
  return _app
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await getApp()
  app.server.emit('request', req, res)
}
