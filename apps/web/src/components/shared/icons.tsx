/**
 * AgroConnect SVG Icon System — Bold Edition
 * All icons use strokeWidth 2.5+, filled accents, distinctive silhouettes.
 */

import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function base(size = 20, rest: IconProps) {
  const { size: _, ...props } = rest
  return { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', ...props }
}

// ── Navigation ──────────────────────────────────────────────────────────────

export function HomeIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M3 10.5L12 3l9 7.5V21a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V10.5Z"
        fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round"/>
      <path d="M9 22V14h6v8" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
    </svg>
  )
}

export function MarketIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M2 7h20l-1.8 10a2 2 0 0 1-2 1.5H5.8a2 2 0 0 1-2-1.5L2 7Z"
        fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round"/>
      <path d="M2 7L4.5 3h15L22 7" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round"/>
      <path d="M9 7v2a3 3 0 0 0 6 0V7" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
    </svg>
  )
}

export function PledgeIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M12 3C8.5 3 5 6 5 10c0 5 7 12 7 12s7-7 7-12c0-4-3.5-7-7-7Z"
        fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2.25"/>
      <path d="M9 10.5l2 2 4-4.5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function WalletIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <rect x="2" y="5" width="20" height="14" rx="2.5"
        fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2.25"/>
      <path d="M2 10h20" stroke="currentColor" strokeWidth="2.25"/>
      <circle cx="16.5" cy="14.5" r="2" fill="currentColor"/>
    </svg>
  )
}

export function ProfileIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <circle cx="12" cy="8" r="4" fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2.25"/>
      <path d="M4 20c0-3.5 3.6-6.5 8-6.5s8 3 8 6.5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
    </svg>
  )
}

// ── Sectors (bold filled icons) ───────────────────────────────────────────────

export function CropsIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M12 21V11" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M12 11C11 6 7 3.5 3 4c0 4.5 3 8 9 7Z"
        fill="currentColor" fillOpacity="0.9" stroke="currentColor" strokeWidth="0"/>
      <path d="M12 11c1-5 5-7.5 9-7 0 4.5-3 8-9 7Z"
        fill="currentColor" fillOpacity="0.7" stroke="currentColor" strokeWidth="0"/>
      <path d="M5 21h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

export function LivestockIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <ellipse cx="12" cy="13.5" rx="6.5" ry="4.5"
        fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.25"/>
      <path d="M8 9C8 6 9.5 4.5 12 4.5S16 6 16 9" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
      <path d="M7.5 18.5v2.5M16.5 18.5v2.5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
      <path d="M8 9c-.5-1.5-2.5-1.5-3-.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 9c.5-1.5 2.5-1.5 3-.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export function PoultryIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <ellipse cx="12" cy="15" rx="5" ry="4"
        fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.25"/>
      <circle cx="12" cy="7" r="3.5"
        fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2.25"/>
      <path d="M8 7.5C6.5 6.5 4.5 7 4.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 10.5v4.5" stroke="currentColor" strokeWidth="2.25"/>
      <path d="M9 19v2M15 19v2" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
    </svg>
  )
}

export function FisheriesIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M3.5 12C3.5 12 7 6 12 6s8.5 6 8.5 6S16 18 12 18 3.5 12 3.5 12Z"
        fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round"/>
      <path d="M20.5 12c1.5-2.5 3.5-2.5 3.5-2.5s0 2.5-2 5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="9.5" cy="11.5" r="1.5" fill="currentColor"/>
    </svg>
  )
}

export function InputsIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M4 8h16v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z"
        fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round"/>
      <path d="M2 5.5h20v2.5H2z" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M10 13h4M12 11v4" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
    </svg>
  )
}

// ── Actions ──────────────────────────────────────────────────────────────────

export function ListProduceIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <rect x="3" y="3" width="18" height="18" rx="2.5"
        fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.25"/>
      <path d="M8 8.5h8M8 12h8M8 15.5h5" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
    </svg>
  )
}

export function BuyInputsIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M6 2.5 3 7v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7l-3-4.5Z"
        fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round"/>
      <path d="M3 7h18" stroke="currentColor" strokeWidth="2.25"/>
      <path d="M16 11a4 4 0 0 1-8 0" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
    </svg>
  )
}

export function HarvestPledgeIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M12 2a7.5 7.5 0 0 1 7.5 7.5c0 5.5-7.5 13-7.5 13S4.5 15 4.5 9.5A7.5 7.5 0 0 1 12 2Z"
        fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.25"/>
      <path d="M12 6.5v5.5l3 2" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function WeatherIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M18.5 10.5h-1.1A7.5 7.5 0 1 0 9 20h9.5a5 5 0 0 0 0-10Z"
        fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round"/>
    </svg>
  )
}

export function PricesIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M7 17l4-5 3.5 3 5-6.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="7" cy="17" r="1.5" fill="currentColor"/>
      <circle cx="11" cy="12" r="1.5" fill="currentColor"/>
      <circle cx="14.5" cy="15" r="1.5" fill="currentColor"/>
    </svg>
  )
}

export function PestAlertIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"
        fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round"/>
      <path d="M12 9v5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="12" cy="17.5" r="1.5" fill="currentColor"/>
    </svg>
  )
}

export function WithdrawIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M12 4v12m0 0-4-4m4 4 4-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
    </svg>
  )
}

export function SendIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M22 2 11 13" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
      <path d="M22 2 15 22l-4-9-9-4 20-7Z"
        fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round"/>
    </svg>
  )
}

export function SearchIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <circle cx="11" cy="11" r="7.5"
        fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.5"/>
      <path d="m21 21-4.5-4.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

