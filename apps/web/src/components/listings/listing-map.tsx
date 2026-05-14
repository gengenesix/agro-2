'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { formatGHS } from '@/lib/format'
import { SectorChip } from '@/components/shared/sector-chip'
import { MapPinIcon, CloseIcon } from '@/components/shared/icons'

interface MapListing {
  id:           string
  slug:         string
  title:        string
  sector:       string
  pricePerUnit: number
  unit:         string
  lat:          number
  lng:          number
  region:       string
  seller:       { fullName: string }
  photos:       string[]
}

interface ListingMapProps {
  listings: MapListing[]
  height?:  string
}

const SECTOR_COLORS: Record<string, string> = {
  crops:     '#1a4a28',
  livestock: '#92400e',
  poultry:   '#b45309',
  fisheries: '#1d4ed8',
  inputs:    '#5b21b6',
}

// Leaflet's default icon path is broken in Next.js — override here
function fixLeafletIcons(L: typeof import('leaflet')) {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  })
}

function sectorIcon(L: typeof import('leaflet'), sector: string) {
  const color = SECTOR_COLORS[sector] ?? '#1a3a24'
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14C28 6.27 21.73 0 14 0Z"
            fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="5" fill="white" fill-opacity="0.9"/>
    </svg>`
  return L.divIcon({
    html:        svg,
    className:   '',
    iconSize:    [28, 36],
    iconAnchor:  [14, 36],
    popupAnchor: [0, -38],
  })
}

export function ListingMap({ listings, height = '480px' }: ListingMapProps) {
  const mapRef      = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<import('leaflet').Map | null>(null)
  const [selected, setSelected] = useState<MapListing | null>(null)
  const [mounted, setMounted]   = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || !mapRef.current || listings.length === 0) return

    let map = mapInstance.current

    import('leaflet').then(async (L) => {
      await import('leaflet/dist/leaflet.css' as any)
      fixLeafletIcons(L)

      if (!map) {
        const center = listings.reduce(
          (acc, l) => [acc[0] + l.lat, acc[1] + l.lng],
          [0, 0],
        )
        const avgLat = center[0] / listings.length
        const avgLng = center[1] / listings.length

        map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: false })
        mapInstance.current = map

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
        }).addTo(map)

        map.setView([avgLat, avgLng], 8)
      } else {
        map.eachLayer(layer => {
          if ((layer as any)._url === undefined) map?.removeLayer(layer)
        })
      }

      listings.forEach(listing => {
        const marker = L.marker([listing.lat, listing.lng], {
          icon: sectorIcon(L, listing.sector),
        }).addTo(map!)

        marker.on('click', () => setSelected(listing))
      })

      if (listings.length > 1) {
        const bounds = L.latLngBounds(listings.map(l => [l.lat, l.lng]))
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 })
      }
    })

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [mounted, listings])

  if (!mounted) {
    return (
      <div style={{ height }} className="bg-cream-dark rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <MapPinIcon size={28} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Loading map…</p>
        </div>
      </div>
    )
  }

  if (listings.length === 0) {
    return (
      <div style={{ height }} className="bg-cream-dark rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <MapPinIcon size={28} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">No listings with GPS coordinates</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative" style={{ height }}>
      <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden z-0" />

      {/* Legend */}
      <div className="absolute top-3 left-3 z-[400] bg-white rounded-xl shadow-md border border-border p-2.5 space-y-1">
        {Object.entries(SECTOR_COLORS).map(([sector, color]) => (
          <div key={sector} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            <span className="text-[10px] font-semibold text-forest capitalize">{sector}</span>
          </div>
        ))}
      </div>

      {/* Count badge */}
      <div className="absolute top-3 right-3 z-[400] bg-forest text-white text-xs font-bold
                      px-2.5 py-1 rounded-xl shadow-md">
        {listings.length} listing{listings.length !== 1 ? 's' : ''}
      </div>

      {/* Selected listing popup */}
      {selected && (
        <div className="absolute bottom-4 left-4 right-4 z-[500]">
          <div className="bg-white rounded-2xl border border-border shadow-xl p-4">
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 w-6 h-6 rounded-full bg-cream flex items-center justify-center
                         hover:bg-cream-dark transition-colors">
              <CloseIcon size={12} className="text-muted-foreground" />
            </button>

            <div className="flex items-start gap-3 pr-6">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <SectorChip sector={selected.sector} size="sm" />
                </div>
                <p className="font-display text-sm font-semibold text-forest leading-tight line-clamp-2">
                  {selected.title}
                </p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="font-mono text-sm font-bold text-forest">
                    {formatGHS(selected.pricePerUnit)}
                  </span>
                  <span className="text-xs text-muted-foreground">/{selected.unit}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPinIcon size={11} />
                  <span>{selected.region}</span>
                  <span className="mx-1">·</span>
                  <span>{selected.seller.fullName}</span>
                </div>
              </div>
            </div>

            <Link href={`/produce/${selected.slug}`}
              className="mt-3 w-full block text-center py-2.5 bg-forest text-white text-sm font-bold
                         rounded-xl hover:bg-forest-dark transition-colors">
              View listing
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
