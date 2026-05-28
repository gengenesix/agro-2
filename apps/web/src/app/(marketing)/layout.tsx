import Link            from 'next/link'
import { LandingNav } from '@/components/landing/landing-nav'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingNav />
      {children}

      <footer style={{ backgroundColor: 'var(--forest)', color: 'white' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">

          {/* Top row */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-14">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                     style={{ backgroundColor: 'var(--lime)' }}>
                  <svg viewBox="0 0 32 32" width="18" height="18" fill="none">
                    <path d="M16 3C11 3 7 7.5 7 12c0 6 9 16 9 16s9-10 9-16c0-4.5-4-9-9-9Z"
                          fill="var(--forest)" />
                  </svg>
                </div>
                <div className="leading-none">
                  <p className="font-display font-extrabold text-base tracking-tight">
                    Agro<span style={{ color: 'var(--lime)' }}>Connect</span>
                  </p>
                  <p className="text-[9px] font-medium uppercase tracking-wide"
                     style={{ color: 'rgba(255,255,255,0.40)' }}>
                    Global Agricultural Trade
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-xs"
                 style={{ color: 'rgba(255,255,255,0.50)' }}>
                Trusted infrastructure for cross-border agricultural trade —
                escrow-backed payments, harvest forward contracts, and farmer
                credit built for the world.
              </p>
            </div>

            {/* Platform */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-5"
                 style={{ color: 'rgba(255,255,255,0.40)' }}>
                Platform
              </p>
              <ul className="space-y-3">
                {[
                  ['Marketplace',         '/marketplace'],
                  ['Harvest Pledges',     '/harvest-pledges'],
                  ['Market Intelligence', '/market-intelligence'],
                  ['Agro Inputs',         '/agro-inputs'],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: 'rgba(255,255,255,0.50)' }}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-5"
                 style={{ color: 'rgba(255,255,255,0.40)' }}>
                Company
              </p>
              <ul className="space-y-3">
                {[
                  ['About Us', '/about'],
                  ['Features', '/features'],
                  ['Contact',  '/contact'],
                  ['Sign In',  '/login'],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href}
                      className="text-sm transition-colors hover:text-white"
                      style={{ color: 'rgba(255,255,255,0.50)' }}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-5"
                 style={{ color: 'rgba(255,255,255,0.40)' }}>
                Reach Us
              </p>
              <ul className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                <li>Accra, Ghana · Global HQ</li>
                <li>info@agroconnect.io</li>
                <li className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
                  54 AfCFTA Nations · Multi-currency
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
               style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
              &copy; {new Date().getFullYear()} AgroConnect Ltd. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
              agroconnect.io · Pilot market: Ghana
            </p>
          </div>

        </div>
      </footer>
    </>
  )
}
