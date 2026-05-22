'use client'

import { useState, useEffect } from 'react'
import { AppSidebar } from '@/components/shared/app-sidebar'
import { FarmerBottomNav } from '@/components/shared/farmer-bottom-nav'
import { NotificationPanel } from '@/components/shared/notification-panel'
import { api } from '@/lib/api'
import {
  HomeIcon, ListProduceIcon, OrdersIcon, WalletIcon, ProfileIcon,
  WeatherIcon, BuyInputsIcon, HarvestPledgeIcon, InputsIcon,
} from '@/components/shared/icons'
import type { NavItem } from '@/components/shared/app-sidebar'

const NAV: NavItem[] = [
  { href: '/dashboard',     label: 'Dashboard',     Icon: HomeIcon,          exact: true },
  { href: '/listings',      label: 'My Listings',   Icon: ListProduceIcon               },
  { href: '/farmer/inputs', label: 'Inputs Market', Icon: InputsIcon,        exact: true },
  { href: '/farmer/orders', label: 'Orders',        Icon: OrdersIcon                    },
  { href: '/wallet',        label: 'Wallet',        Icon: WalletIcon                    },
  { href: '/bnpl',          label: 'BNPL Credit',   Icon: BuyInputsIcon                 },
  { href: '/my-pledges',    label: 'My Pledges',    Icon: HarvestPledgeIcon             },
  { href: '/intelligence',  label: 'Intelligence',  Icon: WeatherIcon                   },
  { href: '/profile',       label: 'Profile',       Icon: ProfileIcon                   },
]

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const [collapsed,   setCollapsed]   = useState(false)
  const [notifOpen,   setNotifOpen]   = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [badgeCount,  setBadgeCount]  = useState(0)

  useEffect(() => {
    function poll() {
      api.get('/notifications?page=1').then(r => setUnreadCount(r.data.unreadCount ?? 0)).catch(() => {})
      api.get('/navigation/badges').then(r => setBadgeCount(r.data.data?.badgeCount ?? 0)).catch(() => {})
    }
    poll()
    const id = setInterval(poll, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="flex min-h-screen bg-cream">
      <AppSidebar
        nav={NAV}
        portalLabel="Farmer Portal"
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
        unreadNotifications={unreadCount}
        onNotificationsClick={() => setNotifOpen(true)}
        navBadges={{ '/farmer/orders': badgeCount }}
      />
      <div className={`flex-1 transition-all duration-300 ease-in-out
                       ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        {children}
      </div>
      <FarmerBottomNav
        unreadCount={unreadCount}
        onBellClick={() => setNotifOpen(true)}
      />
      {/* onClose resets unreadCount (bell badge) only.
          badgeCount (order nav badge) is sourced from /navigation/badges
          and only drops when the underlying order status changes. */}
      <NotificationPanel
        isOpen={notifOpen}
        onClose={() => { setNotifOpen(false); setUnreadCount(0) }}
      />
    </div>
  )
}
