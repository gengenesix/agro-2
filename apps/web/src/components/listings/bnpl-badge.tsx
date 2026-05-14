import { PayAtHarvestIcon } from '@/components/shared/icons'

interface BnplBadgeProps {
  size?: 'sm' | 'md'
  className?: string
}

export function BnplBadge({ size = 'sm', className = '' }: BnplBadgeProps) {
  const base = 'inline-flex items-center gap-1 font-semibold rounded-full'
  const sizes = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  }
  return (
    <span className={`${base} ${sizes[size]} bg-harvest-gold/15 text-harvest-gold ${className}`}>
      <PayAtHarvestIcon size={size === 'sm' ? 11 : 13} />
      Pay at Harvest
    </span>
  )
}
