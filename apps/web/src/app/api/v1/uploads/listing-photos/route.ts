import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'

// Demo mode: return placeholder photo URLs instead of uploading to storage.
export async function POST(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({
    success: true,
    data: {
      urls: [
        'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=80&fit=crop',
      ],
    },
  })
}
