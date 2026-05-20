import type { Metadata } from 'next'
import AnimatedLanding   from '@/components/home/animated-landing'
import FeaturedListings  from '@/components/home/featured-listings'

export const metadata: Metadata = {
  title: 'AgroConnect — Ghana Agricultural Marketplace',
}

export default function LandingPage() {
  return <AnimatedLanding featuredSection={<FeaturedListings />} />
}
