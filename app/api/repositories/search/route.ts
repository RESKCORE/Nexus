/**
 * API Route: Search Repositories
 * GET /api/repositories/search?q=react&limit=20
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchRepositories } from '@/lib/supabase-queries';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const data = await searchRepositories(query, limit);

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      query,
    });
  } catch (error: any) {
    console.error('Error searching repositories:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
