import { useState, useEffect } from 'react'

const API_KEY = 'c9e49bee9ad64b7e858135239261401'

function mapConditionToIcon(condition) {
  const lower = condition.toLowerCase()
  if (lower.includes('sunny') || lower.includes('clear')) return '☀️'
  if (lower.includes('partly cloudy')) return '⛅'
  if (lower.includes('cloudy')) return '☁️'
  if (lower.includes('rain')) return '🌦️'
  if (lower.includes('snow')) return '❄️'
  return '☁️☀️' // default
}

function getDayName(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { weekday: 'long' })
}

export function useForecastData() {
  const [forecastData, setForecastData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchForecastData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch forecast from WeatherAPI
      let forecast = []
      try {
        const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=Islamabad&days=7`)
        if (response.ok) {
          const data = await response.json()
          forecast = data.forecast.forecastday.map(day => ({
            day_name: getDayName(day.date),
            condition: day.day.condition.text,
            rain_chance: day.day.daily_chance_of_rain || 0,
            temperature: Math.round(day.day.avgtemp_c),
            icon: mapConditionToIcon(day.day.condition.text)
          }))
        }
      } catch (apiError) {
        console.warn('Failed to fetch forecast from API:', apiError)
      }

      if (forecast.length > 0) {
        setForecastData(forecast)
      } else {
        // Default forecast data
        const defaultDays = [
          { day_name: 'Monday', condition: 'Sunny', rain_chance: 45, temperature: 28, icon: '☀️' },
          { day_name: 'Tuesday', condition: 'Partly Cloudy', rain_chance: 52, temperature: 26, icon: '⛅' },
          { day_name: 'Wednesday', condition: 'Cloudy', rain_chance: 60, temperature: 24, icon: '☁️' },
          { day_name: 'Thursday', condition: 'Light Rain', rain_chance: 75, temperature: 22, icon: '🌦️' },
          { day_name: 'Friday', condition: 'Sunny', rain_chance: 48, temperature: 27, icon: '☀️' },
          { day_name: 'Saturday', condition: 'Sunny', rain_chance: 42, temperature: 29, icon: '☀️' },
          { day_name: 'Sunday', condition: 'Partly Cloudy', rain_chance: 50, temperature: 28, icon: '⛅' },
        ]
        setForecastData(defaultDays)
      }
    } catch (err) {
      console.error('Error fetching forecast data:', err)
      setError(err.message)
      // Default forecast data
      const defaultDays = [
        { day_name: 'Monday', condition: 'Sunny', rain_chance: 45, temperature: 28, icon: '☀️' },
        { day_name: 'Tuesday', condition: 'Partly Cloudy', rain_chance: 52, temperature: 26, icon: '⛅' },
        { day_name: 'Wednesday', condition: 'Cloudy', rain_chance: 60, temperature: 24, icon: '☁️' },
        { day_name: 'Thursday', condition: 'Light Rain', rain_chance: 75, temperature: 22, icon: '🌦️' },
        { day_name: 'Friday', condition: 'Sunny', rain_chance: 48, temperature: 27, icon: '☀️' },
        { day_name: 'Saturday', condition: 'Sunny', rain_chance: 42, temperature: 29, icon: '☀️' },
        { day_name: 'Sunday', condition: 'Partly Cloudy', rain_chance: 50, temperature: 28, icon: '⛅' },
      ]
      setForecastData(defaultDays)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchForecastData()
  }, [])

  return { forecastData, loading, error, refetch: fetchForecastData }
}

