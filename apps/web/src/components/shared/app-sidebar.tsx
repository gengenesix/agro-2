'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { SettingsIcon, BellIcon } from '@/components/shared/icons'

export interface NavItem {
  href:   string
  label:  string
  Icon:   React.FC<{ size?: number; className?: string }>
  exact?: boolean
}

export interface AppSidebarProps {
  nav:                     NavItem[]
  portalLabel:             string
  collapsed:               boolean
  onToggleCollapse:        () => void
  settingsHref?:           string
  settingsLabel?:          string
  theme?:                  'light' | 'dark'
  unreadNotifications?:    number
  onNotificationsClick?:   () => void
}

const T = {
  light: {
    aside:          'bg-white border-r border-border',
    logo:           'bg-forest',
    logoFill:       'oklch(0.88 0.22 120)',
    brandLabel:     'text-forest',
    portalSub:      'text-muted-foreground',
    activeBg:       'bg-forest text-white',
    idleBg:         'text-muted-foreground hover:text-forest hover:bg-cream',
    divider:        'border-border',
    footerLink:     'text-muted-foreground hover:text-forest hover:bg-cream',
    footerActive:   'bg-forest text-white',
    signout:        'text-muted-foreground hover:bg-red-50 hover:text-red-600',
    toggleBase:     'text-muted-foreground hover:text-forest hover:bg-cream',
    togglePopped:   'bg-white border border-border shadow-sm',
  },
  dark: {
    aside:          'bg-forest border-r border-white/10',
    logo:           'bg-lime',
    logoFill:       'oklch(0.28 0.07 145)',
    brandLabel:     'text-white',
    portalSub:      'text-white/40',
    activeBg:       'bg-white/20 text-white',
    idleBg:         'text-white/60 hover:text-white hover:bg-white/10',
    divider:        'border-white/10',
    footerLink:     'text-white/40 hover:text-white hover:bg-white/10',
    footerActive:   'bg-white/20 text-white',
    signout:        'text-white/40 hover:bg-red-500/20 hover:text-red-300',
    toggleBase:     'text-white/40 hover:text-white hover:bg-white/10',
    togglePopped:   'bg-forest-dark border border-white/20 shadow-sm',
  },
} as const

export function AppSidebar({
  nav,
  portalLabel,
  collapsed,
  onToggleCollapse,
  settingsHref           = '/settings',
  settingsLabel          = 'Settings',
  theme                  = 'light',
  unreadNotifications    = 0,
  onNotificationsClick,
}: AppSidebarProps) {
  const pathname       = usePathname()
  const { logout }     = useAuth()
  const t              = T[theme]

  function isActive(href: string, exact?: boolean): boolean {
    if (exact) return pathname === href
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <aside
      className={`hidden lg:flex flex-col fixed top-0 left-0 h-full z-30
                  transition-all duration-300 ease-in-out ${t.aside}
                  ${collapsed ? 'w-[72px]' : 'w-64'}`}
    >
      {/* Logo + collapse toggle */}
      <div
        className={`border-b ${t.divider} flex items-center relative
                    ${collapsed ? 'justify-center flex-col gap-2 py-4 px-2' : 'justify-between px-5 py-4'}`}
      >
        {!collapsed ? (
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <div className={`w-9 h-9 rounded-lg ${t.logo} flex-shrink-0 flex items-center justify-center`}>
              <svg viewBox="0 0 32 32" width="20" height="20" fill="none">
                <path d="M16 4C12 4 9 8 9 12c0 5 7 13 7 13s7-8 7-13c0-4-3-8-7-8Z" fill={t.logoFill} />
                <path d="M16 15v7" stroke={t.logoFill} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className={`font-bold text-sm leading-none block ${t.brandLabel}`}>AgroConnect</span>
              <span className={`text-[10px] ${t.portalSub}`}>{portalLabel}</span>
            </div>
          </Link>
        ) : (
          <Link href="/"
            className={`w-9 h-9 rounded-lg ${t.logo} flex items-center justify-center flex-shrink-0`}>
            <svg viewBox="0 0 32 32" width="20" height="20" fill="none">
              <path d="M16 4C12 4 9 8 9 12c0 5 7 13 7 13s7-8 7-13c0-4-3-8-7-8Z" fill={t.logoFill} />
            </svg>
          </Link>
        )}

        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`flex items-center justify-center w-7 h-7 rounded-lg transition-colors
                      flex-shrink-0 ${t.toggleBase}
                      ${collapsed ? `absolute top-4 -right-3.5 ${t.togglePopped}` : ''}`}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
               className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}>
            <path d="M10 4L6 8l4 4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Nav items */}
      <nav className={`flex-1 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden
                       ${collapsed ? 'px-2' : 'px-3'}`}>
        {nav.map(({ href, label, Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center rounded-xl transition-colors
                          ${collapsed ? 'justify-center w-full h-11' : 'gap-3 px-3 py-2.5'}
                          ${active ? t.activeBg : t.idleBg}`}
            >
              <Icon size={collapsed ? 20 : 18} className="flex-shrink-0" />
              {!collapsed && <span className="text-sm font-semibold truncate">{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer: notifications + settings + sign out */}
      <div className={`border-t ${t.divider} ${collapsed ? 'p-2' : 'p-3'} space-y-0.5`}>
        {onNotificationsClick && (
          <button
            onClick={onNotificationsClick}
            title={collapsed ? 'Notifications' : undefined}
            className={`flex items-center rounded-xl text-sm font-semibold transition-colors w-full
                        ${collapsed ? 'justify-center h-11' : 'gap-3 px-3 py-2.5'}
                        ${t.footerLink}`}
          >
            <span className="relative flex-shrink-0">
              <BellIcon size={collapsed ? 20 : 18} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px]
                                 font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center
                                 px-1 leading-none">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </span>
            {!collapsed && 'Notifications'}
          </button>
        )}
        <Link
          href={settingsHref}
          title={collapsed ? settingsLabel : undefined}
          className={`flex items-center rounded-xl text-sm font-semibold transition-colors
                      ${collapsed ? 'justify-center w-full h-11' : 'gap-3 px-3 py-2.5'}
                      ${isActive(settingsHref, true) ? t.footerActive : t.footerLink}`}
        >
          <SettingsIcon size={collapsed ? 20 : 18} className="flex-shrink-0" />
          {!collapsed && settingsLabel}
        </Link>

        <button
          onClick={logout}
          title={collapsed ? 'Sign out' : undefined}
          className={`flex items-center rounded-xl text-sm font-semibold transition-colors w-full
                      ${collapsed ? 'justify-center h-11' : 'gap-3 px-3 py-2.5'}
                      ${t.signout}`}
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
               width={collapsed ? 20 : 18} height={collapsed ? 20 : 18}
               className="flex-shrink-0" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 3h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4" />
            <path d="M8 14l4-4-4-4" />
            <path d="M12 10H3" />
          </svg>
          {!collapsed && 'Sign out'}
        </button>
      </div>
    </aside>
  )
}
