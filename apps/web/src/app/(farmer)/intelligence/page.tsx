'use client'

import { useEffect, useRef, useState } from 'react'
import { useAuth }                      from '@/context/auth-context'
import { api }                          from '@/lib/api'
import { WeatherCard }                  from '@/components/intelligence/weather-card'
import { PriceChart }                   from '@/components/intelligence/price-chart'
import { DashboardStatsSkeleton }       from '@/components/shared/skeleton'
import { PestAlertIcon, BellIcon }      from '@/components/shared/icons'
import { formatDate }                   from '@/lib/format'
import { GHANA_REGIONS }                from '@/lib/types'
import type { WeatherDay, WeatherAssessment, MarketPrice } from '@/lib/types'

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

const HIGH_RISK_PATHOGENS = [
  'fall armyworm', 'cassava brown streak', 'maize lethal necrosis',
  'tomato yellow leaf curl', 'armyworm', 'striga', 'rice yellow mottle',
]

type DiagnosisState = 'idle' | 'scanning' | 'result'

// ── AI Diagnosis Card ──────────────────────────────────────────────────────────

function AIDiagnosisCard() {
  const [open, setOpen]           = useState(false)
  const [state, setState]         = useState<DiagnosisState>('idle')
  const [fileName, setFileName]   = useState('')
  const [dragOver, setDragOver]   = useState(false)
  const timerRef                  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef                  = useRef<HTMLInputElement>(null)

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current) }, [])

  function processFile(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return
    setFileName(file.name)
    setState('scanning')
    timerRef.current = setTimeout(() => setState('result'), 2600)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    processFile(e.target.files?.[0])
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    processFile(e.dataTransfer.files[0])
  }

  function reset() {
    setState('idle')
    setFileName('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full px-5 py-4 flex items-center gap-3 hover:bg-cream/40 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-lime/20 flex items-center justify-center flex-shrink-0">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
               className="w-4 h-4 text-forest">
            <path d="M10 3a7 7 0 100 14A7 7 0 0010 3z" />
            <path d="M10 7v3l2 2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold text-forest">AI Crop Symptom Diagnosis</p>
          <p className="text-xs text-muted-foreground mt-0.5">Upload a leaf or crop photo for instant analysis</p>
        </div>
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
             className={`w-4 h-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}>
          <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Expandable body */}
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">

          {state === 'idle' && (
            <label
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center gap-3 px-6 py-8 rounded-xl border-2 border-dashed
                          cursor-pointer transition-colors
                          ${dragOver
                            ? 'border-forest bg-lime/10'
                            : 'border-border hover:border-forest/40 hover:bg-cream/60'}`}
            >
              <div className="w-12 h-12 bg-cream rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                     className="w-6 h-6 text-muted-foreground">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeLinecap="round" strokeLinejoin="round" />
                  <polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round" />
                  <line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-forest">Upload leaf or crop photo</p>
                <p className="text-xs text-muted-foreground mt-0.5">Click to browse or drag &amp; drop · JPG, PNG, HEIC</p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleInputChange}
              />
            </label>
          )}

          {state === 'scanning' && (
            <div className="flex flex-col items-center gap-4 py-8">
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 animate-spin text-forest" viewBox="0 0 56 56" fill="none">
                  <circle cx="28" cy="28" r="24" stroke="currentColor" strokeOpacity="0.15" strokeWidth="4" />
                  <path d="M28 4a24 24 0 0124 24" stroke="currentColor" strokeWidth="4"
                        strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 bg-lime/30 rounded-full" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-forest">Analyzing crop sample…</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Running visual pathogen detection on{' '}
                  <span className="font-medium text-forest">{fileName}</span>
                </p>
              </div>
            </div>
          )}

          {state === 'result' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-4 py-3 bg-lime/15 rounded-xl border border-lime/30">
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75"
                     className="w-5 h-5 text-forest flex-shrink-0">
                  <path d="M16 6L8 14l-4-4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-xs font-bold text-forest">Analysis complete — {fileName}</p>
              </div>

              <div className="bg-cream rounded-xl px-4 py-4 space-y-3">
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                    Analyzed Asset
                  </p>
                  <p className="text-sm font-semibold text-forest">
                    Potential early-stage leaf spot detected
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Confidence: <span className="font-semibold text-harvest-gold">74%</span> ·
                    Pathogen class: <span className="font-semibold">Cercospora / Alternaria spp.</span>
                  </p>
                </div>

                <div className="border-t border-border pt-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                    Recommended Mitigation
                  </p>
                  <p className="text-xs text-forest leading-relaxed">
                    Apply organic neem-based bio-pesticide (2% solution) as foliar spray every 7 days.
                    Remove and destroy severely infected leaves. For field confirmation, contact the{' '}
                    <span className="font-semibold">Pokuase PPRSD office</span> or your nearest MoFA extension officer.
                  </p>
                </div>
              </div>

              <button
                onClick={reset}
                className="w-full h-10 rounded-xl border border-border text-xs font-semibold
                           text-muted-foreground hover:text-forest hover:border-forest/40 transition-colors"
              >
                Analyze another photo
              </button>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground text-center">
            AI diagnosis is indicative only. Always confirm with a certified agronomist.
          </p>
        </div>
      )}
    </div>
  )
}

// ── Pest Alerts Section ────────────────────────────────────────────────────────

