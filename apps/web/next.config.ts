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
  generateBuildId: async () => `agroconnect-${Date.now()}`,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'unpkg.com' },
    ],
    localPatterns: [
      { pathname: '/uploads/**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['framer-motion', 'recharts'],
  },
}

export default withPWA(config)
