import type { FastifyInstance } from 'fastify'
import { requestOTP, verifyOTP, getMe } from './auth.service.js'
import { requestOTPSchema, verifyOTPSchema } from '@agroconnect/validators'
import { AuthError } from '../../lib/errors.js'

export default async function authRoutes(app: FastifyInstance) {
  app.post('/request-otp', async (req, reply) => {
    const body = requestOTPSchema.parse(req.body)
    const result = await requestOTP(body.phone)
    return reply.send({ success: true, data: result })
  })

  app.post('/verify-otp', async (req, reply) => {
    const body = verifyOTPSchema.parse(req.body)
    const result = await verifyOTP(body.phone, body.otp)
    return reply.send({ success: true, data: result })
  })

  app.get('/me', async (req, reply) => {
    if (!req.user) throw new AuthError()
    const profile = await getMe(req.user.id)
    return reply.send({ success: true, data: profile })
  })
}
