import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getRootRotSuggestion } from '../services/geminiService'
import { useSensorData } from './useSensorData'
import { useCropTypes } from './useCropTypes'

// Crop data for ideal ranges
const cropData = {
  wheat: {
    pH: { min: 6.0, max: 7.0 },
    N: { min: 25, max: 50 },
    P: { min: 15, max: 30 },
    K: { min: 20, max: 40 }
  },
  rice: {
    pH: { min: 5.5, max: 6.5 },
    N: { min: 30, max: 60 },
    P: { min: 20, max: 40 },
    K: { min: 25, max: 50 }
  },
  corn: {
    pH: { min: 6.0, max: 7.0 },
    N: { min: 20, max: 40 },
    P: { min: 15, max: 30 },
    K: { min: 15, max: 30 }
  },
  tomato: {
    pH: { min: 6.0, max: 6.8 },
    N: { min: 100, max: 150 },
    P: { min: 50, max: 80 },
    K: { min: 150, max: 200 }
  },
  potato: {
    pH: { min: 5.0, max: 6.0 },
    N: { min: 80, max: 120 },
    P: { min: 40, max: 60 },
    K: { min: 120, max: 160 }
  },
  // Default values
  default: {
    pH: { min: 6.0, max: 7.0 },
    N: { min: 25, max: 50 },
    P: { min: 15, max: 30 },
    K: { min: 20, max: 40 }
  }
}

export function useAlerts() {
  const { sensorData } = useSensorData()
  const { currentCropType } = useCropTypes()
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const generateAlertsFromSensorData = (sensorData, currentCropType) => {
    const alerts = []
    const ideals = cropData[currentCropType.toLowerCase()] || cropData.default

    // Moisture Alert
    const moisture = sensorData?.moisture || 0
    let moistureSeverity = 'low'
    let moistureMessage = 'Moisture levels are optimal.'

    if (moisture < 20) {
      moistureSeverity = 'critical'
      moistureMessage = 'Critical: Immediate irrigation required to prevent crop stress.'
    } else if (moisture < 40) {
      moistureSeverity = 'high'
      moistureMessage = 'High: Irrigation needed soon to maintain optimal moisture levels.'
    } else if (moisture < 60) {
      moistureSeverity = 'medium'
      moistureMessage = 'Medium: Monitor moisture levels and prepare for irrigation.'
    }

    alerts.push({
      alert_type: 'moisture',
      severity: moistureSeverity,
      value: `${moisture.toFixed(1)}%`,
      message: moistureMessage
    })

    // pH Level Alert
    const ph = sensorData?.ph_level || 7.0
    let phSeverity = 'low'
    let phMessage = `pH level (${ph.toFixed(1)}) is within optimal range (${ideals.pH.min}-${ideals.pH.max}).`

    if (ph < ideals.pH.min - 0.5 || ph > ideals.pH.max + 0.5) {
      phSeverity = 'high'
      phMessage = `pH level (${ph.toFixed(1)}) is outside optimal range (${ideals.pH.min}-${ideals.pH.max}). Soil amendment required.`
    } else if (ph < ideals.pH.min || ph > ideals.pH.max) {
      phSeverity = 'medium'
      phMessage = `pH level (${ph.toFixed(1)}) is slightly outside optimal range (${ideals.pH.min}-${ideals.pH.max}). Monitor and consider adjustment.`
    }

    alerts.push({
      alert_type: 'ph',
      severity: phSeverity,
      value: ph.toFixed(1),
      message: phMessage
    })

    // NPK Level Alert
    const nitrogen = sensorData?.nitrogen || 0
    const phosphorus = sensorData?.phosphorus || 0
    const potassium = sensorData?.potassium || 0

    const npkDeficiencies = []
    if (nitrogen < ideals.N.min) npkDeficiencies.push('N')
    if (phosphorus < ideals.P.min) npkDeficiencies.push('P')
    if (potassium < ideals.K.min) npkDeficiencies.push('K')

    let npkSeverity = 'low'
    let npkMessage = `NPK levels are adequate. N:${nitrogen}, P:${phosphorus}, K:${potassium}`

    if (npkDeficiencies.length > 0) {
      if (npkDeficiencies.length === 3) {
        npkSeverity = 'critical'
        npkMessage = `Critical: All nutrients deficient. Immediate fertilization required for ${npkDeficiencies.join(', ')}.`
      } else if (npkDeficiencies.length === 2) {
        npkSeverity = 'high'
        npkMessage = `High: Multiple nutrients deficient. Fertilization needed for ${npkDeficiencies.join(' and ')}.`
      } else {
        npkSeverity = 'medium'
        npkMessage = `Medium: ${npkDeficiencies[0]} nutrient deficient. Consider targeted fertilization.`
      }
    }

    alerts.push({
      alert_type: 'npk',
      severity: npkSeverity,
      value: `${nitrogen}, ${phosphorus}, ${potassium}`,
      message: npkMessage
    })

    return alerts
  }

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(10)

      if (fetchError) throw fetchError

      if (data && data.length > 0) {
        setAlerts(data)
      } else {
        // Generate alerts from sensor data
        const sensorAlerts = generateAlertsFromSensorData(sensorData, currentCropType)

        // Get AI-powered root rot suggestion
        const rootRotSuggestion = await getRootRotSuggestion(sensorData, currentCropType)

        // Add root rot alert
        sensorAlerts.push({
          alert_type: 'root_rot',
          severity: rootRotSuggestion.risk_level.toLowerCase(),
          value: rootRotSuggestion.risk_level,
          message: `${rootRotSuggestion.explanation} ${rootRotSuggestion.recommendation}`
        })

        setAlerts(sensorAlerts)
      }
    } catch (err) {
      console.error('Error fetching alerts:', err)
      setError(err.message)
      // Generate basic alerts from sensor data even on error
      const sensorAlerts = generateAlertsFromSensorData(sensorData, currentCropType)
      sensorAlerts.push({
        alert_type: 'root_rot',
        severity: 'warning',
        value: 'Unknown',
        message: 'Unable to assess root rot risk. Monitor soil conditions closely.'
      })
      setAlerts(sensorAlerts)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log('🔄 useAlerts useEffect triggered - sensorData:', sensorData, 'currentCropType:', currentCropType)
    fetchAlerts()

    // Set up real-time subscription with unique channel name
    const channelName = `alerts-changes-${Date.now()}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts'
        },
        (payload) => {
          console.log('🔔 Alerts changed:', payload)
          fetchAlerts()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Alerts subscription: CONNECTED')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Alerts subscription: ERROR - Check if Realtime is enabled on alerts table')
        } else {
          console.log('🔄 Alerts subscription status:', status)
        }
      })

    return () => {
      console.log('🔌 Cleaning up alerts subscription')
      supabase.removeChannel(channel)
    }
  }, [sensorData?.ph_level, sensorData?.moisture, sensorData?.nitrogen, sensorData?.phosphorus, sensorData?.potassium, currentCropType])

  return { alerts, loading, error, refetch: fetchAlerts }
}

