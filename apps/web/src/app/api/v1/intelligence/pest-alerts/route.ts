import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const reports = await prisma.pestReport.findMany({
    where:   { isVerified: true },
    orderBy: { createdAt: 'desc' },
    take:    20,
    include: {
      category: { select: { name: true } },
      region:   { select: { name: true } },
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      alerts: reports.map(r => ({
        id:         r.id,
        pest:       r.pestName,
        crop:       r.category?.name ?? 'General',
        severity:   r.severity as 'low' | 'medium' | 'high',
        region:     r.region?.name ?? 'Unknown',
        message:    r.description ?? `${r.pestName} reported in ${r.region?.name ?? 'your area'}.`,
        reportedAt: r.createdAt.toISOString(),
      })),
    },
  })
}
