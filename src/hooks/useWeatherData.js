import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY

function mapConditionToIcon(condition) {
  const lower = condition.toLowerCase()
  if (lower.includes('sunny') || lower.includes('clear')) return '☀️'
  if (lower.includes('partly cloudy')) return '⛅'
  if (lower.includes('cloudy')) return '☁️'
  if (lower.includes('rain')) return '🌦️'
  if (lower.includes('snow')) return '❄️'
  return '☁️☀️' // default
}

export function useWeatherData() {
  const [regionalWeather, setRegionalWeather] = useState(null)
  const [onSiteWeather, setOnSiteWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchWeatherData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch regional weather from WeatherAPI
      let regionalData = null
      try {
        const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=Islamabad`)
        if (response.ok) {
          const data = await response.json()
          regionalData = {
            location: `${data.location.name}, ${data.location.country}`,
            temperature: data.current.temp_c,
            humidity: data.current.humidity,
            weather_type: data.current.condition.text,
            weather_icon: mapConditionToIcon(data.current.condition.text)
          }
        }
      } catch (apiError) {
        console.warn('Failed to fetch regional weather from API:', apiError)
      }

      // Fetch on-site weather from Supabase
      const { data, error: fetchError } = await supabase
        .from('weather_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(2)

      if (fetchError) throw fetchError

      let onSiteData = null
      if (data && data.length > 0) {
        onSiteData = data.find(w => w.is_on_site) || data[0]
      }

      // Set regional weather (API or default)
      if (regionalData) {
        setRegionalWeather(regionalData)
      } else {
        setRegionalWeather({
          location: 'Islamabad, PK',
          temperature: 8,
          humidity: 26,
          weather_type: 'Partly Cloudy',
          weather_icon: '☁️☀️'
        })
      }

      // Set on-site weather (Supabase or default)
      if (onSiteData) {
        setOnSiteWeather(onSiteData)
      } else {
        setOnSiteWeather({
          location: 'On-Site',
          temperature: 16.1,
          humidity: 75.7,
          weather_type: 'Partly Cloudy',
          weather_icon: '☁️☀️'
        })
      }
    } catch (err) {
      console.error('Error fetching weather data:', err)
      setError(err.message)
      // Set default values
      setRegionalWeather({
        location: 'Islamabad, PK',
        temperature: 8,
        humidity: 26,
        weather_type: 'Partly Cloudy',
        weather_icon: '☁️☀️'
      })
      setOnSiteWeather({
        location: 'On-Site',
        temperature: 16.1,
        humidity: 75.7,
        weather_type: 'Partly Cloudy',
        weather_icon: '☁️☀️'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeatherData()

    // Set up real-time subscription with unique channel name
    const channelName = `weather-data-changes-${Date.now()}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weather_data'
        },
        (payload) => {
          console.log('🔔 Weather data changed:', payload)
          fetchWeatherData()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Weather data subscription: CONNECTED')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Weather data subscription: ERROR - Check if Realtime is enabled on weather_data table')
        } else {
          console.log('🔄 Weather data subscription status:', status)
        }
      })

    return () => {
      console.log('🔌 Cleaning up weather data subscription')
      supabase.removeChannel(channel)
    }
  }, [])

  return { regionalWeather, onSiteWeather, loading, error, refetch: fetchWeatherData }
}

