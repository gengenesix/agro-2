import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, DM_Sans, Geist_Mono } from 'next/font/google'
import { Toaster }     from 'sonner'
import { AuthProvider } from '@/context/auth-context'
import './globals.css'

const bricolage = Bricolage_Grotesque({
  subsets:  ['latin'],
  variable: '--font-bricolage',
  weight:   ['400', '500', '600', '700', '800'],
  display:  'swap',
})

const dmSans = DM_Sans({
  subsets:  ['latin'],
  variable: '--font-dm-sans',
  weight:   ['400', '500', '600', '700'],
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
  icons:    { apple: '/icons/pwa/icon.svg' },
}

export const viewport: Viewport = {
  themeColor:    '#1a3a24',
  width:         'device-width',
  initialScale:  1,
  maximumScale:  1,
  userScalable:  false,
  viewportFit:   'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bricolage.variable} ${dmSans.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily:   'var(--font-dm-sans)',
              borderRadius: '0.75rem',
            },
          }}
        />
      </body>
    </html>
  )
}
