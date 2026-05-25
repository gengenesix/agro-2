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
  { href: '/features',  label: 'Features'    },
  { href: '/about',     label: 'About Us'    },
  { href: '/produce',   label: 'Marketplace' },
  { href: '/contact',   label: 'Contact'     },
]

export function LandingNav() {
  const pathname          = usePathname()
  const { user, loading } = useAuth()
  const [open, setOpen]   = useState(false)
  const dashboardPath     = user ? (ROLE_HOME[user.role] ?? '/dashboard') : null

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-forest flex items-center justify-center">
            <svg viewBox="0 0 32 32" width="20" height="20" fill="none">
              <path d="M16 4C12 4 9 8 9 12c0 5 7 13 7 13s7-8 7-13c0-4-3-8-7-8Z"
                    fill="oklch(0.88 0.22 120)"/>
              <path d="M16 15v7" stroke="oklch(0.88 0.22 120)" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 25h8" stroke="oklch(0.88 0.22 120)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <span className="font-bold text-forest text-base leading-none block">AgroConnect</span>
            <span className="text-[10px] text-muted-foreground leading-none">agroconnect.com.gh</span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors
                  ${active
                    ? 'bg-cream text-forest'
                    : 'text-muted-foreground hover:text-forest hover:bg-cream'}`}>
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Desktop CTA + mobile hamburger */}
        <div className="flex items-center gap-3">
          {!loading && (
            dashboardPath ? (
              <Link href={dashboardPath}
                className="hidden sm:flex px-5 py-2 bg-forest text-white text-sm font-bold
                           rounded-xl hover:bg-forest-dark transition-colors">
                Dashboard
              </Link>
            ) : (
              <Link href="/login"
                className="hidden sm:flex px-5 py-2 bg-forest text-white text-sm font-bold
                           rounded-xl hover:bg-forest-dark transition-colors">
                Sign In
              </Link>
            )
          )}
          <button type="button" onClick={() => setOpen(o => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-forest
                       hover:bg-cream transition-colors">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <><path d="M18 6L6 18"/><path d="M6 6l12 12"/></>
              ) : (
                <><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-white border-b border-border px-4 py-3 space-y-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-forest
                         hover:bg-cream transition-colors">
              {label}
            </Link>
          ))}
          <div className="pt-2 mt-2 border-t border-border">
            {!loading && (dashboardPath ? (
              <Link href={dashboardPath} onClick={() => setOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-bold bg-forest text-white text-center">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" onClick={() => setOpen(false)}
                className="block px-4 py-2.5 rounded-xl text-sm font-bold bg-forest text-white text-center">
                Sign In
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
