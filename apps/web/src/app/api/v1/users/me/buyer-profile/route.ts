import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  fullName:            z.string().min(2).max(120).optional(),
  organizationName:    z.string().max(120).optional().nullable(),
  buyerType:           z.enum(['hotel', 'restaurant', 'processor', 'retailer', 'exporter', 'individual']),
  contactPerson:       z.string().max(120).optional().nullable(),
  email:               z.string().email().optional().nullable(),
  regionId:            z.coerce.number().optional().nullable(),
  deliveryAddress:     z.string().max(500).optional().nullable(),
  preferredCategories: z.array(z.string().max(60)).max(30).optional(),
})

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const buyerProfile = await prisma.buyerProfile.findUnique({
    where: { userId: profile.id },
  })

  return NextResponse.json({
    success: true,
    data: buyerProfile ?? {
      organizationName:    null,
      buyerType:           'individual',
      contactPerson:       null,
      email:               null,
      deliveryAddress:     null,
      preferredCategories: [],
      monthlyVolumeEstimate: null,
    },
  })
}

export async function PUT(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch { body = {} }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { fullName, organizationName, buyerType, contactPerson, email, regionId, deliveryAddress, preferredCategories } = parsed.data

  if (fullName || regionId !== undefined) {
    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        ...(fullName     && { fullName }),
        ...(regionId !== undefined && { regionId }),
      },
    })
  }

  const buyerData = {
    buyerType,
    ...(organizationName !== undefined && { organizationName }),
    ...(contactPerson    !== undefined && { contactPerson }),
    ...(email            !== undefined && { email }),
    ...(deliveryAddress  !== undefined && { deliveryAddress }),
    ...(preferredCategories !== undefined && { preferredCategories }),
  }

  await prisma.buyerProfile.upsert({
    where:  { userId: profile.id },
    update: buyerData,
    create: { userId: profile.id, ...buyerData },
  })

  return NextResponse.json({ success: true })
}
