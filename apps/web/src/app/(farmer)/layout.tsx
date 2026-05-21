'use client'

import { useState } from 'react'
import { AppSidebar } from '@/components/shared/app-sidebar'
import { FarmerBottomNav } from '@/components/shared/farmer-bottom-nav'
import {
  HomeIcon, ListProduceIcon, OrdersIcon, WalletIcon, ProfileIcon,
  WeatherIcon, BuyInputsIcon, HarvestPledgeIcon,
} from '@/components/shared/icons'
import type { NavItem } from '@/components/shared/app-sidebar'

const NAV: NavItem[] = [
  { href: '/dashboard',    label: 'Dashboard',    Icon: HomeIcon,          exact: true },
  { href: '/listings',     label: 'My Listings',  Icon: ListProduceIcon               },
  { href: '/orders',       label: 'Orders',       Icon: OrdersIcon                    },
  { href: '/wallet',       label: 'Wallet',       Icon: WalletIcon                    },
  { href: '/bnpl',         label: 'BNPL Credit',  Icon: BuyInputsIcon                 },
  { href: '/my-pledges',   label: 'My Pledges',   Icon: HarvestPledgeIcon             },
  { href: '/intelligence', label: 'Intelligence', Icon: WeatherIcon                   },
  { href: '/profile',      label: 'Profile',      Icon: ProfileIcon                   },
]

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-cream">
      <AppSidebar
        nav={NAV}
        portalLabel="Farmer Portal"
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
      />
      <div className={`flex-1 transition-all duration-300 ease-in-out
                       ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        {children}
      </div>
      <FarmerBottomNav />
    </div>
  )
}
