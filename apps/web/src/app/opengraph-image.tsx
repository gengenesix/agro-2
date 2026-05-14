import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt     = 'AgroConnect Ghana — From seed to sale. Every farmer. Every region.'
export const size    = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'flex-start', justifyContent: 'flex-end',
          background: 'linear-gradient(135deg, #1a3a24 0%, #0f2518 60%, #1a3a24 100%)',
          padding: '64px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Decorative lime circle */}
        <div style={{
          position: 'absolute', top: -120, right: -80,
          width: 500, height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(200,245,66,0.15) 0%, transparent 70%)',
        }} />

        {/* Logo badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          marginBottom: 32,
          background: 'rgba(200,245,66,0.12)',
          border: '1px solid rgba(200,245,66,0.3)',
          borderRadius: 16,
          padding: '10px 20px',
          width: 'fit-content',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#c8f542',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1a3a24">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-13 6.5S11.5 20 11.5 20"/>
            </svg>
          </div>
          <span style={{ color: '#c8f542', fontSize: 14, fontWeight: 700, letterSpacing: '0.1em' }}>
            AGROCONNECT
          </span>
        </div>

        {/* Headline */}
        <div style={{
          fontSize: 64, fontWeight: 800, color: '#ffffff',
          lineHeight: 1.1, marginBottom: 20, maxWidth: 720,
        }}>
          Ghana&apos;s Agricultural Network
        </div>

        {/* Tagline */}
        <div style={{
          fontSize: 24, color: 'rgba(255,255,255,0.7)',
          marginBottom: 40,
        }}>
          From seed to sale. Every farmer. Every region.
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { label: 'Regions covered', value: '16' },
            { label: 'Sectors',         value: '5'  },
            { label: 'Currency',        value: 'GHS'},
          ].map(stat => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12, padding: '12px 20px',
              display: 'flex', flexDirection: 'column', gap: 2,
            }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: '#c8f542', fontFamily: 'monospace' }}>
                {stat.value}
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Domain */}
        <div style={{
          position: 'absolute', top: 64, right: 64,
          fontSize: 16, color: 'rgba(255,255,255,0.4)', fontWeight: 600,
        }}>
          agroconnect.com.gh
        </div>
      </div>
    ),
    { ...size },
  )
}
