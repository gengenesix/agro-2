# CLAUDE_API.md — AgroConnect Backend
# Fastify API on Railway — Complete Build Instructions
# Read CLAUDE.md first, then this file.

---

## 1. PROJECT STRUCTURE

```
apps/api/
├── src/
│   ├── app.ts
│   ├── server.ts
│   │
│   ├── config/
│   │   ├── env.ts              Zod-validated — crash on missing
│   │   ├── database.ts         Prisma singleton
│   │   ├── redis.ts            ioredis
│   │   ├── supabase.ts         Admin client (JWT verify only)
│   │   └── logger.ts           Pino
│   │
│   ├── plugins/
│   │   ├── cors.ts
│   │   ├── helmet.ts
│   │   ├── swagger.ts
│   │   ├── authenticate.ts     JWT → profile → attach to req
│   │   └── rateLimit.ts        Redis-backed, per phone/IP
│   │
│   ├── modules/
│   │   ├── auth/               OTP + JWT + profile
│   │   ├── users/              Profile, farmer, dealer, buyer profiles
│   │   ├── listings/           Produce + input listings (CRUD + search)
│   │   ├── pledges/            Harvest Pledge lifecycle
│   │   ├── orders/             Order creation + status management
│   │   ├── payments/           Paystack + wallet + escrow
│   │   ├── bnpl/               Input financing (apply, approve, repay)
│   │   ├── intelligence/       Weather, prices, pest alerts, advisories
│   │   ├── reviews/            Ratings and reviews
│   │   ├── notifications/      In-app + SMS queue
│   │   ├── ussd/               Arkesel USSD session handler
│   │   └── admin/              Verification, disputes, analytics, broadcast
│   │
│   ├── workers/
│   │   ├── index.ts            Start all workers
│   │   ├── sms.worker.ts       Arkesel SMS jobs
│   │   ├── email.worker.ts     Resend email jobs
│   │   ├── payment.worker.ts   Payment verification polling
│   │   ├── score.worker.ts     Nightly AgroScore recalculation
│   │   ├── weather.worker.ts   Open-Meteo fetch + regional alerts
│   │   └── listing.worker.ts   Expiry, price feed update
│   │
│   ├── jobs/
│   │   ├── queues.ts           Define all BullMQ queues
│   │   ├── sms.jobs.ts
│   │   ├── email.jobs.ts
│   │   └── score.jobs.ts
│   │
│   ├── lib/
│   │   ├── paystack.ts         Paystack API wrapper
│   │   ├── arkesel.ts          Arkesel SMS + USSD wrapper
│   │   ├── open-meteo.ts       Weather API (free, no key)
│   │   ├── resend.ts           Email sender
│   │   ├── cache.ts            Redis get/set helpers
│   │   ├── score.ts            AgroScore calculation
│   │   └── errors.ts           Custom error classes
│   │
│   └── types/
│       └── fastify.d.ts        Augment FastifyRequest
│
├── prisma/schema.prisma
├── tests/
├── Dockerfile
├── railway.toml
└── package.json
```

---

## 2. ENV VALIDATION (src/config/env.ts)

```typescript
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV:                  z.enum(['development', 'test', 'production']),
  PORT:                      z.string().default('4000').transform(Number),
  API_URL:                   z.string().url(),
  WEB_URL:                   z.string().url(),
  DATABASE_URL:              z.string().min(1),
  REDIS_URL:                 z.string().min(1),
  SUPABASE_URL:              z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  PAYSTACK_SECRET_KEY:       z.string().startsWith('sk_'),
  PAYSTACK_WEBHOOK_SECRET:   z.string().min(1),
  ARKESEL_API_KEY:           z.string().min(1),
  ARKESEL_SENDER_ID:         z.string().default('AGROCON'),
  RESEND_API_KEY:            z.string().startsWith('re_'),
  JWT_SECRET:                z.string().min(32),
  CORS_ORIGINS:              z.string(),
  SUPER_ADMIN_PHONE:         z.string(),
  PLATFORM_FEE_DIRECT:       z.string().default('0.03').transform(Number),
  PLATFORM_FEE_PLEDGE:       z.string().default('0.025').transform(Number),
  PLATFORM_FEE_INPUT:        z.string().default('0.015').transform(Number),
})

const parsed = envSchema.safeParse(process.env)
if (!parsed.success) {
  console.error('❌ Invalid env vars:', parsed.error.flatten().fieldErrors)
  process.exit(1)
}
export const env = parsed.data
```

