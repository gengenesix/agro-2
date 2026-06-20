import { forwardRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/cn'

type Variant = 'forest' | 'lime' | 'outline' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const VARIANT: Record<Variant, string> = {
  forest:  'btn-forest',
  lime:    'btn-lime',
  outline: 'btn-outline',
  ghost:   'btn-ghost',
}
const SIZE: Record<Size, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
}

interface BaseProps {
  variant?: Variant
  size?: Size
  block?: boolean
  className?: string
}

/**
 * Pill button — the single source of truth for CTAs across AgroConnect.
 * Forest = authority/primary, Lime = the spark, Outline/Ghost = secondary.
 */
export const Button = forwardRef<
  HTMLButtonElement,
  BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(function Button({ variant = 'forest', size = 'md', block, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn('btn', VARIANT[variant], SIZE[size], block && 'w-full', className)}
      {...props}
    />
  )
})

/** Same pill styling, rendered as a Next.js link. */
export function ButtonLink({
  variant = 'forest',
  size = 'md',
  block,
  className,
  href,
  ...props
}: BaseProps & { href: string } & Omit<React.ComponentProps<typeof Link>, 'href'>) {
  return (
    <Link
      href={href}
      className={cn('btn', VARIANT[variant], SIZE[size], block && 'w-full', className)}
      {...props}
    />
  )
}
