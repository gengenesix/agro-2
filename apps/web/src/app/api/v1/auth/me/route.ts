import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import type { Profile } from '@/lib/types'

export async function GET(req: NextRequest) {
  const row = await getAuthProfile(req)
  if (!row) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const profile: Profile = {
    id:                row.id,
    phone:             row.phone,
    fullName:          row.fullName,
    role:              row.role as Profile['role'],
    language:          row.language as Profile['language'],
    regionId:          row.regionId,
    districtId:        row.districtId,
    community:         row.community,
    avatarUrl:         row.avatarUrl,
    isActive:          row.isActive,
    agroScore:         row.agroScore,
    verificationLevel: row.verificationLevel as Profile['verificationLevel'],
    createdAt:         row.createdAt.toISOString(),
  }

  return NextResponse.json({ success: true, data: profile })
}