---

## 3. AUTHENTICATION MODULE

Phone number is the primary identifier. OTP via Arkesel.

```typescript
// src/modules/auth/auth.service.ts

export async function requestOTP(phone: string) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 min

  // Store OTP in Redis with 10-min TTL
  await cache.set(`otp:${phone}`, otp, 'EX', 600)

  // Send via Arkesel
  await arkesel.sendSMS({
    to: phone,
    message: `Your AgroConnect code: ${otp}. Valid 10 minutes. Do not share.`,
  })

  return { message: 'OTP sent' }
}

export async function verifyOTP(phone: string, otp: string) {
  const stored = await cache.get(`otp:${phone}`)
  if (!stored || stored !== otp) {
    throw new AppError('Invalid or expired OTP', 400)
  }
  await cache.del(`otp:${phone}`)

  // Find or create Supabase Auth user + Prisma profile
  let profile = await prisma.profile.findUnique({ where: { phone } })

  if (!profile) {
    // First time — create Supabase auth user
    const { data: authUser } = await supabase.auth.admin.createUser({
      phone,
      phone_confirm: true,
      user_metadata: { phone },
    })

    profile = await prisma.profile.create({
      data: {
        id: authUser.user!.id,
        phone,
        role: 'farmer', // default, updated in onboarding
        verificationLevel: 'unverified',
        agroScore: 0,
        language: 'en',
      },
    })

    // Create wallet
    await prisma.wallet.create({ data: { userId: profile.id } })
  }

  // Issue JWT via Supabase
  const { data: session } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: `${phone.replace('+', '')}@agroconnect.phone`,
  })

  return { profile, session }
}
```

---

## 4. AGROSCORE CALCULATION (src/lib/score.ts)

```typescript
import { prisma } from '../config/database'

export async function recalculateAgroScore(farmerId: string): Promise<number> {
  const farmer = await prisma.profile.findUnique({
    where: { id: farmerId },
    include: {
      farmerProfile: true,
      ordersAsSeller: { where: { trackingStatus: 'delivered' } },
      bnplApplications: true,
      reviewsReceived: true,
    },
  })

  if (!farmer?.farmerProfile) return 0

  let score = 0
  const fp = farmer.farmerProfile

  // Profile completeness (max 20)
  if (fp.farmName)                     score += 2
  if (fp.farmSizeAcres)                score += 2
  if (fp.gpsLat && fp.gpsLng)          score += 4
  if (fp.farmPhotos.length >= 2)        score += 4
  if (fp.mobileMoneyNumber)            score += 4
  if (fp.nationalId)                   score += 4

  // Verification level (max 30)
  const verificationPts = {
    unverified:     0,
    self_declared:  10,
    field_verified: 20,
    premium:        30,
  }
  score += verificationPts[farmer.verificationLevel]

  // Order history (max 20)
  const completedOrders = farmer.ordersAsSeller.length
  score += Math.round(Math.min(completedOrders / 10, 1) * 20)

  // Repayment history (max 20)
  const totalBNPL = farmer.bnplApplications.length
  if (totalBNPL > 0) {
    const repaid = farmer.bnplApplications.filter(a => a.status === 'repaid').length
    score += Math.round((repaid / totalBNPL) * 20)
  } else {
    score += 10 // neutral if no BNPL history
  }

  // Platform tenure (max 10)
  const months = Math.floor(
    (Date.now() - farmer.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
  )
  score += Math.min(Math.floor(months / 2), 10)

  // Community rating (max 10)
  const reviews = farmer.reviewsReceived
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    score += Math.round((avgRating / 5) * 10)
  }

  const finalScore = Math.min(score, 110)

  await prisma.profile.update({
    where: { id: farmerId },
    data: { agroScore: finalScore },
  })

  return finalScore
}

export function getBNPLTier(score: number): {
  tier: string; maxAmount: number; interestRate: number
} | null {
  if (score >= 90) return { tier: 'commercial',   maxAmount: 50000, interestRate: 0.04 }
  if (score >= 70) return { tier: 'established',  maxAmount: 10000, interestRate: 0.05 }
  if (score >= 50) return { tier: 'grower',        maxAmount: 2000,  interestRate: 0.06 }
  if (score >= 20) return { tier: 'starter',       maxAmount: 500,   interestRate: 0.08 }
  return null
}
```

