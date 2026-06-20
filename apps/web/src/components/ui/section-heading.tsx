import { cn } from '@/lib/cn'

interface SectionHeadingProps {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  align?: 'left' | 'center'
  className?: string
}

/** Consistent section header — lime eyebrow, tight forest title. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(align === 'center' && 'mx-auto max-w-2xl text-center', className)}>
      {eyebrow && (
        <div className={cn('mb-3 flex items-center gap-2', align === 'center' && 'justify-center')}>
          <span className="h-px w-6 bg-lime" />
          <span className="label-eyebrow text-forest/55">{eyebrow}</span>
        </div>
      )}
      <h2 className="text-balance text-3xl font-extrabold text-forest sm:text-4xl">{title}</h2>
      {description && (
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
