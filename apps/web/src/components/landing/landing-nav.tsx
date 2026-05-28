'use client'

import { useState }     from 'react'
import Link              from 'next/link'
import { usePathname }   from 'next/navigation'
import { useAuth }       from '@/context/auth-context'

const ROLE_HOME: Record<string, string> = {
  farmer:      '/dashboard',
  dealer:      '/dealer/dashboard',
  buyer:       '/buyer/dashboard',
  consumer:    '/consumer',
  field_agent: '/field-agent/dashboard',
  admin:       '/admin/dashboard',
}

const NAV_LINKS = [
  { href: '/marketplace',         label: 'Marketplace'  },
  { href: '/harvest-pledges',     label: 'Pledges'      },
  { href: '/market-intelligence', label: 'Intelligence' },
  { href: '/agro-inputs',         label: 'Inputs'       },
  { href: '/about',               label: 'About'        },
]

export function LandingNav() {
  const pathname          = usePathname()
  const { user, loading } = useAuth()
  const [open, setOpen]   = useState(false)
  const dashboardPath     = user ? (ROLE_HOME[user.role] ?? '/dashboard') : null

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center"
      style={{ backgroundColor: 'var(--forest)' }}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <div
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl"
            style={{
              backgroundColor: 'white',
              border: '1.5px solid rgba(255,255,255,0.20)',
              boxShadow: '0 2px 16px rgba(0,0,0,0.28)',
            }}
          >
            {/* Leaf mark */}
            <svg viewBox="0 0 28 28" width="22" height="22" fill="none">
              <path d="M14 3C9 3 5 7.5 5 12c0 6 9 16 9 16s9-10 9-16c0-4.5-4-9-9-9Z"
                    fill="var(--forest)" />
              <path d="M14 13v5" stroke="var(--lime)" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="14" cy="11" r="2" fill="var(--lime)" />
            </svg>
            <div className="leading-none">
              <span
                className="font-extrabold tracking-tight block"
                style={{ fontSize: '0.9rem', color: 'var(--forest)', letterSpacing: '-0.035em' }}
              >
                Agro<span style={{ color: 'hsl(140,45%,30%)' }}>Connect</span>
              </span>
              <span
                className="block font-semibold uppercase"
                style={{ fontSize: '0.55rem', color: 'hsl(140,15%,55%)', letterSpacing: '0.08em' }}
              >
                Seed to Sale · Ghana
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className="text-sm font-semibold transition-opacity hover:opacity-100"
                style={{
                  color: active ? 'var(--lime)' : 'rgba(255,255,255,0.58)',
                  textDecoration: 'none',
                }}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          {!loading && (
            dashboardPath ? (
              <Link
                href={dashboardPath}
                className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all hover:opacity-90 active:scale-[0.97]"
                style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)', textDecoration: 'none' }}
              >
                Dashboard
                <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor"
                     strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:block text-sm font-semibold transition-opacity hover:opacity-70"
                  style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none' }}
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2 rounded-full text-sm font-bold transition-all hover:opacity-90 active:scale-[0.97]"
                  style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)', textDecoration: 'none' }}
                >
                  Get Started
                </Link>
              </>
            )
          )}

          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
                 stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              {open
                ? <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>
                : <><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></>
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="md:hidden absolute top-16 left-0 right-0 px-5 py-4 space-y-1 border-t"
          style={{ backgroundColor: 'var(--forest-dark)', borderColor: 'rgba(255,255,255,0.08)' }}
        >
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  color: active ? 'var(--lime)' : 'rgba(255,255,255,0.70)',
                  backgroundColor: active ? 'rgba(255,255,255,0.06)' : 'transparent',
                  textDecoration: 'none',
                }}
              >
                {label}
                {active && (
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="var(--lime)"
                       strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                )}
              </Link>
            )
          })}
          <div className="pt-3 mt-2 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {!loading && (dashboardPath ? (
              <Link
                href={dashboardPath}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center px-4 py-3 rounded-full text-sm font-bold"
                style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)', textDecoration: 'none' }}
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}
                  className="flex items-center justify-center px-4 py-2.5 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.80)', textDecoration: 'none' }}>
                  Sign In
                </Link>
                <Link href="/login" onClick={() => setOpen(false)}
                  className="flex items-center justify-center px-4 py-3 rounded-full text-sm font-bold"
                  style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)', textDecoration: 'none' }}>
                  Get Started Free
                </Link>
              </>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
