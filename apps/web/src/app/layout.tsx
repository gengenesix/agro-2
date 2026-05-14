import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Playfair_Display, Geist_Mono } from 'next/font/google'
import { Toaster }     from 'sonner'
import { AuthProvider } from '@/context/auth-context'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets:  ['latin'],
  variable: '--font-plus-jakarta',
  weight:   ['400', '500', '600', '700', '800'],
  display:  'swap',
})

const playfair = Playfair_Display({
  subsets:  ['latin'],
  variable: '--font-playfair',
  weight:   ['700', '800'],
  display:  'swap',
})

const geistMono = Geist_Mono({
  subsets:  ['latin'],
  variable: '--font-geist-mono',
  weight:   ['400', '500', '700'],
  display:  'swap',
})

export const metadata: Metadata = {
  title:       { template: '%s | AgroConnect', default: 'AgroConnect — From Seed to Sale' },
  description: "Ghana's agricultural marketplace. Buy produce, sell harvests, access credit. Every farmer. Every region.",
  metadataBase: new URL('https://agroconnect.com.gh'),
  keywords: ['ghana agriculture', 'farm produce', 'buy maize ghana', 'harvest pledge', 'agro inputs ghana'],
  authors:  [{ name: 'AgroConnect Ghana' }],
  openGraph: {
    siteName: 'AgroConnect',
    type:     'website',
    locale:   'en_GH',
  },
  twitter: {
    card:  'summary_large_image',
    site:  '@agroconnectgh',
    title: 'AgroConnect Ghana',
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
    <html lang="en" className={`${plusJakarta.variable} ${playfair.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily:   'var(--font-plus-jakarta)',
              borderRadius: '0.75rem',
            },
          }}
        />
      </body>
    </html>
  )
}
