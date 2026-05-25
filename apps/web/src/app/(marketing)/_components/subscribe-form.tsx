'use client'

import { useState } from 'react'

export function SubscribeForm() {
  const [done, setDone] = useState(false)

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-border p-6 text-center">
        <p className="font-bold text-forest text-base mb-1">You&apos;re subscribed.</p>
        <p className="text-muted-foreground text-xs">
          We&apos;ll send market price alerts, new region launches, and seasonal crop reports.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <p className="font-bold text-forest text-base mb-1">Get platform updates</p>
      <p className="text-muted-foreground text-xs mb-4">
        Market price alerts, new region launches, and seasonal crop reports.
      </p>
      <form className="space-y-3"
        onSubmit={e => { e.preventDefault(); setDone(true) }}>
        <input type="text" placeholder="Your full name"
          className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-sm
                     text-forest placeholder:text-muted-foreground focus:outline-none
                     focus:ring-2 focus:ring-forest/10 focus:border-forest transition-all" />
        <div className="flex gap-2">
          <input type="email" placeholder="Email address" required
            className="flex-1 px-4 py-3 bg-cream border border-border rounded-xl text-sm
                       text-forest placeholder:text-muted-foreground focus:outline-none
                       focus:ring-2 focus:ring-forest/10 focus:border-forest transition-all" />
          <button type="submit"
            className="px-5 py-3 bg-forest text-white text-sm font-bold rounded-xl
                       hover:bg-forest-dark transition-colors whitespace-nowrap">
            Subscribe
          </button>
        </div>
      </form>
    </div>
  )
}