---

## 5. LISTINGS SERVICE

```typescript
// src/modules/listings/listings.service.ts

export async function searchListings(filters: ListingFilters) {
  const cacheKey = `listings:search:${JSON.stringify(filters)}`
  const cached = await cache.get(cacheKey)
  if (cached) return JSON.parse(cached)

  const {
    page = 1, limit = 12, sector, categorySlug,
    regionId, listingType, maxPrice, minQuantity,
    farmingMethod, deliveryOption, verifiedOnly, search,
    sortBy = 'newest', lat, lng, radiusKm,
  } = filters

  const where = {
    status: 'active' as const,
    ...(sector       && { category: { sector } }),
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(regionId     && { regionId }),
    ...(listingType  && { listingType }),
    ...(maxPrice     && { pricePerUnit: { lte: maxPrice } }),
    ...(farmingMethod && { farmingMethod }),
    ...(verifiedOnly && { seller: { verificationLevel: { not: 'unverified' } } }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } },
        { seller: { fullName: { contains: search, mode: 'insensitive' as const } } },
      ]
    }),
  }

  const orderBy = {
    newest:          { createdAt: 'desc' as const },
    price_low:       { pricePerUnit: 'asc' as const },
    price_high:      { pricePerUnit: 'desc' as const },
    most_viewed:     { viewsCount: 'desc' as const },
    harvest_soonest: { expectedHarvestDate: 'asc' as const },
    top_rated:       { seller: { agroScore: 'desc' as const } },
  }[sortBy]

  const skip = (page - 1) * limit

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      select: {
        id: true, title: true, slug: true, listingType: true,
        quantityAvailable: true, pricePerUnit: true,
        photos: true, farmingMethod: true, deliveryOptions: true,
        expectedHarvestDate: true, depositPercentage: true,
        pledgeStatus: true, status: true, createdAt: true,
        unit: { select: { name: true, abbreviation: true } },
        category: { select: { name: true, sector: true, slug: true } },
        region: { select: { name: true, code: true } },
        district: { select: { name: true } },
        seller: {
          select: {
            id: true, fullName: true, avatarUrl: true,
            verificationLevel: true, agroScore: true,
            _count: { select: { reviewsReceived: true } },
          }
        },
        _count: { select: { inquiries: true } },
      },
    }),
    prisma.listing.count({ where }),
  ])

  const result = {
    listings,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }

  await cache.set(cacheKey, JSON.stringify(result), 'EX', 180) // 3 min cache
  return result
}
```

---

## 6. HARVEST PLEDGE SERVICE

```typescript
// src/modules/pledges/pledges.service.ts

export async function acceptPledge(
  listingId: string,
  buyerId: string,
  quantity: number
) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId, listingType: 'harvest_pledge', status: 'active' },
    include: { seller: { select: { id: true, fullName: true } } },
  })

  if (!listing) throw new AppError('Pledge listing not found', 404)
  if (listing.quantityAvailable < quantity) throw new AppError('Insufficient quantity', 400)

  const subtotal = Number(listing.pricePerUnit) * quantity
  const depositAmount = subtotal * (listing.depositPercentage / 100)
  const platformCommission = subtotal * env.PLATFORM_FEE_PLEDGE
  const totalAmount = subtotal + platformCommission

  // Create order in pending state
  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      buyerId,
      sellerId: listing.sellerId,
      listingId,
      orderType: 'harvest_pledge',
      quantity,
      unitPrice: listing.pricePerUnit,
      subtotal,
      platformCommission,
      totalAmount,
      depositAmount,
      balanceAmount: totalAmount - depositAmount,
      pledgeProgress: 'planted',
      trackingStatus: 'pending',
    },
  })

  // Update listing pledged quantity
  const newAvailable = Number(listing.quantityAvailable) - quantity
  await prisma.listing.update({
    where: { id: listingId },
    data: {
      quantityAvailable: newAvailable,
      pledgeStatus: newAvailable <= 0 ? 'fully_pledged' : 'partially_pledged',
    },
  })

  return { order, depositAmount }
}

export async function updatePledgeProgress(
  orderId: string,
  farmerId: string,
  progress: PledgeProgress
) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, sellerId: farmerId, orderType: 'harvest_pledge' },
  })
  if (!order) throw new AppError('Order not found', 404)

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { pledgeProgress: progress },
    include: { buyer: { select: { id: true, phone: true, fullName: true } } },
  })

  // SMS buyer with update
  await addSMSJob({
    to: updated.buyer.phone,
    message: `AgroConnect: Your pledge order ${order.orderNumber} update: ${PROGRESS_LABELS[progress]}. Track at agroconnect.com.gh`,
  })

  return updated
}

const PROGRESS_LABELS: Record<string, string> = {
  planted:         'Crop has been planted',
  growing:         'Crop is growing well',
  ready_to_harvest:'Crop is ready to harvest',
  harvested:       'Crop has been harvested',
  dispatched:      'Produce dispatched to you',
  delivered:       'Produce delivered',
}

function generateOrderNumber(): string {
  const date = new Date()
  const y = date.getFullYear()
  const seq = Math.floor(Math.random() * 99999).toString().padStart(5, '0')
  return `AC-${y}-${seq}`
}
```

