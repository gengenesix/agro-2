'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center gap-3 mb-10">
      <div className="w-11 h-11 rounded-xl bg-forest flex items-center justify-center shadow-sm">
        <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
          <path d="M16 4C12 4 9 8 9 12c0 5 7 13 7 13s7-8 7-13c0-4-3-8-7-8Z" fill="oklch(0.88 0.22 120)" />
          <path d="M10 26h12" stroke="oklch(0.88 0.22 120)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M16 15v9" stroke="oklch(0.88 0.22 120)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <p className="font-bold text-forest text-lg leading-none tracking-tight">AgroConnect</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">From seed to sale.</p>
      </div>
    </div>
  )
}

// ─── Google Icon ─────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84Z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z" fill="#EA4335" />
    </svg>
  )
}

// ─── Inner component (uses useSearchParams — must be wrapped in Suspense) ─────

function LoginContent() {
  const searchParams = useSearchParams()
  const error        = searchParams.get('error')
  const next         = searchParams.get('next') ?? ''

  const googleHref = `/api/auth/google${next ? `?next=${encodeURIComponent(next)}` : ''}`

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-[420px]">
        <Logo />

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground
                     hover:text-forest transition-colors mb-6"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15,18 9,12 15,6"/></svg>
          Back to AgroConnect
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-forest mb-2">Sign in</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Use your Google account to sign in or create an AgroConnect account. You will choose your role in the next step.
          </p>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive font-medium">
              {error === 'missing_code'
                ? 'Sign-in was cancelled. Please try again.'
                : error === 'session_error'
                ? 'Could not establish a session. Please try again.'
                : `Sign-in error: ${error}`}
            </p>
          </div>
        )}

        <a
          href={googleHref}
          className="w-full flex items-center justify-center gap-3 py-4 px-5
                     bg-white border-2 border-border rounded-2xl
                     text-forest font-bold text-sm
                     hover:border-forest hover:shadow-sm
                     active:scale-[0.98] transition-all duration-150"
        >
          <GoogleIcon />
          Continue with Google
        </a>

        <p className="mt-6 text-center text-xs text-muted-foreground leading-relaxed">
          By signing in, you agree to the{' '}
          <Link href="/terms" className="underline underline-offset-2 hover:text-forest">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline underline-offset-2 hover:text-forest">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
