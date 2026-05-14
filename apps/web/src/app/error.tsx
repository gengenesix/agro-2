'use client'

import { useEffect } from 'react'
import Link          from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env['NODE_ENV'] === 'production') return
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-white rounded-2xl border border-border p-8 max-w-sm w-full">
        <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
               strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 text-red-500">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
        <h1 className="font-bold text-forest text-lg mb-2">Something went wrong</h1>
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          An unexpected error occurred. Our team has been notified.
        </p>
        <div className="space-y-2">
          <button
            onClick={reset}
            className="block w-full py-3 bg-forest text-white font-bold text-sm rounded-xl
                       hover:bg-forest-dark transition-colors"
          >
            Try again
          </button>
          <Link
            href="/"
            className="block w-full py-3 border border-border text-forest font-bold text-sm
                       rounded-xl hover:bg-cream transition-colors"
          >
            Go home
          </Link>
        </div>
        {error.digest && (
          <p className="mt-4 font-mono text-[10px] text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
