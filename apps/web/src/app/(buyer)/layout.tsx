'use client'

import { useState }       from 'react'
import Link               from 'next/link'
import { usePathname }    from 'next/navigation'
import {
  HomeIcon, MarketIcon, PledgeIcon, OrdersIcon, WalletIcon, ProfileIcon,
  BellIcon, SettingsIcon,
} from '@/components/shared/icons'
import { BottomNav } from '@/components/shared/navbar'

const SIDEBAR_ITEMS = [
  { href: '/buyer/dashboard',   label: 'Dashboard',    Icon: HomeIcon    },
  { href: '/buyer/marketplace', label: 'Marketplace',  Icon: MarketIcon  },
  { href: '/buyer/pledges',     label: 'Pledges',      Icon: PledgeIcon  },
  { href: '/buyer/orders',      label: 'My Orders',    Icon: OrdersIcon  },
  { href: '/buyer/alerts',      label: 'Price Alerts', Icon: BellIcon    },
  { href: '/buyer/wallet',      label: 'Wallet',       Icon: WalletIcon  },
  { href: '/buyer/profile',     label: 'Profile',      Icon: ProfileIcon },
] as const

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const pathname    = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-cream">
      {/* ── Sidebar ── */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-border fixed top-0 left-0 h-full z-30
                    transition-all duration-300 ease-in-out
                    ${collapsed ? 'w-[72px]' : 'w-64'}`}
      >
        {/* Logo + toggle */}
        <div className={`border-b border-border flex items-center
                         ${collapsed ? 'justify-center p-4' : 'justify-between px-5 py-4'}`}>
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-forest flex-shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 32 32" width="20" height="20" fill="none">
                  <path d="M16 4C12 4 9 8 9 12c0 5 7 13 7 13s7-8 7-13c0-4-3-8-7-8Z"
                        fill="oklch(0.88 0.22 120)" />
                  <path d="M16 15v7" stroke="oklch(0.88 0.22 120)" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="min-w-0">
                <span className="font-bold text-forest text-sm leading-none block">AgroConnect</span>
                <span className="text-[10px] text-muted-foreground">Buyer Portal</span>
              </div>
            </Link>
          )}

          {collapsed && (
            <Link href="/" className="w-9 h-9 rounded-lg bg-forest flex items-center justify-center">
              <svg viewBox="0 0 32 32" width="20" height="20" fill="none">
                <path d="M16 4C12 4 9 8 9 12c0 5 7 13 7 13s7-8 7-13c0-4-3-8-7-8Z"
                      fill="oklch(0.88 0.22 120)" />
                <path d="M16 15v7" stroke="oklch(0.88 0.22 120)" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </Link>
          )}

          <button
            onClick={() => setCollapsed(c => !c)}
            className={`flex items-center justify-center w-7 h-7 rounded-lg
                        text-muted-foreground hover:text-forest hover:bg-cream transition-colors
                        ${collapsed ? 'absolute top-4 -right-3.5 bg-white border border-border shadow-sm' : ''}`}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                 className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
              <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Nav items */}
        <nav className={`flex-1 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden
                         ${collapsed ? 'px-2' : 'px-3'}`}>
          {SIDEBAR_ITEMS.map(({ href, label, Icon }) => {
            const active = pathname === href ||
              (href !== '/buyer/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                title={collapsed ? label : undefined}
                className={`flex items-center rounded-xl transition-colors
                  ${collapsed
                    ? 'justify-center w-full h-11'
                    : 'gap-3 px-3 py-2.5'}
                  ${active
                    ? 'bg-forest text-white'
                    : 'text-muted-foreground hover:text-forest hover:bg-cream'}`}
              >
                <Icon size={collapsed ? 20 : 18} className="flex-shrink-0" />
                {!collapsed && (
                  <span className="text-sm font-semibold truncate">{label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Settings footer */}
        <div className={`border-t border-border ${collapsed ? 'p-2' : 'p-3'}`}>
          <Link
            href="/settings"
            title={collapsed ? 'Settings' : undefined}
            className={`flex items-center rounded-xl text-sm font-semibold transition-colors
              ${collapsed ? 'justify-center w-full h-11' : 'gap-3 px-3 py-2.5'}
              ${pathname === '/settings'
                ? 'bg-forest text-white'
                : 'text-muted-foreground hover:text-forest hover:bg-cream'}`}
          >
            <SettingsIcon size={collapsed ? 20 : 18} className="flex-shrink-0" />
            {!collapsed && 'Settings'}
          </Link>
        </div>
      </aside>

      {/* ── Main content — shifts right as sidebar expands/collapses ── */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out
                    ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}
      >
        {children}
      </div>

      <BottomNav />
    </div>
  )
}
