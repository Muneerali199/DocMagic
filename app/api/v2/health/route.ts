// v2 canonical URL for /api/health — re-exports the current handler unchanged.
// Clients that pin to /api/v2/health are future-proof when v3 is introduced.
export { GET } from '@/app/api/health/route';
