import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, getSession } from '@/lib/otp-store'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!token) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const payload = verifyToken(token)
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
  }

  const profile = getSession(token)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Session expired' }, { status: 401 })
  }

  return NextResponse.json({ success: true, data: profile })
}
