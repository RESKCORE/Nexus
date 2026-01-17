/**
 * API Route: Get Dashboard Statistics
 * GET /api/stats
 */

import { NextResponse } from 'next/server';
import { getRepositoryStats, getLanguageStats, getYearlyTrends } from '@/lib/supabase-queries';

export async function GET() {
  try {
    const [stats, languages, trends] = await Promise.all([
      getRepositoryStats(),
      getLanguageStats(),
      getYearlyTrends(),
    ]);

    // Top 5 languages
    const topLanguages = languages.slice(0, 5);

    // Recent trends (last 5 years)
    const recentTrends = trends.slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        overview: stats,
        topLanguages,
        recentTrends,
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
