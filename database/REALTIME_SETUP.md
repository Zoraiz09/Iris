# Real-Time Updates Setup

Your website is now configured for real-time updates! Here's what you need to know:

## ✅ What's Already Set Up

1. **Real-time subscriptions** are configured in all hooks:
   - `useSensorData` - Updates when sensor_data changes
   - `useWeatherData` - Updates when weather_data changes
   - `useAlerts` - Updates when alerts change
   - `useForecastData` - Updates when forecast_data changes
   - `useFertilizerPlan` - Updates when fertilizer_plans change

2. **Automatic refresh** - When any data changes in Supabase, the website will automatically update without page refresh.

## 🔧 Enable Realtime in Supabase

For real-time to work, you need to enable it on your tables in Supabase:

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard
2. Navigate to **Database** → **Replication**
3. For each table, toggle **Realtime** to ON:
   - `sensor_data`
   - `weather_data`
   - `alerts`
   - `forecast_data`
   - `fertilizer_plans`

### Option 2: Via SQL (Run in SQL Editor)

```sql
-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE sensor_data;
ALTER PUBLICATION supabase_realtime ADD TABLE weather_data;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE forecast_data;
ALTER PUBLICATION supabase_realtime ADD TABLE fertilizer_plans;
```

## 🧪 Testing Real-Time Updates

1. Open your website in the browser
2. Open Supabase Dashboard → Table Editor
3. Edit any row in `sensor_data`, `weather_data`, or `alerts`
4. The website should update automatically within seconds!

## 📊 Console Logs

Check your browser's developer console (F12) to see:
- Subscription status messages
- Data change notifications
- Any connection issues

## 🔍 Troubleshooting

If real-time isn't working:

1. **Check Realtime is enabled** - Make sure tables are enabled in Database → Replication
2. **Check browser console** - Look for subscription status messages
3. **Check network tab** - Verify WebSocket connections are established
4. **Verify RLS policies** - Make sure your RLS policies allow SELECT operations

## 🚀 How It Works

- When data changes in Supabase, a WebSocket connection sends the update to your browser
- The hooks automatically detect the change and refresh the data
- React re-renders the components with the new data
- No page refresh needed!






