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
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f0a] via-[#0d2818] to-[#0a2015] w-full relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="bg-blob w-[500px] h-[500px] bg-green-500/8 -top-40 -right-40 fixed" />
      <div className="bg-blob w-[600px] h-[600px] bg-emerald-600/6 -bottom-60 -left-40 fixed" />
      <div className="bg-blob w-[400px] h-[400px] bg-teal-500/5 top-1/2 left-1/3 fixed" />

      {/* Header */}
      <header className="glass-header text-white px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center w-full safe-top relative z-10 sticky top-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-green-400/15 p-1.5 sm:p-2 rounded-xl border border-green-400/10">
            <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">IRIS</h1>
            <p className="text-green-400/70 text-[10px] sm:text-xs font-medium -mt-0.5">Agricultural Monitoring</p>
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
              <div className="absolute right-0 sm:right-0 top-full mt-2 w-[calc(100vw-1.5rem)] sm:w-80 max-w-sm glass-card rounded-xl z-50 animate-slide-down">
                <div className="p-3 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <h3 className="text-sm font-semibold text-white">Urgent Alerts</h3>
                  </div>
                  <button onClick={() => setAlertsOpen(false)} className="text-white/40 hover:text-white/70 p-1">
                    <span className="text-lg leading-none">&times;</span>
                  </button>
                </div>
                <div className="max-h-[60vh] sm:max-h-64 overflow-y-auto overscroll-contain">
                  {alertsLoading ? (
                    <div className="p-4 text-center text-white/40 text-sm">Loading alerts...</div>
                  ) : alerts.filter(a => a.severity === 'critical' || a.severity === 'high' || a.severity === 'medium').length === 0 ? (
                    <div className="p-6 text-center">
                      <Activity className="w-8 h-8 text-green-400/50 mx-auto mb-2" />
                      <p className="text-white/40 text-sm">All systems normal</p>
                    </div>
                  ) : (
                    alerts
                      .filter(a => a.severity === 'critical' || a.severity === 'high' || a.severity === 'medium')
                      .sort((a, b) => {
                        const order = { critical: 0, high: 1, medium: 2 }
                        return (order[a.severity] ?? 3) - (order[b.severity] ?? 3)
                      })
                      .map((alert, i) => (
                        <div key={i} className="px-3 py-3 sm:py-2.5 border-b border-white/5 last:border-0 active:bg-white/5 transition-colors">
                          <div className="flex items-start gap-2.5">
                            <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                              alert.severity === 'critical' ? 'bg-red-500 animate-pulse' :
                              alert.severity === 'high' ? 'bg-orange-500' : 'bg-amber-400'
                            }`} />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">{alert.alert_type.replace('_', ' ')}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                                  alert.severity === 'critical' ? 'bg-red-500/20 text-red-300' :
                                  alert.severity === 'high' ? 'bg-orange-500/20 text-orange-300' : 'bg-amber-500/20 text-amber-300'
                                }`}>{alert.severity}</span>
                              </div>
                              <p className="text-xs text-white/50 mt-0.5 leading-relaxed">{alert.message}</p>
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
      <main className="px-3 sm:px-6 py-4 sm:py-6 w-full max-w-[1600px] mx-auto safe-bottom relative z-10">
        {/* Top Bar: Crop Type and Rain Forecast */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 animate-fade-in">
          <div className="glass-card rounded-2xl p-4 sm:p-5 card-hover">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="bg-green-400/15 p-2 rounded-lg border border-green-400/10">
                <Sprout className="w-4 h-4 text-green-400" />
              </div>
              <label className="text-sm font-semibold text-white/80">Crop Type</label>
            </div>
            <select
              value={currentCropType}
              onChange={(e) => setCurrentCropType(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/[0.06] border border-white/10 rounded-xl focus:ring-2 focus:ring-green-400/50 focus:border-green-400/30 text-white font-medium transition-all text-base [&>option]:bg-[#0d2818] [&>option]:text-white"
            >
              {cropTypes.map((crop) => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>
          <div className="glass-card rounded-2xl p-4 sm:p-5 card-hover">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg border ${nextRainInfo.chance > 0 ? 'bg-blue-400/15 border-blue-400/10' : 'bg-white/[0.06] border-white/10'}`}>
                {nextRainInfo.chance > 0 ? <CloudRain className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
              </div>
              <span className="text-base sm:text-lg font-semibold text-white">{nextRainInfo.message}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/40 pl-11">
              <Clock className="w-3.5 h-3.5" />
              <span>Last Updated: {formatLastUpdated()}</span>
            </div>
          </div>
        </div>

        {/* Critical Alerts Section */}
        <div className="mb-4 sm:mb-6 animate-slide-up">
          <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
            <div className="bg-red-400/15 p-2 rounded-lg border border-red-400/10">
              <ShieldAlert className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">Critical Alerts</h2>
          </div>
          {/* Horizontal scroll on mobile, grid on larger screens */}
          <div className="flex gap-3 overflow-x-auto mobile-scroll pb-2 sm:pb-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 snap-x snap-mandatory">
            {/* Moisture Card */}
            {(() => {
              const isAlert = sensorData?.moisture < 60 || sensorData?.moisture > 70
              return (
                <div className={`rounded-2xl p-4 sm:p-5 text-center card-hover stagger-1 animate-fade-in min-w-[160px] sm:min-w-0 snap-center flex-shrink-0 sm:flex-shrink ${
                  isAlert ? 'glass-card border border-red-400/20 metric-glow-red' : 'glass-card metric-glow-green'
                }`}>
                  <div className={`inline-flex p-2.5 sm:p-3 rounded-xl mb-2 sm:mb-3 ${isAlert ? 'bg-red-400/15' : 'bg-blue-400/15'}`}>
                    <Droplets className={`w-5 h-5 sm:w-6 sm:h-6 ${isAlert ? 'text-red-400' : 'text-blue-400'}`} />
                  </div>
                  <p className="text-white/60 font-semibold text-xs sm:text-sm">Moisture</p>
                  <p className={`${isAlert ? 'text-red-400' : 'text-green-400'} text-xl sm:text-2xl font-bold mt-1`}>
                    {sensorData?.moisture?.toFixed(1) || '0.0'}%
                  </p>
                  <p className="text-white/30 text-[10px] sm:text-xs mt-1">Optimal: 60-70%</p>
                </div>
              )
            })()}

            {/* pH Level Card */}
            {(() => {
              const isAlert = sensorData?.ph_level < 6.0 || sensorData?.ph_level > 7.5
              return (
                <div className={`rounded-2xl p-4 sm:p-5 text-center card-hover stagger-2 animate-fade-in min-w-[160px] sm:min-w-0 snap-center flex-shrink-0 sm:flex-shrink ${
                  isAlert ? 'glass-card border border-red-400/20 metric-glow-red' : 'glass-card metric-glow-green'
                }`}>
                  <div className={`inline-flex p-2.5 sm:p-3 rounded-xl mb-2 sm:mb-3 ${isAlert ? 'bg-red-400/15' : 'bg-orange-400/15'}`}>
                    <FlaskConical className={`w-5 h-5 sm:w-6 sm:h-6 ${isAlert ? 'text-red-400' : 'text-orange-400'}`} />
                  </div>
                  <p className="text-white/60 font-semibold text-xs sm:text-sm">pH Level</p>
                  <p className={`${isAlert ? 'text-red-400' : 'text-green-400'} text-xl sm:text-2xl font-bold mt-1`}>
                    {sensorData?.ph_level?.toFixed(1) || '0.0'}
                  </p>
                  <p className="text-white/30 text-[10px] sm:text-xs mt-1">Optimal: 6.0-7.5</p>
                </div>
              )
            })()}

            {/* NPK Levels Card */}
            {(() => {
              const isAlert = (sensorData?.nitrogen === 0 && sensorData?.phosphorus === 0 && sensorData?.potassium === 0) ||
                (sensorData?.nitrogen < 25 || sensorData?.phosphorus < 15 || sensorData?.potassium < 20)
              return (
                <div className={`rounded-2xl p-4 sm:p-5 text-center card-hover stagger-3 animate-fade-in min-w-[160px] sm:min-w-0 snap-center flex-shrink-0 sm:flex-shrink ${
                  isAlert ? 'glass-card border border-red-400/20 metric-glow-red' : 'glass-card metric-glow-green'
                }`}>
                  <div className={`inline-flex p-2.5 sm:p-3 rounded-xl mb-2 sm:mb-3 ${isAlert ? 'bg-red-400/15' : 'bg-emerald-400/15'}`}>
                    <Zap className={`w-5 h-5 sm:w-6 sm:h-6 ${isAlert ? 'text-red-400' : 'text-emerald-400'}`} />
                  </div>
                  <p className="text-white/60 font-semibold text-xs sm:text-sm">NPK Levels</p>
                  <div className="flex justify-center gap-3 sm:gap-4 mt-2">
                    <div className="text-center">
                      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">N</p>
                      <p className={`text-base sm:text-lg font-bold ${sensorData?.nitrogen < 25 ? 'text-red-400' : 'text-green-400'}`}>{sensorData?.nitrogen || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">P</p>
                      <p className={`text-base sm:text-lg font-bold ${sensorData?.phosphorus < 15 ? 'text-red-400' : 'text-green-400'}`}>{sensorData?.phosphorus || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">K</p>
                      <p className={`text-base sm:text-lg font-bold ${sensorData?.potassium < 20 ? 'text-red-400' : 'text-green-400'}`}>{sensorData?.potassium || 0}</p>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Root Rot Prediction Card */}
            {(() => {
              const isAlert = rootRotData?.risk_level === 'High'
              return (
                <div className={`rounded-2xl p-4 sm:p-5 text-center card-hover stagger-4 animate-fade-in min-w-[160px] sm:min-w-0 snap-center flex-shrink-0 sm:flex-shrink ${
                  isAlert ? 'glass-card border border-red-400/20 metric-glow-red' : 'glass-card metric-glow-green'
                }`}>
                  <div className={`inline-flex p-2.5 sm:p-3 rounded-xl mb-2 sm:mb-3 ${isAlert ? 'bg-red-400/15' : 'bg-green-400/15'}`}>
                    <Bug className={`w-5 h-5 sm:w-6 sm:h-6 ${isAlert ? 'text-red-400' : 'text-green-400'}`} />
                  </div>
                  <p className="text-white/60 font-semibold text-xs sm:text-sm">Root Rot Risk</p>
                  <p className={`${isAlert ? 'text-red-400' : 'text-green-400'} text-xl sm:text-2xl font-bold mt-1`}>
                    {rootRotLoading ? 'Loading...' : rootRotData?.risk_level || 'Low'}
                  </p>
                  <p className="text-white/30 text-[10px] sm:text-xs mt-1 line-clamp-2">
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
          <div className="glass-card rounded-2xl p-4 sm:p-6 card-hover animate-slide-up">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2.5">
                <div className="bg-emerald-400/15 p-2 rounded-lg border border-emerald-400/10">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Live Sensor Data</h2>
              </div>
            </div>

            {sensorLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 text-white/20 animate-spin mx-auto mb-2" />
                <p className="text-white/40 text-sm">Loading sensor data...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="glass-card-inner rounded-xl p-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FlaskConical className="w-4 h-4 text-orange-400" />
                      <span className="text-xs font-medium text-white/50">pH Level</span>
                    </div>
                    <div className="text-xl font-bold text-orange-400">{sensorData?.ph_level?.toFixed(1) || 'N/A'}</div>
                  </div>

                  <div className="glass-card-inner rounded-xl p-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Droplets className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-medium text-white/50">Moisture</span>
                    </div>
                    <div className="text-xl font-bold text-blue-400">{sensorData?.moisture?.toFixed(1) || '0.0'}%</div>
                  </div>

                  <div className="glass-card-inner rounded-xl p-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Thermometer className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-medium text-white/50">Soil Temp</span>
                    </div>
                    <div className="text-xl font-bold text-red-400">{sensorData?.soil_temp?.toFixed(1) || 'N/A'} °C</div>
                  </div>

                  <div className="glass-card-inner rounded-xl p-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-xs font-medium text-white/50">Nitrogen</span>
                    </div>
                    <div className="text-xl font-bold text-green-400">{sensorData?.nitrogen || 0} ppm</div>
                  </div>

                  <div className="glass-card-inner rounded-xl p-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Atom className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-medium text-white/50">Phosphorus</span>
                    </div>
                    <div className="text-xl font-bold text-purple-400">{sensorData?.phosphorus || 0} ppm</div>
                  </div>

                  <div className="glass-card-inner rounded-xl p-3.5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-medium text-white/50">Potassium</span>
                    </div>
                    <div className="text-xl font-bold text-amber-400">{sensorData?.potassium || 0} ppm</div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-white/50 glass-card-inner rounded-lg px-3 py-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${sensorData?.sensor_status === 'active' ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                  <span className="font-medium">Sensor: {sensorData?.sensor_status || 'Unknown'}</span>
                </div>
              </>
            )}
          </div>

          {/* 7-Day Forecast */}
          <div className="glass-card rounded-2xl p-4 sm:p-6 card-hover animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2.5">
                <div className="bg-blue-400/15 p-2 rounded-lg border border-blue-400/10">
                  <Cloud className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-bold text-white">7-Day Forecast</h2>
              </div>
            </div>

            {forecastLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 text-white/20 animate-spin mx-auto mb-2" />
                <p className="text-white/40 text-sm">Loading forecast...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {forecastData.map((day, index) => (
                  <div key={day.id || index} className="flex items-center justify-between p-3 glass-card-inner rounded-xl hover:bg-white/[0.08] transition-all duration-200">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl w-8 text-center">{day.icon || '☀️'}</span>
                      <div>
                        <div className="font-semibold text-white text-sm">{day.day_name || day.day}</div>
                        <div className="text-xs text-white/50">{day.condition}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-blue-400">
                        <Droplets className="w-3 h-3" />
                        <span>{day.rain_chance || day.rain}%</span>
                      </div>
                      <div className="font-bold text-white text-sm">{day.temperature || day.temp}°C</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Fertilizer Plan */}
          <div className="glass-card rounded-2xl p-4 sm:p-6 card-hover animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex justify-between items-center mb-4 sm:mb-5">
              <div className="flex items-center gap-2.5">
                <div className="bg-violet-400/15 p-2 rounded-lg border border-violet-400/10">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">AI Fertilizer Plan</h2>
              </div>
              <button
                onClick={handleClearCache}
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-orange-400 active:text-orange-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-orange-400/10"
                title="Clear cached recommendations"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {planLoading ? (
              <div className="text-center py-8">
                <Sparkles className="w-6 h-6 text-violet-400/50 animate-pulse mx-auto mb-2" />
                <p className="text-white/40 text-sm">Generating AI recommendations...</p>
              </div>
            ) : fertilizerPlan ? (
              <>
                <div className="glass-card-inner rounded-xl p-4 mb-4 border-green-400/10">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-white/70 leading-relaxed">
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
                    <div key={i} className="glass-card-inner rounded-xl p-4 hover:bg-white/[0.08] transition-colors">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="text-white/40">{nutrient.icon}</span>
                          <span className="font-semibold text-white">{nutrient.label}</span>
                        </div>
                        <span className={`${getSeverityBadge(nutrient.priority)} text-white text-[10px] font-bold px-2 py-0.5 rounded-full capitalize`}>
                          {nutrient.priority} Priority
                        </span>
                      </div>
                      <div className="space-y-1.5 pl-6">
                        <div className="flex items-center gap-2 text-sm text-white/50">
                          <Scale className="w-3.5 h-3.5 text-white/30" />
                          <span>{nutrient.amount?.toFixed(0) || nutrient.defaultAmount} kg/ha</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-white/50">
                          <CalendarDays className="w-3.5 h-3.5 text-white/30" />
                          <span>Apply {nutrient.applyBy ? new Date(nutrient.applyBy).toLocaleDateString() === new Date().toLocaleDateString() ? 'immediately' : `by ${new Date(nutrient.applyBy).toLocaleDateString()}` : nutrient.defaultApply}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 flex items-center justify-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Generate Detailed Schedule
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="w-8 h-8 text-white/10 mx-auto mb-2" />
                <p className="text-white/40 text-sm">No fertilizer plan available</p>
              </div>
            )}
          </div>
        </div>

        {/* Weather Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 animate-fade-in">
          {/* Regional Forecast */}
          <div className="glass-card rounded-2xl p-4 sm:p-6 card-hover">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-sky-400/15 p-2 rounded-lg border border-sky-400/10">
                  <Cloud className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-white">{regionalWeather?.location || 'Islamabad, PK'}</h2>
                  <p className="text-[10px] sm:text-xs text-white/40">Regional Forecast</p>
                </div>
              </div>
            </div>
            {weatherLoading ? (
              <div className="text-center py-4">
                <RefreshCw className="w-5 h-5 text-white/20 animate-spin mx-auto" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-3xl sm:text-4xl font-bold text-white">{regionalWeather?.temperature?.toFixed(0) || 8}°</div>
                  <div className="flex items-center gap-1.5 text-white/60 glass-card-inner px-2 sm:px-2.5 py-1 rounded-full text-xs sm:text-sm">
                    <Droplets className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400" />
                    <span>{regionalWeather?.humidity?.toFixed(0) || 26}%</span>
                  </div>
                </div>
                <div className="text-4xl sm:text-5xl">{regionalWeather?.weather_icon || '☁️☀️'}</div>
              </div>
            )}
          </div>

          {/* On-Site Weather */}
          <div className="glass-card rounded-2xl p-4 sm:p-6 card-hover">
            <div className="flex items-center gap-2.5 mb-3 sm:mb-4">
              <div className="bg-emerald-400/15 p-2 rounded-lg border border-emerald-400/10">
                <CircleDot className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-white">On-Site Weather</h2>
                <p className="text-[10px] sm:text-xs text-white/40">Local sensor data</p>
              </div>
            </div>
            {weatherLoading ? (
              <div className="text-center py-4">
                <RefreshCw className="w-5 h-5 text-white/20 animate-spin mx-auto" />
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-3xl sm:text-4xl font-bold text-white">{onSiteWeather?.temperature?.toFixed(1) || 16.1}°</div>
                  <div className="flex items-center gap-1.5 text-white/60 glass-card-inner px-2 sm:px-2.5 py-1 rounded-full text-xs sm:text-sm">
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
