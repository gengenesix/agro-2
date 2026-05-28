import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow:     '/',
        disallow:  [
          '/dashboard',
          '/admin',
          '/farmer',
          '/dealer',
          '/buyer',
          '/consumer',
          '/field-agent',
          '/orders',
          '/wallet',
          '/bnpl',
          '/settings',
          '/notifications',
          '/profile',
          '/onboarding',
          '/payments',
          '/api',
        ],
      },
    ],
    sitemap: 'https://agroconnect.io/sitemap.xml',
    host:    'https://agroconnect.io',
  }
}
