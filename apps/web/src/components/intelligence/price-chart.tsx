'use client'

import { PricesIcon } from '@/components/shared/icons'
import { formatGHS }  from '@/lib/format'
import type { MarketPrice } from '@agroconnect/types'

// API may return extended price objects with history for sparklines
interface PriceItem extends MarketPrice {
  priceHistory?: number[]
}

interface PriceChartProps {
  prices: PriceItem[]
}

function TrendBadge({ pct }: { pct: number }) {
  const positive = pct >= 0
  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full
                      ${positive ? 'bg-lime/20 text-forest' : 'bg-red-50 text-red-600'}`}>
      {positive ? (
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
          <path d="M2 9l4-6 4 6" />
        </svg>
      ) : (
        <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5">
          <path d="M2 3l4 6 4-6" />
        </svg>
      )}
      {Math.abs(pct).toFixed(1)}%
    </span>
  )
}

function Sparkline({ history }: { history: number[] }) {
  if (history.length < 2) return null
  const min = Math.min(...history)
  const max = Math.max(...history)
  const range = max - min || 1
  const W = 80, H = 28, pad = 2
  const pts = history.map((v, i) => {
    const x = pad + (i / (history.length - 1)) * (W - pad * 2)
    const y = H - pad - ((v - min) / range) * (H - pad * 2)
    return `${x},${y}`
  }).join(' ')

  const isUp = history[history.length - 1] >= history[0]
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-20 h-7">
      <polyline points={pts} fill="none" stroke={isUp ? 'var(--lime)' : '#ef4444'} strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PriceChart({ prices }: PriceChartProps) {
  if (!prices.length) {
    return (
      <div className="bg-white rounded-2xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <PricesIcon size={18} className="text-forest" />
          <h3 className="font-bold text-forest text-sm">Market Prices</h3>
        </div>
        <p className="text-muted-foreground text-xs text-center py-6">No price data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <PricesIcon size={18} className="text-forest" />
        <h3 className="font-bold text-forest text-sm">Market Prices</h3>
        <span className="text-xs text-muted-foreground ml-auto">Accra Central Market</span>
      </div>

      <div className="divide-y divide-border">
        {prices.map((item) => {
          const history = item.priceHistory ?? []
          const pct = history.length >= 2
            ? ((history[history.length - 1] - history[0]) / history[0]) * 100
            : 0

          return (
            <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-cream/40 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-forest truncate">{item.category.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">per {item.unit.abbreviation}</p>
              </div>

              <Sparkline history={history} />

              <div className="text-right min-w-[80px]">
                <p className="font-mono text-sm font-bold text-forest">{formatGHS(item.pricePerUnit)}</p>
                {history.length >= 2 && (
                  <div className="flex justify-end mt-0.5">
                    <TrendBadge pct={pct} />
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-5 py-2.5 bg-cream/50 border-t border-border">
        <p className="text-[10px] text-muted-foreground text-center">
          Prices updated daily · Source: Ghana Markets Authority
        </p>
      </div>
    </div>
  )
}
