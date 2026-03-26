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

      if (!sensorData) {
        setRootRotData(null)
        setLoading(false)
        return
      }

      // Get AI-powered root rot prediction (cached for 24h inside geminiService)
      const prediction = await getRootRotSuggestion(sensorData, currentCropType)
      setRootRotData(prediction)
    } catch (err) {
      console.error('Error fetching root rot prediction:', err)
      setError(err.message)
      setRootRotData(null)
    } finally {
      setLoading(false)
    }
  }

  // Use stable primitive values as dependencies instead of the sensorData object
  const ph = sensorData?.ph_level
  const moisture = sensorData?.moisture
  const nitrogen = sensorData?.nitrogen

  useEffect(() => {
    fetchRootRotPrediction()
  }, [ph, moisture, nitrogen, currentCropType])

  return { rootRotData, loading, error, refetch: fetchRootRotPrediction }
}
