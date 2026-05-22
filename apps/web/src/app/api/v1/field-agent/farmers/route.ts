import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const url    = new URL(req.url)
  const filter = url.searchParams.get('filter') ?? 'pending'
  const page   = Math.max(1, Number(url.searchParams.get('page') ?? 1))
  const limit  = 50

  const where =
    filter === 'pending'
      ? {
          role:              'farmer'      as const,
          verificationLevel: 'unverified' as const,
          ...(profile.regionId ? { regionId: profile.regionId } : {}),
        }
      : {
          role:          'farmer' as const,
          farmerProfile: { fieldAgentId: profile.id },
        }

  const [total, farmers] = await Promise.all([
    prisma.profile.count({ where }),
    prisma.profile.findMany({
      where,
      orderBy: { createdAt: 'asc' },
      skip:    (page - 1) * limit,
      take:    limit,
      include: {
        farmerProfile: {
          select: {
            id:              true,
            farmName:        true,
            gpsLat:          true,
            gpsLng:          true,
            fieldVerifiedAt: true,
          },
        },
      },
    }),
  ])

  // Batch-fetch region and district names from scalar IDs
  const regionIds   = [...new Set(farmers.map(f => f.regionId).filter((id): id is number => id != null))]
  const districtIds = [...new Set(farmers.map(f => f.districtId).filter((id): id is number => id != null))]

  const [regions, districts] = await Promise.all([
    regionIds.length   ? prisma.region.findMany({ where: { id: { in: regionIds } } })     : [],
    districtIds.length ? prisma.district.findMany({ where: { id: { in: districtIds } } }) : [],
  ])

  const regionMap   = Object.fromEntries(regions.map(r   => [r.id, r.name]))
  const districtMap = Object.fromEntries(districts.map(d => [d.id, d.name]))

  return NextResponse.json({
    success: true,
    data: {
      farmers: farmers.map(f => ({
        id:              f.farmerProfile?.id ?? f.id,
        userId:          f.id,
        farmName:        f.farmerProfile?.farmName      ?? null,
        gpsLat:          f.farmerProfile?.gpsLat        != null ? Number(f.farmerProfile.gpsLat)  : null,
        gpsLng:          f.farmerProfile?.gpsLng        != null ? Number(f.farmerProfile.gpsLng)  : null,
        fieldVerifiedAt: f.farmerProfile?.fieldVerifiedAt?.toISOString() ?? null,
        createdAt:       f.createdAt.toISOString(),
        user: {
          id:                f.id,
          fullName:          f.fullName,
          phone:             f.phone,
          verificationLevel: f.verificationLevel,
          community:         f.community ?? null,
          region:            f.regionId   ? { name: regionMap[f.regionId]   ?? '' } : null,
          district:          f.districtId ? { name: districtMap[f.districtId] ?? '' } : null,
        },
      })),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  })
}
