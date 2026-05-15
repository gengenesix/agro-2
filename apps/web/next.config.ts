import type { NextConfig } from 'next'
import withPWAInit      from 'next-pwa'

const withPWA = withPWAInit({
  dest:        'public',
  disable:     process.env.NODE_ENV === 'development',
  register:    true,
  skipWaiting: true,
  buildExcludes: [/middleware-manifest\.json$/],
})

const config: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'unpkg.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'recharts'],
  },
}

export default withPWA(config)
