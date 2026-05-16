import { CropsIcon, LivestockIcon, PoultryIcon, FisheriesIcon, InputsIcon } from './icons'
import type { Sector } from '@/lib/types'

interface SectorChipProps {
  sector:     Sector
  label?:     string
  size?:      'sm' | 'md'
  className?: string
}

const SECTOR_STYLES: Record<Sector, string> = {
  crops:     'bg-[oklch(0.94_0.04_145)] text-[oklch(0.35_0.12_145)] border-[oklch(0.35_0.12_145)]/25',
  livestock: 'bg-[oklch(0.95_0.04_60)]  text-[oklch(0.45_0.12_60)]  border-[oklch(0.45_0.12_60)]/25',
  poultry:   'bg-[oklch(0.96_0.05_80)]  text-[oklch(0.62_0.18_80)]  border-[oklch(0.62_0.18_80)]/25',
  fisheries: 'bg-[oklch(0.95_0.04_240)] text-[oklch(0.48_0.16_240)] border-[oklch(0.48_0.16_240)]/25',
  inputs:    'bg-[oklch(0.95_0.03_300)] text-[oklch(0.42_0.16_300)] border-[oklch(0.42_0.16_300)]/25',
}

const SECTOR_ICONS: Record<Sector, typeof CropsIcon> = {
  crops:     CropsIcon,
  livestock: LivestockIcon,
  poultry:   PoultryIcon,
  fisheries: FisheriesIcon,
  inputs:    InputsIcon,
}

const SECTOR_DEFAULTS: Record<Sector, string> = {
  crops:     'Crops',
  livestock: 'Livestock',
  poultry:   'Poultry',
  fisheries: 'Fisheries',
  inputs:    'Inputs',
}

export function SectorChip({ sector, label, size = 'sm', className = '' }: SectorChipProps) {
  const Icon        = SECTOR_ICONS[sector]
  const displayLabel = label ?? SECTOR_DEFAULTS[sector] ?? sector

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold border rounded-full uppercase tracking-wide
        ${size === 'sm' ? 'text-[9px] px-2 py-0.5' : 'text-[11px] px-3 py-1'}
        ${SECTOR_STYLES[sector]} ${className}`}
    >
      <Icon size={size === 'sm' ? 10 : 14} />
      {displayLabel}
    </span>
  )
}
