import { ImageResponse } from 'next/og'

export const runtime     = 'edge'
export const size        = { width: 1200, height: 630 }
export const contentType = 'image/png'

const SECTOR_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  crops:     { bg: '#94c58a', text: '#1a4a28', label: 'Crops'      },
  livestock: { bg: '#d4a86b', text: '#6b3a1f', label: 'Livestock'  },
  poultry:   { bg: '#e8c547', text: '#5a3a10', label: 'Poultry'    },
  fisheries: { bg: '#7ab3d4', text: '#1a3a5c', label: 'Fisheries'  },
  inputs:    { bg: '#b39ddb', text: '#3a1a5c', label: 'Agro-Inputs'},
}

async function getListing(slug: string) {
  try {
    const base = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'
    const res  = await fetch(`${base}/listings/${slug}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const json = await res.json()
    return json.data?.listing ?? null
  } catch {
    return null
  }
}

export default async function Image({ params }: { params: { slug: string } }) {
  const listing = await getListing(params.slug)

  if (!listing) {
    // Fallback OG image
    return new ImageResponse(
      (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#1a3a24',
        }}>
          <span style={{ color: '#c8f542', fontSize: 40, fontWeight: 800, fontFamily: 'sans-serif' }}>
            AgroConnect Ghana
          </span>
        </div>
      ),
      { ...size },
    )
  }

  const sector      = listing.sector ?? 'crops'
  const sectorColor = SECTOR_COLORS[sector] ?? SECTOR_COLORS['crops']
  const price       = `GHS ${Number(listing.pricePerUnit).toFixed(2)}`
  const unit        = listing.unit ?? 'kg'
  const region      = listing.region ?? 'Ghana'
  const seller      = listing.seller?.fullName ?? 'AgroConnect Seller'
  const photo       = listing.photos?.[0] ?? null

  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex',
        background: '#f8f3e8',
        fontFamily: 'sans-serif',
      }}>
        {/* Left — content */}
        <div style={{
          flex: 1,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
          padding: 56,
          background: 'linear-gradient(135deg, #1a3a24 0%, #0f2518 100%)',
        }}>
          {/* Sector chip */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            width: 'fit-content',
          }}>
            <div style={{
              background: sectorColor.bg,
              color: sectorColor.text,
              padding: '6px 14px', borderRadius: 10,
              fontSize: 13, fontWeight: 700, letterSpacing: '0.06em',
            }}>
              {sectorColor.label.toUpperCase()}
            </div>
          </div>

          {/* Title */}
          <div style={{
            fontSize: listing.title.length > 50 ? 36 : 44,
            fontWeight: 800, color: '#ffffff',
            lineHeight: 1.15, maxWidth: 500,
          }}>
            {listing.title}
          </div>

          {/* Price + details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{
                fontFamily: 'monospace', fontSize: 48, fontWeight: 800, color: '#c8f542',
              }}>
                {price}
              </span>
              <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.6)' }}>/{unit}</span>
            </div>
            <div style={{ display: 'flex', gap: 16, fontSize: 15, color: 'rgba(255,255,255,0.65)' }}>
              <span>{region}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
              <span>{seller}</span>
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
              <span>agroconnect.com.gh</span>
            </div>
          </div>
        </div>

        {/* Right — photo */}
        {photo && (
          <div style={{
            width: 420, height: '100%',
            overflow: 'hidden', flexShrink: 0,
            backgroundImage: `url(${photo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }} />
        )}
        {!photo && (
          <div style={{
            width: 420, height: '100%', flexShrink: 0,
            background: sectorColor.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="120" height="120" viewBox="0 0 24 24" fill={sectorColor.text} opacity={0.4}>
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-13 6.5S11.5 20 11.5 20"/>
            </svg>
          </div>
        )}
      </div>
    ),
    { ...size },
  )
}
