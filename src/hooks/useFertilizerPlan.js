import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getFertilizerRecommendation } from '../services/geminiService'

export function useFertilizerPlan(sensorData, currentCropType) {
  const [fertilizerPlan, setFertilizerPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFertilizerPlan = async () => {
    try {
      setLoading(true)
      setError(null)

      // Only generate AI recommendation if sensor data is available
      if (!sensorData) {
        setFertilizerPlan(null)
        setLoading(false)
        return
      }

      // Get AI-powered fertilizer recommendation (cached for 24h inside geminiService)
      const aiRecommendation = await getFertilizerRecommendation(sensorData, currentCropType)
      setFertilizerPlan(aiRecommendation)
    } catch (err) {
      console.error('Error fetching fertilizer plan:', err)
      setError(err.message)
      setFertilizerPlan(null)
    } finally {
      setLoading(false)
    }
  }

  // Use stable primitive values as dependencies instead of the sensorData object
  const ph = sensorData?.ph_level
  const moisture = sensorData?.moisture
  const nitrogen = sensorData?.nitrogen
  const phosphorus = sensorData?.phosphorus
  const potassium = sensorData?.potassium

  useEffect(() => {
    fetchFertilizerPlan()
  }, [ph, moisture, nitrogen, phosphorus, potassium, currentCropType])

  return { fertilizerPlan, loading, error, refetch: fetchFertilizerPlan }
}
