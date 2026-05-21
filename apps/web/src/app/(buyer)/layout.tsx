'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/shared/app-sidebar'
import { BottomNav } from '@/components/shared/navbar'
import {
  HomeIcon, MarketIcon, PledgeIcon, OrdersIcon,
  WalletIcon, ProfileIcon, BellIcon,
} from '@/components/shared/icons'
import type { NavItem } from '@/components/shared/app-sidebar'

const NAV: NavItem[] = [
  { href: '/buyer/dashboard',   label: 'Dashboard',    Icon: HomeIcon,   exact: true },
  { href: '/buyer/marketplace', label: 'Marketplace',  Icon: MarketIcon              },
  { href: '/buyer/pledges',     label: 'Pledges',      Icon: PledgeIcon              },
  { href: '/buyer/orders',      label: 'My Orders',    Icon: OrdersIcon              },
  { href: '/buyer/alerts',      label: 'Price Alerts', Icon: BellIcon                },
  { href: '/buyer/wallet',      label: 'Wallet',       Icon: WalletIcon              },
  { href: '/buyer/profile',     label: 'Profile',      Icon: ProfileIcon             },
]

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-cream">
      <AppSidebar
        nav={NAV}
        portalLabel="Buyer Portal"
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />
      <div className={`flex-1 transition-all duration-300 ease-in-out
                       ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
