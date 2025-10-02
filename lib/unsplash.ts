/**
 * Unsplash API integration for fetching high-quality images
 * Free tier: 50 requests per hour
 * Get your API key at: https://unsplash.com/developers
 */

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY || '';
const UNSPLASH_API_URL = 'https://api.unsplash.com';

export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
  };
  links: {
    download_location: string;
  };
}

/**
 * Search for images on Unsplash
 */
export async function searchImages(
  query: string,
  perPage: number = 1
): Promise<UnsplashImage[]> {
  // If no API key, return placeholder images
  if (!UNSPLASH_ACCESS_KEY) {
    console.warn('Unsplash API key not configured, using placeholders');
    return [{
      id: 'placeholder',
      urls: {
        raw: `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920`,
        full: `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1920`,
        regular: `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1080`,
        small: `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400`,
        thumb: `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=200`,
      },
      alt_description: query,
      description: `Professional image for ${query}`,
      user: {
        name: 'Unsplash',
        username: 'unsplash'
      },
      links: {
        download_location: ''
      }
    }];
  }

  try {
    const response = await fetch(
      `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
      {
        headers: {
          'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          'Accept-Version': 'v1'
        }
      }
    );

    if (!response.ok) {
      console.error('Unsplash API error:', response.statusText);
      return [];
    }

    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error fetching images from Unsplash:', error);
    return [];
  }
}

/**
 * Get a random image from Unsplash
 */
export async function getRandomImage(query?: string): Promise<UnsplashImage | null> {
  if (!UNSPLASH_ACCESS_KEY) {
    return null;
  }

  try {
    const url = query
      ? `${UNSPLASH_API_URL}/photos/random?query=${encodeURIComponent(query)}&orientation=landscape`
      : `${UNSPLASH_API_URL}/photos/random?orientation=landscape`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
        'Accept-Version': 'v1'
      }
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching random image from Unsplash:', error);
    return null;
  }
}

/**
 * Track download (required by Unsplash API guidelines)
 */
export async function trackDownload(downloadLocation: string): Promise<void> {
  if (!UNSPLASH_ACCESS_KEY || !downloadLocation) {
    return;
  }

  try {
    await fetch(downloadLocation, {
      headers: {
        'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`
      }
    });
  } catch (error) {
    console.error('Error tracking download:', error);
  }
}

/**
 * Get placeholder image URL for development
 */
export function getPlaceholderImage(width: number = 1200, height: number = 675, query: string = 'business'): string {
  return `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=${width}&h=${height}&fit=crop&q=80`;
}
