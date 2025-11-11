import { NextRequest, NextResponse } from 'next/server';
import { JSDOM } from 'jsdom';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'Website URL is required' }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Fetch website content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 15000,
      maxRedirects: 5,
    });

    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    // Extract brand DNA
    const brandDNA = {
      brandName: extractBrandName(document, url),
      tagline: extractTagline(document),
      colors: extractColors(document),
      fonts: extractFonts(document),
      tone: extractTone(document),
      keywords: extractKeywords(document),
      description: extractDescription(document),
      logo: extractLogo(document, url),
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({ 
      success: true, 
      brandDNA 
    });

  } catch (error: any) {
    console.error('Error extracting brand DNA:', error);
    return NextResponse.json({ 
      error: 'Failed to extract brand information',
      details: error.message 
    }, { status: 500 });
  }
}

function extractBrandName(document: Document, url: string): string {
  // Try multiple sources
  const sources = [
    document.querySelector('meta[property="og:site_name"]')?.getAttribute('content'),
    document.querySelector('meta[name="application-name"]')?.getAttribute('content'),
    document.querySelector('h1')?.textContent?.trim(),
    document.querySelector('title')?.textContent?.split('|')[0]?.split('-')[0]?.trim(),
    new URL(url).hostname.replace('www.', '').split('.')[0],
  ];

  return sources.find(s => s && s.length > 0) || 'Unknown Brand';
}

function extractTagline(document: Document): string {
  const sources = [
    document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
    document.querySelector('meta[name="description"]')?.getAttribute('content'),
    document.querySelector('h2')?.textContent?.trim(),
    document.querySelector('.tagline')?.textContent?.trim(),
    document.querySelector('.subtitle')?.textContent?.trim(),
  ];

  const tagline = sources.find(s => s && s.length > 0 && s.length < 200) || '';
  return tagline.substring(0, 150);
}

function extractColors(document: Document): string[] {
  const colors = new Set<string>();
  
  // Get colors from CSS variables
  const styles = document.querySelectorAll('style');
  styles.forEach(style => {
    const content = style.textContent || '';
    const colorMatches = content.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\([^)]+\)|rgba\([^)]+\)/g);
    if (colorMatches) {
      colorMatches.forEach(color => colors.add(color));
    }
  });

  // Get colors from inline styles
  const elementsWithColor = document.querySelectorAll('[style*="color"]');
  elementsWithColor.forEach(el => {
    const style = el.getAttribute('style') || '';
    const colorMatches = style.match(/#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|rgb\([^)]+\)/g);
    if (colorMatches) {
      colorMatches.forEach(color => colors.add(color));
    }
  });

  // Return top 5 most common colors
  return Array.from(colors).slice(0, 5);
}

function extractFonts(document: Document): string[] {
  const fonts = new Set<string>();
  
  // Get fonts from CSS
  const styles = document.querySelectorAll('style');
  styles.forEach(style => {
    const content = style.textContent || '';
    const fontMatches = content.match(/font-family:\s*([^;]+)/gi);
    if (fontMatches) {
      fontMatches.forEach(match => {
        const font = match.replace(/font-family:\s*/i, '').trim();
        fonts.add(font);
      });
    }
  });

  // Get computed styles from key elements
  const keyElements = ['h1', 'h2', 'p', 'body'];
  keyElements.forEach(tag => {
    const el = document.querySelector(tag);
    if (el instanceof HTMLElement) {
      const style = el.getAttribute('style') || '';
      const fontMatch = style.match(/font-family:\s*([^;]+)/i);
      if (fontMatch) {
        fonts.add(fontMatch[1].trim());
      }
    }
  });

  return Array.from(fonts).slice(0, 3);
}

function extractTone(document: Document): string {
  const text = document.body?.textContent || '';
  const lowerText = text.toLowerCase();

  // Simple sentiment analysis based on keywords
  const formalKeywords = ['pursuant', 'hereby', 'professional', 'enterprise', 'corporate'];
  const casualKeywords = ['awesome', 'cool', 'hey', 'amazing', 'love'];
  const urgentKeywords = ['now', 'today', 'limited', 'hurry', 'exclusive'];
  const friendlyKeywords = ['we', 'you', 'together', 'community', 'join'];

  const formalScore = formalKeywords.filter(k => lowerText.includes(k)).length;
  const casualScore = casualKeywords.filter(k => lowerText.includes(k)).length;
  const urgentScore = urgentKeywords.filter(k => lowerText.includes(k)).length;
  const friendlyScore = friendlyKeywords.filter(k => lowerText.includes(k)).length;

  if (urgentScore > 2) return 'urgent';
  if (casualScore > formalScore) return 'casual';
  if (formalScore > casualScore) return 'formal';
  if (friendlyScore > 3) return 'friendly';
  
  return 'professional';
}

function extractKeywords(document: Document): string[] {
  const keywords = new Set<string>();

  // Get keywords from meta tags
  const metaKeywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content');
  if (metaKeywords) {
    metaKeywords.split(',').forEach(k => keywords.add(k.trim()));
  }

  // Get keywords from headings
  const headings = document.querySelectorAll('h1, h2, h3');
  headings.forEach(h => {
    const text = h.textContent?.trim();
    if (text && text.length < 50) {
      text.split(' ').forEach(word => {
        if (word.length > 4) keywords.add(word.toLowerCase());
      });
    }
  });

  return Array.from(keywords).slice(0, 10);
}

function extractDescription(document: Document): string {
  const sources = [
    document.querySelector('meta[property="og:description"]')?.getAttribute('content'),
    document.querySelector('meta[name="description"]')?.getAttribute('content'),
    document.querySelector('p')?.textContent?.trim(),
  ];

  return sources.find(s => s && s.length > 20) || '';
}

function extractLogo(document: Document, baseUrl: string): string {
  const sources = [
    document.querySelector('meta[property="og:image"]')?.getAttribute('content'),
    document.querySelector('link[rel="icon"]')?.getAttribute('href'),
    document.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href'),
    document.querySelector('img[alt*="logo" i]')?.getAttribute('src'),
    document.querySelector('.logo img')?.getAttribute('src'),
  ];

  const logoPath = sources.find(s => s);
  
  if (!logoPath) return '';

  // Convert relative URLs to absolute
  try {
    return new URL(logoPath, baseUrl).href;
  } catch {
    return logoPath;
  }
}
