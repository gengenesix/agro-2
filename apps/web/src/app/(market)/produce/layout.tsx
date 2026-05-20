import Link from 'next/link'

export default function ProduceLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-white border-b border-border sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-forest flex items-center justify-center">
              <svg viewBox="0 0 32 32" width="16" height="16" fill="none">
                <path d="M16 4C12 4 9 8 9 12c0 5 7 13 7 13s7-8 7-13c0-4-3-8-7-8Z"
                      fill="oklch(0.88 0.22 120)" />
                <path d="M16 15v7" stroke="oklch(0.88 0.22 120)"
                      strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-bold text-forest text-sm">AgroConnect</span>
          </Link>

          <Link
            href="/produce"
            className="text-xs font-semibold text-muted-foreground hover:text-forest transition-colors"
          >
            Browse marketplace
          </Link>
        </div>
      </header>

      <div className="pb-10">
        {children}
      </div>

      <footer className="bg-forest text-white py-6 mt-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-bold text-sm">AgroConnect</p>
          <p className="text-white/40 text-xs">
            From seed to sale. Every farmer. Every region.
          </p>
        </div>
      </footer>
    </>
  )
}
