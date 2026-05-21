'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AppSidebar } from '@/components/shared/app-sidebar'
import {
  HomeIcon, ProfileIcon, ListProduceIcon, OrdersIcon,
  BuyInputsIcon, AdminIcon, BellIcon,
} from '@/components/shared/icons'
import type { NavItem } from '@/components/shared/app-sidebar'

const NAV: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard',  Icon: HomeIcon,        exact: true },
  { href: '/admin/users',     label: 'Users',       Icon: ProfileIcon                  },
  { href: '/admin/listings',  label: 'Listings',    Icon: ListProduceIcon              },
  { href: '/admin/orders',    label: 'Orders',      Icon: OrdersIcon                   },
  { href: '/admin/bnpl',      label: 'BNPL Queue',  Icon: BuyInputsIcon                },
  { href: '/admin/disputes',  label: 'Disputes',    Icon: AdminIcon                    },
  { href: '/admin/broadcast', label: 'Broadcast',   Icon: BellIcon                     },
]

const MOBILE_NAV = NAV.slice(0, 4)

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname              = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-forest-dark">
      <AppSidebar
        nav={NAV}
        portalLabel="Admin Panel"
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
        settingsHref="/"
        settingsLabel="Back to Site"
        theme="dark"
      />

      <div className={`flex-1 pb-20 lg:pb-0 transition-all duration-300 ease-in-out
                       ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        {children}
      </div>

      {/* Mobile-only bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-forest border-t border-white/10 z-50
                      flex items-center justify-around h-16 px-2">
        {MOBILE_NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px]
                          font-semibold transition-colors
                          ${active ? 'text-lime' : 'text-white/50'}`}
            >
              <Icon size={20} />
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
