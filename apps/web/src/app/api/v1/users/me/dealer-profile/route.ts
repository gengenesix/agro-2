import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const patchSchema = z.object({
  businessName:       z.string().min(2, 'Business name must be at least 2 characters').max(200),
  registrationNumber: z.string().optional().nullable(),
  physicalAddress:    z.string().optional().nullable(),
  mobileMoneyNumber:  z.string().min(1, 'Mobile money number is required'),
  mobileMoneyNetwork: z.enum(['mtn', 'vodafone', 'airteltigo']).optional().nullable(),
  deliveryRadiusKm:   z.coerce.number().int().min(1).max(500).optional(),
  sectorsServed:      z.array(z.string()).optional(),
})

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const dp = await prisma.dealerProfile.findUnique({ where: { userId: profile.id } })
  return NextResponse.json({ success: true, data: dp ?? null })
}

async function upsertDealerProfile(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch { body = {} }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0]
    return NextResponse.json(
      {
        success: false,
        error:   firstError ?? 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    )
  }

  const {
    businessName, registrationNumber, physicalAddress,
    mobileMoneyNumber, mobileMoneyNetwork, deliveryRadiusKm, sectorsServed,
  } = parsed.data

  const dp = await prisma.dealerProfile.upsert({
    where:  { userId: profile.id },
    create: {
      userId:            profile.id,
      businessName,
      registrationNumber: registrationNumber ?? undefined,
      physicalAddress:   physicalAddress    ?? undefined,
      mobileMoneyNumber: mobileMoneyNumber,
      mobileMoneyNetwork: mobileMoneyNetwork ?? undefined,
      deliveryRadiusKm:  deliveryRadiusKm   ?? 20,
      sectorsServed:     sectorsServed      ?? ['inputs'],
    },
    update: {
      businessName,
      ...(registrationNumber !== undefined && { registrationNumber: registrationNumber ?? undefined }),
      ...(physicalAddress    !== undefined && { physicalAddress:    physicalAddress    ?? undefined }),
      mobileMoneyNumber,
      ...(mobileMoneyNetwork !== undefined && { mobileMoneyNetwork: mobileMoneyNetwork ?? undefined }),
      ...(deliveryRadiusKm   !== undefined && { deliveryRadiusKm }),
      ...(sectorsServed      !== undefined && { sectorsServed }),
    },
  })

  return NextResponse.json({ success: true, data: dp })
}

export async function PUT(req: NextRequest)   { return upsertDealerProfile(req) }
export async function PATCH(req: NextRequest) { return upsertDealerProfile(req) }
