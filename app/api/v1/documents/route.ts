import { NextRequest, NextResponse, type NextResponse as NextResponseType } from 'next/server';
import { addDeprecationHeaders, convertV1DocumentToV2, type V1DocumentInput } from '@/lib/api-versioning';
import { POST as v2POST, GET as v2GET } from '@/app/api/documents/route';

export const dynamic = 'force-dynamic';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** v1 list documents — proxies to v2 and injects deprecation headers. */
export async function GET(request: NextRequest): Promise<NextResponseType> {
  const response = await v2GET(request) as NextResponseType;
  return addDeprecationHeaders(response);
}

/** v1 create document — validates required fields, converts legacy fields (name→title, type→documentType, data→content) then proxies to v2. */
export async function POST(request: NextRequest): Promise<NextResponseType> {
  let legacyBody: V1DocumentInput;
  try {
    legacyBody = await request.json() as V1DocumentInput;
  } catch {
    return addDeprecationHeaders(NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }));
  }

  if (!isNonEmptyString(legacyBody?.name)) {
    return addDeprecationHeaders(NextResponse.json({ error: 'name is required' }, { status: 400 }));
  }
  if (!isNonEmptyString(legacyBody?.type)) {
    return addDeprecationHeaders(NextResponse.json({ error: 'type is required' }, { status: 400 }));
  }

  const v2Body = convertV1DocumentToV2(legacyBody);

  // Rebuild the request with the converted body so v2POST receives its expected shape
  const v2Request = new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify(v2Body),
  });

  const response = await v2POST(v2Request) as NextResponseType;
  return addDeprecationHeaders(response);
}
