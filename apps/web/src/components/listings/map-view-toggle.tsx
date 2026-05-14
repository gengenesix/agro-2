'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { GridViewIcon, MapViewIcon } from '@/components/shared/icons'

export function MapViewToggle() {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const view         = searchParams.get('view') ?? 'grid'

  function toggle(v: 'grid' | 'map') {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', v)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center bg-cream rounded-xl p-0.5 border border-border">
      {[
        { v: 'grid', Icon: GridViewIcon, label: 'Grid' },
        { v: 'map',  Icon: MapViewIcon,  label: 'Map'  },
      ].map(({ v, Icon, label }) => (
        <button
          key={v}
          onClick={() => toggle(v as any)}
          title={`${label} view`}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                      ${view === v
                        ? 'bg-white text-forest shadow-sm border border-border/60'
                        : 'text-muted-foreground hover:text-forest'}`}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  )
}
