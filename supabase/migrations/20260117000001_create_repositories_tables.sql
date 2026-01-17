-- Create table for github_dataset.csv (561 repos)
CREATE TABLE IF NOT EXISTS repositories (
  id BIGSERIAL PRIMARY KEY,
  repository_name TEXT NOT NULL,
  stars_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  issues_count INTEGER DEFAULT 0,
  pull_requests INTEGER DEFAULT 0,
  contributors INTEGER DEFAULT 0,
  language TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for repository_data.csv (large dataset)
CREATE TABLE IF NOT EXISTS repository_data (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  stars_count INTEGER DEFAULT 0,
  forks_count INTEGER DEFAULT 0,
  watchers INTEGER DEFAULT 0,
  pull_requests INTEGER DEFAULT 0,
  primary_language TEXT,
  languages_used TEXT[], -- Array of languages
  commit_count NUMERIC,
  created_at TIMESTAMPTZ,
  licence TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for fast queries
CREATE INDEX idx_repositories_stars ON repositories(stars_count DESC);
CREATE INDEX idx_repositories_language ON repositories(language);
CREATE INDEX idx_repositories_contributors ON repositories(contributors DESC);

CREATE INDEX idx_repo_data_stars ON repository_data(stars_count DESC);
CREATE INDEX idx_repo_data_language ON repository_data(primary_language);
CREATE INDEX idx_repo_data_commits ON repository_data(commit_count DESC);
CREATE INDEX idx_repo_data_created ON repository_data(created_at);
CREATE INDEX idx_repo_data_licence ON repository_data(licence);

-- Enable Row Level Security (required for Supabase)
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE repository_data ENABLE ROW LEVEL SECURITY;

-- Create policies (allow public read access for dashboard)
CREATE POLICY "Allow public read access to repositories"
  ON repositories FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to repository_data"
  ON repository_data FOR SELECT
  USING (true);

-- Create materialized view for language statistics
CREATE MATERIALIZED VIEW language_stats AS
SELECT 
  primary_language,
  COUNT(*) as repo_count,
  ROUND(AVG(stars_count)) as avg_stars,
  ROUND(AVG(forks_count)) as avg_forks,
  ROUND(AVG(commit_count)) as avg_commits,
  ROUND(AVG(pull_requests)) as avg_pull_requests,
  SUM(stars_count) as total_stars,
  MAX(stars_count) as max_stars,
  MIN(stars_count) as min_stars
FROM repository_data
WHERE primary_language IS NOT NULL
GROUP BY primary_language
ORDER BY avg_stars DESC;

-- Create view for top repositories
CREATE VIEW top_repositories AS
SELECT 
  name,
  stars_count,
  forks_count,
  primary_language,
  commit_count,
  created_at,
  EXTRACT(YEAR FROM created_at) as created_year
FROM repository_data
WHERE stars_count > 10000
ORDER BY stars_count DESC
LIMIT 100;

-- Create view for license analysis
CREATE VIEW licence_distribution AS
SELECT 
  licence,
  COUNT(*) as repo_count,
  ROUND(AVG(stars_count)) as avg_stars,
  ROUND(AVG(forks_count)) as avg_forks
FROM repository_data
WHERE licence IS NOT NULL
GROUP BY licence
ORDER BY repo_count DESC;

-- Create view for yearly trends
CREATE VIEW yearly_trends AS
SELECT 
  EXTRACT(YEAR FROM created_at) as year,
  COUNT(*) as repos_created,
  ROUND(AVG(stars_count)) as avg_stars,
  ROUND(AVG(commit_count)) as avg_commits
FROM repository_data
WHERE created_at IS NOT NULL
GROUP BY EXTRACT(YEAR FROM created_at)
ORDER BY year DESC;

-- Function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_language_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW language_stats;
END;
$$ LANGUAGE plpgsql;
