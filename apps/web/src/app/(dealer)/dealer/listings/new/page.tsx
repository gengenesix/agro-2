import { CreateListingForm } from '@/components/listings/create-listing-form'

export const metadata = { title: 'Add Product — AgroConnect' }

export default function DealerNewListingPage() {
  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="font-bold text-forest text-lg">Add Product</h1>
          <p className="text-xs text-muted-foreground">List an agro-input for sale</p>
        </div>
      </div>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <CreateListingForm initialData={{ sector: 'inputs' }} />
      </div>
    </main>
  )
}
