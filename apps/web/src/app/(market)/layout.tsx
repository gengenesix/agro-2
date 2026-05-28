import { LandingNav }  from '@/components/landing/landing-nav'
import { BottomNav }   from '@/components/shared/navbar'

export default function MarketLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LandingNav />
      <div className="pb-20 lg:pb-0">
        {children}
      </div>
      <BottomNav />
      <footer className="hidden lg:block bg-forest text-white py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-lg">AgroConnect</p>
            <p className="text-white/50 text-sm mt-0.5">From seed to sale. Every farmer. Every region.</p>
          </div>
          <p className="text-white/40 text-xs">
            &copy; {new Date().getFullYear()} AgroConnect Ltd. All rights reserved.
          </p>
        </div>
      </footer>
    </>
  )
}
