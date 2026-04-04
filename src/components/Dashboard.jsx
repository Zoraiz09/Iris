import { useState, useEffect, useRef } from 'react'
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
import {
  Leaf,
  Bell,
  Settings,
  LogOut,
  Droplets,
  FlaskConical,
  Thermometer,
  Zap,
  Atom,
  Beaker,
  CloudRain,
  Cloud,
  Sun,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Activity,
  Sprout,
  Scale,
  CalendarDays,
  Sparkles,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  CircleDot,
  Bug,
} from 'lucide-react'

const Dashboard = () => {
  const { sensorData, loading: sensorLoading } = useSensorData()
  const { regionalWeather, onSiteWeather, loading: weatherLoading } = useWeatherData()
  const { forecastData, loading: forecastLoading } = useForecastData()
  const { alerts, loading: alertsLoading } = useAlerts()
  const { cropTypes, currentCropType, setCurrentCropType } = useCropTypes()
  const { fertilizerPlan, loading: planLoading } = useFertilizerPlan(sensorData, currentCropType)
  const { rootRotData, loading: rootRotLoading } = useRootRotPrediction(sensorData, currentCropType)
  const { signOut } = useAuth()
  const [alertsOpen, setAlertsOpen] = useState(false)
  const alertsRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (alertsRef.current && !alertsRef.current.contains(e.target)) {
        setAlertsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  const getAlertIcon = (alertType) => {
    const iconClass = "w-7 h-7"
    switch (alertType) {
      case 'moisture':
        return <Droplets className={`${iconClass} text-blue-500`} />
      case 'ph':
        return <FlaskConical className={`${iconClass} text-orange-500`} />
      case 'npk':
        return <Zap className={`${iconClass} text-yellow-500`} />
      case 'root_rot':
        return <Bug className={`${iconClass} text-red-500`} />
      default:
        return <AlertTriangle className={`${iconClass} text-red-500`} />
    }
  }

  const getSeverityBadge = (severity) => {
    const colors = {
      critical: 'bg-red-500/90',
      high: 'bg-red-500/90',
      warning: 'bg-orange-500/90',
      medium: 'bg-amber-500/90',
      low: 'bg-blue-500/90',
      info: 'bg-slate-500/90'
    }
    return colors[severity] || 'bg-slate-500/90'
  }

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

  const getNextRainInfo = () => {
    if (!forecastData || forecastData.length === 0) {
      return { message: 'No Rain Soon', chance: 0 }
    }

    const nextRainDay = forecastData.find(day => day.rain_chance > 0)

    if (!nextRainDay) {
      return { message: 'No Rain Soon', chance: 0 }
    }

    if (nextRainDay.day_name === new Date().toLocaleDateString('en-US', { weekday: 'long' })) {
      return { message: `Rain Today (${nextRainDay.rain_chance}%)`, chance: nextRainDay.rain_chance }
    }

    return { message: `Next Rain: ${nextRainDay.day_name} (${nextRainDay.rain_chance}%)`, chance: nextRainDay.rain_chance }
  }

  const nextRainInfo = getNextRainInfo()

  const handleClearCache = () => {
    clearFertilizerCache()
    window.location.reload()
  }

  const isOutOfRange = (value, min, max) => value < min || value > max

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30 w-full">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-800 text-white px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center shadow-lg w-full border-b border-green-600/30 safe-top">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-white/15 p-1.5 sm:p-2 rounded-xl backdrop-blur-sm">
            <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-green-300" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight">IRIS</h1>
            <p className="text-green-300/80 text-[10px] sm:text-xs font-medium -mt-0.5">Agricultural Monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Alerts Button - tap to toggle on mobile, hover on desktop */}
          <div className="relative" ref={alertsRef}>
            <button
              onClick={() => setAlertsOpen(!alertsOpen)}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all duration-200"
            >
              <div className="relative">
                <Bell className="w-5 h-5" />
                {alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center alert-pulse ring-2 ring-green-800">
                    {alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium hidden sm:inline">Alerts</span>
            </button>
            {alertsOpen && (
              <div className="absolute right-0 sm:right-0 top-full mt-2 w-[calc(100vw-1.5rem)] sm:w-80 max-w-sm bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-slide-down">
                <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <h3 className="text-sm font-semibold text-gray-800">Urgent Alerts</h3>
                  </div>
                  <button onClick={() => setAlertsOpen(false)} className="text-gray-400 hover:text-gray-600 p-1">
                    <span className="text-lg leading-none">&times;</span>
                  </button>
                </div>
                <div className="max-h-[60vh] sm:max-h-64 overflow-y-auto overscroll-contain">
                  {alertsLoading ? (
                    <div className="p-4 text-center text-gray-400 text-sm">Loading alerts...</div>
                  ) : alerts.filter(a => a.severity === 'critical' || a.severity === 'high' || a.severity === 'medium').length === 0 ? (
                    <div className="p-6 text-center">
                      <Activity className="w-8 h-8 text-green-300 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">All systems normal</p>
                    </div>
                  ) : (
                    alerts
                      .filter(a => a.severity === 'critical' || a.severity === 'high' || a.severity === 'medium')
                      .sort((a, b) => {
                        const order = { critical: 0, high: 1, medium: 2 }
                        return (order[a.severity] ?? 3) - (order[b.severity] ?? 3)
                      })
                      .map((alert, i) => (
                        <div key={i} className="px-3 py-3 sm:py-2.5 border-b border-gray-50 last:border-0 active:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-2.5">
                            <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                              alert.severity === 'critical' ? 'bg-red-500 animate-pulse' :
                              alert.severity === 'high' ? 'bg-orange-500' : 'bg-amber-400'
                            }`} />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">{alert.alert_type.replace('_', ' ')}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                                  alert.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                  alert.severity === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
                                }`}>{alert.severity}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{alert.message}</p>
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>
          <button className="flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all duration-200">
            <Settings className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Settings</span>
          </button>
          <button onClick={signOut} className="flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all duration-200">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-3 sm:px-6 py-4 sm:py-6 w-full max-w-[1600px] mx-auto safe-bottom">
        {/* Top Bar: Crop Type and Rain Forecast */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 card-hover">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Sprout className="w-4 h-4 text-green-600" />
              </div>
              <label className="text-sm font-semibold text-gray-700">Crop Type</label>
            </div>
            <select
              value={currentCropType}
              onChange={(e) => setCurrentCropType(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 font-medium transition-all text-base"
            >
              {cropTypes.map((crop) => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 card-hover">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${nextRainInfo.chance > 0 ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {nextRainInfo.chance > 0 ? <CloudRain className="w-4 h-4 text-blue-600" /> : <Sun className="w-4 h-4 text-amber-500" />}
              </div>
              <span className="text-base sm:text-lg font-semibold text-gray-800">{nextRainInfo.message}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 pl-11">
              <Clock className="w-3.5 h-3.5" />
              <span>Last Updated: {formatLastUpdated()}</span>
            </div>
          </div>
        </div>

        {/* Critical Alerts Section */}
        <div className="mb-4 sm:mb-6 animate-slide-up">
          <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
            <div className="bg-red-100 p-2 rounded-lg">
              <ShieldAlert className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Critical Alerts</h2>
          </div>
          {/* Horizontal scroll on mobile, grid on larger screens */}
          <div className="flex gap-3 overflow-x-auto mobile-scroll pb-2 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 snap-x snap-mandatory">
            {/* Moisture Card */}
            {(() => {
              const isAlert = sensorData?.moisture < 60 || sensorData?.moisture > 70
              return (
                <div className={`rounded-2xl p-4 sm:p-5 text-center border-2 card-hover stagger-1 animate-fade-in min-w-[160px] sm:min-w-0 snap-center flex-shrink-0 sm:flex-shrink ${
                  isAlert ? 'bg-red-50/80 border-red-200 metric-glow-red' : 'bg-white border-gray-100 metric-glow-green'
                }`}>
                  <div className={`inline-flex p-2.5 sm:p-3 rounded-xl mb-2 sm:mb-3 ${isAlert ? 'bg-red-100' : 'bg-blue-100'}`}>
                    <Droplets className={`w-5 h-5 sm:w-6 sm:h-6 ${isAlert ? 'text-red-500' : 'text-blue-500'}`} />
                  </div>
                  <p className="text-gray-600 font-semibold text-xs sm:text-sm">Moisture</p>
                  <p className={`${isAlert ? 'text-red-500' : 'text-green-600'} text-xl sm:text-2xl font-bold mt-1`}>
                    {sensorData?.moisture?.toFixed(1) || '0.0'}%
                  </p>
                  <p className="text-gray-400 text-[10px] sm:text-xs mt-1">Optimal: 60-70%</p>
                </div>
              )
            })()}

            {/* pH Level Card */}
            {(() => {
              const isAlert = sensorData?.ph_level < 6.0 || sensorData?.ph_level > 7.5
              return (
                <div className={`rounded-2xl p-4 sm:p-5 text-center border-2 card-hover stagger-2 animate-fade-in min-w-[160px] sm:min-w-0 snap-center flex-shrink-0 sm:flex-shrink ${
                  isAlert ? 'bg-red-50/80 border-red-200 metric-glow-red' : 'bg-white border-gray-100 metric-glow-green'
                }`}>
                  <div className={`inline-flex p-2.5 sm:p-3 rounded-xl mb-2 sm:mb-3 ${isAlert ? 'bg-red-100' : 'bg-orange-100'}`}>
                    <FlaskConical className={`w-5 h-5 sm:w-6 sm:h-6 ${isAlert ? 'text-red-500' : 'text-orange-500'}`} />
                  </div>
                  <p className="text-gray-600 font-semibold text-xs sm:text-sm">pH Level</p>
                  <p className={`${isAlert ? 'text-red-500' : 'text-green-600'} text-xl sm:text-2xl font-bold mt-1`}>
                    {sensorData?.ph_level?.toFixed(1) || '0.0'}
                  </p>
                  <p className="text-gray-400 text-[10px] sm:text-xs mt-1">Optimal: 6.0-7.5</p>
                </div>
              )
            })()}

            {/* NPK Levels Card */}
            {(() => {
              const isAlert = (sensorData?.nitrogen === 0 && sensorData?.phosphorus === 0 && sensorData?.potassium === 0) ||
                (sensorData?.nitrogen < 25 || sensorData?.phosphorus < 15 || sensorData?.potassium < 20)
              return (
                <div className={`rounded-2xl p-4 sm:p-5 text-center border-2 card-hover stagger-3 animate-fade-in min-w-[160px] sm:min-w-0 snap-center flex-shrink-0 sm:flex-shrink ${
                  isAlert ? 'bg-red-50/80 border-red-200 metric-glow-red' : 'bg-white border-gray-100 metric-glow-green'
                }`}>
                  <div className={`inline-flex p-2.5 sm:p-3 rounded-xl mb-2 sm:mb-3 ${isAlert ? 'bg-red-100' : 'bg-emerald-100'}`}>
                    <Zap className={`w-5 h-5 sm:w-6 sm:h-6 ${isAlert ? 'text-red-500' : 'text-emerald-500'}`} />
                  </div>
                  <p className="text-gray-600 font-semibold text-xs sm:text-sm">NPK Levels</p>
                  <div className="flex justify-center gap-3 sm:gap-4 mt-2">
                    <div className="text-center">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">N</p>
                      <p className={`text-base sm:text-lg font-bold ${sensorData?.nitrogen < 25 ? 'text-red-500' : 'text-green-600'}`}>{sensorData?.nitrogen || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">P</p>
                      <p className={`text-base sm:text-lg font-bold ${sensorData?.phosphorus < 15 ? 'text-red-500' : 'text-green-600'}`}>{sensorData?.phosphorus || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">K</p>
                      <p className={`text-base sm:text-lg font-bold ${sensorData?.potassium < 20 ? 'text-red-500' : 'text-green-600'}`}>{sensorData?.potassium || 0}</p>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Root Rot Prediction Card */}
            {(() => {
              const isAlert = rootRotData?.risk_level === 'High'
              return (
                <div className={`rounded-2xl p-4 sm:p-5 text-center border-2 card-hover stagger-4 animate-fade-in min-w-[160px] sm:min-w-0 snap-center flex-shrink-0 sm:flex-shrink ${
                  isAlert ? 'bg-red-50/80 border-red-200 metric-glow-red' : 'bg-white border-gray-100 metric-glow-green'
                }`}>
                  <div className={`inline-flex p-2.5 sm:p-3 rounded-xl mb-2 sm:mb-3 ${isAlert ? 'bg-red-100' : 'bg-green-100'}`}>
                    <Bug className={`w-5 h-5 sm:w-6 sm:h-6 ${isAlert ? 'text-red-500' : 'text-green-500'}`} />
                  </div>
                  <p className="text-gray-600 font-semibold text-xs sm:text-sm">Root Rot Risk</p>
                  <p className={`${isAlert ? 'text-red-500' : 'text-green-600'} text-xl sm:text-2xl font-bold mt-1`}>
                    {rootRotLoading ? 'Loading...' : rootRotData?.risk_level || 'Low'}
                  </p>
                  <p className="text-gray-400 text-[10px] sm:text-xs mt-1 line-clamp-2">
                    {rootRotLoading
                      ? 'Analyzing soil conditions...'
                      : rootRotData?.explanation || 'Analysis unavailable.'
                    }
                  </p>
                </div>
              )
            })()}
          </div>
        </div>

        {/* Main Data Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Live Sensor Data */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 card-hover animate-slide-up">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2.5">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Live Sensor Data</h2>
              </div>
            </div>

            {sensorLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 text-gray-300 animate-spin mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Loading sensor data...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-xl p-3.5 border border-orange-100/50">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FlaskConical className="w-4 h-4 text-orange-500" />
                      <span className="text-xs font-medium text-gray-500">pH Level</span>
                    </div>
                    <div className="text-xl font-bold text-orange-600">{sensorData?.ph_level?.toFixed(1) || 'N/A'}</div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50/50 rounded-xl p-3.5 border border-blue-100/50">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-medium text-gray-500">Moisture</span>
                    </div>
                    <div className="text-xl font-bold text-blue-600">{sensorData?.moisture?.toFixed(1) || '0.0'}%</div>
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-rose-50/50 rounded-xl p-3.5 border border-red-100/50">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Thermometer className="w-4 h-4 text-red-500" />
                      <span className="text-xs font-medium text-gray-500">Soil Temp</span>
                    </div>
                    <div className="text-xl font-bold text-red-500">{sensorData?.soil_temp?.toFixed(1) || 'N/A'} °C</div>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-xl p-3.5 border border-green-100/50">
                    <div className="flex items-center gap-2 mb-1.5">
                      <TrendingUp className="w-4 h-4 text-green-500" />
                      <span className="text-xs font-medium text-gray-500">Nitrogen</span>
                    </div>
                    <div className="text-xl font-bold text-green-600">{sensorData?.nitrogen || 0} ppm</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-violet-50/50 rounded-xl p-3.5 border border-purple-100/50">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Atom className="w-4 h-4 text-purple-500" />
                      <span className="text-xs font-medium text-gray-500">Phosphorus</span>
                    </div>
                    <div className="text-xl font-bold text-purple-600">{sensorData?.phosphorus || 0} ppm</div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 rounded-xl p-3.5 border border-amber-100/50">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-medium text-gray-500">Potassium</span>
                    </div>
                    <div className="text-xl font-bold text-amber-600">{sensorData?.potassium || 0} ppm</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${sensorData?.sensor_status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="font-medium">Sensor: {sensorData?.sensor_status || 'Unknown'}</span>
                </div>
              </>
            )}
          </div>

          {/* 7-Day Forecast */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 card-hover animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2.5">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Cloud className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">7-Day Forecast</h2>
              </div>
            </div>

            {forecastLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 text-gray-300 animate-spin mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Loading forecast...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {forecastData.map((day, index) => (
                  <div key={day.id || index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-transparent rounded-xl hover:from-blue-50/50 transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl w-8 text-center">{day.icon || '☀️'}</span>
                      <div>
                        <div className="font-semibold text-gray-800 text-sm">{day.day_name || day.day}</div>
                        <div className="text-xs text-gray-500">{day.condition}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-blue-500">
                        <Droplets className="w-3 h-3" />
                        <span>{day.rain_chance || day.rain}%</span>
                      </div>
                      <div className="font-bold text-gray-800 text-sm">{day.temperature || day.temp}°C</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Fertilizer Plan */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 card-hover animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex justify-between items-center mb-4 sm:mb-5">
              <div className="flex items-center gap-2.5">
                <div className="bg-violet-100 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-800">AI Fertilizer Plan</h2>
              </div>
              <button
                onClick={handleClearCache}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-500 active:text-orange-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-orange-50"
                title="Clear cached recommendations"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {planLoading ? (
              <div className="text-center py-8">
                <Sparkles className="w-6 h-6 text-violet-300 animate-pulse mx-auto mb-2" />
                <p className="text-gray-400 text-sm">Generating AI recommendations...</p>
              </div>
            ) : fertilizerPlan ? (
              <>
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 mb-4 border border-green-100/50">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {fertilizerPlan.recommendation_text || 'Based on current soil conditions and crop requirements, immediate fertilization is critical.'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  {[
                    { label: 'Nitrogen (N)', priority: fertilizerPlan.nitrogen_priority, amount: fertilizerPlan.nitrogen_amount, applyBy: fertilizerPlan.nitrogen_apply_by, icon: <TrendingUp className="w-4 h-4" />, defaultAmount: 120, defaultApply: 'immediately' },
                    { label: 'Phosphorus (P)', priority: fertilizerPlan.phosphorus_priority, amount: fertilizerPlan.phosphorus_amount, applyBy: fertilizerPlan.phosphorus_apply_by, icon: <Atom className="w-4 h-4" />, defaultAmount: 80, defaultApply: 'within 3 days' },
                    { label: 'Potassium (K)', priority: fertilizerPlan.potassium_priority, amount: fertilizerPlan.potassium_amount, applyBy: fertilizerPlan.potassium_apply_by, icon: <Zap className="w-4 h-4" />, defaultAmount: 100, defaultApply: 'within 5 days' },
                  ].map((nutrient, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-green-200 transition-colors">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">{nutrient.icon}</span>
                          <span className="font-semibold text-gray-800">{nutrient.label}</span>
                        </div>
                        <span className={`${getSeverityBadge(nutrient.priority)} text-white text-[10px] font-bold px-2 py-0.5 rounded-full capitalize`}>
                          {nutrient.priority} Priority
                        </span>
                      </div>
                      <div className="space-y-1.5 pl-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Scale className="w-3.5 h-3.5 text-gray-400" />
                          <span>{nutrient.amount?.toFixed(0) || nutrient.defaultAmount} kg/ha</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                          <span>Apply {nutrient.applyBy ? new Date(nutrient.applyBy).toLocaleDateString() === new Date().toLocaleDateString() ? 'immediately' : `by ${new Date(nutrient.applyBy).toLocaleDateString()}` : nutrient.defaultApply}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Generate Detailed Schedule
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No fertilizer plan available</p>
              </div>
            )}
          </div>
        </div>

        {/* Weather Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 animate-fade-in">
          {/* Regional Forecast */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 card-hover">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-sky-100 p-2 rounded-lg">
                  <Cloud className="w-4 h-4 text-sky-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800">{regionalWeather?.location || 'Islamabad, PK'}</h2>
                  <p className="text-[10px] sm:text-xs text-gray-400">Regional Forecast</p>
                </div>
              </div>
            </div>
            {weatherLoading ? (
              <div className="text-center py-4">
                <RefreshCw className="w-5 h-5 text-gray-300 animate-spin mx-auto" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-800">{regionalWeather?.temperature?.toFixed(0) || 8}°</div>
                  <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2 sm:px-2.5 py-1 rounded-full text-xs sm:text-sm">
                    <Droplets className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
                    <span>{regionalWeather?.humidity?.toFixed(0) || 26}%</span>
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl">{regionalWeather?.weather_icon || '☁️☀️'}</div>
              </div>
            )}
          </div>

          {/* On-Site Weather */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 card-hover">
            <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <CircleDot className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">On-Site Weather</h2>
                <p className="text-[10px] sm:text-xs text-gray-400">Local sensor data</p>
              </div>
            </div>
            {weatherLoading ? (
              <div className="text-center py-4">
                <RefreshCw className="w-5 h-5 text-gray-300 animate-spin mx-auto" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-3xl sm:text-4xl font-bold text-gray-800">{onSiteWeather?.temperature?.toFixed(1) || 16.1}°</div>
                  <div className="flex items-center gap-1.5 text-gray-500 bg-gray-50 px-2 sm:px-2.5 py-1 rounded-full text-xs sm:text-sm">
                    <Droplets className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
                    <span>{onSiteWeather?.humidity?.toFixed(1) || 75.7}%</span>
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl">{onSiteWeather?.weather_icon || '☁️☀️'}</div>
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
