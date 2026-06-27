import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    {
      version: process.env.npm_package_version || 'unknown',
      environment: process.env.NODE_ENV || 'development',
      buildTime: process.env.BUILD_TIME || 'unknown',
      commitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    }
  );
}