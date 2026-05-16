import { StarIcon } from '@/components/shared/icons'
import { formatRelative } from '@/lib/format'
import type { Review } from '@/lib/types'

interface ReviewListProps {
  reviews:       Review[]
  averageRating?: number
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <StarIcon
          key={i}
          size={13}
          className={i <= rating ? 'text-harvest-gold fill-harvest-gold' : 'text-border'}
        />
      ))}
    </div>
  )
}

export function ReviewList({ reviews, averageRating }: ReviewListProps) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="font-bold text-forest text-sm">Reviews</h2>
        {averageRating !== undefined && (
          <div className="flex items-center gap-2">
            <Stars rating={Math.round(averageRating)} />
            <span className="font-mono text-sm font-bold text-forest">{averageRating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({reviews.length})</span>
          </div>
        )}
      </div>

      <div className="divide-y divide-border">
        {reviews.map(review => (
          <div key={review.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <p className="text-sm font-semibold text-forest">{review.reviewer.fullName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <Stars rating={review.rating} />
                  <span className="text-[10px] text-muted-foreground">{formatRelative(review.createdAt)}</span>
                </div>
              </div>
            </div>
            {review.comment && (
              <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
