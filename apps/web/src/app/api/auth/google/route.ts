import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const origin   = new URL(req.url).origin

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo:  `${origin}/api/auth/callback`,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })

  if (error || !data.url) {
    return NextResponse.json(
      { success: false, error: error?.message ?? 'Failed to initiate Google sign-in' },
      { status: 500 },
    )
  }

  return NextResponse.redirect(data.url)
}
