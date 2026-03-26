# IRIS Agricultural Monitoring System

A modern, responsive frontend dashboard for agricultural monitoring and management.

## Features

- **Dashboard Overview**: Weather information, crop selection, and critical alerts
- **Live Sensor Data**: Real-time monitoring of pH, moisture, temperature, and NPK levels
- **7-Day Weather Forecast**: Detailed weather predictions
- **AI Fertilizer Plan**: Intelligent recommendations for fertilizer application

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

Top-level layout is organized into **frontend**, **backend**, and **database** concerns:

```text
.
├── src/                    # Frontend React app (Vite + Tailwind)
│   ├── components/
│   │   ├── Dashboard.jsx        # Main dashboard view (home)
│   │   ├── DetailedView.jsx     # Detailed data view (currently unused route)
│   │   └── RealtimeStatus.jsx   # Small widget to show realtime connection status
│   ├── hooks/                   # Supabase data hooks
│   │   ├── useSensorData.js
│   │   ├── useWeatherData.js
│   │   ├── useForecastData.js
│   │   ├── useFertilizerPlan.js
│   │   ├── useAlerts.js
│   │   └── useCropTypes.js
│   ├── lib/
│   │   └── supabase.js          # Supabase client configuration
│   ├── App.jsx                  # Main app component with routing
│   ├── main.jsx                 # Entry point
│   └── index.css                # Global styles with Tailwind
│
├── backend/                 # Backend layer (currently Supabase-only, no custom API)
│   └── README.md
│
├── database/                # Database / Supabase artifacts
│   ├── README.md
│   ├── enable_realtime.sql
│   ├── REALTIME_SETUP.md
│   └── TROUBLESHOOTING_REALTIME.md
│
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

## Pages

- `/` - Main dashboard with weather, alerts, and navigation
- `/detailed` - Detailed view with sensor data, forecast, and fertilizer plan

