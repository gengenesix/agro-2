'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPinIcon } from '@/components/shared/icons'

interface FarmLocationMapProps {
  lat:     number
  lng:     number
  onMove?: (lat: number, lng: number) => void
  height?: string
}

export function FarmLocationMap({ lat, lng, onMove, height = '220px' }: FarmLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<import('leaflet').Map | null>(null)
  const markerRef    = useRef<import('leaflet').Marker | null>(null)
  const onMoveRef    = useRef(onMove)
  const [mounted,   setMounted]   = useState(false)
  const [placeName, setPlaceName] = useState('')

  useEffect(() => { onMoveRef.current = onMove }, [onMove])
  useEffect(() => { setMounted(true) }, [])

  // Reverse-geocode whenever coordinates change (Nominatim, free & no key)
  useEffect(() => {
    if (!lat || !lng) return
    const ctrl = new AbortController()
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { signal: ctrl.signal },
    )
      .then(r => r.json())
      .then(d => {
        const a = d.address
        if (!a) return
        const parts = [
          a.suburb ?? a.village ?? a.town ?? a.city ?? a.municipality,
          a.county ?? a.state_district ?? a.state,
          a.country,
        ].filter(Boolean)
        setPlaceName(parts.slice(0, 2).join(', '))
      })
      .catch(() => {})
    return () => ctrl.abort()
  }, [lat, lng])

  // Update marker when lat/lng props change (from parent drag callback)
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng])
    }
  }, [lat, lng])

  // Initialise Leaflet map once on mount
  useEffect(() => {
    if (!mounted || !containerRef.current) return
    let cancelled = false

    import('leaflet').then(async (L) => {
      if (cancelled || mapRef.current) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await import('leaflet/dist/leaflet.css' as any)

      // Fix broken default icon paths in Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const map = L.map(containerRef.current!, {
        zoomControl:      true,
        scrollWheelZoom:  false,
      })
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      map.setView([lat, lng], 15)

      const pinIcon = L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
          <path d="M14 0C6.27 0 0 6.27 0 14c0 9.33 14 22 14 22S28 23.33 28 14 21.73 0 14 0Z"
                fill="#1a4a28" stroke="white" stroke-width="2"/>
          <circle cx="14" cy="14" r="5" fill="white" fill-opacity="0.9"/>
        </svg>`,
        className:   '',
        iconSize:    [28, 36],
        iconAnchor:  [14, 36],
        popupAnchor: [0, -38],
      })

      const marker = L.marker([lat, lng], {
        icon:      pinIcon,
        draggable: !!onMoveRef.current,
      }).addTo(map)
      markerRef.current = marker

      if (onMoveRef.current) {
        marker.on('dragend', () => {
          const p = marker.getLatLng()
          onMoveRef.current?.(p.lat, p.lng)
        })
        map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
          marker.setLatLng(e.latlng)
          onMoveRef.current?.(e.latlng.lat, e.latlng.lng)
        })
      }
    })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current  = null
      markerRef.current = null
    }
  }, [mounted]) // intentionally only on mount — marker position managed via separate effect

  if (!mounted) {
    return (
      <div style={{ height }}
        className="bg-cream-dark rounded-xl flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <MapPinIcon size={20} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Loading map…</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <div style={{ height }} className="rounded-xl overflow-hidden border border-border">
        <div ref={containerRef} className="w-full h-full" />
      </div>
      {placeName && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPinIcon size={11} />
          <span className="line-clamp-1">{placeName}</span>
        </div>
      )}
      {onMove && (
        <p className="text-[11px] text-muted-foreground">
          Tap the map or drag the pin to adjust your farm location.
        </p>
      )}
    </div>
  )
}
