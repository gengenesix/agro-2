import Link                 from 'next/link'
import Image                from 'next/image'
import { AgroScoreBar }     from '@/components/shared/agro-score-bar'
import { VerifiedBlueIcon, PremiumGreenIcon, MapPinIcon, StarIcon } from '@/components/shared/icons'

interface SellerCardProps {
  seller: {
    id:              string
    name:            string
    avatar?:         string
    verificationLevel: string
    agroScore:       number
    regionName?:     string
    averageRating?:  number
    reviewCount?:    number
    listingsCount?:  number
    memberSince?:    string
  }
}

export function SellerCard({ seller }: SellerCardProps) {
  const isPremium  = seller.verificationLevel === 'premium'
  const isVerified = ['verified', 'premium'].includes(seller.verificationLevel)

  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <h3 className="font-bold text-forest text-xs uppercase tracking-wider mb-4">Seller</h3>

      <div className="flex items-start gap-3 mb-4">
        {/* Avatar */}
        <div className="relative w-12 h-12 rounded-full bg-cream-dark flex-shrink-0 overflow-hidden">
          {seller.avatar ? (
            <Image src={seller.avatar} alt={seller.name} fill className="object-cover" sizes="48px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-forest text-lime font-bold text-lg">
              {seller.name.charAt(0).toUpperCase()}
            </div>
          )}
          {isVerified && (
            <div className="absolute -bottom-0.5 -right-0.5">
              {isPremium
                ? <PremiumGreenIcon size={16} />
                : <VerifiedBlueIcon size={16} />}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-forest text-sm truncate">{seller.name}</p>
          {seller.regionName && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <MapPinIcon size={11} />
              {seller.regionName}
            </p>
          )}
          {seller.averageRating !== undefined && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
              <StarIcon size={11} className="text-harvest-gold fill-harvest-gold" />
              <span className="font-mono font-semibold text-forest">{seller.averageRating.toFixed(1)}</span>
              {seller.reviewCount !== undefined && (
                <span>({seller.reviewCount} reviews)</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* AgroScore */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">AgroScore</p>
          <p className="font-mono text-sm font-bold text-forest">{seller.agroScore}/110</p>
        </div>
        <AgroScoreBar score={seller.agroScore} animate />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {seller.listingsCount !== undefined && (
          <div className="bg-cream rounded-xl p-2.5 text-center">
            <p className="font-mono text-sm font-bold text-forest">{seller.listingsCount}</p>
            <p className="text-[10px] text-muted-foreground">Listings</p>
          </div>
        )}
        {seller.memberSince && (
          <div className="bg-cream rounded-xl p-2.5 text-center">
            <p className="font-mono text-sm font-bold text-forest">
              {new Date(seller.memberSince).getFullYear()}
            </p>
            <p className="text-[10px] text-muted-foreground">Member since</p>
          </div>
        )}
      </div>

      <Link
        href={`/farmers/${seller.id}`}
        className="block w-full text-center py-2 border border-forest text-forest text-xs font-bold
                   rounded-xl hover:bg-forest hover:text-white transition-colors"
      >
        View profile
      </Link>
    </div>
  )
}
