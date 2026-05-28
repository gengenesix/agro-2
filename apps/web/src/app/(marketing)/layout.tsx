import Link            from 'next/link'
import { LandingNav } from '@/components/landing/landing-nav'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingNav />
      <div className="pt-16">{children}</div>

      <footer style={{ backgroundColor: 'var(--forest)', color: 'white' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">

          {/* Top row */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-14">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div
                  className="w-9 h-9 flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: 'var(--lime)',
                    clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))',
                  }}
                >
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none">
                    <path d="M12 21v-9" stroke="var(--forest)" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M12 12C11 8 8 6 4 6c0 3.5 2.5 6.5 8 6Z" fill="var(--forest)"/>
                    <path d="M12 12c1-4 4-6 8-6 0 3.5-2.5 6.5-8 6Z" fill="var(--forest)" fillOpacity="0.7"/>
                  </svg>
                </div>
                <div className="leading-none">
                  <p className="font-display font-extrabold text-base tracking-tight text-white">
                    Agro<span style={{ color: 'var(--lime)' }}>Connect</span>
                  </p>
                  <p className="text-[9px] font-mono uppercase tracking-widest mt-0.5"
                     style={{ color: 'rgba(255,255,255,0.35)' }}>
                    agroconnect.io
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-xs mb-6"
                 style={{ color: 'rgba(255,255,255,0.45)' }}>
                Trusted infrastructure for cross-border agricultural trade —
                escrow-backed payments, harvest forward contracts, and farmer
                credit built for the world.
              </p>
              {/* Stat pills */}
              <div className="flex flex-wrap gap-2">
                {['54 Nations', '$3.5T Market', 'Multi-FX'].map(s => (
                  <span
                    key={s}
                    className="text-[10px] font-bold px-2.5 py-1"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.07)',
                      color: 'rgba(255,255,255,0.50)',
                      border: '1px solid rgba(255,255,255,0.10)',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-5"
                 style={{ color: 'rgba(255,255,255,0.35)' }}>
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
                      style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-5"
                 style={{ color: 'rgba(255,255,255,0.35)' }}>
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
                      style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-5"
                 style={{ color: 'rgba(255,255,255,0.35)' }}>
                Reach Us
              </p>
              <ul className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                <li>Accra, Ghana · Global HQ</li>
                <li>
                  <a href="mailto:info@agroconnect.io" className="hover:text-white transition-colors">
                    info@agroconnect.io
                  </a>
                </li>
                <li>
                  <a href="mailto:trade@agroconnect.io" className="hover:text-white transition-colors">
                    trade@agroconnect.io
                  </a>
                </li>
                <li className="text-xs pt-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  54 AfCFTA Nations · Multi-currency
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
          >
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>
              &copy; {new Date().getFullYear()} AgroConnect Ltd. All rights reserved.
            </p>
            <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.28)' }}>
              agroconnect.io · Pilot market: Ghana
            </p>
          </div>

        </div>
      </footer>
    </>
  )
}
