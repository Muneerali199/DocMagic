import { logger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { isPrivateUrl } from '@/lib/validate-fetch-url';

// Maximum proxied image size: 10 MB (OWASP A04 - Insecure Design)
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

// Allowed image MIME types (OWASP A08 - Data Integrity Failures)
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'image/avif', 'image/bmp', 'image/tiff',
];

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  // Validate URL format and protocol (OWASP A10 - SSRF)
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return new NextResponse('Invalid protocol', { status: 400 });
    }
  } catch {
    return new NextResponse('Invalid URL format', { status: 400 });
  }

  try {
    if (isPrivateUrl(url)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const response = await fetch(url, {
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return new NextResponse('Upstream fetch failed', { status: 502 });
    }

    // Validate Content-Type is an image (OWASP A08)
    const contentType = response.headers.get('Content-Type') || '';
    if (!ALLOWED_IMAGE_TYPES.some(type => contentType.startsWith(type))) {
      return new NextResponse('Response is not an image', { status: 400 });
    }

    // Check Content-Length header before downloading (OWASP A04)
    const contentLength = parseInt(response.headers.get('Content-Length') || '0', 10);
    if (contentLength > MAX_IMAGE_SIZE) {
      return new NextResponse('Image too large', { status: 413 });
    }

    // Stream body with size enforcement to prevent memory exhaustion
    // from chunked responses that omit or lie about Content-Length
    const reader = response.body?.getReader();
    if (!reader) {
      return new NextResponse('Empty response body', { status: 502 });
    }

    const chunks: Uint8Array[] = [];
    let totalSize = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalSize += value.byteLength;
      if (totalSize > MAX_IMAGE_SIZE) {
        reader.cancel();
        return new NextResponse('Image too large', { status: 413 });
      }
      chunks.push(value);
    }

    const blob = new Blob(chunks, { type: contentType });

    // Return with restricted headers — no wildcard CORS (OWASP A05)
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': blob.size.toString(),
        'Cache-Control': 'public, max-age=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    logger.error({ route: 'app/api/proxy-image/route.ts' }, 'Error proxying image:', error);
    return new NextResponse('Failed to fetch image', { status: 500 });
  }
}