---

## 7. PAYMENT & WALLET SERVICE

```typescript
// src/modules/payments/payments.service.ts

export async function initializePayment(params: {
  orderId: string
  amount: number
  payerId: string
  paymentType: 'deposit' | 'balance' | 'full'
}) {
  const payer = await prisma.profile.findUnique({ where: { id: params.payerId } })
  if (!payer) throw new AppError('User not found', 404)

  const reference = `AC_${params.orderId.slice(0, 8)}_${Date.now()}`

  // Create pending payment record
  await prisma.payment.create({
    data: {
      orderId: params.orderId,
      payerId: params.payerId,
      payeeId: (await prisma.order.findUnique({ where: { id: params.orderId } }))!.sellerId,
      paymentType: params.paymentType,
      amount: params.amount,
      status: 'pending',
      paymentMethod: 'mtn_momo', // updated on webhook
      paystackReference: reference,
    },
  })

  const result = await initializePaystackTransaction({
    email: `${payer.phone.replace('+', '')}@agroconnect.phone`,
    amountGHS: params.amount,
    reference,
    callbackUrl: `${env.WEB_URL}/payments/verify?ref=${reference}`,
    metadata: {
      orderId: params.orderId,
      payerId: params.payerId,
      paymentType: params.paymentType,
    },
  })

  return result
}

export async function processWebhookPayment(paystackData: any) {
  const { reference, metadata, amount, channel } = paystackData

  // IDEMPOTENCY CHECK
  const existing = await prisma.payment.findUnique({
    where: { paystackReference: reference },
  })
  if (existing?.status === 'success') return existing

  const amountGHS = amount / 100

  await prisma.$transaction(async (tx) => {
    // Update payment status
    await tx.payment.update({
      where: { paystackReference: reference },
      data: {
        status: 'success',
        paymentMethod: mapPaystackChannel(channel),
        completedAt: new Date(),
      },
    })

    // Hold funds in escrow (wallet pending balance for seller)
    const order = await tx.order.findUnique({
      where: { id: metadata.orderId },
      select: { sellerId: true, platformCommission: true },
    })

    if (order) {
      await tx.wallet.update({
        where: { userId: order.sellerId },
        data: { pendingBalance: { increment: amountGHS - Number(order.platformCommission) } },
      })

      await tx.walletTransaction.create({
        data: {
          wallet: { connect: { userId: order.sellerId } },
          type: 'escrow_hold',
          amount: amountGHS,
          balanceAfter: 0, // calc separately
          description: `Escrow for order ${metadata.orderId}`,
          orderId: metadata.orderId,
        },
      })
    }
  })

  // Queue SMS to buyer + seller
  await addSMSJob({
    to: metadata.payerPhone,
    message: `AgroConnect: Payment of GHS ${amountGHS.toFixed(2)} confirmed. Order ${reference.slice(0, 15)} is processing.`,
  })
}

function mapPaystackChannel(channel: string): string {
  const map: Record<string, string> = {
    mobile_money: 'mtn_momo',
    card: 'card',
    bank: 'bank',
  }
  return map[channel] ?? 'card'
}
```

---

## 8. WEATHER SERVICE (src/lib/open-meteo.ts)

