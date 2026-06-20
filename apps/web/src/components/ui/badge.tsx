import { cn } from '@/lib/cn'

type Tone = 'lime' | 'forest' | 'neutral' | 'outline' | 'gold' | 'destructive'

const TONE: Record<Tone, string> = {
  lime:        'bg-lime text-forest',
  forest:      'bg-forest text-white',
  neutral:     'bg-cream-dark text-forest',
  outline:     'bg-transparent text-forest border border-border',
  gold:        'bg-harvest-gold-bg text-harvest-gold border border-harvest-gold/25',
  destructive: 'bg-destructive/10 text-destructive',
}

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone
  /** Uppercase micro-label styling (tracked, tiny). */
  eyebrow?: boolean
}

/** Small status/category pill. Lime = featured/active, neutral = default. */
export function Badge({ tone = 'neutral', eyebrow, className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
        eyebrow ? 'label-eyebrow' : 'text-[11px] font-semibold leading-none',
        TONE[tone],
        className,
      )}
      {...props}
    />
  )
}
