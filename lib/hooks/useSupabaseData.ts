'use client';

import { useState, useEffect } from 'react';

export interface OverviewStats {
  totalRepos: number;
  totalStars: number;
  totalCommits: number;
  uniqueLanguages: number;
}

export interface TopLanguage {
  primary_language: string;
  repo_count: number;
  total_stars: number;
  avg_stars: number;
  avg_forks: number;
}

export interface YearlyTrend {
  year: number;
  repos_created: number;
  avg_stars: number;
  avg_commits: number;
}

export interface Repository {
  id: number;
  name: string;
  stars_count: number;
  forks_count: number;
  primary_language: string | null;
  commit_count: number;
  pull_requests: number;
  contributors: number;
  created_at: string | null;
  licence: string | null;
}

export interface CountryStats {
  code: string;
  totalStars: number;
  totalRepos: number;
  totalCommits: number;
  totalContributions: number;
}

export interface DashboardData {
  overview: OverviewStats | null;
  topLanguages: TopLanguage[];
  allLanguages: TopLanguage[];
  recentTrends: YearlyTrend[];
  topRepos: Repository[];
  countryStats: CountryStats[];
  topCountries: CountryStats[];
  totalContributions: number;
  activeRegions: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useSupabaseData(): DashboardData {
  const [data, setData] = useState<DashboardData>({
    overview: null,
    topLanguages: [],
    allLanguages: [],
    recentTrends: [],
    topRepos: [],
    countryStats: [],
    topCountries: [],
    totalContributions: 0,
    activeRegions: 0,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all data in parallel
        const [statsRes, reposRes, languagesRes, countriesRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/repositories/top?limit=50'),
          fetch('/api/languages/stats'),
          fetch('/api/countries/stats'),
        ]);

        const [statsData, reposData, languagesData, countriesData] = await Promise.all([
          statsRes.json().catch(() => ({ success: false, data: {} })),
          reposRes.json().catch(() => ({ data: [] })),
          languagesRes.json().catch(() => ({ data: [] })),
          countriesRes.json().catch(() => ({ success: false })),
        ]);

        setData({
          overview: statsData?.data?.overview || null,
          topLanguages: statsData?.data?.topLanguages || [],
          allLanguages: languagesData?.data || [],
          recentTrends: statsData?.data?.recentTrends || [],
          topRepos: reposData?.data || [],
          countryStats: countriesData?.success ? countriesData.data.countries : [],
          topCountries: countriesData?.success ? countriesData.data.topCountries : [],
          totalContributions: countriesData?.success ? countriesData.data.totalGlobalContributions : 0,
          activeRegions: countriesData?.success ? countriesData.data.activeRegions : 0,
          loading: false,
          error: statsData?.success ? null : (statsData?.error || 'Partial data loaded'),
          lastUpdated: new Date(),
        });
      } catch (error: any) {
        console.error('Error fetching Supabase data:', error);
        setData(prev => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
    }

    fetchData();

    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return data;
}

// Computed stats from real data
export function useComputedStats() {
  const { topRepos, allLanguages, overview, loading } = useSupabaseData();

  // Calculate real metrics from database
  const totalForks = topRepos.reduce((sum, r) => sum + (r.forks_count || 0), 0);
  const totalPRs = topRepos.reduce((sum, r) => sum + (r.pull_requests || 0), 0);
  const totalContributors = topRepos.reduce((sum, r) => sum + (r.contributors || 0), 0);

  // Average stats
  const avgStarsPerRepo = topRepos.length > 0
    ? Math.round(topRepos.reduce((sum, r) => sum + r.stars_count, 0) / topRepos.length)
    : 0;

  // Language distribution
  const languagesByRepoCount = [...allLanguages].sort((a, b) => b.repo_count - a.repo_count);
  const languagesByStars = [...allLanguages].sort((a, b) => b.total_stars - a.total_stars);

  // License breakdown from repos
  const licenseStats = topRepos.reduce((acc, r) => {
    const license = r.licence || 'Unknown';
    acc[license] = (acc[license] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topLicenses = Object.entries(licenseStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count, percentage: Math.round((count / topRepos.length) * 100) }));

  return {
    overview,
    totalForks,
    totalPRs,
    totalContributors,
    avgStarsPerRepo,
    languagesByRepoCount,
    languagesByStars,
    topLicenses,
    loading,
  };
}
