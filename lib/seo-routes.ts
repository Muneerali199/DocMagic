export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://draftdeckai.com').replace(/\/$/, '');

export const publicSeoRoutes = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/pricing', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/templates', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/documentation', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/resume', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/presentation', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/letter', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/cv', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
] as const;

export const privateRobotsPaths = [
  '/api/',
  '/auth/',
  '/dashboard/',
  '/diagnostic',
  '/documents/',
  '/editor',
  '/profile',
  '/resume-builder',
  '/resume-builder-simple',
  '/resume-editor',
  '/settings/',
  '/subscription/',
  '/test-ats',
] as const;

