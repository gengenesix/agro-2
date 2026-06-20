'use client'

import Link     from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import {
  HomeIcon, MarketIcon, PledgeIcon, WalletIcon, ProfileIcon, BellIcon,
} from './icons'

const NAV_ITEMS = [
  { href: '/',          label: 'Home',    Icon: HomeIcon    },
  { href: '/produce',   label: 'Market',  Icon: MarketIcon  },
  { href: '/pledges',   label: 'Pledges', Icon: PledgeIcon  },
  { href: '/wallet',    label: 'Wallet',  Icon: WalletIcon  },
  { href: '/profile',   label: 'Profile', Icon: ProfileIcon },
] as const

interface BottomNavProps {
  unreadCount?: number
  onBellClick?: () => void
}

export function BottomNav({ unreadCount = 0, onBellClick }: BottomNavProps) {
  const pathname    = usePathname()
  const { user, loading } = useAuth()

  if (loading || !user) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md
                    border-t border-border pb-safe lg:hidden">
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl
                         transition-colors min-w-0"
            >
              <span className={`transition-colors ${active ? 'text-forest' : 'text-muted-foreground'}`}>
                <Icon size={22} />
              </span>
              <span className={`text-[10px] font-semibold transition-colors
                ${active ? 'text-forest' : 'text-muted-foreground'}`}>
                {label}
              </span>
              {active && <span className="w-1 h-1 rounded-full bg-lime" />}
            </Link>
          )
        })}
        {onBellClick && (
          <button
            onClick={onBellClick}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors min-w-0"
          >
            <span className="relative text-muted-foreground">
              <BellIcon size={22} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold
                                 rounded-full min-w-[14px] h-3.5 flex items-center justify-center
                                 px-0.5 leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground">Alerts</span>
          </button>
        )}
      </div>
    </nav>
  )
}

const ROLE_HOME: Record<string, string> = {
  farmer:      '/dashboard',
  dealer:      '/dealer/dashboard',
  buyer:       '/buyer/dashboard',
  consumer:    '/consumer',
  field_agent: '/field-agent/dashboard',
  admin:       '/admin/dashboard',
}

export function TopNav() {
  const pathname      = usePathname()
  const { user, loading, logout } = useAuth()

  const dashboardHref = user ? (ROLE_HOME[user.role] ?? '/dashboard') : '/dashboard'

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-cream/85 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2.5">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-forest transition-transform group-hover:scale-105">
            <svg viewBox="0 0 32 32" width="18" height="18" fill="none">
              <path d="M16 4C12 4 9 8 9 12c0 5 7 13 7 13s7-8 7-13c0-4-3-8-7-8Z" fill="var(--lime)" />
              <path d="M16 15v7" stroke="var(--lime)" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M12 25h8" stroke="var(--lime)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-[17px] font-extrabold tracking-tight text-forest">
            AgroConnect
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {[
            { href: '/produce',       label: 'Marketplace' },
            { href: '/pledges',       label: 'Pledges'     },
            { href: '/intelligence',  label: 'Intelligence'},
            { href: '/inputs',        label: 'Inputs'      },
          ].map(({ href, label }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-3.5 py-2 text-sm font-semibold transition-colors ${
                  active ? 'text-forest' : 'text-muted-foreground hover:text-forest'
                }`}
              >
                {label}
                {active && (
                  <span className="absolute inset-x-3.5 -bottom-px h-0.5 rounded-full bg-lime" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Auth area */}
        <div className="flex items-center gap-1.5">
          {!loading && user ? (
            <>
              <Link
                href={dashboardHref}
                className="hidden sm:block max-w-[140px] truncate px-3 py-2 text-sm font-semibold text-forest transition-colors hover:text-forest-dark"
              >
                {user.fullName || user.phone?.replace('+233', '0') || 'Dashboard'}
              </Link>
              <button onClick={logout} className="btn btn-ghost btn-sm">
                Sign out
              </button>
            </>
          ) : !loading ? (
            <>
              <Link
                href="/login"
                className="hidden px-3 py-2 text-sm font-semibold text-forest transition-colors hover:text-forest-dark sm:block"
              >
                Sign in
              </Link>
              <Link href="/login" className="btn btn-forest btn-sm">
                Get Started
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </header>
  )
}
