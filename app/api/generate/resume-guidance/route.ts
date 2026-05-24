import { logger } from '@/lib/logger';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateResumeStepGuidance } from '@/lib/gemini';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { step, targetRole, existingData } = body;

    if (!step || !targetRole) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const guidance = await generateResumeStepGuidance(step, targetRole, existingData);
    return NextResponse.json(guidance);
  } catch (error) {
    logger.error({ route: 'app/api/generate/resume-guidance/route.ts' }, 'Error generating resume guidance:', error);
    return NextResponse.json(
      { error: 'Failed to generate guidance' },
      { status: 500 }
    );
  }
}
