/**
 * API Route: Get Filtered Repositories
 * POST /api/repositories/filter
 * Body: { language, minStars, maxStars, licence, fromYear, toYear, sortBy, sortOrder, limit }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFilteredRepositories } from '@/lib/supabase-queries';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const data = await getFilteredRepositories({
      language: body.language,
      minStars: body.minStars,
      maxStars: body.maxStars,
      licence: body.licence,
      fromYear: body.fromYear,
      toYear: body.toYear,
      sortBy: body.sortBy || 'stars_count',
      sortOrder: body.sortOrder || 'desc',
      limit: body.limit || 100,
    });

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      filters: body,
    });
  } catch (error: any) {
    console.error('Error filtering repositories:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
