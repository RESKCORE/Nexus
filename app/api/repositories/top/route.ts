/**
 * API Route: Get Top Repositories
 * GET /api/repositories/top?limit=100
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTopRepositories } from '@/lib/supabase-queries';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');

    const data = await getTopRepositories(limit);

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error: any) {
    console.error('Error fetching top repositories:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