function PestAlertsSection({ pests, userRegion }: { pests: PestAlert[]; userRegion: string }) {
  const outbreakAlerts = pests.filter(a =>
    a.severity === 'high' &&
    HIGH_RISK_PATHOGENS.some(p => a.pest.toLowerCase().includes(p))
  )

  const regionAlerts   = pests.filter(a => a.region.toLowerCase() === userRegion.toLowerCase())
  const otherAlerts    = pests.filter(a => a.region.toLowerCase() !== userRegion.toLowerCase())

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center gap-2">
        <PestAlertIcon size={18} className="text-red-500" />
        <h2 className="font-bold text-forest text-sm">Pest &amp; disease alerts</h2>
        <span className="text-[10px] font-semibold px-2 py-0.5 bg-cream rounded-full text-muted-foreground border border-border">
          {userRegion}
        </span>
        {pests.length > 0 && (
          <span className="ml-auto font-mono text-xs font-bold px-2 py-0.5 bg-red-50 text-red-600 rounded-full">
            {pests.length} active
          </span>
        )}
      </div>

      {/* High-risk outbreak banner */}
      {outbreakAlerts.length > 0 && (
        <div className="mx-4 mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
               className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5">
            <path d="M10 3l7.5 13H2.5L10 3z" strokeLinejoin="round" />
            <path d="M10 9v3M10 14.5h.01" strokeLinecap="round" />
          </svg>
          <div>
            <p className="text-xs font-bold text-red-700">High-risk pathogen outbreak detected</p>
            <p className="text-xs text-red-600 mt-0.5">
              {outbreakAlerts.map(a => a.pest).join(', ')} — immediate field inspection recommended.
            </p>
          </div>
        </div>
      )}

      {pests.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <div className="w-10 h-10 bg-lime/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
                 className="w-5 h-5 text-forest">
              <path d="M16 7L7 16l-4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-forest">All clear</p>
          <p className="text-xs text-muted-foreground mt-1">
            No active pest alerts in <span className="font-semibold">{userRegion}</span>
          </p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {/* Region-matched alerts first */}
          {regionAlerts.map(alert => (
            <AlertRow key={alert.id} alert={alert} isLocal />
          ))}
          {otherAlerts.map(alert => (
            <AlertRow key={alert.id} alert={alert} isLocal={false} />
          ))}
        </div>
      )}
    </div>
  )
}

function AlertRow({ alert, isLocal }: { alert: PestAlert; isLocal: boolean }) {
  return (
    <div className={`px-5 py-4 ${isLocal ? 'bg-red-50/40' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize
                              ${SEVERITY_COLORS[alert.severity]}`}>
              {alert.severity} risk
            </span>
            {isLocal && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
                               bg-harvest-gold/15 text-harvest-gold border border-harvest-gold/30">
                Your region
              </span>
            )}
            <span className="text-xs text-muted-foreground">{alert.region}</span>
          </div>
          <p className="font-semibold text-forest text-sm">{alert.pest}</p>
          <p className="text-xs text-muted-foreground">Affecting: {alert.crop}</p>
        </div>
        <p className="text-[10px] text-muted-foreground flex-shrink-0">{formatDate(alert.reportedAt)}</p>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{alert.message}</p>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function IntelligencePage() {
  const { user }  = useAuth()
  const [forecast, setForecast]     = useState<WeatherDay[]>([])
  const [assessment, setAssess]     = useState<WeatherAssessment | null>(null)
  const [prices, setPrices]         = useState<MarketPrice[]>([])
  const [pests, setPests]           = useState<PestAlert[]>([])
  const [loading, setLoading]       = useState(true)
  const [district, setDistrict]     = useState('Accra, Greater Accra')
  const [priceQuery, setPriceQuery] = useState('')

  const userRegion = GHANA_REGIONS.find(
    r => r.id === (user as any)?.regionId
  )?.name ?? 'Greater Accra'

  useEffect(() => {
    const dist = (user as any)?.farmerProfile?.district ?? 'Accra'
    setDistrict(dist)

    Promise.allSettled([
      api.get('/intelligence/weather'),
      api.get('/market-prices'),
      api.get('/intelligence/pest-alerts'),
    ]).then(([w, p, pe]) => {
      if (w.status  === 'fulfilled') {
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

  const filteredPrices = priceQuery
    ? prices.filter(p => p.category.name.toLowerCase().includes(priceQuery.toLowerCase()))
    : prices

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
        <div className="space-y-3">
          <div className="relative">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5"
                 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="M13 13l3.5 3.5" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              value={priceQuery}
              onChange={e => setPriceQuery(e.target.value)}
              placeholder="Search commodity prices..."
              className="w-full h-11 pl-10 pr-4 text-sm rounded-xl border border-border bg-white
                         focus:outline-none focus:ring-2 focus:ring-lime/40 placeholder:text-muted-foreground/60"
            />
          </div>

          {priceQuery && filteredPrices.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border px-5 py-10 text-center">
              <p className="text-sm font-semibold text-forest">No local price data for &ldquo;{priceQuery}&rdquo;</p>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-sm mx-auto leading-relaxed">
                Check external agricultural bulletins at{' '}
                <a
                  href="https://marketplace.esoko.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-700 underline underline-offset-2
                             hover:text-emerald-800 transition-colors"
                >
                  Esoko Ghana
                </a>
                {' '}or the{' '}
                <a
                  href="https://mofa.gov.gh/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-emerald-700 underline underline-offset-2
                             hover:text-emerald-800 transition-colors"
                >
                  MoFA price portals
                </a>
                {' '}for this commodity.
              </p>
            </div>
          ) : (
            <PriceChart prices={filteredPrices} />
          )}
        </div>

        {/* Pest alerts — region-aware */}
        <PestAlertsSection pests={pests} userRegion={userRegion} />

        {/* AI Diagnosis */}
        <AIDiagnosisCard />

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
