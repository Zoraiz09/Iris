import { useSensorData } from '../hooks/useSensorData'
import { useWeatherData } from '../hooks/useWeatherData'
import { useForecastData } from '../hooks/useForecastData'
import { useAlerts } from '../hooks/useAlerts'
import { useCropTypes } from '../hooks/useCropTypes'
import { useFertilizerPlan } from '../hooks/useFertilizerPlan'
import { useRootRotPrediction } from '../hooks/useRootRotPrediction'
import { clearFertilizerCache } from '../services/geminiService'
import RealtimeStatus from './RealtimeStatus'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const { sensorData, loading: sensorLoading } = useSensorData()
  const { regionalWeather, onSiteWeather, loading: weatherLoading } = useWeatherData()
  const { forecastData, loading: forecastLoading } = useForecastData()
  const { alerts, loading: alertsLoading } = useAlerts()
  const { cropTypes, currentCropType, setCurrentCropType } = useCropTypes()
  const { fertilizerPlan, loading: planLoading } = useFertilizerPlan(sensorData, currentCropType)
  const { rootRotData, loading: rootRotLoading } = useRootRotPrediction(sensorData, currentCropType)
  const { signOut } = useAuth()

  // Helper function to get alert icon
  const getAlertIcon = (alertType) => {
    switch (alertType) {
      case 'moisture':
        return (
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
          </svg>
        )
      case 'ph':
        return (
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7zm2 6.172V4h2v4.172a3 3 0 00.879 2.12l1.027 1.028a4 4 0 00-2.171.102l-.47.156a4 4 0 01-2.53 0l-.563-.187a1.993 1.993 0 00-.114-.035l1.063-1.063A3 3 0 009 8.172z" clipRule="evenodd" />
          </svg>
        )
      case 'npk':
        return (
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )
      case 'root_rot':
        return (
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  // Helper function to get severity badge color
  const getSeverityBadge = (severity) => {
    const colors = {
      critical: 'bg-red-600',
      high: 'bg-red-600',
      warning: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500',
      info: 'bg-gray-500'
    }
    return colors[severity] || 'bg-gray-500'
  }

  // Format date for last updated
  const formatLastUpdated = () => {
    const now = new Date()
    return now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Get next rain information
  const getNextRainInfo = () => {
    if (!forecastData || forecastData.length === 0) {
      return { message: 'No Rain Soon', chance: 0 }
    }

    const today = new Date().toISOString().split('T')[0]
    const nextRainDay = forecastData.find(day => day.rain_chance > 0)

    if (!nextRainDay) {
      return { message: 'No Rain Soon', chance: 0 }
    }

    // Check if it's today
    if (nextRainDay.day_name === new Date().toLocaleDateString('en-US', { weekday: 'long' })) {
      return { message: `Rain Today (${nextRainDay.rain_chance}%)`, chance: nextRainDay.rain_chance }
    }

    return { message: `Next Rain: ${nextRainDay.day_name} (${nextRainDay.rain_chance}%)`, chance: nextRainDay.rain_chance }
  }

  const nextRainInfo = getNextRainInfo()

  const handleClearCache = () => {
    clearFertilizerCache()
    window.location.reload() // Reload to trigger fresh recommendation
  }

  return (
    <div className="min-h-screen bg-gray-50 w-full">
      {/* Header */}
      <header className="bg-green-800 text-white px-6 py-4 flex justify-between items-center shadow-md w-full">
        <div className="flex items-center gap-3">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <h1 className="text-xl font-semibold">IRIS Agricultural Monitoring System</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative group">
            <button className="flex items-center gap-2 hover:opacity-80">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span>Alerts</span>
              {alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length}
                </span>
              )}
            </button>
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800">Urgent Alerts</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {alertsLoading ? (
                  <div className="p-4 text-center text-gray-400 text-sm">Loading alerts...</div>
                ) : alerts.filter(a => a.severity === 'critical' || a.severity === 'high' || a.severity === 'medium').length === 0 ? (
                  <div className="p-4 text-center text-gray-400 text-sm">No urgent alerts</div>
                ) : (
                  alerts
                    .filter(a => a.severity === 'critical' || a.severity === 'high' || a.severity === 'medium')
                    .sort((a, b) => {
                      const order = { critical: 0, high: 1, medium: 2 }
                      return (order[a.severity] ?? 3) - (order[b.severity] ?? 3)
                    })
                    .map((alert, i) => (
                      <div key={i} className="px-3 py-2.5 border-b border-gray-50 last:border-0 hover:bg-gray-50">
                        <div className="flex items-start gap-2">
                          <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                            alert.severity === 'critical' ? 'bg-red-500' :
                            alert.severity === 'high' ? 'bg-orange-500' : 'bg-yellow-500'
                          }`} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-gray-700 uppercase">{alert.alert_type.replace('_', ' ')}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                                alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                alert.severity === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>{alert.severity}</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{alert.message}</p>
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 hover:opacity-80">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Settings</span>
          </button>
          <button onClick={signOut} className="flex items-center gap-2 hover:opacity-80">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 w-full">
        {/* Crop Type and Rain Forecast */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Crop Type</label>
            <select
              value={currentCropType}
              onChange={(e) => setCurrentCropType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {cropTypes.map((crop) => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z" />
              </svg>
              <span className="text-lg font-semibold text-gray-800">{nextRainInfo.message}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Last Updated: {formatLastUpdated()}</span>
            </div>
          </div>
        </div>


        {/* Main Data Sections: Live Sensor Data, 7-Day Forecast, AI Fertilizer Plan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Live Sensor Data */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">Live Sensor Data</h2>
              </div>
              <button className="text-sm text-green-600 hover:underline">View History</button>
            </div>
            
            {sensorLoading ? (
              <div className="text-center py-8 text-gray-500">Loading sensor data...</div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7 2a1 1 0 00-.707 1.707L7 4.414v3.758a1 1 0 01-.293.707l-4 4C.817 14.769 2.156 18 4.828 18h10.343c2.673 0 4.012-3.231 2.122-5.121l-4-4A1 1 0 0113 8.172V4.414l.707-.707A1 1 0 0013 2H7z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">pH Level</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-500">{sensorData?.ph_level?.toFixed(1) || 'N/A'}</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                      </svg>
                      <span className="text-sm text-gray-600">Moisture</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-500">{sensorData?.moisture?.toFixed(1) || '0.0'}%</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm text-gray-600">Soil Temp</span>
                    </div>
                    <div className="text-2xl font-bold text-red-500">{sensorData?.soil_temp?.toFixed(1) || 'N/A'} °C</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm text-gray-600">Nitrogen</span>
                    </div>
                    <div className="text-2xl font-bold text-green-500">{sensorData?.nitrogen || 0} ppm</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm text-gray-600">Phosphorus</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-500">{sensorData?.phosphorus || 0} ppm</div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm text-gray-600">Potassium</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-500">{sensorData?.potassium || 0} ppm</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className={`w-3 h-3 rounded-full ${sensorData?.sensor_status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span>Sensor Status: {sensorData?.sensor_status || 'Unknown'}</span>
                </div>
              </>
            )}
          </div>

          {/* 7-Day Forecast */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4 4 0 003 15z" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">7-Day Forecast</h2>
              </div>
              <button className="text-sm text-green-600 hover:underline">Full Forecast</button>
            </div>

            {forecastLoading ? (
              <div className="text-center py-8 text-gray-500">Loading forecast...</div>
            ) : (
              <div className="space-y-3">
                {forecastData.map((day, index) => (
                  <div key={day.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{day.icon || '☀️'}</span>
                      <div>
                        <div className="font-semibold text-gray-800">{day.day_name || day.day}</div>
                        <div className="text-sm text-gray-600">{day.condition}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Rain: {day.rain_chance || day.rain}%</div>
                      <div className="font-semibold text-gray-800">{day.temperature || day.temp}°C</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Fertilizer Plan */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <h2 className="text-xl font-semibold text-gray-800">AI Fertilizer Plan</h2>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleClearCache}
                  className="text-sm text-orange-600 hover:text-orange-800 hover:underline"
                  title="Clear cached recommendations and generate fresh ones"
                >
                  Clear Cache
                </button>
              </div>
            </div>

            {planLoading ? (
              <div className="text-center py-8 text-gray-500">Loading fertilizer plan...</div>
            ) : fertilizerPlan ? (
              <>
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                    <p className="text-sm text-gray-700">
                      {fertilizerPlan.recommendation_text || 'Based on current soil conditions and crop requirements, immediate fertilization is critical. NPK levels are depleted and moisture is extremely low. Combine fertilization with irrigation for optimal results.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {/* Nitrogen */}
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-semibold text-gray-800">Nitrogen (N)</span>
                      <span className={`${getSeverityBadge(fertilizerPlan.nitrogen_priority)} text-white text-xs font-semibold px-2 py-1 rounded capitalize`}>
                        {fertilizerPlan.nitrogen_priority} Priority
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 6.001M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 6.001M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                        <span>{fertilizerPlan.nitrogen_amount?.toFixed(0) || 120} kg/ha</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Apply {fertilizerPlan.nitrogen_apply_by ? new Date(fertilizerPlan.nitrogen_apply_by).toLocaleDateString() === new Date().toLocaleDateString() ? 'immediately' : `by ${new Date(fertilizerPlan.nitrogen_apply_by).toLocaleDateString()}` : 'immediately'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Phosphorus */}
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-semibold text-gray-800">Phosphorus (P)</span>
                      <span className={`${getSeverityBadge(fertilizerPlan.phosphorus_priority)} text-white text-xs font-semibold px-2 py-1 rounded capitalize`}>
                        {fertilizerPlan.phosphorus_priority} Priority
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 6.001M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 6.001M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                        <span>{fertilizerPlan.phosphorus_amount?.toFixed(0) || 80} kg/ha</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Apply {fertilizerPlan.phosphorus_apply_by ? `within ${Math.ceil((new Date(fertilizerPlan.phosphorus_apply_by) - new Date()) / (1000 * 60 * 60 * 24))} days` : 'within 3 days'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Potassium */}
                  <div className="border-2 border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-lg font-semibold text-gray-800">Potassium (K)</span>
                      <span className={`${getSeverityBadge(fertilizerPlan.potassium_priority)} text-white text-xs font-semibold px-2 py-1 rounded capitalize`}>
                        {fertilizerPlan.potassium_priority} Priority
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 6.001M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 6.001M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                        <span>{fertilizerPlan.potassium_amount?.toFixed(0) || 100} kg/ha</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Apply {fertilizerPlan.potassium_apply_by ? `within ${Math.ceil((new Date(fertilizerPlan.potassium_apply_by) - new Date()) / (1000 * 60 * 60 * 24))} days` : 'within 5 days'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-green-600 text-white font-semibold py-3 rounded-lg hover:bg-green-700 transition-colors">
                  Generate Detailed Schedule
                </button>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">No fertilizer plan available</div>
            )}
          </div>
        </div>

        {/* Weather Section - Moved to Bottom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Regional Forecast */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{regionalWeather?.location || 'Islamabad, PK'}</h2>
                <p className="text-sm text-gray-600">Regional Forecast</p>
              </div>
            </div>
            {weatherLoading ? (
              <div className="text-center py-4 text-gray-500">Loading weather...</div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-gray-800">{regionalWeather?.temperature?.toFixed(0) || 8}°</div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                    </svg>
                    <span>{regionalWeather?.humidity?.toFixed(0) || 26}%</span>
                  </div>
                </div>
                <div className="text-6xl">{regionalWeather?.weather_icon || '☁️☀️'}</div>
              </div>
            )}
          </div>

          {/* On-Site Weather */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold text-gray-800">On-Site Weather</h2>
            </div>
            {weatherLoading ? (
              <div className="text-center py-4 text-gray-500">Loading weather...</div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-gray-800">{onSiteWeather?.temperature?.toFixed(1) || 16.1}°</div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                    </svg>
                    <span>{onSiteWeather?.humidity?.toFixed(1) || 75.7}%</span>
                  </div>
                </div>
                <div className="text-6xl">{onSiteWeather?.weather_icon || '☁️☀️'}</div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Realtime Status Widget */}
      <RealtimeStatus />
    </div>
  )
}

export default Dashboard
