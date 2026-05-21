'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AppSidebar } from '@/components/shared/app-sidebar'
import {
  HomeIcon, OrdersIcon, BellIcon, ProfileIcon,
} from '@/components/shared/icons'
import type { NavItem } from '@/components/shared/app-sidebar'

const NAV: NavItem[] = [
  { href: '/consumer',               label: 'Shop',      Icon: HomeIcon,    exact: true },
  { href: '/consumer/orders',        label: 'My Orders', Icon: OrdersIcon               },
  { href: '/consumer/notifications', label: 'Alerts',    Icon: BellIcon                 },
  { href: '/consumer/profile',       label: 'Profile',   Icon: ProfileIcon              },
]

const MOBILE_NAV = [
  {
    href:  '/consumer',
    label: 'Shop',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-13 6.5S11.5 20 11.5 20" />
      </svg>
    ),
  },
  {
    href:  '/consumer/orders',
    label: 'My orders',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z" />
      </svg>
    ),
  },
  {
    href:  '/consumer/notifications',
    label: 'Alerts',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
      </svg>
    ),
  },
  {
    href:  '/consumer/profile',
    label: 'Profile',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
]

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  const pathname              = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Desktop sidebar */}
      <AppSidebar
        nav={NAV}
        portalLabel="Consumer"
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />

      <div className={`flex-1 pb-20 lg:pb-0 transition-all duration-300 ease-in-out
                       ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        {/* Mobile-only top bar */}
        <header className="bg-forest text-white px-4 py-3 flex items-center justify-between
                           sticky top-0 z-40 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-lime rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 32 32" width="16" height="16" fill="none">
                <path d="M16 4C12 4 9 8 9 12c0 5 7 13 7 13s7-8 7-13c0-4-3-8-7-8Z"
                      fill="oklch(0.28 0.07 145)" />
              </svg>
            </div>
            <span className="font-display font-bold text-base">AgroConnect</span>
          </div>
          <Link href="/produce" className="text-xs font-semibold text-white/80 hover:text-white">
            Browse all
          </Link>
        </header>

        <main className="px-4 pt-4 lg:px-6 lg:pt-6">
          {children}
        </main>
      </div>

      {/* Mobile-only bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-border z-50
                      flex items-center justify-around h-16 px-2">
        {MOBILE_NAV.map(item => {
          const active = item.href === '/consumer'
            ? pathname === '/consumer'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl text-[10px]
                          font-semibold transition-colors ${
                active ? 'text-forest' : 'text-muted-foreground'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
