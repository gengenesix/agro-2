import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl  = new URL(request.url)
  const cookieStore = await cookies()

  // Collect cookies that Supabase needs to write (PKCE code verifier, etc.)
  // We apply them to the final redirect so they travel to the browser.
  const pendingCookies: Array<{ name: string; value: string; options: Record<string, unknown> }> = []

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach((c) => pendingCookies.push(c))
        },
      },
    },
  )

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo:  `${requestUrl.origin}/api/auth/callback`,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })

  if (error || !data.url) {
    const msg = encodeURIComponent(error?.message ?? 'Failed to start Google sign-in')
    return NextResponse.redirect(new URL(`/login?error=${msg}`, requestUrl.origin))
  }

  // Redirect to Google, carrying Supabase's PKCE cookies on the response
  const response = NextResponse.redirect(data.url)
  pendingCookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]),
  )
  return response
}
