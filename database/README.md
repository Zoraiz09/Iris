## Database

This folder contains all **database-related artifacts** for the IRIS Agricultural Monitoring System.

### Files

- `schema.sql` (recommended name): core schema for tables, functions, triggers, and policies  
- `enable_realtime.sql`: enables Supabase Realtime on key tables  
- `REALTIME_SETUP.md`: how realtime is wired into the app  
- `TROUBLESHOOTING_REALTIME.md`: common issues and fixes for realtime

> Note: In the current project, the main schema was created directly in the Supabase SQL editor.

### Suggested layout

```text
database/
  schema/                 # Core DDL (tables, functions, triggers)
    001_schema.sql
    002_functions.sql
  realtime/               # Realtime-specific SQL and docs
    enable_realtime.sql
  docs/                   # Database documentation
    REALTIME_SETUP.md
    TROUBLESHOOTING_REALTIME.md
```

### How to apply SQL

1. Open **Supabase Dashboard → SQL Editor**
2. Paste the contents of the `.sql` file
3. Click **Run**






