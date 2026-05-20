import type { Metadata } from 'next'
import AnimatedLanding   from '@/components/home/animated-landing'
import FeaturedListings  from '@/components/home/featured-listings'

export const metadata: Metadata = {
  title: 'AgroConnect — Ghana Agricultural Marketplace',
}

export default function LandingPage() {
  return (
    <>
      <AnimatedLanding featuredSection={<FeaturedListings />} />
      {/* build-probe: AGROCONNECT BUILD V2 - LIVE CHECK */}
      <p className="text-center text-[10px] text-muted-foreground py-2 bg-cream">
        AgroConnect v2 · Build {new Date('2026-05-20').toISOString().slice(0, 10)}
      </p>
    </>
  )
}
