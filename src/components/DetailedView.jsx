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
    <div className="min-h-screen bg-gradient-to-br from-[#0a1f0a] via-[#0d2818] to-[#0a2015] w-full relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="bg-blob w-[500px] h-[500px] bg-green-500/8 -top-40 -right-40 fixed" />
      <div className="bg-blob w-[600px] h-[600px] bg-emerald-600/6 -bottom-60 -left-40 fixed" />
      <div className="bg-blob w-[400px] h-[400px] bg-teal-500/5 top-1/2 left-1/3 fixed" />

      {/* Header */}
      <header className="glass-header text-white px-3 sm:px-6 py-3 sm:py-4 flex justify-between items-center w-full safe-top relative z-10 sticky top-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all duration-200">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="bg-green-400/15 p-1.5 sm:p-2 rounded-xl border border-green-400/10">
            <Leaf className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white">IRIS</h1>
            <p className="text-green-400/70 text-[10px] sm:text-xs font-medium -mt-0.5">Agricultural Monitoring</p>
          </div>
        </div>
        <button onClick={signOut} className="flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-all duration-200">
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium hidden sm:inline">Sign Out</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="px-3 sm:px-6 py-4 sm:py-6 w-full max-w-[1600px] mx-auto safe-bottom relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Live Sensor Data */}
          <div className="glass-card rounded-2xl p-4 sm:p-6 card-hover animate-slide-up">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2.5">
                <div className="bg-emerald-400/15 p-2 rounded-lg border border-emerald-400/10">
                  <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <h2 className="text-lg font-bold text-white">Live Sensor Data</h2>
              </div>
              <button className="text-xs text-green-400 hover:text-green-300 font-medium px-2 py-1 rounded-lg hover:bg-green-400/10 transition-colors">View History</button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="glass-card-inner rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <FlaskConical className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-medium text-white/50">pH Level</span>
                </div>
                <div className="text-xl font-bold text-orange-400">8.1</div>
              </div>

              <div className="glass-card-inner rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-medium text-white/50">Moisture</span>
                </div>
                <div className="text-xl font-bold text-blue-400">0.0%</div>
              </div>

              <div className="glass-card-inner rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Thermometer className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-medium text-white/50">Soil Temp</span>
                </div>
                <div className="text-xl font-bold text-red-400">24.5 °C</div>
              </div>

              <div className="glass-card-inner rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-medium text-white/50">Nitrogen</span>
                </div>
                <div className="text-xl font-bold text-green-400">0 ppm</div>
              </div>

              <div className="glass-card-inner rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Atom className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-medium text-white/50">Phosphorus</span>
                </div>
                <div className="text-xl font-bold text-purple-400">0 ppm</div>
              </div>

              <div className="glass-card-inner rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-medium text-white/50">Potassium</span>
                </div>
                <div className="text-xl font-bold text-amber-400">0 ppm</div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-white/50 glass-card-inner rounded-lg px-3 py-2">
              <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
              <span className="font-medium">Sensor Status: Active</span>
            </div>
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
              <button className="text-xs text-green-400 hover:text-green-300 font-medium px-2 py-1 rounded-lg hover:bg-green-400/10 transition-colors">Full Forecast</button>
            </div>

            <div className="space-y-2">
              {days.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 glass-card-inner rounded-xl hover:bg-white/[0.08] transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl w-8 text-center">{day.icon}</span>
                    <div>
                      <div className="font-semibold text-white text-sm">{day.day}</div>
                      <div className="text-xs text-white/50">{day.condition}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-blue-400">
                      <Droplets className="w-3 h-3" />
                      <span>{day.rain}%</span>
                    </div>
                    <div className="font-bold text-white text-sm">{day.temp}°C</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Fertilizer Plan */}
          <div className="glass-card rounded-2xl p-4 sm:p-6 card-hover animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2.5">
                <div className="bg-violet-400/15 p-2 rounded-lg border border-violet-400/10">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                </div>
                <h2 className="text-lg font-bold text-white">AI Fertilizer Plan</h2>
              </div>
              <button className="text-xs text-green-400 hover:text-green-300 font-medium px-2 py-1 rounded-lg hover:bg-green-400/10 transition-colors">Download Plan</button>
            </div>

            <div className="glass-card-inner rounded-xl p-4 mb-4 border-green-400/10">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-white/70 leading-relaxed">
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
                <div key={i} className="glass-card-inner rounded-xl p-4 hover:bg-white/[0.08] transition-colors">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-white/40">{nutrient.icon}</span>
                      <span className="font-semibold text-white">{nutrient.label}</span>
                    </div>
                    <span className={`${nutrient.priority === 'high' ? 'bg-red-500/90' : 'bg-amber-500/90'} text-white text-[10px] font-bold px-2 py-0.5 rounded-full capitalize`}>
                      {nutrient.priority === 'high' ? 'High' : 'Medium'} Priority
                    </span>
                  </div>
                  <div className="space-y-1.5 pl-6">
                    <div className="flex items-center gap-2 text-sm text-white/50">
                      <Scale className="w-3.5 h-3.5 text-white/30" />
                      <span>{nutrient.amount} kg/ha</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/50">
                      <CalendarDays className="w-3.5 h-3.5 text-white/30" />
                      <span>{nutrient.timing}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold py-3 rounded-xl hover:from-green-400 hover:to-emerald-400 transition-all duration-200 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 flex items-center justify-center gap-2">
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
