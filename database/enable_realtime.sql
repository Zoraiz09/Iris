-- Enable Realtime for IRIS Agricultural Monitoring System Tables
-- Run this in Supabase SQL Editor to enable real-time updates

-- Enable Realtime for sensor_data table
ALTER PUBLICATION supabase_realtime ADD TABLE sensor_data;

-- Enable Realtime for weather_data table
ALTER PUBLICATION supabase_realtime ADD TABLE weather_data;

-- Enable Realtime for alerts table
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;

-- Enable Realtime for forecast_data table
ALTER PUBLICATION supabase_realtime ADD TABLE forecast_data;

-- Enable Realtime for fertilizer_plans table
ALTER PUBLICATION supabase_realtime ADD TABLE fertilizer_plans;

-- Verify Realtime is enabled (optional - run to check)
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('sensor_data', 'weather_data', 'alerts', 'forecast_data', 'fertilizer_plans');






