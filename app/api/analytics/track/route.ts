import { logger } from '@/lib/logger';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { analyticsService } from '@/lib/analytics-service';
import { createHash } from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { documentId, eventType, eventData } = body;

    if (!documentId || !eventType) {
      return NextResponse.json({ error: 'Missing documentId or eventType' }, { status: 400 });
    }

    // Get IP for hashing (for unique view tracking without PII)
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    const ipHash = createHash('sha256').update(ip).digest('hex');

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get user from token if available
    const authHeader = request.headers.get('Authorization');
    let userId = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      const authSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        }
      );
      const { data: { user } } = await authSupabase.auth.getUser();
      userId = user?.id || null;
    }

    if (eventType === 'view') {
      const referrer = request.headers.get('referer');
      const userAgent = request.headers.get('user-agent');
      const { data, error } = await analyticsService.trackView(
        supabase,
        documentId,
        userId,
        ipHash,
        referrer || undefined,
        userAgent || undefined
      );
      if (error) throw error;
      return NextResponse.json({ success: true, viewId: data?.id });
    } else if (eventType === 'duration') {
      const { viewId, duration } = body;
      if (!viewId) return NextResponse.json({ error: 'Missing viewId' }, { status: 400 });
      
      // Validate duration (must be a positive number and not unreasonably large)
      const validDuration = Number(duration);
      if (isNaN(validDuration) || validDuration < 0 || validDuration > 86400) { // Max 24 hours
        return NextResponse.json({ error: 'Invalid duration' }, { status: 400 });
      }
      
      const { error } = await analyticsService.updateViewDuration(supabase, viewId, validDuration);
      if (error) throw error;
      return NextResponse.json({ success: true });
    } else {
      const { error } = await analyticsService.trackEngagement(
        supabase,
        documentId,
        userId,
        eventType,
        eventData
      );
      if (error) throw error;
      return NextResponse.json({ success: true });
    }
  } catch (error: any) {
    logger.error({ route: 'app/api/analytics/track/route.ts' }, 'Error in analytics track API:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
