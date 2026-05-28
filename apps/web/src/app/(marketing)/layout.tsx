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
                  <p className="font-extrabold text-base tracking-tight">
                    Agro<span style={{ color: 'var(--lime)' }}>Connect</span>
                  </p>
                  <p className="text-[9px] font-medium uppercase tracking-wide"
                     style={{ color: 'rgba(255,255,255,0.40)' }}>
                    Ghana · Seed to Sale
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed max-w-xs"
                 style={{ color: 'rgba(255,255,255,0.50)' }}>
                Ghana&apos;s agricultural trading infrastructure. Escrow-backed payments,
                harvest forward contracts, and field-verified produce — every region, every sector.
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
                <li>Accra, Greater Accra Region</li>
                <li>info@agroconnect.com.gh</li>
                <li className="font-mono font-bold" style={{ color: 'var(--lime)' }}>*800*456#</li>
                <li className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
                  All 16 regions · GHS only
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
               style={{ borderColor: 'rgba(255,255,255,0.10)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
              &copy; {new Date().getFullYear()} AgroConnect Ghana Ltd. All rights reserved.
            </p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.30)' }}>
              Registered in Ghana · Ghana Data Protection Act 2012 compliant
            </p>
          </div>

        </div>
      </footer>
    </>
  )
}
