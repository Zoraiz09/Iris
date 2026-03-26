import { useState, useEffect } from 'react'
import { getRootRotSuggestion } from '../services/geminiService'

export function useRootRotPrediction(sensorData, currentCropType) {
  const [rootRotData, setRootRotData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRootRotPrediction = async () => {
    try {
      setLoading(true)
      setError(null)

      // Only generate prediction if sensor data is available
      if (!sensorData) {
        console.log('⏳ Waiting for sensor data before generating root rot prediction...')
        setRootRotData(null)
        setLoading(false)
        return
      }

      console.log('🔍 Generating root rot prediction with Gemini...')
      console.log('📊 Sensor data:', sensorData)
      console.log('🌱 Crop type:', currentCropType)

      // Get AI-powered root rot prediction
      const prediction = await getRootRotSuggestion(sensorData, currentCropType)
      console.log('✨ Root rot prediction received:', prediction)
      setRootRotData(prediction)
    } catch (err) {
      console.error('❌ Error fetching root rot prediction:', err)
      setError(err.message)
      setRootRotData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRootRotPrediction()
  }, [sensorData, currentCropType])

  return { rootRotData, loading, error, refetch: fetchRootRotPrediction }
}
