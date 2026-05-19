import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  const fp = await prisma.farmerProfile.findUnique({ where: { userId: profile.id } })
  if (!fp) return NextResponse.json({ success: true, data: null })

  // Prisma returns Decimal fields as Prisma.Decimal objects; coerce to JS numbers
  // so the client receives proper number types (not strings that break .toFixed())
  return NextResponse.json({
    success: true,
    data: {
      ...fp,
      farmSizeAcres: fp.farmSizeAcres != null ? Number(fp.farmSizeAcres) : null,
      gpsLat:        fp.gpsLat        != null ? Number(fp.gpsLat)        : null,
      gpsLng:        fp.gpsLng        != null ? Number(fp.gpsLng)        : null,
    },
  })
}

const schema = z.object({
  fullName:           z.string().min(2).max(100).optional(),
  farmName:           z.string().min(2).max(120).optional().nullable(),
  farmSizeHectares:   z.coerce.number().min(0).optional().nullable(),
  regionId:           z.coerce.number().optional().nullable(),
  district:           z.string().optional().nullable(),
  sectors:            z.array(z.string()).optional(),
  mobileMoneyNumber:  z.string().optional().nullable(),
  mobileMoneyNetwork: z.string().optional().nullable(),
  gpsLat:             z.coerce.number().optional().nullable(),
  gpsLng:             z.coerce.number().optional().nullable(),
  farmPhotos:         z.array(z.string()).optional(),
  nationalId:         z.string().optional().nullable(),
  // KYC fields
  kycFrontPhotoUrl:   z.string().optional().nullable(),
  kycBackPhotoUrl:    z.string().optional().nullable(),
  kycSelfieUrl:       z.string().optional().nullable(),
  kycStatus:          z.enum(['not_submitted', 'pending', 'approved', 'rejected']).optional(),
  kycSubmittedAt:     z.string().optional().nullable(),
  kycRejectedReason:  z.string().optional().nullable(),
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

  const {
    fullName, farmName, farmSizeHectares, regionId, district, sectors,
    mobileMoneyNumber, mobileMoneyNetwork, gpsLat, gpsLng, farmPhotos, nationalId,
    kycFrontPhotoUrl, kycBackPhotoUrl, kycSelfieUrl, kycStatus, kycSubmittedAt, kycRejectedReason,
  } = parsed.data

  // Update main profile if name provided
  if (fullName) {
    await prisma.profile.update({
      where: { id: profile.id },
      data: { fullName, ...(regionId !== undefined && { regionId }), ...(district && { community: district }) },
    })
  }

  // Upsert farmer profile
  const farmerData = {
    ...(farmName            !== undefined && { farmName }),
    ...(farmSizeHectares    !== undefined && { farmSizeAcres: farmSizeHectares ? farmSizeHectares * 2.47105 : null }),
    ...(gpsLat              !== undefined && { gpsLat }),
    ...(gpsLng              !== undefined && { gpsLng }),
    ...(sectors             !== undefined && { sectors }),
    ...(mobileMoneyNumber   !== undefined && { mobileMoneyNumber }),
    ...(mobileMoneyNetwork  !== undefined && { mobileMoneyNetwork }),
    ...(farmPhotos          !== undefined && { farmPhotos }),
    ...(nationalId          !== undefined && { nationalId }),
    ...(kycFrontPhotoUrl    !== undefined && { kycFrontPhotoUrl }),
    ...(kycBackPhotoUrl     !== undefined && { kycBackPhotoUrl }),
    ...(kycSelfieUrl        !== undefined && { kycSelfieUrl }),
    ...(kycStatus           !== undefined && { kycStatus }),
    ...(kycSubmittedAt      !== undefined && { kycSubmittedAt: kycSubmittedAt ? new Date(kycSubmittedAt) : null }),
    ...(kycRejectedReason   !== undefined && { kycRejectedReason }),
  }

  await prisma.farmerProfile.upsert({
    where:  { userId: profile.id },
    update: farmerData,
    create: { userId: profile.id, ...farmerData },
  })

  // Recalculate AgroScore: profile completeness (max 20 pts)
  const fpr = await prisma.farmerProfile.findUnique({ where: { userId: profile.id } })
  const pr  = await prisma.profile.findUnique({ where: { id: profile.id } })

  let completenessScore = 0
  if (pr?.fullName && pr.fullName.length > 1)             completenessScore += 4
  if (fpr?.farmName)                                       completenessScore += 4
  if (fpr?.gpsLat)                                         completenessScore += 4
  if (fpr?.mobileMoneyNumber)                              completenessScore += 4
  if (pr?.regionId)                                        completenessScore += 2
  if (fpr?.farmPhotos && fpr.farmPhotos.length >= 2)       completenessScore += 2

  const verificationPoints =
    pr?.verificationLevel === 'premium'       ? 30 :
    pr?.verificationLevel === 'field_verified'? 20 :
    pr?.verificationLevel === 'self_declared' ? 10 : 0

  const newScore = completenessScore + verificationPoints
  const current  = pr?.agroScore ?? 0
  if (newScore > current) {
    await prisma.profile.update({ where: { id: profile.id }, data: { agroScore: newScore } })
  }

  return NextResponse.json({ success: true })
}
