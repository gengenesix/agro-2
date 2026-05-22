'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AppSidebar } from '@/components/shared/app-sidebar'
import { HomeIcon, ProfileIcon, WalletIcon, SettingsIcon, OrdersIcon } from '@/components/shared/icons'
import type { NavItem } from '@/components/shared/app-sidebar'

const NAV: NavItem[] = [
  { href: '/field-agent/dashboard',       label: 'Dashboard',         Icon: HomeIcon,     exact: true },
  { href: '/field-agent/register-farmer', label: 'Register Farmer',   Icon: ProfileIcon               },
  { href: '/field-agent/registrations',   label: 'My Registrations',  Icon: OrdersIcon                },
  { href: '/field-agent/earnings',        label: 'Earnings',          Icon: WalletIcon                },
  { href: '/field-agent/settings',        label: 'Settings',          Icon: SettingsIcon              },
]

const MOBILE_NAV = [
  {
    href:  '/field-agent/dashboard',
    label: 'Dashboard',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>,
  },
  {
    href:  '/field-agent/register-farmer',
    label: 'Register',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>,
  },
  {
    href:  '/field-agent/registrations',
    label: 'Records',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" /></svg>,
  },
  {
    href:  '/field-agent/earnings',
    label: 'Earnings',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" /></svg>,
  },
  {
    href:  '/field-agent/settings',
    label: 'Settings',
    icon: <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>,
  },
]

export default function FieldAgentLayout({ children }: { children: React.ReactNode }) {
  const pathname              = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-cream">
      <AppSidebar
        nav={NAV}
        portalLabel="GENE Agent"
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
        theme="dark"
      />

      <main className={`flex-1 pb-20 lg:pb-0 transition-all duration-300 ease-in-out
                        p-4 lg:p-8 ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        {children}
      </main>

      {/* Mobile-only bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-border z-50
                      flex items-center justify-around h-16 px-2">
        {MOBILE_NAV.map(item => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px]
                          font-semibold transition-colors
                          ${active ? 'text-forest' : 'text-muted-foreground'}`}
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
