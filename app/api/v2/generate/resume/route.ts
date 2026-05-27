// Define the configuration explicitly so Next.js build-time analyzer can see it
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Re-export the POST handler
export { POST } from '@/app/api/generate/resume/route';