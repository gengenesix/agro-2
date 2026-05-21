'use client'

import Link                        from 'next/link'
import { usePathname, useRouter }  from 'next/navigation'
import { createClient }            from '@/lib/supabase'
import {
  HomeIcon, ListProduceIcon, OrdersIcon, WalletIcon, ProfileIcon,
  WeatherIcon, BuyInputsIcon, HarvestPledgeIcon, SettingsIcon,
} from '@/components/shared/icons'
import { FarmerBottomNav } from '@/components/shared/farmer-bottom-nav'

const SIDEBAR_ITEMS = [
  { href: '/dashboard',   label: 'Dashboard',    Icon: HomeIcon          },
  { href: '/listings',    label: 'My Listings',  Icon: ListProduceIcon   },
  { href: '/orders',      label: 'Orders',       Icon: OrdersIcon        },
  { href: '/wallet',      label: 'Wallet',       Icon: WalletIcon        },
  { href: '/bnpl',        label: 'BNPL Credit',  Icon: BuyInputsIcon     },
  { href: '/my-pledges',  label: 'My Pledges',   Icon: HarvestPledgeIcon },
  { href: '/intelligence',label: 'Intelligence', Icon: WeatherIcon       },
  { href: '/profile',     label: 'Profile',      Icon: ProfileIcon       },
] as const

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-cream">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-border fixed top-0 left-0 h-full z-30">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-forest flex items-center justify-center">
              <svg viewBox="0 0 32 32" width="20" height="20" fill="none">
                <path d="M16 4C12 4 9 8 9 12c0 5 7 13 7 13s7-8 7-13c0-4-3-8-7-8Z" fill="oklch(0.88 0.22 120)"/>
                <path d="M16 15v7" stroke="oklch(0.88 0.22 120)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <span className="font-bold text-forest text-sm leading-none block">AgroConnect</span>
              <span className="text-[10px] text-muted-foreground">Farmer Portal</span>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {SIDEBAR_ITEMS.map(({ href, label, Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors
                  ${active
                    ? 'bg-forest text-white'
                    : 'text-muted-foreground hover:text-forest hover:bg-cream'}`}>
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Settings + sign-out */}
        <div className="p-3 border-t border-border space-y-0.5">
          <Link href="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors
              ${pathname === '/settings' ? 'bg-forest text-white' : 'text-muted-foreground hover:text-forest hover:bg-cream'}`}>
            <SettingsIcon size={18} />
            Settings
          </Link>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors w-full
                       text-muted-foreground hover:bg-red-50 hover:text-red-600"
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                 width="18" height="18" className="flex-shrink-0">
              <path d="M13 3h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 14l4-4-4-4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 10H3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 lg:ml-64">
        {children}
      </div>

      {/* Mobile bottom nav */}
      <FarmerBottomNav />
    </div>
  )
}
