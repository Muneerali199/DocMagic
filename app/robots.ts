import type { MetadataRoute } from 'next';
import { privateRobotsPaths, siteUrl } from '@/lib/seo-routes';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [...privateRobotsPaths],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}

