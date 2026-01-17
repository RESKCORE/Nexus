/**
 * Supabase Query Hooks
 * Reusable functions for common database queries
 */

import { supabase } from './supabase-client';
import type {
  Repository,
  RepositoryData,
  LanguageStat,
  YearlyTrend,
  LicenceDistribution,
} from './supabase-client';

/**
 * Get top repositories by stars
 */
export async function getTopRepositories(limit: number = 100) {
  const { data, error } = await supabase
    .from('repository_data')
    .select('*')
    .order('stars_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as RepositoryData[];
}

/**
 * Get language statistics
 */
export async function getLanguageStats() {
  const { data, error } = await supabase
    .from('language_stats')
    .select('*')
    .order('avg_stars', { ascending: false });

  if (error) throw error;
  return data as LanguageStat[];
}

/**
 * Get yearly trends
 */
export async function getYearlyTrends() {
  const { data, error } = await supabase
    .from('yearly_trends')
    .select('*')
    .order('year', { ascending: false });

  if (error) throw error;
  return data as YearlyTrend[];
}

/**
 * Get license distribution
 */
export async function getLicenseDistribution() {
  const { data, error } = await supabase
    .from('licence_distribution')
    .select('*')
    .limit(20);

  if (error) throw error;
  return data as LicenceDistribution[];
}

/**
 * Get repositories by language
 */
export async function getRepositoriesByLanguage(
  language: string,
  limit: number = 50
) {
  const { data, error } = await supabase
    .from('repository_data')
    .select('*')
    .eq('primary_language', language)
    .order('stars_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as RepositoryData[];
}

/**
 * Search repositories by name
 */
export async function searchRepositories(query: string, limit: number = 20) {
  const { data, error } = await supabase
    .from('repository_data')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('stars_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as RepositoryData[];
}

/**
 * Get repository statistics
 */
export async function getRepositoryStats() {
  // Total repositories
  const { count: totalRepos } = await supabase
    .from('repository_data')
    .select('*', { count: 'exact', head: true });

  // Total stars
  const { data: starsData } = await supabase
    .from('repository_data')
    .select('stars_count');
  const totalStars = starsData?.reduce((sum, r) => sum + r.stars_count, 0) || 0;

  // Total commits
  const { data: commitsData } = await supabase
    .from('repository_data')
    .select('commit_count');
  const totalCommits = commitsData?.reduce((sum, r) => sum + (r.commit_count || 0), 0) || 0;

  // Unique languages
  const { data: languagesData } = await supabase
    .from('repository_data')
    .select('primary_language')
    .not('primary_language', 'is', null);
  const uniqueLanguages = new Set(languagesData?.map(r => r.primary_language)).size;

  return {
    totalRepos: totalRepos || 0,
    totalStars,
    totalCommits,
    uniqueLanguages,
  };
}

/**
 * Get repositories with filters
 */
export async function getFilteredRepositories({
  language,
  minStars = 0,
  maxStars = Number.MAX_SAFE_INTEGER,
  licence,
  fromYear,
  toYear,
  sortBy = 'stars_count',
  sortOrder = 'desc',
  limit = 100,
}: {
  language?: string;
  minStars?: number;
  maxStars?: number;
  licence?: string;
  fromYear?: number;
  toYear?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}) {
  let query = supabase
    .from('repository_data')
    .select('*')
    .gte('stars_count', minStars)
    .lte('stars_count', maxStars);

  if (language) {
    query = query.eq('primary_language', language);
  }

  if (licence) {
    query = query.eq('licence', licence);
  }

  if (fromYear) {
    query = query.gte('created_at', `${fromYear}-01-01`);
  }

  if (toYear) {
    query = query.lte('created_at', `${toYear}-12-31`);
  }

  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).limit(limit);

  const { data, error } = await query;

  if (error) throw error;
  return data as RepositoryData[];
}

/**
 * Get correlation analysis
 */
export async function getCorrelationData() {
  const { data, error } = await supabase
    .from('repository_data')
    .select('stars_count, forks_count, commit_count, pull_requests, watchers')
    .not('commit_count', 'is', null)
    .limit(1000);

  if (error) throw error;
  return data;
}

/**
 * Get multi-language repositories
 */
export async function getMultiLanguageRepos(limit: number = 50) {
  const { data, error } = await supabase.rpc('get_multi_language_repos', {
    min_languages: 3,
    result_limit: limit,
  });

  if (error) {
    // Fallback if function doesn't exist
    const { data: fallbackData } = await supabase
      .from('repository_data')
      .select('*')
      .not('languages_used', 'is', null)
      .order('stars_count', { ascending: false })
      .limit(limit);
    
    return fallbackData?.filter(r => r.languages_used && r.languages_used.length >= 3) || [];
  }
  
  return data as RepositoryData[];
}
