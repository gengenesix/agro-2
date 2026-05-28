import { NextRequest, NextResponse } from 'next/server'

// Demo mode: real OAuth callback is not used — redirect to home.
export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin
  return NextResponse.redirect(new URL('/', origin))
}
