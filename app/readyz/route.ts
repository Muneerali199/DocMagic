export const dynamic = 'force-dynamic';

export async function GET() {
  // In a more complex scenario, this would check DB connections or external services
  return new Response(
    JSON.stringify({
      status: 'ready',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  );
}
