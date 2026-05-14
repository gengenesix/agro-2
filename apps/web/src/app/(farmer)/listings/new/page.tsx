import { CreateListingForm } from '@/components/listings/create-listing-form'
import Link                  from 'next/link'
import { ArrowLeftIcon }     from '@/components/shared/icons'

export const metadata = { title: 'New Listing — AgroConnect' }

export default function NewListingPage() {
  return (
    <main className="min-h-screen bg-cream">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/listings" className="p-2 -ml-2 text-muted-foreground hover:text-forest transition-colors">
            <ArrowLeftIcon size={18} />
          </Link>
          <h1 className="font-bold text-forest text-lg">New Listing</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <CreateListingForm />
      </div>
    </main>
  )
}
