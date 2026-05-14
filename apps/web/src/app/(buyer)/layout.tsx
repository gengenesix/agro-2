import Link from 'next/link'
import {
  HomeIcon, MarketIcon, PledgeIcon, OrdersIcon, WalletIcon, ProfileIcon,
  BellIcon, SettingsIcon,
} from '@/components/shared/icons'
import { BottomNav } from '@/components/shared/navbar'

const SIDEBAR_ITEMS = [
  { href: '/buyer/dashboard', label: 'Dashboard',   Icon: HomeIcon   },
  { href: '/produce',         label: 'Marketplace', Icon: MarketIcon },
  { href: '/pledges',         label: 'Pledges',     Icon: PledgeIcon },
  { href: '/buyer/orders',    label: 'My Orders',   Icon: OrdersIcon },
  { href: '/buyer/alerts',    label: 'Price Alerts',Icon: BellIcon   },
  { href: '/wallet',          label: 'Wallet',      Icon: WalletIcon },
  { href: '/profile',         label: 'Profile',     Icon: ProfileIcon},
] as const

export default function BuyerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-cream">
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-border fixed top-0 left-0 h-full z-30">
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
              <span className="text-[10px] text-muted-foreground">Buyer Portal</span>
            </div>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {SIDEBAR_ITEMS.map(({ href, label, Icon }) => (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                         text-muted-foreground hover:text-forest hover:bg-cream transition-colors">
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Link href="/profile"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                       text-muted-foreground hover:text-forest hover:bg-cream transition-colors">
            <SettingsIcon size={18} />
            Settings
          </Link>
        </div>
      </aside>
      <div className="flex-1 lg:ml-64">{children}</div>
      <BottomNav />
    </div>
  )
}
