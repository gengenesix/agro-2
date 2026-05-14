import Link from 'next/link'
import {
  HomeIcon, ProfileIcon, ListProduceIcon, OrdersIcon,
  BuyInputsIcon, SettingsIcon, AdminIcon, BellIcon,
} from '@/components/shared/icons'

const ADMIN_NAV = [
  { href: '/admin/dashboard', label: 'Dashboard',  Icon: HomeIcon         },
  { href: '/admin/users',     label: 'Users',       Icon: ProfileIcon      },
  { href: '/admin/listings',  label: 'Listings',    Icon: ListProduceIcon  },
  { href: '/admin/orders',    label: 'Orders',      Icon: OrdersIcon       },
  { href: '/admin/bnpl',      label: 'BNPL Queue',  Icon: BuyInputsIcon    },
  { href: '/admin/disputes',  label: 'Disputes',    Icon: AdminIcon        },
  { href: '/admin/broadcast', label: 'Broadcast',   Icon: BellIcon         },
] as const

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-forest-dark">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-forest fixed top-0 left-0 h-full z-30
                        border-r border-white/10">
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-lime flex items-center justify-center">
              <svg viewBox="0 0 32 32" width="20" height="20" fill="none">
                <path d="M16 4C12 4 9 8 9 12c0 5 7 13 7 13s7-8 7-13c0-4-3-8-7-8Z" fill="oklch(0.28 0.07 145)"/>
              </svg>
            </div>
            <div>
              <span className="font-bold text-white text-sm leading-none block">AgroConnect</span>
              <span className="text-white/40 text-[10px]">Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {ADMIN_NAV.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                         text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold
                       text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <SettingsIcon size={18} />
            Back to Site
          </Link>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64">
        {children}
      </div>
    </div>
  )
}