export function FilterIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z"
        fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round"/>
    </svg>
  )
}

export function MapPinIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z"
        fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.25"/>
      <circle cx="12" cy="10" r="3" fill="currentColor" fillOpacity="0.6"/>
    </svg>
  )
}

export function ChevronRightIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function ChevronDownIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function ArrowLeftIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="m12 19-7-7 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19 12H5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

export function CloseIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M18 6 6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

export function CheckIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function StarIcon({ size = 20, filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(size, props)}>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinejoin="round"
        fill={filled ? 'currentColor' : 'currentColor'}
        fillOpacity={filled ? 1 : 0.15}
      />
    </svg>
  )
}

export function EyeIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M2 12s3.5-7.5 10-7.5S22 12 22 12s-3.5 7.5-10 7.5S2 12 2 12Z"
        fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2.25"/>
      <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}

export function CameraIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round"/>
      <circle cx="12" cy="13" r="4" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2.25"/>
    </svg>
  )
}

export function LoadingIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)} className={`animate-spin ${props.className ?? ''}`}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" strokeOpacity="0.2"/>
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/>
    </svg>
  )
}

// ── Verification Badges ───────────────────────────────────────────────────────

export function VerifiedBlueIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M12 2l2.4 3.2 3.9-.9-1 3.9 3.2 2.4-3.2 2.4 1 3.9-3.9-.9L12 22l-2.4-3.2-3.9.9 1-3.9L3.5 13.4l3.2-2.4-1-3.9 3.9.9L12 2Z"
        fill="#3b82f6" fillOpacity="0.25" stroke="#3b82f6" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M9 12l2 2 4-4" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function PremiumGreenIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M12 2l2.4 3.2 3.9-.9-1 3.9 3.2 2.4-3.2 2.4 1 3.9-3.9-.9L12 22l-2.4-3.2-3.9.9 1-3.9L3.5 13.4l3.2-2.4-1-3.9 3.9.9L12 2Z"
        fill="oklch(0.48 0.20 145 / 0.25)" stroke="oklch(0.48 0.20 145)" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M12 7l1.27 2.57L16 10l-2.73.43L12 13l-1.27-2.57L8 10l2.73-.43L12 7Z"
        fill="oklch(0.48 0.20 145)"/>
    </svg>
  )
}

export function TopSellerIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M6 9v9a6 6 0 0 0 12 0V9" fill="#ca8a04" fillOpacity="0.15" stroke="#ca8a04" strokeWidth="2.25"/>
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18" stroke="#ca8a04" strokeWidth="2.25" strokeLinecap="round"/>
      <path d="M6 4h12" stroke="#ca8a04" strokeWidth="2.25" strokeLinecap="round"/>
      <path d="M4 22h16" stroke="#ca8a04" strokeWidth="2.25" strokeLinecap="round"/>
    </svg>
  )
}

// ── BNPL / Finance ────────────────────────────────────────────────────────────

export function PayAtHarvestIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <rect x="2" y="5" width="20" height="14" rx="2.5"
        fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2.25"/>
      <path d="M2 10.5h20" stroke="currentColor" strokeWidth="2.25"/>
      <path d="M7 15.5h4" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
      <path d="M16 15.5h2" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
    </svg>
  )
}

export function AgroScoreIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <circle cx="12" cy="12" r="9.5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2.25"/>
      <path d="M12 7.5v5l3 2.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M5 12h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

// ── Delivery ──────────────────────────────────────────────────────────────────

export function TruckIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <rect x="1" y="3" width="15" height="13" rx="1.5"
        fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2.25"/>
      <path d="M16 8.5h4l3 4v5h-7V8.5Z"
        fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round"/>
      <circle cx="5.5" cy="18.5" r="2.5" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2.25"/>
      <circle cx="18.5" cy="18.5" r="2.5" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2.25"/>
    </svg>
  )
}

// ── Mobile Money ──────────────────────────────────────────────────────────────

export function MobileMoneyIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <rect x="5" y="2" width="14" height="20" rx="2.5"
        fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2.25"/>
      <path d="M9.5 7h5M9 17h6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="2.5" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="2"/>
    </svg>
  )
}

// ── Notification / Bell ───────────────────────────────────────────────────────

export function BellIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
        fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
    </svg>
  )
}

// ── Settings / Misc ───────────────────────────────────────────────────────────

export function SettingsIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <circle cx="12" cy="12" r="3.5" fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2.25"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        stroke="currentColor" strokeWidth="2.25"/>
    </svg>
  )
}

export function LogoutIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="m16 17 5-5-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12H9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

export function GridViewIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.25"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.25"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.25"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.25"/>
    </svg>
  )
}

export function MapViewIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7Z"
        fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round"/>
      <path d="M9 4v13M15 7v13" stroke="currentColor" strokeWidth="2.25"/>
    </svg>
  )
}

export function PlusIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

export function InfoIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <circle cx="12" cy="12" r="9.5" fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2.25"/>
      <path d="M12 16v-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="12" cy="8" r="1.5" fill="currentColor"/>
    </svg>
  )
}

export function OrdersIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z"
        fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round"/>
      <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2.25"/>
      <path d="M9 13h6M9 17h4" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
    </svg>
  )
}

export function CalendarIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <rect x="3" y="4" width="18" height="18" rx="2.5"
        fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round"/>
      <path d="M16 2v4M8 2v4" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"/>
      <path d="M3 10h18" stroke="currentColor" strokeWidth="2.25"/>
    </svg>
  )
}

export function AdminIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"
        fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2.25" strokeLinejoin="round"/>
    </svg>
  )
}
