# Quick Fix: Apply Stats Cache Migration

## ⚡ Quick Steps

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy & Execute This SQL**

```sql
-- Create materialized view for cached dashboard statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS dashboard_stats_cache AS
SELECT 
  (SELECT COUNT(*) FROM repository_data) as total_repos,
  (SELECT COALESCE(SUM(stars_count), 0) FROM repository_data) as total_stars,
  (SELECT COALESCE(SUM(commit_count), 0) FROM repository_data WHERE commit_count IS NOT NULL) as total_commits,
  (SELECT COUNT(DISTINCT primary_language) FROM repository_data WHERE primary_language IS NOT NULL) as unique_languages,
  NOW() as last_updated;

-- Create index for fast access
CREATE UNIQUE INDEX IF NOT EXISTS idx_dashboard_stats_cache ON dashboard_stats_cache(last_updated);

-- Function to refresh dashboard stats cache
CREATE OR REPLACE FUNCTION refresh_dashboard_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY dashboard_stats_cache;
END;
$$ LANGUAGE plpgsql;

-- Refresh the views
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_materialized_views WHERE matviewname = 'language_stats') THEN
    REFRESH MATERIALIZED VIEW language_stats;
  END IF;
  
  -- Initial populate of dashboard stats
  REFRESH MATERIALIZED VIEW dashboard_stats_cache;
END $$;
```

4. **Click "Run"** (or press Ctrl+Enter)

5. **Verify It Worked**
```sql
SELECT * FROM dashboard_stats_cache;
```

You should see one row with your stats!

## ✅ Done!

Now restart your dev server:
```bash
npm run dev
```

The `/api/stats` endpoint should now load in ~200ms instead of timing out! 🎉

## 🔄 Optional: Auto-Refresh Setup

To keep stats fresh, you can set up a cron job or run manually:
```bash
node scripts/refresh-stats-cache.js
```

Or run this SQL periodically:
```sql
SELECT refresh_dashboard_stats();
```
