'use client'

import { WeatherIcon, InfoIcon } from '@/components/shared/icons'
import type { WeatherDay, WeatherAssessment } from '@agroconnect/types'

interface WeatherCardProps {
  forecast:   WeatherDay[]
  assessment: WeatherAssessment
  district:   string
}

const WMO_LABELS: Record<number, string> = {
  0: 'Clear', 1: 'Mostly Clear', 2: 'Partly Cloudy', 3: 'Overcast',
  45: 'Foggy', 48: 'Icy Fog',
  51: 'Light Drizzle', 53: 'Drizzle', 55: 'Heavy Drizzle',
  61: 'Light Rain', 63: 'Rain', 65: 'Heavy Rain',
  71: 'Light Snow', 73: 'Snow', 75: 'Heavy Snow',
  80: 'Showers', 81: 'Heavy Showers', 82: 'Violent Showers',
  95: 'Thunderstorm', 96: 'Thunderstorm', 99: 'Severe Thunderstorm',
}

function WeatherEmoji({ code }: { code: number }) {
  const svgProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.75', className: 'w-6 h-6' }
  if (code === 0 || code === 1) return (
    <svg {...svgProps} className="w-6 h-6 text-harvest-gold">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" strokeLinecap="round" />
    </svg>
  )
  if (code >= 61 && code <= 99) return (
    <svg {...svgProps} className="w-6 h-6 text-blue-400">
      <path d="M20 17.58A5 5 0 0018 8h-1.26A8 8 0 104 15.25" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 19v2M8 13v2M12 21v2M12 15v2M16 19v2M16 13v2" strokeLinecap="round" />
    </svg>
  )
  return (
    <svg {...svgProps} className="w-6 h-6 text-muted-foreground">
      <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const SEVERITY_STYLES: Record<string, string> = {
  good:    'bg-lime/20 text-forest border-lime/40',
  caution: 'bg-harvest-gold/15 text-harvest-gold border-harvest-gold/30',
  warning: 'bg-red-50 text-red-700 border-red-200',
}

export function WeatherCard({ forecast, assessment, district }: WeatherCardProps) {
  const today = forecast[0]

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-forest px-5 py-4 flex items-start justify-between">
        <div>
          <p className="text-lime text-xs font-bold uppercase tracking-wider mb-1">7-Day Forecast</p>
          <h3 className="text-white font-bold text-base">{district}</h3>
          {today && (
            <p className="text-white/70 text-sm mt-0.5">
              {Math.round(today.tempMin)}° – {Math.round(today.tempMax)}°C
              · {WMO_LABELS[today.weatherCode] ?? 'Unknown'}
            </p>
          )}
        </div>
        <WeatherIcon size={28} className="text-lime flex-shrink-0 mt-0.5" />
      </div>

      {/* Assessment alert */}
      {assessment.alert && (
        <div className={`mx-4 mt-4 flex items-start gap-2 px-3 py-2.5 rounded-xl border text-sm
                         ${SEVERITY_STYLES[assessment.severity] ?? SEVERITY_STYLES.caution}`}>
          <InfoIcon size={15} className="flex-shrink-0 mt-0.5" />
          <p className="leading-snug text-xs font-medium">{assessment.message}</p>
        </div>
      )}

      {/* 7-day strip */}
      <div className="px-4 py-4 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {forecast.map((day, i) => {
            const date = new Date(day.date)
            const label = i === 0 ? 'Today'
                        : i === 1 ? 'Tmrw'
                        : date.toLocaleDateString('en-GH', { weekday: 'short' })
            return (
              <div
                key={day.date}
                className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl min-w-[62px]
                            ${i === 0 ? 'bg-cream' : 'hover:bg-cream/60'} transition-colors`}
              >
                <p className="text-[10px] font-bold text-muted-foreground uppercase">{label}</p>
                <WeatherEmoji code={day.weatherCode} />
                <div className="text-center">
                  <p className="font-mono text-xs font-bold text-forest">{Math.round(day.tempMax)}°</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{Math.round(day.tempMin)}°</p>
                </div>
                {day.precipitationSum > 0 && (
                  <p className="font-mono text-[10px] text-blue-500">{day.precipitationSum.toFixed(1)}mm</p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Farming tips row */}
      <div className="px-4 pb-4">
        <div className="flex gap-3 flex-wrap">
          {today && (
            <>
              <Stat label="Humidity" value={`${Math.round((today as any).humidity ?? 65)}%`} />
              <Stat label="Wind" value={`${Math.round((today as any).windSpeed ?? 12)} km/h`} />
              <Stat label="UV Index" value={String((today as any).uvIndex ?? 'N/A')} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-cream rounded-xl px-3 py-1.5">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="font-mono text-xs font-bold text-forest">{value}</p>
    </div>
  )
}
