import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'

// Default to Accra if no region coords available
const REGION_COORDS: Record<string, { lat: number; lon: number }> = {
  'Greater Accra': { lat: 5.56,  lon: -0.20 },
  'Ashanti':       { lat: 6.69,  lon: -1.62 },
  'Western':       { lat: 5.00,  lon: -2.10 },
  'Eastern':       { lat: 6.10,  lon: -0.45 },
  'Central':       { lat: 5.50,  lon: -1.27 },
  'Volta':         { lat: 6.63,  lon: 0.45  },
  'Northern':      { lat: 9.40,  lon: -0.85 },
  'Upper East':    { lat: 10.79, lon: -0.85 },
  'Upper West':    { lat: 10.25, lon: -2.33 },
  'Savannah':      { lat: 9.33,  lon: -1.65 },
  'Bono':          { lat: 7.94,  lon: -2.07 },
}

const DEFAULT = { lat: 5.56, lon: -0.20 }

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const url   = new URL(req.url)
  const region = url.searchParams.get('region') ?? ''
  const coords = REGION_COORDS[region] ?? DEFAULT

  try {
    const meteoUrl = new URL('https://api.open-meteo.com/v1/forecast')
    meteoUrl.searchParams.set('latitude',   String(coords.lat))
    meteoUrl.searchParams.set('longitude',  String(coords.lon))
    meteoUrl.searchParams.set('daily',      'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode')
    meteoUrl.searchParams.set('timezone',   'Africa/Accra')
    meteoUrl.searchParams.set('forecast_days', '7')

    const res  = await fetch(meteoUrl.toString(), { next: { revalidate: 3600 } })
    const json = await res.json() as {
      daily: {
        time:                string[]
        temperature_2m_max:  number[]
        temperature_2m_min:  number[]
        precipitation_sum:   number[]
        weathercode:         number[]
      }
    }

    const d = json.daily
    const forecast = d.time.map((date, i) => ({
      date,
      maxTempC:        d.temperature_2m_max[i]  ?? 0,
      minTempC:        d.temperature_2m_min[i]  ?? 0,
      precipitationMm: d.precipitation_sum[i]   ?? 0,
      weatherCode:     d.weathercode[i]          ?? 0,
      description:     codeToLabel(d.weathercode[i] ?? 0),
    }))

    // Farming assessment based on next 3 days
    const avgRain    = forecast.slice(0, 3).reduce((s, d) => s + d.precipitationMm, 0) / 3
    const hasHeavy   = forecast.slice(0, 3).some(d => d.precipitationMm > 20)
    const allDry     = forecast.slice(0, 7).every(d => d.precipitationMm < 1)

    const assessment = {
      alert:    hasHeavy || allDry,
      severity: hasHeavy ? 'warning' : allDry ? 'caution' : 'good',
      message:  hasHeavy
        ? 'Heavy rainfall expected. Delay planting; ensure drainage.'
        : allDry
        ? 'Dry spell ahead. Irrigate crops if possible.'
        : `Moderate conditions. Average rainfall ${avgRain.toFixed(1)} mm over next 3 days.`,
    }

    return NextResponse.json({ success: true, data: { forecast, assessment } })
  } catch {
    return NextResponse.json(
      { success: true, data: { forecast: [], assessment: { alert: false, severity: 'good', message: 'Weather data unavailable.' } } }
    )
  }
}

function codeToLabel(code: number): string {
  if (code === 0)              return 'Clear sky'
  if (code <= 3)               return 'Partly cloudy'
  if (code <= 49)              return 'Foggy'
  if (code <= 69)              return 'Drizzle'
  if (code <= 79)              return 'Rain'
  if (code <= 99)              return 'Thunderstorm'
  return 'Overcast'
}
