import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/cn'

const MARK: Record<'forest' | 'white', string> = {
  forest: '/brand/agroconnect-mark-tight.png', // forest tile / white leaf — for light surfaces
  white:  '/brand/agroconnect-mark-white.png', // white tile / forest leaf — for dark/forest surfaces
}

interface LogoMarkProps {
  /** Pixel size of the square mark. */
  size?: number
  /** Tile variant — use "white" on dark/forest backgrounds. */
  variant?: 'forest' | 'white'
  className?: string
}

/** The AgroConnect leaf mark — the single brand mark asset. */
export function LogoMark({ size = 36, variant = 'forest', className }: LogoMarkProps) {
  return (
    <Image
      src={MARK[variant]}
      alt="AgroConnect"
      width={size}
      height={size}
      priority
      draggable={false}
      className={cn('rounded-[22%] select-none', className)}
      style={{ width: size, height: size }}
    />
  )
}

interface LogoProps {
  /** Pixel size of the mark; wordmark scales alongside. */
  size?: number
  /** Hide the wordmark, mark only. */
  markOnly?: boolean
  /** Wordmark color — defaults to forest; pass "white" on dark surfaces. */
  tone?: 'forest' | 'white'
  href?: string
  className?: string
}

/** Mark + AgroConnect wordmark lockup. Links home unless href is overridden. */
export function Logo({ size = 36, markOnly, tone = 'forest', href = '/', className }: LogoProps) {
  const content = (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark
        size={size}
        variant={tone === 'white' ? 'white' : 'forest'}
        className="transition-transform group-hover:scale-105"
      />
      {!markOnly && (
        <span
          className={cn(
            'font-extrabold tracking-tight leading-none',
            tone === 'white' ? 'text-white' : 'text-forest',
          )}
          style={{ fontSize: size * 0.47 }}
        >
          AgroConnect
        </span>
      )}
    </span>
  )

  if (href === '') return content
  return (
    <Link href={href} className="group inline-flex items-center">
      {content}
    </Link>
  )
}
