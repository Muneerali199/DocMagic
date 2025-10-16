export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'Missing URL' },
        { status: 400 }
      );
    }

    // Validate URL format
    let validUrl: URL;
    try {
      validUrl = new URL(url);
      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid URL format. Please provide a valid HTTP/HTTPS URL.' },
        { status: 400 }
      );
    }

    // Fetch the URL content
    const response = await fetch(validUrl.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.statusText}` },
        { status: response.status }
      );
    }

    const html = await response.text();
    
    // Parse HTML and extract text content
    const $ = cheerio.load(html);
    
    // Remove script, style, and other non-content elements
    $('script, style, nav, header, footer, iframe, noscript').remove();
    
    // Extract title
    const title = $('title').text().trim() || 
                  $('h1').first().text().trim() || 
                  'Untitled';
    
    // Extract meta description
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || 
                       '';
    
    // Extract main content
    // Try to find main content areas first
    let mainContent = '';
    const contentSelectors = [
      'main',
      'article',
      '[role="main"]',
      '.content',
      '.main-content',
      '#content',
      '#main-content',
      '.post-content',
      '.entry-content',
      'body'
    ];
    
    for (const selector of contentSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        mainContent = element.text();
        if (mainContent.trim().length > 100) {
          break;
        }
      }
    }
    
    // Clean up the text
    let cleanedText = mainContent
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();
    
    // Extract headings for structure
    const headings: string[] = [];
    $('h1, h2, h3').each((_, element) => {
      const heading = $(element).text().trim();
      if (heading && heading.length > 0 && heading.length < 200) {
        headings.push(heading);
      }
    });
    
    // Limit text length to avoid token limits
    const maxLength = 8000;
    if (cleanedText.length > maxLength) {
      cleanedText = cleanedText.substring(0, maxLength) + '...';
    }
    
    // Check if we got meaningful content
    if (cleanedText.length < 50) {
      return NextResponse.json(
        { error: 'Could not extract meaningful content from the URL. The page might be JavaScript-rendered or protected.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      title,
      description,
      content: cleanedText,
      headings: headings.slice(0, 20), // Limit headings
      url: validUrl.toString(),
      wordCount: cleanedText.split(/\s+/).length
    });
    
  } catch (error: any) {
    console.error('Error fetching URL content:', error);
    
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timeout. The URL took too long to respond.' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch and extract content from URL. Please try a different URL.' },
      { status: 500 }
    );
  }
}
