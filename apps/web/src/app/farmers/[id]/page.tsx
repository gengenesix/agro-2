import { notFound }    from 'next/navigation'
import Image           from 'next/image'
import Link            from 'next/link'
import { SectorChip }  from '@/components/shared/sector-chip'
import { AgroScoreBar } from '@/components/shared/agro-score-bar'
import { ListingCard }  from '@/components/listings/listing-card'
import {
  VerifiedBlueIcon, PremiumGreenIcon, MapPinIcon, CalendarIcon,
} from '@/components/shared/icons'
import { formatDate }  from '@/lib/format'
import { prisma }      from '@/lib/prisma'
import { GHANA_REGIONS } from '@/lib/types'
import type { ListingSummary } from '@/lib/types'

async function fetchFarmer(id: string) {
  try {
    return await prisma.profile.findUnique({
      where:   { id },
      include: { farmerProfile: true },
    })
  } catch {
    return null
  }
}

async function fetchFarmerListings(id: string): Promise<ListingSummary[]> {
  try {
    const rows = await prisma.listing.findMany({
      where:   { sellerId: id, status: 'active' },
      take:    12,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true, sector: true, slug: true } },
        unit:     { select: { name: true, abbreviation: true } },
        seller:   { select: { id: true, fullName: true, avatarUrl: true, verificationLevel: true, agroScore: true } },
        region:   { select: { name: true, code: true } },
        district: { select: { name: true } },
      },
    })
    return rows.map(l => ({
      id:                  l.id,
      title:               l.title,
      slug:                l.slug,
      listingType:         l.listingType,
      status:              l.status,
      quantityAvailable:   Number(l.quantityAvailable),
      pricePerUnit:        Number(l.pricePerUnit),
      minOrderQuantity:    Number(l.minOrderQuantity),
      photos:              l.photos,
      farmingMethod:       l.farmingMethod ?? null,
      expectedHarvestDate: l.expectedHarvestDate?.toISOString() ?? null,
      depositPercentage:   l.depositPercentage,
      pledgeStatus:        l.pledgeStatus ?? null,
      bnplAvailable:       l.bnplAvailable,
      viewsCount:          l.viewsCount,
      createdAt:           l.createdAt.toISOString(),
      unit:                l.unit,
      category:            l.category,
      region:              l.region,
      district:            l.district,
      seller:              l.seller,
    }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id }  = await params
  const farmer  = await fetchFarmer(id)
  if (!farmer) return { title: 'Farmer not found' }
  return {
    title:       `${farmer.fullName} — AgroConnect`,
    description: `View listings from ${farmer.fullName} on AgroConnect Ghana.`,
  }
}

export default async function PublicFarmerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id }              = await params
  const [farmer, listings]  = await Promise.all([fetchFarmer(id), fetchFarmerListings(id)])
  if (!farmer) notFound()

  const fp         = farmer.farmerProfile
  const lvl        = farmer.verificationLevel
  const regionName = GHANA_REGIONS.find(r => r.id === farmer.regionId)?.name ?? null

  return (
    <main className="min-h-screen bg-cream pb-20">
      {/* Back nav */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link href="/produce" className="hover:text-forest transition-colors">Marketplace</Link>
          <span>/</span>
          <span className="text-forest font-semibold">{farmer.fullName}</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Profile card */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-forest to-forest-dark" />

          <div className="px-5 pb-5">
            {/* Avatar */}
            <div className="relative -mt-10 mb-3">
              <div className="w-20 h-20 rounded-2xl border-4 border-white overflow-hidden bg-forest
                              flex items-center justify-center">
                {farmer.avatarUrl ? (
                  <Image src={farmer.avatarUrl} alt={farmer.fullName} width={80} height={80}
                    className="object-cover" />
                ) : (
                  <span className="text-white font-bold text-2xl">
                    {farmer.fullName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-bold text-forest text-xl">{farmer.fullName}</h1>
                  {lvl === 'field_verified' && <VerifiedBlueIcon size={18} />}
                  {lvl === 'premium'        && <PremiumGreenIcon size={18} />}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {fp?.farmName && (
                    <span className="text-sm text-muted-foreground">{fp.farmName}</span>
                  )}
                  {(regionName || farmer.community) && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPinIcon size={12} />
                      {farmer.community && `${farmer.community}, `}
                      {regionName ?? 'Ghana'}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <CalendarIcon size={12} />
                    Member since {formatDate(farmer.createdAt.toISOString())}
                  </div>
                </div>
              </div>

              {/* Verification badge */}
              <div>
                {lvl === 'unverified' && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-border text-muted-foreground">
                    Unverified
                  </span>
                )}
                {lvl === 'self_declared' && (
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-lime/20 text-forest border border-lime/30">
                    Self-Declared
                  </span>
                )}
                {lvl === 'field_verified' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full
                                   bg-blue-50 text-blue-600 border border-blue-100">
                    <VerifiedBlueIcon size={12} /> Field Verified
                  </span>
                )}
                {lvl === 'premium' && (
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full
                                   bg-lime/20 text-forest border border-lime/30">
                    <PremiumGreenIcon size={12} /> Premium Verified
                  </span>
                )}
              </div>
            </div>

            {/* Farm details */}
            {fp && (
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-border">
                {fp.farmSizeAcres && (
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Farm size</p>
                    <p className="text-sm font-bold text-forest mt-0.5">
                      {Number(fp.farmSizeAcres)} acres
                    </p>
                  </div>
                )}
                {fp.sectors.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">Sectors</p>
                    <div className="flex gap-1 flex-wrap">
                      {fp.sectors.map(s => (
                        <SectorChip key={s} sector={s as any} label={s} size="sm" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* AgroScore */}
          <div className="px-5 pb-5 pt-0">
            <div className="bg-cream rounded-xl p-4">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">AgroScore</p>
              <AgroScoreBar score={farmer.agroScore} />
            </div>
          </div>
        </div>

        {/* Active listings */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-forest">
              Active listings
              <span className="ml-2 text-xs font-semibold text-muted-foreground">
                ({listings.length})
              </span>
            </h2>
          </div>

          {listings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">No active listings from this farmer.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {listings.map(l => <ListingCard key={l.id} listing={l} />)}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
