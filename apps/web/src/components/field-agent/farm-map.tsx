'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface MapFarmer {
  id:                      string
  gpsLat:                  number | null
  gpsLng:                  number | null
  user:                    { fullName: string }
  verificationRequested?:  boolean
}

export interface AgentLocation {
  lat: number
  lng: number
}

interface FarmMapProps {
  farmers:  MapFarmer[]
  selected: MapFarmer | null
  agentLoc: AgentLocation | null
}

// Ghana geographic center
const GHANA: L.LatLngTuple = [7.9465, -1.0232]

// Standard solid circle pin
function pin(color: string, size: number): L.DivIcon {
  return L.divIcon({
    className:  '',
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;
      background:${color};border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.32)"></div>`,
  })
}

// Gold pulsing pin for farmers who explicitly requested a visit.
// The pulse ring is rendered via a CSS animation injected into the document head.
function goldPulsePin(size: number, isSelected: boolean): L.DivIcon {
  const ring  = size + 16        // pulse halo extends 8px each side
  const color = isSelected ? '#f59e0b' : '#d97706'   // amber-400 : amber-600
  return L.divIcon({
    className:  '',
    iconSize:   [ring, ring],
    iconAnchor: [ring / 2, ring / 2],
    html: `
      <div style="width:${ring}px;height:${ring}px;position:relative;
                  display:flex;align-items:center;justify-content:center">
        <div style="position:absolute;width:${ring}px;height:${ring}px;border-radius:50%;
                    background:${color};opacity:0.35;
                    animation:agro-pulse 1.8s ease-in-out infinite"></div>
        <div style="width:${size}px;height:${size}px;border-radius:50%;
                    background:${color};border:3px solid #fff;
                    box-shadow:0 2px 10px rgba(217,119,6,0.55);
                    position:relative;z-index:1"></div>
      </div>`,
  })
}

function MapController({
  selected,
  agentLoc,
}: {
  selected: MapFarmer | null
  agentLoc: AgentLocation | null
}) {
  const map = useMap()

  useEffect(() => {
    const hasTarget = selected?.gpsLat != null && selected?.gpsLng != null
    const hasAgent  = agentLoc != null

    if (hasTarget && hasAgent) {
      map.fitBounds(
        L.latLngBounds(
          [selected!.gpsLat!, selected!.gpsLng!],
          [agentLoc!.lat,    agentLoc!.lng],
        ),
        { padding: [60, 60], maxZoom: 14 },
      )
    } else if (hasTarget) {
      map.flyTo([selected!.gpsLat!, selected!.gpsLng!], 14, { duration: 1.2 })
    } else if (hasAgent) {
      map.flyTo([agentLoc!.lat, agentLoc!.lng], 13, { duration: 1.0 })
    }
  }, [selected, agentLoc, map])

  return null
}

export default function FarmMap({ farmers, selected, agentLoc }: FarmMapProps) {
  const plotted = farmers.filter(f => f.gpsLat != null && f.gpsLng != null)

  // Inject keyframes for the gold pulse animation once per mount
  useEffect(() => {
    const id    = 'agro-pulse-keyframes'
    if (document.getElementById(id)) return
    const style = document.createElement('style')
    style.id    = id
    style.textContent = `
      @keyframes agro-pulse {
        0%   { transform: scale(0.85); opacity: 0.55; }
        50%  { transform: scale(1.4);  opacity: 0;    }
        100% { transform: scale(0.85); opacity: 0;    }
      }
    `
    document.head.appendChild(style)
  }, [])

  return (
    <MapContainer
      center={GHANA}
      zoom={7}
      style={{ width: '100%', height: '100%' }}
      zoomControl
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapController selected={selected} agentLoc={agentLoc} />

      {plotted.map(f => {
        const isSelected  = selected?.id === f.id
        const isRequested = !!f.verificationRequested

        return (
          <Marker
            key={f.id}
            position={[f.gpsLat!, f.gpsLng!]}
            icon={
              isRequested
                ? goldPulsePin(isSelected ? 20 : 14, isSelected)
                : pin(isSelected ? '#7ecb20' : '#1a4731', isSelected ? 20 : 12)
            }
            zIndexOffset={isSelected ? 1000 : isRequested ? 500 : 0}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>{f.user.fullName}</span>
              {isRequested && (
                <span style={{ fontSize: 10, marginLeft: 6, color: '#d97706', fontWeight: 700 }}>
                  Requested
                </span>
              )}
            </Tooltip>
          </Marker>
        )
      })}

      {agentLoc && (
        <Marker
          position={[agentLoc.lat, agentLoc.lng]}
          icon={pin('#2563eb', 16)}
          zIndexOffset={2000}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={0.95} permanent>
            <span style={{ fontSize: 12, fontWeight: 600 }}>You</span>
          </Tooltip>
        </Marker>
      )}

      {agentLoc && selected?.gpsLat != null && selected?.gpsLng != null && (
        <Polyline
          positions={[
            [agentLoc.lat, agentLoc.lng],
            [selected.gpsLat, selected.gpsLng],
          ]}
          color="#1a4731"
          weight={2}
          dashArray="6 6"
          opacity={0.65}
        />
      )}
    </MapContainer>
  )
}
