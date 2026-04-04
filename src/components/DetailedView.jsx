import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Leaf,
  ArrowLeft,
  LogOut,
  FlaskConical,
  Droplets,
  Thermometer,
  TrendingUp,
  Atom,
  Zap,
  Cloud,
  Activity,
  Sparkles,
  Scale,
  CalendarDays,
  CircleDot,
} from 'lucide-react'

const DetailedView = () => {
  const navigate = useNavigate()
  const { signOut } = useAuth()

  const days = [
    { day: 'Monday', icon: '☀️', condition: 'Sunny', rain: 45, temp: 28 },
    { day: 'Tuesday', icon: '⛅', condition: 'Partly Cloudy', rain: 52, temp: 26 },
    { day: 'Wednesday', icon: '☁️', condition: 'Cloudy', rain: 60, temp: 24 },
    { day: 'Thursday', icon: '🌦️', condition: 'Light Rain', rain: 75, temp: 22 },
    { day: 'Friday', icon: '☀️', condition: 'Sunny', rain: 48, temp: 27 },
    { day: 'Saturday', icon: '☀️', condition: 'Sunny', rain: 42, temp: 29 },
    { day: 'Sunday', icon: '⛅', condition: 'Partly Cloudy', rain: 50, temp: 28 },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30 w-full">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-800 text-white px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center shadow-lg w-full border-b border-green-600/30 safe-top">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all duration-200">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="bg-white/15 p-1.5 sm:p-2 rounded-xl backdrop-blur-sm">
            <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-green-300" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight">IRIS</h1>
            <p className="text-green-300/80 text-[10px] sm:text-xs font-medium -mt-0.5">Agricultural Monitoring</p>
          </div>
        </div>
        <button onClick={signOut} className="flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all duration-200">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Sign Out</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="px-3 sm:px-6 py-4 sm:py-6 w-full max-w-[1600px] mx-auto safe-bottom">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Live Sensor Data */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 card-hover animate-slide-up">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2.5">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <Activity className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">Live Sensor Data</h2>
              </div>
              <button className="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 rounded-lg hover:bg-green-50 transition-colors">View History</button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-br from-orange-50 to-amber-50/50 rounded-xl p-3.5 border border-orange-100/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <FlaskConical className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-medium text-gray-500">pH Level</span>
                </div>
                <div className="text-xl font-bold text-orange-600">8.1</div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50/50 rounded-xl p-3.5 border border-blue-100/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium text-gray-500">Moisture</span>
                </div>
                <div className="text-xl font-bold text-blue-600">0.0%</div>
              </div>

              <div className="bg-gradient-to-br from-red-50 to-rose-50/50 rounded-xl p-3.5 border border-red-100/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <Thermometer className="w-4 h-4 text-red-500" />
                  <span className="text-xs font-medium text-gray-500">Soil Temp</span>
                </div>
                <div className="text-xl font-bold text-red-500">24.5 °C</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-xl p-3.5 border border-green-100/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-xs font-medium text-gray-500">Nitrogen</span>
                </div>
                <div className="text-xl font-bold text-green-600">0 ppm</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-violet-50/50 rounded-xl p-3.5 border border-purple-100/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <Atom className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-medium text-gray-500">Phosphorus</span>
                </div>
                <div className="text-xl font-bold text-purple-600">0 ppm</div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-yellow-50/50 rounded-xl p-3.5 border border-amber-100/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-medium text-gray-500">Potassium</span>
                </div>
                <div className="text-xl font-bold text-amber-600">0 ppm</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Sensor Status: Active</span>
            </div>
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
              <button className="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 rounded-lg hover:bg-green-50 transition-colors">Full Forecast</button>
            </div>

            <div className="space-y-2">
              {days.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-transparent rounded-xl hover:from-blue-50/50 transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl w-8 text-center">{day.icon}</span>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm">{day.day}</div>
                      <div className="text-xs text-gray-500">{day.condition}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-blue-500">
                      <Droplets className="w-3 h-3" />
                      <span>{day.rain}%</span>
                    </div>
                    <div className="font-bold text-gray-800 text-sm">{day.temp}°C</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Fertilizer Plan */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 card-hover animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2.5">
                <div className="bg-violet-100 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-800">AI Fertilizer Plan</h2>
              </div>
              <button className="text-xs text-green-600 hover:text-green-700 font-medium px-2 py-1 rounded-lg hover:bg-green-50 transition-colors">Download Plan</button>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-4 mb-4 border border-green-100/50">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600 leading-relaxed">
                  Based on current soil conditions and crop requirements, immediate fertilization is critical. NPK levels are depleted and moisture is extremely low.
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {[
                { label: 'Nitrogen (N)', priority: 'high', amount: 120, timing: 'Apply immediately', icon: <TrendingUp className="w-4 h-4" /> },
                { label: 'Phosphorus (P)', priority: 'high', amount: 80, timing: 'Apply within 3 days', icon: <Atom className="w-4 h-4" /> },
                { label: 'Potassium (K)', priority: 'medium', amount: 100, timing: 'Apply within 5 days', icon: <Zap className="w-4 h-4" /> },
              ].map((nutrient, i) => (
                <div key={i} className="border border-gray-100 rounded-xl p-4 hover:border-green-200 transition-colors">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">{nutrient.icon}</span>
                      <span className="font-semibold text-gray-800">{nutrient.label}</span>
                    </div>
                    <span className={`${nutrient.priority === 'high' ? 'bg-red-500/90' : 'bg-amber-500/90'} text-white text-[10px] font-bold px-2 py-0.5 rounded-full capitalize`}>
                      {nutrient.priority === 'high' ? 'High' : 'Medium'} Priority
                    </span>
                  </div>
                  <div className="space-y-1.5 pl-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Scale className="w-3.5 h-3.5 text-gray-400" />
                      <span>{nutrient.amount} kg/ha</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                      <span>{nutrient.timing}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Generate Detailed Schedule
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DetailedView
