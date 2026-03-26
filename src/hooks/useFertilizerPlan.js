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

      console.log('🔍 Checking for existing fertilizer plans in database...')

      const { data, error: fetchError } = await supabase
        .from('fertilizer_plans')
        .select('*')
        .eq('is_applied', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Database error:', fetchError)
        throw fetchError
      }

      // Only generate AI recommendation if sensor data is available
      if (!sensorData) {
        console.log('⏳ Waiting for sensor data before generating recommendation...')
        setFertilizerPlan(null)
        setLoading(false) // Ensure loading is set to false if we're waiting for data
        return
      }

      console.log('✅ Sensor data available, generating AI recommendation...')
      console.log('📊 Sensor data:', sensorData)
      console.log('🌱 Crop type:', currentCropType)

      // Get AI-powered fertilizer recommendation
      const aiRecommendation = await getFertilizerRecommendation(sensorData, currentCropType)
      console.log('✨ AI Recommendation received:', aiRecommendation)
      setFertilizerPlan(aiRecommendation)
    } catch (err) {
      console.error('❌ Error fetching fertilizer plan:', err)
      setError(err.message)
      setFertilizerPlan(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFertilizerPlan()

    // Set up real-time subscription with unique channel name
    const channelName = `fertilizer-plan-changes-${Date.now()}`
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'fertilizer_plans'
        },
        (payload) => {
          console.log('🔔 Fertilizer plan changed:', payload)
          fetchFertilizerPlan()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Fertilizer plan subscription: CONNECTED')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Fertilizer plan subscription: ERROR - Check if Realtime is enabled on fertilizer_plans table')
        } else {
          console.log('🔄 Fertilizer plan subscription status:', status)
        }
      })

    return () => {
      console.log('🔌 Cleaning up fertilizer plan subscription')
      supabase.removeChannel(channel)
    }
  }, [sensorData, currentCropType])

  return { fertilizerPlan, loading, error, refetch: fetchFertilizerPlan }
}

