# 🚀 Supabase Setup Guide

Complete CLI-based setup for your Nexus Observatory project.

## 📋 Prerequisites

- Node.js 18+ installed
- Supabase account (free tier)

## 🔧 Step 1: Create Supabase Project

### Via Web UI (Easiest):
1. Go to https://app.supabase.com
2. Click **"New Project"**
3. Fill in:
   - **Name**: `nexus-observatory` (or your choice)
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to you
4. Click **"Create new project"** (takes ~2 minutes)

### Via CLI (Alternative):
```bash
npx supabase projects create nexus-observatory --org-id your_org_id
```

## 🔑 Step 2: Get Your Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbG...` (long token)
   - **service_role key**: `eyJhbG...` (different long token)

## 📝 Step 3: Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your values
# Replace with YOUR actual credentials from Step 2
```

Your `.env.local` should look like:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🗄️ Step 4: Run Database Migrations

This creates all tables, indexes, and views:

```bash
# Link to your Supabase project
npx supabase link --project-ref your_project_id

# Push migrations to Supabase
npx supabase db push
```

**Alternative (via SQL Editor):**
1. Go to Supabase Dashboard → **SQL Editor**
2. Copy content from `supabase/migrations/20260117000001_create_repositories_tables.sql`
3. Paste and click **"Run"**

## 📊 Step 5: Import CSV Data

This will take 10-15 minutes for the large dataset:

```bash
# Make sure .env.local is configured first!
node scripts/import-to-supabase.js
```

**What it does:**
- ✅ Imports `github_dataset.csv` (561 repos)
- ✅ Imports `repository_data.csv` (~50,000 repos)
- ✅ Creates materialized views
- ✅ Shows progress in real-time

**Expected output:**
```
🚀 Starting Supabase data import...
✅ Connected to Supabase successfully!

📦 Importing github_dataset.csv...
✅ Imported: 561/561

📦 Importing repository_data.csv...
✅ Imported: 50000 rows (100% estimated)

🔄 Refreshing language statistics...
✅ Language statistics refreshed!

🎉 All data imported successfully!
```

## 🧪 Step 6: Test the API

Start your dev server:
```bash
npm run dev
```

Test the API endpoints:
```bash
# Get top repositories
curl http://localhost:3000/api/repositories/top?limit=10

# Get language stats
curl http://localhost:3000/api/languages/stats

# Search repositories
curl http://localhost:3000/api/repositories/search?q=react

# Get dashboard stats
curl http://localhost:3000/api/stats
```

## 🎨 Step 7: Verify in Supabase Dashboard

1. Go to **Table Editor** in Supabase
2. Check tables:
   - `repositories` (should have ~561 rows)
   - `repository_data` (should have ~50,000 rows)
3. Go to **SQL Editor** and run:
```sql
-- Verify data
SELECT COUNT(*) FROM repositories;
SELECT COUNT(*) FROM repository_data;

-- Check language stats
SELECT * FROM language_stats LIMIT 10;

-- Check yearly trends
SELECT * FROM yearly_trends ORDER BY year DESC;
```

## 🚀 Step 8: Deploy to Vercel

```bash
# Add environment variables to Vercel
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Deploy
npx vercel --prod
```

**Or via Vercel Dashboard:**
1. Go to project → **Settings** → **Environment Variables**
2. Add both `NEXT_PUBLIC_*` variables (NOT the service role key!)
3. Redeploy

## 🔄 Updating Data

If you need to re-import data:

```bash
# Clear existing data (optional)
npx supabase db reset

# Or via SQL Editor:
# TRUNCATE repositories, repository_data CASCADE;

# Re-run import
node scripts/import-to-supabase.js
```

## 📊 Useful SQL Queries

```sql
-- Top 10 repositories by stars
SELECT name, stars_count, primary_language
FROM repository_data
ORDER BY stars_count DESC
LIMIT 10;

-- Most popular languages
SELECT * FROM language_stats
ORDER BY avg_stars DESC
LIMIT 10;

-- Repositories created per year
SELECT * FROM yearly_trends
ORDER BY year DESC;

-- Multi-language repositories
SELECT name, languages_used, stars_count
FROM repository_data
WHERE array_length(languages_used, 1) >= 5
ORDER BY stars_count DESC
LIMIT 10;
```

## 🐛 Troubleshooting

### Error: "Missing Supabase credentials"
- Check `.env.local` file exists
- Verify credentials are correct
- Restart dev server after adding env vars

### Error: "relation does not exist"
- Run migrations: `npx supabase db push`
- Or manually run SQL in Supabase SQL Editor

### Import is slow
- Normal! Large CSV takes 10-15 minutes
- Don't interrupt the process
- Check Supabase dashboard for row count

### API returns empty data
- Verify import completed successfully
- Check table has data in Supabase dashboard
- Check browser console for errors

## 📚 Next Steps

1. Build dashboard components using `/api/stats`
2. Add data visualizations with D3.js
3. Implement filters and search
4. Add ML clustering visualizations
5. Create export functionality

## 🎉 Done!

Your Supabase database is now set up with:
- ✅ 50,000+ repositories
- ✅ Language statistics
- ✅ Time-series data
- ✅ Auto-generated REST API
- ✅ Production-ready queries

Now you can focus on building awesome visualizations! 🚀
