/**
 * API Route: Get Language Statistics
 * GET /api/languages/stats
 */

import { NextResponse } from 'next/server';
import { getLanguageStats } from '@/lib/supabase-queries';

export async function GET() {
  try {
    const data = await getLanguageStats();

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error: any) {
    console.error('Error fetching language stats:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
