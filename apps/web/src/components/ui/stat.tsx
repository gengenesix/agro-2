import { cn } from '@/lib/cn'

interface StatProps {
  label: string
  value: React.ReactNode
  /** Optional unit/suffix shown muted after the value. */
  suffix?: string
  /** Optional delta line (e.g. "+12% this week"). */
  hint?: string
  icon?: React.ReactNode
  className?: string
}

/**
 * Compact KPI tile. Value always Geist Mono (mono = data).
 * Dense by design — no oversized empty stat cards.
 */
export function Stat({ label, value, suffix, hint, icon, className }: StatProps) {
  return (
    <div className={cn('card-surface card-pad', className)}>
      <div className="flex items-center justify-between">
        <span className="label-eyebrow text-muted-foreground">{label}</span>
        {icon && <span className="text-forest/40">{icon}</span>}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-mono text-2xl font-bold text-forest tracking-tight">{value}</span>
        {suffix && <span className="text-xs font-medium text-muted-foreground">{suffix}</span>}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}
