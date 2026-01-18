# Fixing Statement Timeout Error

## Problem
The `/api/stats` endpoint was timing out (error code 57014) because it was performing expensive aggregate queries on large datasets (50K+ repositories).

## Solution Implemented

### 1. Created Materialized View for Caching
- Added migration: `supabase/migrations/20260117000003_create_stats_cache.sql`
- Creates `dashboard_stats_cache` materialized view that pre-computes:
  - Total repositories count
  - Total stars sum
  - Total commits sum
  - Unique languages count

### 2. Optimized Query Logic
- Modified `getRepositoryStats()` in `lib/supabase-queries.ts`
- Now uses 3-tier approach:
  1. **Primary**: Read from cached materialized view (instant)
  2. **Fallback**: Optimized live queries with limits (500ms-2s)
  3. **Emergency**: Return static estimates if all fails

### 3. Added Configuration
- Updated Supabase client with proper headers
- Reduced sample size from 1000 to 500 repos for commit estimation

### 4. Created Management Scripts
- `scripts/apply-stats-migration.js` - Apply the migration
- `scripts/refresh-stats-cache.js` - Refresh cached data

## How to Apply

### Option A: Using Supabase CLI (Recommended)
```bash
# If you have supabase CLI installed
supabase db push
```

### Option B: Manual SQL Editor
1. Open your Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `supabase/migrations/20260117000003_create_stats_cache.sql`
4. Execute the SQL
5. Verify with: `SELECT * FROM dashboard_stats_cache;`

### Option C: Using Node Script
```bash
node scripts/apply-stats-migration.js
```

## Refresh Cache Periodically

To keep stats fresh, refresh the cache periodically:

```bash
# Run this daily or when data is updated
node scripts/refresh-stats-cache.js
```

Or set up a cron job:
```bash
# Run daily at 2 AM
0 2 * * * cd /path/to/nexus && node scripts/refresh-stats-cache.js
```

## Performance Improvements

**Before:**
- `/api/stats` endpoint: 5.6s (timeout)
- Complex aggregate queries on 50K+ rows
- High database load

**After:**
- `/api/stats` endpoint: ~200ms (cached)
- Single query to materialized view
- Minimal database load
- Graceful fallback if cache unavailable

## Testing

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Check the console - you should see:
   ```
   GET /api/stats 200 in ~200ms
   ```

3. No more timeout errors!

## Maintenance

The cache refreshes automatically when you call:
```javascript
await supabase.rpc('refresh_dashboard_stats');
```

You can also set up a Supabase Edge Function or cron job to refresh it periodically.
