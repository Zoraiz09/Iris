import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useCropTypes() {
  const [cropTypes, setCropTypes] = useState([])
  const [currentCropType, setCurrentCropType] = useState('Chinese Cabbage')
  const [loading, setLoading] = useState(true)

  const fetchCropTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('crop_types')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      if (data && data.length > 0) {
        setCropTypes(data.map(crop => crop.name))
      } else {
        // Default crop types
        setCropTypes(['Chinese Cabbage', 'Tomato', 'Potato', 'Wheat'])
      }
    } catch (err) {
      console.error('Error fetching crop types:', err)
      setCropTypes(['Chinese Cabbage', 'Tomato', 'Potato', 'Wheat'])
    } finally {
      setLoading(false)
    }
  }

  const updateCurrentCropType = async (cropName) => {
    setCurrentCropType(cropName)
    // Optionally save to settings table
    try {
      await supabase
        .from('settings')
        .upsert({ key: 'current_crop_type', value: cropName }, { onConflict: 'key' })
    } catch (err) {
      console.error('Error updating crop type:', err)
    }
  }

  useEffect(() => {
    fetchCropTypes()
  }, [])

  return { cropTypes, currentCropType, loading, setCurrentCropType: updateCurrentCropType }
}





