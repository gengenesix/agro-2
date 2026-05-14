import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-white rounded-2xl border border-border p-8 max-w-sm w-full">
        <div className="w-14 h-14 bg-cream-dark rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
               strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-muted-foreground">
            <path d="M9.172 16.172a4 4 0 015.656 0M12 12h.01M9 9h.01M15 9h.01" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <h1 className="font-bold text-forest text-2xl mb-1">404</h1>
        <p className="font-bold text-forest text-lg mb-2">Page not found</p>
        <p className="text-sm text-muted-foreground mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="space-y-2">
          <Link href="/produce"
            className="block w-full py-3 bg-forest text-white font-bold text-sm rounded-xl
                       hover:bg-forest-dark transition-colors">
            Browse marketplace
          </Link>
          <Link href="/"
            className="block w-full py-3 border border-border text-forest font-bold text-sm
                       rounded-xl hover:bg-cream transition-colors">
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}
