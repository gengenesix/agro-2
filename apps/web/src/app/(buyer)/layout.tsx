'use client'

import { useState, useEffect } from 'react'
import { AppSidebar } from '@/components/shared/app-sidebar'
import { BottomNav } from '@/components/shared/navbar'
import { NotificationPanel } from '@/components/shared/notification-panel'
import { api } from '@/lib/api'
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
        portalLabel="Buyer Portal"
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
        unreadNotifications={unreadCount}
        onNotificationsClick={() => setNotifOpen(true)}
        navBadges={{ '/buyer/orders': badgeCount }}
      />
      <div className={`flex-1 transition-all duration-300 ease-in-out
                       ${collapsed ? 'lg:ml-[72px]' : 'lg:ml-64'}`}>
        {children}
      </div>
      <BottomNav unreadCount={unreadCount} onBellClick={() => setNotifOpen(true)} />
      <NotificationPanel
        isOpen={notifOpen}
        onClose={() => { setNotifOpen(false); setUnreadCount(0) }}
      />
    </div>
  )
}