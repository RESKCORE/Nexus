-- Create materialized view for cached dashboard statistics
-- This pre-computes expensive aggregations to prevent timeouts

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

-- Add repo_count column to language_stats if missing (for total_repos)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_matviews WHERE matviewname = 'language_stats') THEN
    REFRESH MATERIALIZED VIEW language_stats;
  END IF;
END $$;
