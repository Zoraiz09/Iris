import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useSensorData() {
  const [sensorData, setSensorData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSensorData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const { data, error: fetchError } = await supabase
        .from('sensor_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (fetchError) throw fetchError
      setSensorData(data)
    } catch (err) {
      console.error('Error fetching sensor data:', err)
      setError(err.message)
      // Set default values if fetch fails
      setSensorData({
        ph_level: 8.1,
        moisture: 0.0,
        soil_temp: 24.5,
        nitrogen: 0,
        phosphorus: 0,
        potassium: 0,
        sensor_status: 'active'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSensorData()

    // Set up real-time subscription with unique channel name
    const channelName = `sensor-data-changes-${Date.now()}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sensor_data'
        },
        (payload) => {
          console.log('🔔 Sensor data changed:', payload)
          // Always fetch the latest data when any change occurs
          fetchSensorData()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Sensor data subscription: CONNECTED')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Sensor data subscription: ERROR - Check if Realtime is enabled on sensor_data table')
        } else {
          console.log('🔄 Sensor data subscription status:', status)
        }
      })

    return () => {
      console.log('🔌 Cleaning up sensor data subscription')
      supabase.removeChannel(channel)
    }
  }, [])

  return { sensorData, loading, error, refetch: fetchSensorData }
}

