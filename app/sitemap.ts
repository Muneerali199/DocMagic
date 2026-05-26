import type { MetadataRoute } from 'next';
import { publicSeoRoutes, siteUrl } from '@/lib/seo-routes';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return publicSeoRoutes.map((route) => ({
    url: new URL(route.path, siteUrl).toString(),
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}

