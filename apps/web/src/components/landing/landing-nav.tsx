'use client'

import { useState } from 'react'
import Link         from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth }  from '@/context/auth-context'

const ROLE_HOME: Record<string, string> = {
  farmer:      '/dashboard',
  dealer:      '/dealer/dashboard',
  buyer:       '/buyer/dashboard',
  consumer:    '/consumer',
  field_agent: '/field-agent/dashboard',
  admin:       '/admin/dashboard',
}

const NAV_LINKS = [
  { href: '/marketplace',          label: 'Marketplace'   },
  { href: '/harvest-pledges',      label: 'Pledges'       },
  { href: '/market-intelligence',  label: 'Intelligence'  },
  { href: '/agro-inputs',          label: 'Inputs'        },
  { href: '/about',                label: 'About'         },
]

export function LandingNav() {
  const pathname          = usePathname()
  const { user, loading } = useAuth()
  const [open, setOpen]   = useState(false)
  const dashboardPath     = user ? (ROLE_HOME[user.role] ?? '/dashboard') : null

  return (
    <header className="sticky top-0 z-50 bg-white/96 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'var(--forest)' }}
          >
            <svg viewBox="0 0 32 32" width="18" height="18" fill="none">
              <path d="M16 3C11 3 7 7.5 7 12c0 6 9 16 9 16s9-10 9-16c0-4.5-4-9-9-9Z"
                    fill="var(--lime)" />
              <path d="M16 14v6" stroke="var(--forest)" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="16" cy="11.5" r="2" fill="var(--forest)" />
            </svg>
          </div>
          <div className="leading-none">
            <span className="font-extrabold text-forest text-base tracking-tight block">
              Agro<span style={{ color: 'var(--lime-dark)' }}>Connect</span>
            </span>
            <span className="text-[9px] font-medium text-muted-foreground tracking-wide uppercase">
              Ghana · Seed to Sale
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href}
                className="relative px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 group"
                style={{
                  backgroundColor: active ? 'var(--cream)' : 'transparent',
                  color: active ? 'var(--forest)' : 'var(--muted-foreground)',
                }}
              >
                {label}
                {active && (
                  <span
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ backgroundColor: 'var(--lime-dark)' }}
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-2">
          {!loading && (
            dashboardPath ? (
              <Link href={dashboardPath}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-bold
                           rounded-xl transition-colors"
                style={{ backgroundColor: 'var(--forest)', color: 'white' }}>
                Dashboard
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none"
                     stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </Link>
            ) : (
              <>
                <Link href="/login"
                  className="hidden sm:flex px-4 py-2 text-sm font-semibold rounded-xl transition-colors"
                  style={{ color: 'var(--forest)' }}>
                  Sign In
                </Link>
                <Link href="/login"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-bold
                             rounded-xl transition-colors"
                  style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
                  Get Started
                  <svg viewBox="0 0 16 16" width="12" height="12" fill="none"
                       stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </Link>
              </>
            )
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2 rounded-xl transition-colors"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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
        <div className="md:hidden border-b border-border px-4 py-3 space-y-0.5"
             style={{ backgroundColor: 'var(--card)' }}>
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{
                  backgroundColor: active ? 'var(--forest)' : 'transparent',
                  color: active ? 'white' : 'var(--forest)',
                }}
              >
                {label}
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--lime)' }} />
                )}
              </Link>
            )
          })}
          <div className="pt-2 mt-2 border-t border-border space-y-2">
            {!loading && (dashboardPath ? (
              <Link href={dashboardPath} onClick={() => setOpen(false)}
                className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                style={{ backgroundColor: 'var(--forest)', color: 'white' }}>
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)}
                  className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  style={{ backgroundColor: 'var(--cream)', color: 'var(--forest)' }}>
                  Sign In
                </Link>
                <Link href="/login" onClick={() => setOpen(false)}
                  className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                  style={{ backgroundColor: 'var(--lime)', color: 'var(--forest)' }}>
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
