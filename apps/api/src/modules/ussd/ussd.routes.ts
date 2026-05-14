import type { FastifyInstance } from 'fastify'
import { prisma }  from '../../config/database.js'
import { cache }   from '../../lib/cache.js'
import { getDistrictForecast, assessFarmingConditions } from '../../lib/open-meteo.js'

export default async function ussdRoutes(app: FastifyInstance) {
  app.post('/session', async (req, reply) => {
    const { sessionId, phoneNumber, newSession, userInput } = req.body as {
      sessionId:   string
      phoneNumber: string
      networkCode: string
      newSession:  string
      userInput:   string
    }

    const phone    = `+${phoneNumber}`
    const stateKey = `ussd:${sessionId}`
    const raw      = await cache.get(stateKey)
    const state    = raw ? (JSON.parse(raw) as { level: number; data: Record<string, unknown> }) : { level: 0, data: {} }

    let response   = ''
    let endSession = false

    if (newSession === 'true' || state.level === 0) {
      response    = `CON Welcome to AgroConnect\n1. List my produce\n2. Browse inputs\n3. My orders\n4. Market prices\n5. Weather alert\n6. My wallet\n0. Exit`
      state.level = 1
    } else if (state.level === 1) {
      switch (userInput.trim()) {
        case '4': {
          response    = `CON Market Prices\nSelect region:\n1. Greater Accra\n2. Ashanti\n3. Eastern\n4. Volta\n5. Northern`
          state.level = 2
          state.data['flow'] = 'market_prices'
          break
        }
        case '5': {
          const profile = await prisma.profile.findUnique({
            where:   { phone },
            include: { region: true },
          })
          if (!profile?.region) {
            response = 'END Register your region first to get weather alerts.'
          } else {
            const district = await prisma.district.findFirst({ where: { regionId: profile.regionId! } })
            if (!district?.centerLat || !district?.centerLng) {
              response = 'END No weather data available for your region.'
            } else {
              const forecast   = await getDistrictForecast(Number(district.centerLat), Number(district.centerLng))
              const assessment = assessFarmingConditions(forecast)
              response  = `END ${profile.region.name}: ${assessment.message}`
            }
          }
          endSession = true
          break
        }
        case '6': {
          const profile = await prisma.profile.findUnique({ where: { phone }, include: { wallet: true } })
          const balance = profile?.wallet ? Number(profile.wallet.balance).toFixed(2) : '0.00'
          response  = `END AgroConnect Wallet\nBalance: GHS ${balance}\nVisit agroconnect.com.gh to withdraw.`
          endSession = true
          break
        }
        case '0':
          response  = 'END Thank you for using AgroConnect!'
          endSession = true
          break
        default:
          response = `CON Invalid choice. Try again.\n1. List produce\n4. Market prices\n5. Weather\n6. Wallet\n0. Exit`
      }
    }

    if (!endSession) {
      await cache.set(stateKey, JSON.stringify(state), 'EX', 300)
    }

    reply.header('Content-Type', 'text/plain')
    return reply.send(response)
  })
}
