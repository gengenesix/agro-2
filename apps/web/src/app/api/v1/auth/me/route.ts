import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ success: true, data: profile })
}
