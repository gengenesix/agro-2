import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'

// Demo mode: return a placeholder avatar URL instead of uploading to storage.
export async function POST(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({
    success: true,
    data: { url: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=200&q=80&fit=crop' },
  })
}
