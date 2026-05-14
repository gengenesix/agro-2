import { ListingGridSkeleton } from '@/components/shared/skeleton'

export default function Loading() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-white border-b border-border h-14 animate-pulse" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="h-10 bg-white rounded-2xl border border-border animate-pulse" />
        <div className="h-12 bg-white rounded-2xl border border-border animate-pulse" />
        <ListingGridSkeleton count={12} />
      </div>
    </main>
  )
}
