/**
 * Supabase Client for Server Components
 * Use this in Server Components and API Routes
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'X-Client-Info': 'nexus-observatory',
    },
  },
});

// Types for our database tables
export interface Repository {
  id: number;
  repository_name: string;
  stars_count: number;
  forks_count: number;
  issues_count: number;
  pull_requests: number;
  contributors: number;
  language: string | null;
  created_at: string;
  updated_at: string;
}

export interface RepositoryData {
  id: number;
  name: string;
  stars_count: number;
  forks_count: number;
  watchers: number;
  pull_requests: number;
  primary_language: string | null;
  languages_used: string[];
  commit_count: number;
  created_at: string | null;
  licence: string | null;
  updated_at: string;
}

export interface LanguageStat {
  primary_language: string;
  repo_count: number;
  avg_stars: number;
  avg_forks: number;
  avg_commits: number;
  avg_pull_requests: number;
  total_stars: number;
  max_stars: number;
  min_stars: number;
}

export interface YearlyTrend {
  year: number;
  repos_created: number;
  avg_stars: number;
  avg_commits: number;
}

export interface LicenceDistribution {
  licence: string;
  repo_count: number;
  avg_stars: number;
  avg_forks: number;
}
