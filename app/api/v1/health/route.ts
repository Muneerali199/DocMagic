import { type NextResponse } from 'next/server';
import { addDeprecationHeaders } from '@/lib/api-versioning';
import { GET as v2GET } from '@/app/api/health/route';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const response = await v2GET() as NextResponse;
  return addDeprecationHeaders(response);
}
