import { VerifiedBlueIcon, PremiumGreenIcon, TopSellerIcon } from './icons'
import type { VerificationLevel } from '@agroconnect/types'

interface VerificationBadgeProps {
  level:     VerificationLevel
  size?:     'xs' | 'sm' | 'md'
  showLabel?: boolean
}

const SIZE_MAP = { xs: 12, sm: 16, md: 20 }

export function VerificationBadge({ level, size = 'sm', showLabel = false }: VerificationBadgeProps) {
  const px = SIZE_MAP[size]

  if (level === 'unverified') return null

  if (level === 'self_declared') {
    return (
      <span className="inline-flex items-center gap-0.5">
        <span
          className={`inline-flex items-center justify-center rounded-full bg-[oklch(0.88_0.22_120)] text-[oklch(0.18_0.08_145)]
            ${size === 'xs' ? 'text-[8px] px-1.5 py-0' : size === 'sm' ? 'text-[9px] px-2 py-0.5' : 'text-xs px-2 py-0.5'}
            font-bold uppercase tracking-wide`}
        >
          Self-Declared
        </span>
      </span>
    )
  }

  if (level === 'field_verified') {
    return (
      <span className="inline-flex items-center gap-1">
        <VerifiedBlueIcon size={px} />
        {showLabel && <span className="text-[10px] font-semibold text-[oklch(0.55_0.18_250)]">Field Verified</span>}
      </span>
    )
  }

  if (level === 'premium') {
    return (
      <span className="inline-flex items-center gap-1">
        <PremiumGreenIcon size={px} />
        {showLabel && <span className="text-[10px] font-semibold text-[oklch(0.48_0.20_145)]">Premium</span>}
      </span>
    )
  }

  return null
}
