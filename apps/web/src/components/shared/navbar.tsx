'use client'

import Link     from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import {
  HomeIcon, MarketIcon, PledgeIcon, WalletIcon, ProfileIcon,
} from './icons'

const NAV_ITEMS = [
  { href: '/',          label: 'Home',    Icon: HomeIcon    },
  { href: '/produce',   label: 'Market',  Icon: MarketIcon  },
  { href: '/pledges',   label: 'Pledges', Icon: PledgeIcon  },
  { href: '/wallet',    label: 'Wallet',  Icon: WalletIcon  },
  { href: '/profile',   label: 'Profile', Icon: ProfileIcon },
] as const

export function BottomNav() {
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
              {active && (
                <span className="w-1 h-1 rounded-full bg-lime" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export function TopNav() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-forest flex items-center justify-center">
            <svg viewBox="0 0 32 32" width="20" height="20" fill="none">
              <path d="M16 4C12 4 9 8 9 12c0 5 7 13 7 13s7-8 7-13c0-4-3-8-7-8Z" fill="oklch(0.88 0.22 120)"/>
              <path d="M16 15v7" stroke="oklch(0.88 0.22 120)" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 25h8" stroke="oklch(0.88 0.22 120)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <span className="font-bold text-forest text-base leading-none block">AgroConnect</span>
            <span className="text-[10px] text-muted-foreground">agroconnect.com.gh</span>
          </div>
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
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors
                  ${active ? 'bg-cream text-forest' : 'text-muted-foreground hover:text-forest hover:bg-cream'}`}
              >
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:block px-4 py-2 text-sm font-semibold text-forest
                       hover:bg-cream rounded-xl transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/login"
            className="px-4 py-2 bg-forest text-white text-sm font-bold rounded-xl
                       hover:bg-forest-dark transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}
