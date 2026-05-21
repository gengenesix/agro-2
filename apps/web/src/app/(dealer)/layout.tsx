'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/shared/app-sidebar'
import { BottomNav } from '@/components/shared/navbar'
import {
  HomeIcon, ListProduceIcon, OrdersIcon, WalletIcon,
  ProfileIcon, BuyInputsIcon,
} from '@/components/shared/icons'
import type { NavItem } from '@/components/shared/app-sidebar'

const NAV: NavItem[] = [
  { href: '/dealer/dashboard', label: 'Dashboard',  Icon: HomeIcon,        exact: true },
  { href: '/dealer/listings',  label: 'Products',   Icon: ListProduceIcon              },
  { href: '/dealer/orders',    label: 'Orders',     Icon: OrdersIcon                   },
  { href: '/dealer/analytics', label: 'Analytics',  Icon: BuyInputsIcon                },
  { href: '/dealer/wallet',    label: 'Wallet',     Icon: WalletIcon                   },
  { href: '/dealer/profile',   label: 'Profile',    Icon: ProfileIcon                  },
]

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-cream">
      <AppSidebar
        nav={NAV}
        portalLabel="Dealer Portal"
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