```typescript
// Open-Meteo is free — no API key required

interface WeatherForecast {
  date: string
  maxTempC: number
  minTempC: number
  precipitationMm: number
  weatherCode: number
  description: string
}

export async function getDistrictForecast(
  lat: number,
  lng: number
): Promise<WeatherForecast[]> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude', lat.toString())
  url.searchParams.set('longitude', lng.toString())
  url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode')
  url.searchParams.set('timezone', 'Africa/Accra')
  url.searchParams.set('forecast_days', '7')

  const response = await fetch(url.toString())
  const data = await response.json()

  return data.daily.time.map((date: string, i: number) => ({
    date,
    maxTempC: data.daily.temperature_2m_max[i],
    minTempC: data.daily.temperature_2m_min[i],
    precipitationMm: data.daily.precipitation_sum[i],
    weatherCode: data.daily.weathercode[i],
    description: weatherCodeToDescription(data.daily.weathercode[i]),
  }))
}

function weatherCodeToDescription(code: number): string {
  if (code === 0)           return 'Clear sky'
  if (code <= 3)            return 'Partly cloudy'
  if (code <= 49)           return 'Foggy conditions'
  if (code <= 67)           return 'Rain expected'
  if (code >= 80 && code <= 82) return 'Rain showers'
  if (code >= 95)           return 'Thunderstorm'
  return 'Mixed conditions'
}

export function assessFarmingConditions(forecast: WeatherForecast[]): {
  alert: boolean; severity: 'info' | 'warning' | 'critical'; message: string
} {
  const avgRain = forecast.reduce((s, d) => s + d.precipitationMm, 0) / 7
  const maxTemp = Math.max(...forecast.map(d => d.maxTempC))

  if (avgRain < 1 && maxTemp > 36) {
    return {
      alert: true, severity: 'critical',
      message: 'Severe dry conditions. Delay planting. Increase irrigation if available.',
    }
  }
  if (avgRain < 3) {
    return {
      alert: true, severity: 'warning',
      message: 'Below-average rainfall expected. Consider delaying planting by 1 week.',
    }
  }
  return { alert: false, severity: 'info', message: 'Favorable growing conditions this week.' }
}
```

---

## 9. USSD HANDLER

```typescript
// src/modules/ussd/ussd.controller.ts
// Arkesel USSD integration

export async function handleUSSDSession(request: FastifyRequest, reply: FastifyReply) {
  const { sessionId, phoneNumber, networkCode, newSession, userInput } = request.body as any
  const phone = `+${phoneNumber}`

  // Get or create USSD session state from Redis
  const stateKey = `ussd:${sessionId}`
  const stateRaw = await cache.get(stateKey)
  const state = stateRaw ? JSON.parse(stateRaw) : { level: 0, data: {} }

  let response = ''
  let endSession = false

  if (newSession === 'true' || state.level === 0) {
    // Main menu
    response = `CON Welcome to AgroConnect\n1. List my produce\n2. Browse inputs\n3. My orders\n4. Market prices\n5. Weather alert\n6. My wallet\n0. Exit`
    state.level = 1
  } else if (state.level === 1) {
    switch (userInput.trim()) {
      case '1':
        response = `CON List Produce\nEnter product name:`
        state.level = 2; state.data.flow = 'list_produce'
        break
      case '4':
        response = `CON Market Prices\nSelect region:\n1. Greater Accra\n2. Ashanti\n3. Eastern\n4. Volta\n5. Northern`
        state.level = 2; state.data.flow = 'market_prices'
        break
      case '5':
        const forecast = await getWeatherForPhone(phone)
        response = `END ${forecast}`
        endSession = true
        break
      case '6':
        const wallet = await getWalletBalanceForPhone(phone)
        response = `END ${wallet}`
        endSession = true
        break
      case '0':
        response = 'END Thank you for using AgroConnect!'
        endSession = true
        break
      default:
        response = 'CON Invalid choice. Please try again.\n1. List produce\n4. Market prices\n5. Weather\n6. Wallet\n0. Exit'
    }
  }
  // ... deeper levels ...

  // Save state
  await cache.set(stateKey, JSON.stringify(state), 'EX', 300) // 5-min session

  reply.header('Content-Type', 'text/plain')
  return reply.send(response)
}

async function getWeatherForPhone(phone: string): Promise<string> {
  const profile = await prisma.profile.findUnique({
    where: { phone },
    include: { region: true },
  })
  if (!profile?.region) return 'Register your region first to get weather alerts.'

  const district = await prisma.district.findFirst({ where: { regionId: profile.regionId! } })
  if (!district) return 'No weather data for your region.'

  const forecast = await getDistrictForecast(
    Number(district.centerLat),
    Number(district.centerLng)
  )
  const assessment = assessFarmingConditions(forecast)
  return `${profile.region.name}: ${assessment.message}`
}
```

