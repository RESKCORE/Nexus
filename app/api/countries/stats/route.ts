/**
 * API Route: Get Country-Based Contribution Statistics
 * GET /api/countries/stats
 * 
 * Maps programming languages to probable countries to create
 * geographic distribution visualization from repository data
 */

import { NextResponse } from 'next/server';
import { getLanguageStats, getRepositoryStats } from '@/lib/supabase-queries';

// Language -> Country probability mapping
// Based on industry patterns and developer demographics
const LANGUAGE_TO_COUNTRY_MAP: Record<string, Array<{ code: string; weight: number }>> = {
  JavaScript: [
    { code: 'US', weight: 40 },
    { code: 'IN', weight: 15 },
    { code: 'GB', weight: 10 },
    { code: 'DE', weight: 10 },
    { code: 'BR', weight: 8 },
    { code: 'CA', weight: 7 },
    { code: 'FR', weight: 5 },
    { code: 'AU', weight: 5 },
  ],
  TypeScript: [
    { code: 'US', weight: 45 },
    { code: 'GB', weight: 15 },
    { code: 'DE', weight: 12 },
    { code: 'IN', weight: 10 },
    { code: 'CA', weight: 8 },
    { code: 'SE', weight: 5 },
    { code: 'NL', weight: 5 },
  ],
  Python: [
    { code: 'US', weight: 35 },
    { code: 'IN', weight: 20 },
    { code: 'CN', weight: 12 },
    { code: 'DE', weight: 10 },
    { code: 'GB', weight: 8 },
    { code: 'FR', weight: 7 },
    { code: 'BR', weight: 8 },
  ],
  Java: [
    { code: 'IN', weight: 30 },
    { code: 'US', weight: 25 },
    { code: 'CN', weight: 15 },
    { code: 'BR', weight: 10 },
    { code: 'DE', weight: 8 },
    { code: 'GB', weight: 7 },
    { code: 'JP', weight: 5 },
  ],
  Go: [
    { code: 'US', weight: 50 },
    { code: 'CN', weight: 20 },
    { code: 'DE', weight: 10 },
    { code: 'GB', weight: 8 },
    { code: 'SG', weight: 6 },
    { code: 'CA', weight: 6 },
  ],
  Rust: [
    { code: 'US', weight: 35 },
    { code: 'DE', weight: 25 },
    { code: 'GB', weight: 15 },
    { code: 'FR', weight: 10 },
    { code: 'SE', weight: 8 },
    { code: 'CA', weight: 7 },
  ],
  PHP: [
    { code: 'US', weight: 25 },
    { code: 'DE', weight: 20 },
    { code: 'FR', weight: 15 },
    { code: 'IN', weight: 12 },
    { code: 'BR', weight: 10 },
    { code: 'GB', weight: 8 },
    { code: 'PL', weight: 5 },
    { code: 'NL', weight: 5 },
  ],
  Ruby: [
    { code: 'US', weight: 40 },
    { code: 'JP', weight: 25 },
    { code: 'GB', weight: 12 },
    { code: 'DE', weight: 8 },
    { code: 'BR', weight: 8 },
    { code: 'CA', weight: 7 },
  ],
  'C++': [
    { code: 'US', weight: 30 },
    { code: 'CN', weight: 25 },
    { code: 'DE', weight: 15 },
    { code: 'RU', weight: 10 },
    { code: 'IN', weight: 10 },
    { code: 'JP', weight: 5 },
    { code: 'KR', weight: 5 },
  ],
  C: [
    { code: 'US', weight: 35 },
    { code: 'CN', weight: 20 },
    { code: 'IN', weight: 15 },
    { code: 'DE', weight: 10 },
    { code: 'RU', weight: 10 },
    { code: 'JP', weight: 5 },
    { code: 'KR', weight: 5 },
  ],
  'C#': [
    { code: 'US', weight: 45 },
    { code: 'GB', weight: 15 },
    { code: 'DE', weight: 12 },
    { code: 'IN', weight: 10 },
    { code: 'BR', weight: 8 },
    { code: 'CA', weight: 5 },
    { code: 'PL', weight: 5 },
  ],
  Swift: [
    { code: 'US', weight: 60 },
    { code: 'GB', weight: 15 },
    { code: 'CA', weight: 10 },
    { code: 'AU', weight: 5 },
    { code: 'DE', weight: 5 },
    { code: 'JP', weight: 5 },
  ],
  Kotlin: [
    { code: 'US', weight: 35 },
    { code: 'IN', weight: 25 },
    { code: 'DE', weight: 12 },
    { code: 'GB', weight: 10 },
    { code: 'BR', weight: 8 },
    { code: 'RU', weight: 5 },
    { code: 'PL', weight: 5 },
  ],
};

// Default distribution for unlisted languages
const DEFAULT_DISTRIBUTION = [
  { code: 'US', weight: 40 },
  { code: 'IN', weight: 12 },
  { code: 'GB', weight: 10 },
  { code: 'DE', weight: 10 },
  { code: 'BR', weight: 6 },
  { code: 'CN', weight: 5 },
  { code: 'FR', weight: 5 },
  { code: 'CA', weight: 4 },
  { code: 'JP', weight: 4 },
  { code: 'AU', weight: 2 },
  { code: 'SG', weight: 2 },
];

export async function GET() {
  try {
    const [languageStats, overviewStats] = await Promise.all([
      getLanguageStats(),
      getRepositoryStats(),
    ]);

    // Aggregate contributions by country using language proxy
    const countryContributions: Record<string, {
      totalStars: number;
      totalRepos: number;
      totalCommits: number;
      totalContributions: number;
    }> = {};

    // Process each language and distribute to countries
    for (const langStat of languageStats) {
      const distribution = LANGUAGE_TO_COUNTRY_MAP[langStat.primary_language] || DEFAULT_DISTRIBUTION;
      const totalWeight = distribution.reduce((sum, d) => sum + d.weight, 0);

      for (const { code, weight } of distribution) {
        const proportion = weight / totalWeight;

        if (!countryContributions[code]) {
          countryContributions[code] = {
            totalStars: 0,
            totalRepos: 0,
            totalCommits: 0,
            totalContributions: 0,
          };
        }

        // Distribute language stats proportionally
        const starsContribution = Math.round((langStat.total_stars || 0) * proportion);
        const reposContribution = Math.round(langStat.repo_count * proportion);
        const commitsContribution = Math.round((langStat.avg_commits || 0) * reposContribution);

        countryContributions[code].totalStars += starsContribution;
        countryContributions[code].totalRepos += reposContribution;
        countryContributions[code].totalCommits += commitsContribution;
        countryContributions[code].totalContributions += starsContribution + commitsContribution;
      }
    }

    // Sort countries by total contributions
    const sortedCountries = Object.entries(countryContributions)
      .map(([code, stats]) => ({
        code,
        ...stats,
      }))
      .sort((a, b) => b.totalContributions - a.totalContributions);

    // Calculate total global contributions
    const totalGlobalContributions = overviewStats.totalStars + overviewStats.totalCommits;

    // Count unique regions (approximated by number of countries with significant contributions)
    const activeRegions = sortedCountries.filter(c => c.totalContributions > 100000).length;

    return NextResponse.json({
      success: true,
      data: {
        countries: sortedCountries,
        topCountries: sortedCountries.slice(0, 8),
        totalGlobalContributions,
        activeRegions,
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error fetching country statistics:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
