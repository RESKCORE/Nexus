import { NextResponse } from 'next/server';
import { analyzeGlobalGitActivity } from '@/lib/github-analyzer';

export async function GET() {
  const result = await analyzeGlobalGitActivity();
  
  // Return analysis + a timestamp for validity
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    ...result
  });
}