---

## 10. ARKESEL SMS SERVICE (src/lib/arkesel.ts)

```typescript
import axios from 'axios'
import { env } from '../config/env'

const arkeselClient = axios.create({
  baseURL: 'https://sms.arkesel.com/api/v2',
  headers: {
    'api-key': env.ARKESEL_API_KEY,
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

export async function sendSMS(params: { to: string; message: string }) {
  const response = await arkeselClient.post('/sms/send', {
    sender: env.ARKESEL_SENDER_ID,
    message: params.message,
    recipients: [params.to],
  })
  return response.data
}

export async function sendBulkSMS(params: {
  recipients: string[]
  message: string
}) {
  const response = await arkeselClient.post('/sms/send', {
    sender: env.ARKESEL_SENDER_ID,
    message: params.message,
    recipients: params.recipients,
  })
  return response.data
}
```

---

## 11. ADMIN BROADCAST SERVICE

```typescript
// src/modules/admin/admin.service.ts (partial)

export async function broadcastMessage(params: {
  message: string
  channels: ('sms' | 'push')[]
  filter: {
    roles?: string[]
    regionIds?: number[]
    sectors?: string[]
  }
}) {
  // Build recipient list
  const where = {
    isActive: true,
    ...(params.filter.roles?.length && { role: { in: params.filter.roles } }),
    ...(params.filter.regionIds?.length && { regionId: { in: params.filter.regionIds } }),
  }

  const users = await prisma.profile.findMany({
    where,
    select: { id: true, phone: true },
  })

  if (params.channels.includes('sms')) {
    // Batch into chunks of 100 (Arkesel limit)
    const chunks = chunkArray(users.map(u => u.phone), 100)
    for (const chunk of chunks) {
      await addSMSJob({ recipients: chunk, message: params.message })
    }
  }

  if (params.channels.includes('push')) {
    // Queue in-app notifications
    for (const user of users) {
      await addNotificationJob({
        userId: user.id,
        type: 'system',
        title: 'AgroConnect',
        body: params.message,
      })
    }
  }

  return { recipientCount: users.length }
}
```

---

## 12. BUILD ORDER

```
Step 1:  Turborepo monorepo setup + pnpm workspaces
Step 2:  packages/database — Prisma schema + migrate
Step 3:  packages/types + packages/validators
Step 4:  Fastify app.ts + server.ts
Step 5:  src/config/env.ts — Zod validation (crash on missing vars)
Step 6:  All config files (database, redis, supabase, logger)
Step 7:  All plugins (cors, helmet, swagger, authenticate, rateLimit)
Step 8:  Verify server starts + /health returns 200
Step 9:  Auth module — requestOTP + verifyOTP + refreshSession
Step 10: Users module — farmer/dealer/buyer profile CRUD
Step 11: Listings module — CRUD + search + filters + categories
Step 12: Pledges module — accept pledge + update progress + dispute
Step 13: Orders module — create + status management + delivery tracking
Step 14: Payments module — Paystack initialize + verify + webhook
Step 15: Wallet module — balance + withdraw + transaction history
Step 16: BNPL module — apply + eligibility + approve + repay
Step 17: Intelligence module — weather + prices + pest alerts
Step 18: Reviews module — create + list + aggregate
Step 19: Notifications module — in-app + SMS queue
Step 20: USSD module — Arkesel session handler
Step 21: Admin module — verify, broadcast, analytics, disputes
Step 22: BullMQ workers (SMS, email, score, weather, payment, listing)
Step 23: Seed data (regions, districts, categories, units)
Step 24: Unit tests for score.ts, payments.service, pledge.service
Step 25: Dockerfile + railway.toml
Step 26: pnpm build — zero TypeScript errors
```
