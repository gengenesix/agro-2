import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google'
import { Toaster }     from 'sonner'
import { AuthProvider } from '@/context/auth-context'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets:  ['latin'],
  variable: '--font-plus-jakarta',
  weight:   ['400', '500', '600', '700', '800'],
  display:  'swap',
})

const geistMono = Geist_Mono({
  subsets:  ['latin'],
  variable: '--font-geist-mono',
  weight:   ['400', '500', '700'],
  display:  'swap',
})

export const metadata: Metadata = {
  title:       { template: '%s | AgroConnect', default: 'AgroConnect — The Global Agricultural Trade Platform' },
  description: 'Trusted infrastructure for cross-border agricultural trade. Escrow-backed payments, harvest forward contracts, and farmer credit — built for the world.',
  metadataBase: new URL('https://agroconnect.io'),
  keywords: ['agricultural trade platform', 'farm produce marketplace', 'harvest pledge', 'agro-inputs', 'farmer credit', 'escrow agricultural', 'AfCFTA trade'],
  authors:  [{ name: 'AgroConnect' }],
  openGraph: {
    siteName: 'AgroConnect',
    type:     'website',
    locale:   'en_US',
  },
  twitter: {
    card:  'summary_large_image',
    site:  '@agroconnect',
    title: 'AgroConnect — Global Agricultural Trade',
  },
  manifest: '/manifest.json',
  // Icons resolved via App Router file convention: app/icon.png + app/apple-icon.png
  // (public/favicon.ico still served at /favicon.ico for legacy requests).
}

export const viewport: Viewport = {
  themeColor:    '#1D402B',
  width:         'device-width',
  initialScale:  1,
  maximumScale:  1,
  userScalable:  false,
  viewportFit:   'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              fontFamily:   'var(--font-plus-jakarta)',
              borderRadius: '1rem',
            },
          }}
        />
      </body>
    </html>
  )
}
