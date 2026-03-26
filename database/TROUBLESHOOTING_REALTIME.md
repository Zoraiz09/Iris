# Troubleshooting Real-Time Updates

If changes in Supabase don't show on your website without refreshing, follow these steps:

## Step 1: Enable Realtime in Supabase (CRITICAL)

**This is the most common issue!** Realtime must be enabled on each table.

### Quick Fix - Run this SQL in Supabase SQL Editor:

```sql
-- Enable Realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE sensor_data;
ALTER PUBLICATION supabase_realtime ADD TABLE weather_data;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE forecast_data;
ALTER PUBLICATION supabase_realtime ADD TABLE fertilizer_plans;
```

### Or via Dashboard:

1. Go to **Supabase Dashboard** → **Database** → **Replication**
2. For each table, toggle **Realtime** to **ON**:
   - ✅ sensor_data
   - ✅ weather_data
   - ✅ alerts
   - ✅ forecast_data
   - ✅ fertilizer_plans

## Step 2: Check Browser Console

Open your browser's Developer Console (F12) and look for:

### ✅ Good Signs:
- `✅ Sensor data subscription: CONNECTED`
- `✅ Weather data subscription: CONNECTED`
- `✅ Alerts subscription: CONNECTED`

### ❌ Bad Signs:
- `❌ Sensor data subscription: ERROR - Check if Realtime is enabled`
- `CHANNEL_ERROR` status
- No subscription messages at all

## Step 3: Verify Realtime is Enabled

Run this SQL to check:

```sql
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('sensor_data', 'weather_data', 'alerts', 'forecast_data', 'fertilizer_plans');
```

You should see all 5 tables listed. If any are missing, they're not enabled for realtime.

## Step 4: Test Real-Time Updates

1. **Open your website** in the browser
2. **Open browser console** (F12) to see subscription status
3. **Go to Supabase Dashboard** → **Table Editor**
4. **Edit a row** in `sensor_data` (e.g., change pH level from 8.1 to 8.5)
5. **Save the change**
6. **Check your website** - it should update within 1-2 seconds!

## Step 5: Check Network Tab

1. Open **Developer Tools** → **Network** tab
2. Filter by **WS** (WebSocket)
3. You should see a WebSocket connection to your Supabase URL
4. If you don't see WebSocket connections, realtime isn't working

## Common Issues & Solutions

### Issue: "CHANNEL_ERROR" in console
**Solution:** Realtime is not enabled on that table. Enable it via SQL or Dashboard.

### Issue: No subscription messages at all
**Solution:** 
- Check if `.env` file has correct Supabase credentials
- Restart dev server: `npm run dev`
- Check browser console for any errors

### Issue: Subscriptions connect but no updates
**Solution:**
- Make sure you're editing the data in Supabase (not just viewing)
- Check RLS policies allow SELECT operations
- Verify the table name matches exactly (case-sensitive)

### Issue: Updates work but are slow
**Solution:** This is normal - updates can take 1-3 seconds to propagate.

## Still Not Working?

1. **Verify environment variables:**
   ```bash
   # Check .env file exists and has correct values
   cat .env
   ```

2. **Restart everything:**
   - Stop dev server (Ctrl+C)
   - Restart: `npm run dev`
   - Hard refresh browser (Ctrl+Shift+R)

3. **Check Supabase project settings:**
   - Go to **Settings** → **API**
   - Verify your project URL and keys match `.env` file

4. **Test with a simple query:**
   ```javascript
   // In browser console
   const { data } = await supabase.from('sensor_data').select('*').limit(1)
   console.log(data)
   ```
   If this works, the connection is fine - the issue is with realtime specifically.

## Need More Help?

Check the console logs - they now include emoji indicators:
- ✅ = Connected successfully
- ❌ = Error (usually means realtime not enabled)
- 🔔 = Data change detected
- 🔄 = Status change






