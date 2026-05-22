'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AppSidebar } from '@/components/shared/app-sidebar'
import { BottomNav } from '@/components/shared/navbar'
import { NotificationPanel } from '@/components/shared/notification-panel'
import {
  HomeIcon, ListProduceIcon, OrdersIcon, WalletIcon,
  ProfileIcon, BuyInputsIcon,
} from '@/components/shared/icons'
import { api } from '@/lib/api'
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
  const [collapsed,   setCollapsed]   = useState(false)
  const [notifOpen,   setNotifOpen]   = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const pathname = usePathname()
  const router   = useRouter()

  useEffect(() => {
    function poll() {
      api.get('/notifications?page=1').then(r => setUnreadCount(r.data.unreadCount ?? 0)).catch(() => {})
    }
    poll()
    const id = setInterval(poll, 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (pathname === '/dealer/profile') {
      // Clear cache so completeness is re-evaluated after they leave
      sessionStorage.removeItem('dealerProfileStatus')
      return
    }

    const cached = sessionStorage.getItem('dealerProfileStatus')
    if (cached === 'complete') return

    api.get('/users/me/dealer-profile')
      .then(r => {
        const d = r.data?.data
        if (d?.businessName && d?.physicalAddress) {
          sessionStorage.setItem('dealerProfileStatus', 'complete')
        } else {
          router.replace('/dealer/profile?setup=1')
        }
      })
      .catch(() => {
        router.replace('/dealer/profile?setup=1')
      })
  }, [pathname, router])

  return (
    <div className="flex min-h-screen bg-cream">
      <AppSidebar
        nav={NAV}
        portalLabel="Dealer Portal"
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(c => !c)}
        unreadNotifications={unreadCount}
        onNotificationsClick={() => setNotifOpen(true)}
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
