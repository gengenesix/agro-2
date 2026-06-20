import { cn } from '@/lib/cn'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Add hover lift interaction (use on clickable cards). */
  hover?: boolean
  /** Apply default internal padding. */
  pad?: boolean
}

/**
 * White surface card — `rounded-2xl`, soft warm border, subtle shadow.
 * The one card primitive; pages should not re-declare card chrome inline.
 */
export function Card({ hover, pad = true, className, ...props }: CardProps) {
  return (
    <div
      className={cn('card-surface', pad && 'card-pad', hover && 'card-lift cursor-pointer', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-3 flex items-center justify-between gap-3', className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-[15px] font-bold text-forest', className)} {...props} />
}
