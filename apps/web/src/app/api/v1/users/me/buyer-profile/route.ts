import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  fullName:         z.string().optional(),
  organizationName: z.string().min(2).max(120),
  buyerType:        z.enum(['hotel', 'restaurant', 'processor', 'retailer', 'exporter', 'individual']),
  regionId:         z.coerce.number().optional().nullable(),
  deliveryAddress:  z.string().optional().nullable(),
})

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

  const { fullName, organizationName, buyerType, regionId, deliveryAddress } = parsed.data

  if (fullName || regionId !== undefined) {
    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        ...(fullName && { fullName }),
        ...(regionId !== undefined && { regionId }),
      },
    })
  }

  const buyerData = {
    organizationName,
    buyerType,
    ...(deliveryAddress !== undefined && { deliveryAddress }),
  }

  await prisma.buyerProfile.upsert({
    where:  { userId: profile.id },
    update: buyerData,
    create: { userId: profile.id, ...buyerData },
  })

  return NextResponse.json({ success: true })
}
