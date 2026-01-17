/**
 * Advanced Database Functions
 * Run these in Supabase SQL Editor to add helper functions
 */

-- Function to get multi-language repositories
CREATE OR REPLACE FUNCTION get_multi_language_repos(
  min_languages INT DEFAULT 3,
  result_limit INT DEFAULT 50
)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  stars_count INT,
  forks_count INT,
  primary_language TEXT,
  languages_used TEXT[],
  language_count INT,
  commit_count NUMERIC,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.name,
    r.stars_count,
    r.forks_count,
    r.primary_language,
    r.languages_used,
    array_length(r.languages_used, 1) as language_count,
    r.commit_count,
    r.created_at
  FROM repository_data r
  WHERE array_length(r.languages_used, 1) >= min_languages
  ORDER BY r.stars_count DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate repository growth rate
CREATE OR REPLACE FUNCTION get_repository_growth_metrics()
RETURNS TABLE (
  year INT,
  repos_created BIGINT,
  growth_rate NUMERIC,
  cumulative_repos BIGINT
) AS $$
WITH yearly_counts AS (
  SELECT 
    EXTRACT(YEAR FROM created_at)::INT as year,
    COUNT(*) as count
  FROM repository_data
  WHERE created_at IS NOT NULL
  GROUP BY EXTRACT(YEAR FROM created_at)
  ORDER BY year
),
cumulative AS (
  SELECT 
    year,
    count as repos_created,
    SUM(count) OVER (ORDER BY year) as cumulative_repos
  FROM yearly_counts
)
SELECT 
  year,
  repos_created,
  ROUND(
    ((repos_created::NUMERIC - LAG(repos_created) OVER (ORDER BY year)) / 
    NULLIF(LAG(repos_created) OVER (ORDER BY year), 0) * 100)::NUMERIC,
    2
  ) as growth_rate,
  cumulative_repos
FROM cumulative;
$$ LANGUAGE sql;

-- Function to get language correlation with success metrics
CREATE OR REPLACE FUNCTION get_language_correlations()
RETURNS TABLE (
  primary_language TEXT,
  repo_count BIGINT,
  avg_stars_per_commit NUMERIC,
  avg_forks_to_stars_ratio NUMERIC,
  avg_contributors_per_star NUMERIC,
  popularity_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rd.primary_language,
    COUNT(*)::BIGINT as repo_count,
    ROUND(AVG(NULLIF(rd.stars_count, 0)::NUMERIC / NULLIF(rd.commit_count, 0)), 4) as avg_stars_per_commit,
    ROUND(AVG(NULLIF(rd.forks_count, 0)::NUMERIC / NULLIF(rd.stars_count, 0)), 4) as avg_forks_to_stars_ratio,
    ROUND(AVG(NULLIF(r.contributors, 0)::NUMERIC / NULLIF(rd.stars_count, 0)), 6) as avg_contributors_per_star,
    ROUND(
      (AVG(rd.stars_count) * 0.4 + 
       AVG(rd.forks_count) * 0.3 + 
       AVG(rd.commit_count) * 0.2 + 
       AVG(rd.pull_requests) * 0.1)::NUMERIC,
      2
    ) as popularity_score
  FROM repository_data rd
  LEFT JOIN repositories r ON rd.name = r.repository_name
  WHERE rd.primary_language IS NOT NULL
    AND rd.commit_count > 0
    AND rd.stars_count > 0
  GROUP BY rd.primary_language
  HAVING COUNT(*) >= 10
  ORDER BY popularity_score DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get license adoption trends
CREATE OR REPLACE FUNCTION get_license_trends()
RETURNS TABLE (
  licence TEXT,
  total_repos BIGINT,
  avg_stars NUMERIC,
  early_adoption_count BIGINT,
  recent_adoption_count BIGINT,
  growth_percentage NUMERIC
) AS $$
WITH license_by_period AS (
  SELECT 
    licence,
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM created_at) < 2015) as early_count,
    COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM created_at) >= 2020) as recent_count,
    COUNT(*) as total_count,
    AVG(stars_count) as avg_stars
  FROM repository_data
  WHERE licence IS NOT NULL
    AND created_at IS NOT NULL
  GROUP BY licence
)
SELECT 
  licence,
  total_count::BIGINT as total_repos,
  ROUND(avg_stars::NUMERIC, 0) as avg_stars,
  early_count::BIGINT as early_adoption_count,
  recent_count::BIGINT as recent_adoption_count,
  ROUND(
    ((recent_count::NUMERIC - early_count) / NULLIF(early_count, 0) * 100)::NUMERIC,
    2
  ) as growth_percentage
FROM license_by_period
WHERE total_count >= 10
ORDER BY total_repos DESC;
$$ LANGUAGE sql;

-- Create index on languages_used for faster multi-language queries
CREATE INDEX IF NOT EXISTS idx_languages_used_gin ON repository_data USING GIN (languages_used);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_repo_data_lang_stars ON repository_data(primary_language, stars_count DESC);
CREATE INDEX IF NOT EXISTS idx_repo_data_year_stars ON repository_data(EXTRACT(YEAR FROM created_at), stars_count DESC);
