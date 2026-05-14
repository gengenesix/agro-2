export interface WeatherForecast {
  date:             string
  maxTempC:         number
  minTempC:         number
  precipitationMm:  number
  weatherCode:      number
  description:      string
}

export interface FarmingAssessment {
  alert:    boolean
  severity: 'info' | 'warning' | 'critical'
  message:  string
}

export async function getDistrictForecast(lat: number, lng: number): Promise<WeatherForecast[]> {
  const url = new URL('https://api.open-meteo.com/v1/forecast')
  url.searchParams.set('latitude',      lat.toString())
  url.searchParams.set('longitude',     lng.toString())
  url.searchParams.set('daily',         'temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode')
  url.searchParams.set('timezone',      'Africa/Accra')
  url.searchParams.set('forecast_days', '7')

  const response = await fetch(url.toString())
  if (!response.ok) throw new Error('Open-Meteo request failed')

  const data = await response.json() as {
    daily: {
      time:                string[]
      temperature_2m_max:  number[]
      temperature_2m_min:  number[]
      precipitation_sum:   number[]
      weathercode:         number[]
    }
  }

  return data.daily.time.map((date, i) => ({
    date,
    maxTempC:        data.daily.temperature_2m_max[i]!,
    minTempC:        data.daily.temperature_2m_min[i]!,
    precipitationMm: data.daily.precipitation_sum[i]!,
    weatherCode:     data.daily.weathercode[i]!,
    description:     weatherCodeToDescription(data.daily.weathercode[i]!),
  }))
}

export function assessFarmingConditions(forecast: WeatherForecast[]): FarmingAssessment {
  const avgRain = forecast.reduce((s, d) => s + d.precipitationMm, 0) / 7
  const maxTemp = Math.max(...forecast.map(d => d.maxTempC))

  if (avgRain < 1 && maxTemp > 36) {
    return {
      alert:    true,
      severity: 'critical',
      message:  'Severe dry conditions. Delay planting. Increase irrigation if available.',
    }
  }
  if (avgRain < 3) {
    return {
      alert:    true,
      severity: 'warning',
      message:  'Below-average rainfall expected. Consider delaying planting by 1 week.',
    }
  }
  return {
    alert:    false,
    severity: 'info',
    message:  'Favorable growing conditions this week.',
  }
}

function weatherCodeToDescription(code: number): string {
  if (code === 0)              return 'Clear sky'
  if (code <= 3)               return 'Partly cloudy'
  if (code <= 49)              return 'Foggy conditions'
  if (code <= 67)              return 'Rain expected'
  if (code >= 80 && code <= 82) return 'Rain showers'
  if (code >= 95)              return 'Thunderstorm'
  return 'Mixed conditions'
}
