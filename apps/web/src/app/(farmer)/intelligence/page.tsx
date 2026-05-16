'use client'

import { useEffect, useState } from 'react'
import { useAuth }             from '@/context/auth-context'
import { api }                 from '@/lib/api'
import { WeatherCard }         from '@/components/intelligence/weather-card'
import { PriceChart }          from '@/components/intelligence/price-chart'
import { DashboardStatsSkeleton } from '@/components/shared/skeleton'
import { PestAlertIcon, BellIcon } from '@/components/shared/icons'
import { formatDate }          from '@/lib/format'
import type { WeatherDay, WeatherAssessment, MarketPrice } from '@agroconnect/types'

interface PestAlert {
  id:         string
  pest:       string
  crop:       string
  severity:   'low' | 'medium' | 'high'
  region:     string
  message:    string
  reportedAt: string
}

const SEVERITY_COLORS = {
  low:    'bg-lime/20 text-forest border-lime/30',
  medium: 'bg-harvest-gold/15 text-harvest-gold border-harvest-gold/30',
  high:   'bg-red-50 text-red-700 border-red-200',
}

export default function IntelligencePage() {
  const { user }  = useAuth()
  const [forecast, setForecast]   = useState<WeatherDay[]>([])
  const [assessment, setAssess]   = useState<WeatherAssessment | null>(null)
  const [prices, setPrices]       = useState<MarketPrice[]>([])
  const [pests, setPests]         = useState<PestAlert[]>([])
  const [loading, setLoading]     = useState(true)
  const [district, setDistrict]   = useState('Accra, Greater Accra')

  useEffect(() => {
    const dist = (user as any)?.farmerProfile?.district ?? 'Accra'
    setDistrict(dist)

    Promise.allSettled([
      api.get('/intelligence/weather'),
      api.get('/intelligence/prices'),
      api.get('/intelligence/pest-alerts'),
    ]).then(([w, p, pe]) => {
      if (w.status === 'fulfilled') {
        setForecast(w.value.data.data?.forecast ?? [])
        setAssess(w.value.data.data?.assessment ?? { alert: false, severity: 'good', message: '' })
      }
      if (p.status  === 'fulfilled') setPrices(p.value.data.data?.prices ?? [])
      if (pe.status === 'fulfilled') setPests(pe.value.data.data?.alerts ?? [])
    }).finally(() => setLoading(false))
  }, [user])

  if (loading) return (
    <main className="min-h-screen bg-cream p-4 sm:p-6 space-y-5">
      <DashboardStatsSkeleton />
    </main>
  )

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="font-bold text-forest text-lg">Farm Intelligence</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Weather · Prices · Pest alerts</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Weather */}
        {forecast.length > 0 && assessment && (
          <WeatherCard forecast={forecast} assessment={assessment} district={district} />
        )}

        {/* Market prices */}
        <PriceChart prices={prices} />

        {/* Pest alerts */}
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <PestAlertIcon size={18} className="text-red-500" />
            <h2 className="font-bold text-forest text-sm">Pest & disease alerts</h2>
            {pests.length > 0 && (
              <span className="ml-auto font-mono text-xs font-bold px-2 py-0.5 bg-red-50 text-red-600 rounded-full">
                {pests.length} active
              </span>
            )}
          </div>

          {pests.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="w-10 h-10 bg-lime/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
                     className="w-5 h-5 text-forest">
                  <path d="M16 7L7 16l-4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-forest">All clear</p>
              <p className="text-xs text-muted-foreground mt-1">No active pest alerts in your region</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {pests.map(alert => (
                <div key={alert.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize
                                          ${SEVERITY_COLORS[alert.severity]}`}>
                          {alert.severity} risk
                        </span>
                        <span className="text-xs text-muted-foreground">{alert.region}</span>
                      </div>
                      <p className="font-semibold text-forest text-sm">{alert.pest}</p>
                      <p className="text-xs text-muted-foreground">Affecting: {alert.crop}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground flex-shrink-0">{formatDate(alert.reportedAt)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{alert.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Subscribe to alerts */}
        <div className="bg-forest rounded-2xl p-5 flex items-center gap-4">
          <div className="w-10 h-10 bg-lime/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <BellIcon size={20} className="text-lime" />
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-sm">SMS alerts</p>
            <p className="text-white/70 text-xs mt-0.5">Get weather and pest alerts directly on your phone.</p>
          </div>
          <button className="px-4 py-2 bg-lime text-forest text-xs font-bold rounded-xl hover:bg-lime-dark transition-colors flex-shrink-0">
            Enable
          </button>
        </div>
      </div>
    </main>
  )
}
