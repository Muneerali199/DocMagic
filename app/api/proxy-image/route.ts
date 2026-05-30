import { NextRequest, NextResponse } from 'next/server';
import { validateFetchUrl } from '@/lib/validate-fetch-url';
import { logger } from '@/lib/logger';

// Only allow actual image types through the proxy
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/avif',
]);

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  // ✅ Validate URL — blocks private IPs, bad protocols, oversized URLs
  const validationError = validateFetchUrl(url);
  if (validationError) {
    return new NextResponse(validationError, { status: 403 });
  }

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000), // ✅ 10 second timeout — prevents hanging
    });

    if (!response.ok) {
      return new NextResponse('Failed to fetch image', { status: response.status });
    }

    // ✅ Validate content-type — only serve actual images, not HTML/scripts
    const contentType = response.headers.get('content-type') || '';
    const mimeType = contentType.split(';')[0].trim().toLowerCase();
    if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
      return new NextResponse(
        'URL does not point to a valid image',
        { status: 400 }
      );
    }

    const blob = await response.blob();

    const headers = new Headers();
    headers.set('Content-Type', mimeType);
    headers.set('Cache-Control', 'public, max-age=3600');
    // ✅ Restrict CORS to your own app instead of wildcard *
    headers.set(
      'Access-Control-Allow-Origin',
      process.env.NEXT_PUBLIC_APP_URL || 'https://draftdeckai.com'
    );

    return new NextResponse(blob, { status: 200, headers });

  } catch (error: any) {
    logger.error({ route: 'proxy-image' }, 'Error proxying image:', error);

    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return new NextResponse('Request timed out', { status: 408 });
    }

    return new NextResponse('Failed to fetch image', { status: 500 });
  }
}