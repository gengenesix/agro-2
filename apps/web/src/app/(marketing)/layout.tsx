import Link                from 'next/link'
import { LandingNav }     from '@/components/landing/landing-nav'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingNav />
      {children}
      <footer className="bg-forest text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="lg:col-span-1">
              <p className="font-bold text-lg mb-2">AgroConnect</p>
              <p className="text-white/50 text-sm leading-relaxed">
                Ghana's agricultural trading infrastructure. Escrow-backed payments,
                harvest forward contracts, and field-verified produce — every region,
                every sector.
              </p>
            </div>
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">
                Platform
              </p>
              <ul className="space-y-2.5">
                {[
                  ['Marketplace',     '/produce'],
                  ['Harvest Pledges', '/pledges'],
                  ['Agro Inputs',     '/inputs'],
                  ['Market Prices',   '/intelligence'],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href}
                      className="text-white/50 text-sm hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">
                Company
              </p>
              <ul className="space-y-2.5">
                {[
                  ['About Us', '/about'],
                  ['Features', '/features'],
                  ['Contact',  '/contact'],
                  ['Login',    '/login'],
                ].map(([label, href]) => (
                  <li key={href}>
                    <Link href={href}
                      className="text-white/50 text-sm hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-4">
                Reach Us
              </p>
              <ul className="space-y-2.5 text-white/50 text-sm">
                <li>Accra, Greater Accra Region</li>
                <li>info@agroconnect.com.gh</li>
                <li>USSD: *800*456#</li>
                <li className="pt-1 text-white/30 text-xs">All 16 regions · GHS only</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row
                          items-center justify-between gap-3">
            <p className="text-white/30 text-xs">
              &copy; {new Date().getFullYear()} AgroConnect Ghana Ltd. All rights reserved.
            </p>
            <p className="text-white/30 text-xs">
              Registered in Ghana · Ghana Data Protection Act 2012 compliant
            </p>
          </div>
        </div>
      </footer>
    </>
  )
}
