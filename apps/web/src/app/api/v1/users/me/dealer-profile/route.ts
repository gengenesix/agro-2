import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  fullName:          z.string().optional(),
  businessName:      z.string().min(2).max(120),
  regionId:          z.coerce.number().optional().nullable(),
  district:          z.string().optional().nullable(),
  businessRegNo:     z.string().optional().nullable(),
  sectors:           z.array(z.string()).optional(),
  mobileMoneyNumber: z.string().optional().nullable(),
  mobileMoneyNetwork:z.string().optional().nullable(),
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

  const { fullName, businessName, regionId, district, businessRegNo, sectors,
          mobileMoneyNumber, mobileMoneyNetwork } = parsed.data

  if (fullName || regionId !== undefined || district !== undefined) {
    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        ...(fullName  && { fullName }),
        ...(regionId  !== undefined && { regionId }),
        ...(district  !== undefined && { community: district ?? undefined }),
      },
    })
  }

  const dealerData = {
    businessName,
    ...(businessRegNo       !== undefined && { registrationNumber: businessRegNo }),
    ...(sectors             !== undefined && { sectorsServed: sectors }),
    ...(mobileMoneyNumber   !== undefined && { mobileMoneyNumber: mobileMoneyNumber ?? '' }),
    ...(mobileMoneyNetwork  !== undefined && { mobileMoneyNetwork }),
  }

  await prisma.dealerProfile.upsert({
    where:  { userId: profile.id },
    update: dealerData,
    create: { userId: profile.id, ...dealerData, mobileMoneyNumber: mobileMoneyNumber ?? '' },
  })

  return NextResponse.json({ success: true })
}
