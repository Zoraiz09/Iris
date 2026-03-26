import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const RealtimeStatus = () => {
  const [status, setStatus] = useState('checking')
  const [tables, setTables] = useState([])

  useEffect(() => {
    // Test realtime connection
    const testChannel = supabase
      .channel('realtime-test')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sensor_data'
        },
        () => {
          console.log('Realtime test: Received update')
        }
      )
      .subscribe((subscriptionStatus) => {
        if (subscriptionStatus === 'SUBSCRIBED') {
          setStatus('connected')
        } else if (subscriptionStatus === 'CHANNEL_ERROR') {
          setStatus('error')
        } else {
          setStatus(subscriptionStatus)
        }
      })

    // Check which tables have realtime enabled
    const checkTables = async () => {
      try {
        const { data, error } = await supabase.rpc('get_realtime_tables')
        if (!error && data) {
          setTables(data)
        }
      } catch (err) {
        // RPC might not exist, that's okay
        console.log('Could not check realtime tables via RPC')
      }
    }

    checkTables()

    return () => {
      supabase.removeChannel(testChannel)
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-white border-2 rounded-lg shadow-lg p-3 text-xs z-50">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${
          status === 'connected' ? 'bg-green-500' : 
          status === 'error' ? 'bg-red-500' : 
          'bg-yellow-500'
        }`}></div>
        <span className="font-semibold">
          Realtime: {status === 'connected' ? '✅ Connected' : 
                     status === 'error' ? '❌ Error' : 
                     '🔄 Checking...'}
        </span>
      </div>
      {status === 'error' && (
        <div className="text-red-600 text-xs mt-1">
          Enable Realtime in Supabase Dashboard → Database → Replication
        </div>
      )}
    </div>
  )
}

export default RealtimeStatus





