declare module 'next-pwa' {
  import type { NextConfig } from 'next'
  interface PWAConfig {
    dest?: string
    disable?: boolean
    register?: boolean
    skipWaiting?: boolean
    buildExcludes?: RegExp[]
    [key: string]: unknown
  }
  function withPWAInit(config: PWAConfig): (nextConfig: NextConfig) => NextConfig
  export = withPWAInit
}
