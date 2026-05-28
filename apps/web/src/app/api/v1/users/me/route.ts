import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthProfile } from '@/lib/api-auth'
import { signToken } from '@/lib/otp-store'

const updateSchema = z.object({
  fullName:  z.string().min(2).max(100).optional(),
  avatarUrl: z.string().min(1).optional().nullable(),
  regionId:  z.coerce.number().optional().nullable(),
  community: z.string().optional().nullable(),
  language:  z.enum(['en', 'tw', 'ha', 'ew', 'ga']).optional(),
  role:      z.enum(['farmer', 'dealer', 'buyer', 'consumer', 'field_agent']).optional(),
})

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ success: true, data: profile })
}

async function handleUpdate(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try { body = await req.json() } catch { body = {} }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const d = parsed.data
  const updated = {
    ...profile,
    ...(d.fullName  !== undefined && { fullName:  d.fullName  }),
    ...(d.avatarUrl !== undefined && { avatarUrl: d.avatarUrl }),
    ...(d.regionId  !== undefined && { regionId:  d.regionId  }),
    ...(d.community !== undefined && { community: d.community }),
    ...(d.language  !== undefined && { language:  d.language  }),
    ...(d.role      !== undefined && { role:      d.role      }),
  }

  const iat = Math.floor(Date.now() / 1000)
  const exp = iat + 60 * 60 * 24 * 30
  const newToken = signToken({ ...updated, iat, exp })

  const res = NextResponse.json({ success: true, data: updated })
  res.cookies.set('agro_access_token', newToken, {
    httpOnly: true,
    path:     '/',
    maxAge:   60 * 60 * 24 * 30,
    sameSite: 'lax',
    secure:   process.env.NODE_ENV === 'production',
  })
  if (d.role) {
    res.cookies.set('agro_role', d.role, {
      httpOnly: false,
      path:     '/',
      maxAge:   60 * 60 * 24 * 30,
      sameSite: 'lax',
      secure:   process.env.NODE_ENV === 'production',
    })
  }
  return res
}

export async function PUT(req: NextRequest)   { return handleUpdate(req) }
export async function PATCH(req: NextRequest) { return handleUpdate(req) }
