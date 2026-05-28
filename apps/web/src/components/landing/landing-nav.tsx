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
      className="fixed top-0 left-0 right-0 z-50 h-16"
      style={{
        backgroundColor: 'var(--forest)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-8 h-8 flex items-center justify-center"
            style={{
              backgroundColor: 'var(--lime)',
              clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))',
            }}
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
              <path d="M12 21v-9" stroke="var(--forest)" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M12 12C11 8 8 6 4 6c0 3.5 2.5 6.5 8 6Z" fill="var(--forest)"/>
              <path d="M12 12c1-4 4-6 8-6 0 3.5-2.5 6.5-8 6Z" fill="var(--forest)" fillOpacity="0.7"/>
            </svg>
          </div>
          <div>
            <span
              className="font-display font-extrabold block"
              style={{ fontSize: '0.95rem', color: 'white', letterSpacing: '-0.03em', lineHeight: 1.1 }}
            >
              AgroConnect
            </span>
            <span
              className="block font-mono"
              style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.06em' }}
            >
              agroconnect.io
            </span>
          </div>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className="px-3 py-2 text-[13px] font-semibold transition-colors"
                style={{
                  color: active ? 'var(--lime)' : 'rgba(255,255,255,0.55)',
                  borderBottom: active ? '2px solid var(--lime)' : '2px solid transparent',
                }}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-2">
          {!loading && (
            dashboardPath ? (
              <Link
                href={dashboardPath}
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-bold
                           transition-all hover:opacity-90 active:scale-[0.97]"
                style={{
                  backgroundColor: 'var(--lime)',
                  color: 'var(--forest)',
                  clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                }}
              >
                Dashboard
                <svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor"
                     strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8h10M9 4l4 4-4 4"/>
                </svg>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden sm:block text-[13px] font-semibold transition-colors
                             hover:text-white"
                  style={{ color: 'rgba(255,255,255,0.55)' }}
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 text-[13px] font-bold transition-all hover:opacity-90 active:scale-[0.97]"
                  style={{
                    backgroundColor: 'var(--lime)',
                    color: 'var(--forest)',
                    clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                  }}
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
            className="md:hidden p-2 transition-colors cursor-pointer"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none"
                 stroke="currentColor" strokeWidth="2.25" strokeLinecap="round">
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
          className="md:hidden absolute top-16 left-0 right-0 border-t"
          style={{
            backgroundColor: 'var(--forest-dark)',
            borderColor: 'rgba(255,255,255,0.08)',
          }}
        >
          <div className="px-4 py-3 space-y-0.5">
            {NAV_LINKS.map(({ href, label }) => {
              const active = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between px-4 py-3 text-sm font-semibold
                             transition-colors cursor-pointer"
                  style={{
                    color: active ? 'var(--lime)' : 'rgba(255,255,255,0.65)',
                    backgroundColor: active ? 'rgba(255,255,255,0.05)' : 'transparent',
                    borderLeft: active ? '3px solid var(--lime)' : '3px solid transparent',
                  }}
                >
                  {label}
                  {active && (
                    <svg viewBox="0 0 16 16" width="12" height="12" fill="none"
                         stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8h10M9 4l4 4-4 4"/>
                    </svg>
                  )}
                </Link>
              )
            })}
          </div>
          <div
            className="px-4 pb-4 pt-2 space-y-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
          >
            {!loading && (dashboardPath ? (
              <Link
                href={dashboardPath}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-full py-3 text-sm font-bold
                           transition-all hover:opacity-90"
                style={{
                  backgroundColor: 'var(--lime)',
                  color: 'var(--forest)',
                  clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                }}
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-full py-3 text-sm font-semibold
                             transition-colors"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.75)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-full py-3 text-sm font-bold
                             transition-all hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--lime)',
                    color: 'var(--forest)',
                    clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                  }}
                >
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
