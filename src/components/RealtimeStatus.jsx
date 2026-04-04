import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'

const RealtimeStatus = () => {
  const [status, setStatus] = useState('checking')
  const [tables, setTables] = useState([])

  useEffect(() => {
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

    const checkTables = async () => {
      try {
        const { data, error } = await supabase.rpc('get_realtime_tables')
        if (!error && data) {
          setTables(data)
        }
      } catch (err) {
        console.log('Could not check realtime tables via RPC')
      }
    }

    checkTables()

    return () => {
      supabase.removeChannel(testChannel)
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 glass-card rounded-xl p-3 text-xs z-50">
      <div className="flex items-center gap-2">
        {status === 'connected' ? (
          <>
            <div className="relative">
              <Wifi className="w-3.5 h-3.5 text-green-400" />
              <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            </div>
            <span className="font-medium text-green-400">Connected</span>
          </>
        ) : status === 'error' ? (
          <>
            <WifiOff className="w-3.5 h-3.5 text-red-400" />
            <span className="font-medium text-red-400">Disconnected</span>
          </>
        ) : (
          <>
            <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span className="font-medium text-amber-400">Connecting...</span>
          </>
        )}
      </div>
      {status === 'error' && (
        <div className="text-red-400/70 text-[10px] mt-1.5 leading-tight">
          Enable Realtime in Supabase Dashboard
        </div>
      )}
    </div>
  )
}

export default RealtimeStatus
