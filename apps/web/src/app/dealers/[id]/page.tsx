import { notFound }      from 'next/navigation'
import Link              from 'next/link'
import Image             from 'next/image'
import { formatGHS }     from '@/lib/format'

interface DealerProfile {
  businessName:       string
  registrationNumber: string | null
  physicalAddress:    string | null
  deliveryRadiusKm:   number
  sectorsServed:      string[]
  businessPhotos:     string[]
  isVerified:         boolean
}

interface PublicListing {
  id:           string
  slug:         string
  title:        string
  sector:       string
  pricePerUnit: number
  unit:         string
  photos:       string[]
  quantityAvailable: number
  bnplAvailable: boolean
  region:       string
}

interface DealerPublicProfile {
  id:               string
  fullName:         string
  verificationLevel: string
  regionId:         number | null
  createdAt:        string
  region:           { name: string } | null
  dealerProfile:    DealerProfile | null
  listings:         PublicListing[]
}

async function fetchDealerProfile(id: string): Promise<DealerPublicProfile | null> {
  try {
    const base = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'
    const [profileRes, listingsRes] = await Promise.all([
      fetch(`${base}/users/${id}/profile`, { next: { revalidate: 60 } }),
      fetch(`${base}/users/${id}/listings`, { next: { revalidate: 60 } }),
    ])
    if (!profileRes.ok) return null
    const profile  = await profileRes.json()
    const listings = listingsRes.ok ? await listingsRes.json() : { data: { listings: [] } }
    return { ...profile.data, listings: listings.data?.listings ?? [] }
  } catch {
    return null
  }
}

const SECTOR_LABELS: Record<string, string> = {
  crops: 'Crops', livestock: 'Livestock', poultry: 'Poultry',
  fisheries: 'Fisheries', inputs: 'Agro-inputs',
}

export default async function DealerProfilePage({ params }: { params: { id: string } }) {
  const dealer = await fetchDealerProfile(params.id)
  if (!dealer || !dealer.dealerProfile) notFound()

  const dp            = dealer.dealerProfile
  const memberYears   = Math.floor(
    (Date.now() - new Date(dealer.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365),
  )
  const memberSince   = memberYears < 1
    ? 'New member'
    : `${memberYears} year${memberYears !== 1 ? 's' : ''} on AgroConnect`

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero */}
      <div className="bg-forest text-white">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-lime flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-8 h-8 text-forest fill-current">
                <path d="M20 6h-2.18c.07-.44.18-.88.18-1.36C18 2.53 15.47 0 12 0S6 2.53 6 4.64c0 .48.11.92.18 1.36H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-8-4c1.29 0 2 .98 2 2.36S13.29 7 12 7c-1.29 0-2-1.36-2-2.64S10.71 2 12 2z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-2xl font-bold">{dp.businessName}</h1>
                {dp.isVerified && (
                  <span className="bg-lime text-forest text-[10px] font-bold px-2 py-0.5 rounded-lg">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-white/70 text-sm">{dealer.fullName}</p>
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-white/60">
                {dealer.region && <span>{dealer.region.name}</span>}
                {dp.physicalAddress && <span>· {dp.physicalAddress}</span>}
                <span>· {memberSince}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Dealer details */}
        <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
          {dp.sectorsServed.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Sectors served</p>
              <div className="flex flex-wrap gap-2">
                {dp.sectorsServed.map(s => (
                  <span key={s}
                    className="px-3 py-1 rounded-xl text-xs font-semibold bg-cream-dark text-forest capitalize">
                    {SECTOR_LABELS[s] ?? s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">Delivery radius</p>
              <p className="text-sm font-bold text-forest mt-0.5">{dp.deliveryRadiusKm} km</p>
            </div>
            {dp.registrationNumber && (
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Reg. number</p>
                <p className="font-mono text-sm text-forest mt-0.5">{dp.registrationNumber}</p>
              </div>
            )}
          </div>

          {dp.businessPhotos.length > 0 && (
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Business photos
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {dp.businessPhotos.map((url, i) => (
                  <div key={i} className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden">
                    <Image src={url} alt={`${dp.businessName} photo ${i + 1}`}
                      fill className="object-cover" sizes="96px" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Listings */}
        <div>
          <h2 className="font-display text-lg font-bold text-forest mb-3">
            Active listings ({dealer.listings.length})
          </h2>
          {dealer.listings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">No active listings at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {dealer.listings.map(listing => (
                <Link key={listing.id} href={`/produce/${listing.slug}`}
                  className="bg-white rounded-2xl border border-border overflow-hidden
                             hover:border-forest/30 transition-colors">
                  <div className="relative h-36 bg-cream-dark">
                    {listing.photos[0] ? (
                      <Image src={listing.photos[0]} alt={listing.title}
                        fill className="object-cover" sizes="(max-width:640px)100vw,50vw" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg viewBox="0 0 24 24" className="w-8 h-8 text-muted-foreground fill-current">
                          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                        </svg>
                      </div>
                    )}
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-bold
                                     uppercase bg-sector-${listing.sector}-bg text-sector-${listing.sector}`}>
                      {listing.sector}
                    </span>
                    {listing.bnplAvailable && (
                      <span className="absolute top-2 right-2 bg-lime text-forest text-[10px] font-bold
                                       px-2 py-0.5 rounded-lg">
                        BNPL
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="font-display text-sm font-semibold text-forest line-clamp-2 leading-tight">
                      {listing.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="font-mono text-sm font-bold text-forest">
                        {formatGHS(listing.pricePerUnit)}
                      </span>
                      <span className="text-xs text-muted-foreground">/{listing.unit}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
