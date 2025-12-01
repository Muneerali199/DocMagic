import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');

    return new NextResponse(blob, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    return new NextResponse('Failed to fetch image', { status: 500 });
  }
}
