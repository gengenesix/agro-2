import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

// Minimum profile fields required before a farmer can request a field agent visit
function missingRequirements(fp: {
  gpsLat:      unknown
  gpsLng:      unknown
  nationalId:  string | null
  farmPhotos:  string[]
}): string[] {
  const missing: string[] = []
  if (fp.gpsLat == null || fp.gpsLng == null) missing.push('GPS farm location')
  if (!fp.nationalId)                          missing.push('Ghana Card number')
  if (fp.farmPhotos.length < 2)               missing.push('at least 2 farm photos')
  return missing
}

export async function PATCH(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  if (profile.role !== 'farmer') {
    return NextResponse.json(
      { success: false, error: 'Only farmers can request field verification.' },
      { status: 403 },
    )
  }

  const fp = await prisma.farmerProfile.findUnique({ where: { userId: profile.id } })
  if (!fp) {
    return NextResponse.json(
      { success: false, error: 'Farm profile not found. Please complete your farm details first.' },
      { status: 404 },
    )
  }

  // Idempotent — if already requested, return the existing timestamp
  if (fp.verificationRequestedAt) {
    return NextResponse.json({
      success: true,
      data: { verificationRequestedAt: fp.verificationRequestedAt.toISOString(), alreadyRequested: true },
    })
  }

  const missing = missingRequirements(fp)
  if (missing.length > 0) {
    return NextResponse.json({
      success: false,
      error:   `Complete these fields before requesting verification: ${missing.join(', ')}.`,
    }, { status: 400 })
  }

  const now = new Date()

  await prisma.farmerProfile.update({
    where: { userId: profile.id },
    data:  { verificationRequestedAt: now },
  })

  return NextResponse.json({
    success: true,
    data: { verificationRequestedAt: now.toISOString(), alreadyRequested: false },
  })
}
