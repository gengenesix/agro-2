import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  role:       z.string(),
  fullName:   z.string().min(2).max(100),
  regionId:   z.coerce.number().optional().nullable(),
  community:  z.string().optional().nullable(),
  nationalId: z.string().optional().nullable(),
})

export async function POST(req: NextRequest) {
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

  const { fullName, regionId, community, nationalId } = parsed.data

  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      fullName,
      ...(regionId  != null && { regionId }),
      ...(community != null && { community }),
    },
  })

  if (profile.role === 'field_agent' && nationalId) {
    await prisma.farmerProfile.upsert({
      where:  { userId: profile.id },
      update: { nationalId },
      create: { userId: profile.id, nationalId },
    })
  }

  return NextResponse.json({ success: true })
}
