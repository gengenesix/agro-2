import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  fullName:  z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  regionId:  z.coerce.number().optional().nullable(),
  community: z.string().optional().nullable(),
  language:  z.enum(['en', 'tw', 'ha', 'ew', 'ga']).optional(),
})

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ success: true, data: profile })
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

  const updated = await prisma.profile.update({
    where: { id: profile.id },
    data:  {
      ...(parsed.data.fullName  !== undefined && { fullName:  parsed.data.fullName  }),
      ...(parsed.data.avatarUrl !== undefined && { avatarUrl: parsed.data.avatarUrl }),
      ...(parsed.data.regionId  !== undefined && { regionId:  parsed.data.regionId  }),
      ...(parsed.data.community !== undefined && { community: parsed.data.community }),
      ...(parsed.data.language  !== undefined && { language:  parsed.data.language  }),
    },
  })

  return NextResponse.json({ success: true, data: updated })
}
