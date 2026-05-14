import { formatGHS } from '@/lib/format'

interface PriceDisplayProps {
  amount:    number
  unit?:     string
  size?:     'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl',
}

export function PriceDisplay({ amount, unit, size = 'md', className = '' }: PriceDisplayProps) {
  return (
    <span className={`inline-flex items-baseline gap-1 ${className}`}>
      <span className={`font-mono font-bold text-forest ${sizes[size]}`}>
        {formatGHS(amount)}
      </span>
      {unit && (
        <span className="text-xs text-muted-foreground font-sans">
          /{unit}
        </span>
      )}
    </span>
  )
}
