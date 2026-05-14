'use client'

import Link        from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  {
    href:  '/consumer',
    label: 'Shop',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-13 6.5S11.5 20 11.5 20"/>
      </svg>
    ),
  },
  {
    href:  '/consumer/orders',
    label: 'My orders',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
      </svg>
    ),
  },
  {
    href:  '/consumer/notifications',
    label: 'Alerts',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
      </svg>
    ),
  },
  {
    href:  '/settings',
    label: 'Settings',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm7.43-2.45c.04-.32.07-.65.07-.97 0-.32-.03-.66-.07-1l2.14-1.63c.19-.15.24-.42.12-.64l-2.02-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1.01c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98L4.96 5.04c-.23-.09-.49 0-.61.22L2.33 8.72c-.12.21-.08.49.12.64l2.14 1.63c-.04.34-.07.67-.07 1s.03.65.07.97l-2.14 1.66c-.19.15-.24.42-.12.64l2.02 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1.01c.22.08.49 0 .61-.22l2.02-3.46c.12-.22.07-.49-.12-.64l-2.14-1.63z"/>
      </svg>
    ),
  },
]

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-cream pb-20">
      {/* Top bar */}
      <header className="bg-forest text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-lime rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-forest fill-current">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-13 6.5S11.5 20 11.5 20"/>
            </svg>
          </div>
          <span className="font-display font-bold text-base">AgroConnect</span>
        </div>
        <Link href="/produce"
          className="text-xs font-semibold text-white/80 hover:text-white">
          Browse all
        </Link>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 pt-4">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-border z-50
                      flex items-center justify-around h-16 px-2">
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/consumer' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl text-[10px]
                          font-semibold transition-colors ${
                active ? 'text-forest' : 'text-muted-foreground'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
