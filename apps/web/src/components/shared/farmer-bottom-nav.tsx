'use client'

import { useState } from 'react'
import Link         from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth }  from '@/context/auth-context'
import {
  HomeIcon, ListProduceIcon, PlusIcon, OrdersIcon,
  WalletIcon, ProfileIcon, HarvestPledgeIcon, BuyInputsIcon,
  WeatherIcon, BellIcon, SettingsIcon, LogoutIcon, AgroScoreIcon, InputsIcon,
} from './icons'

const PRIMARY = [
  { href: '/dashboard',    label: 'Dashboard', Icon: HomeIcon          },
  { href: '/listings',     label: 'Listings',  Icon: ListProduceIcon   },
  { href: '/listings/new', label: 'New',       Icon: PlusIcon, cta: true },
  { href: '/orders',       label: 'Orders',    Icon: OrdersIcon        },
] as const

const MORE_ITEMS = [
  { href: '/farmer/inputs',label: 'Inputs Market', Icon: InputsIcon        },
  { href: '/my-pledges',   label: 'My Pledges',    Icon: HarvestPledgeIcon },
  { href: '/wallet',       label: 'Wallet',         Icon: WalletIcon        },
  { href: '/bnpl',         label: 'BNPL Credit',    Icon: BuyInputsIcon     },
  { href: '/intelligence', label: 'Intelligence',   Icon: WeatherIcon       },
  { href: '/notifications',label: 'Notifications',  Icon: BellIcon          },
  { href: '/score',        label: 'AgroScore',      Icon: AgroScoreIcon     },
  { href: '/profile',      label: 'Profile',        Icon: ProfileIcon       },
  { href: '/settings',     label: 'Settings',       Icon: SettingsIcon      },
] as const

export function FarmerBottomNav() {
  const pathname          = usePathname()
  const { user, loading, logout } = useAuth()
  const [moreOpen, setMoreOpen] = useState(false)

  if (loading || !user) return null

  return (
    <>
      {/* Backdrop */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More drawer — slides up from the nav */}
      <div
        className={`fixed bottom-16 left-0 right-0 z-50 lg:hidden bg-white rounded-t-2xl
                    border-t border-border shadow-2xl transition-transform duration-300
                    ${moreOpen ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-4 pt-1 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            More options
          </p>
          <div className="grid grid-cols-4 gap-1">
            {MORE_ITEMS.map(({ href, label, Icon }) => {
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl transition-colors
                    ${active ? 'bg-cream text-forest' : 'text-muted-foreground hover:bg-cream hover:text-forest'}`}
                >
                  <Icon size={20} />
                  <span className="text-[10px] font-semibold text-center leading-tight">{label}</span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Sign out */}
        <div className="px-4 pb-5 pt-2 border-t border-border">
          <button
            onClick={() => { setMoreOpen(false); logout() }}
            className="flex items-center gap-2 text-sm font-semibold text-red-500
                       hover:text-red-700 transition-colors w-full px-1 py-2"
          >
            <LogoutIcon size={16} />
            Sign out
          </button>
        </div>
      </div>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md
                      border-t border-border pb-safe lg:hidden">
        <div className="flex items-center justify-around px-1 pt-1.5 pb-1">
          {PRIMARY.map((item) => {
            const { href, label, Icon } = item
            const cta = 'cta' in item && item.cta
            if (cta) {
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-1 px-3 py-1"
                >
                  <span className="w-12 h-12 -mt-5 rounded-2xl bg-forest flex items-center justify-center
                                   shadow-lg shadow-forest/30 active:scale-95 transition-transform">
                    <Icon size={22} className="text-lime" />
                  </span>
                  <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
                </Link>
              )
            }
            const active = href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors min-w-0"
              >
                <span className={`transition-colors ${active ? 'text-forest' : 'text-muted-foreground'}`}>
                  <Icon size={22} />
                </span>
                <span className={`text-[10px] font-semibold transition-colors
                  ${active ? 'text-forest' : 'text-muted-foreground'}`}>
                  {label}
                </span>
                {active && <span className="w-1 h-1 rounded-full bg-lime" />}
              </Link>
            )
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(o => !o)}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors min-w-0"
          >
            <span className={`transition-colors ${moreOpen ? 'text-forest' : 'text-muted-foreground'}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="5"  cy="12" r="1.5" fill="currentColor"/>
                <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                <circle cx="19" cy="12" r="1.5" fill="currentColor"/>
              </svg>
            </span>
            <span className={`text-[10px] font-semibold transition-colors
              ${moreOpen ? 'text-forest' : 'text-muted-foreground'}`}>
              More
            </span>
            {moreOpen && <span className="w-1 h-1 rounded-full bg-lime" />}
          </button>
        </div>
      </nav>
    </>
  )
}
