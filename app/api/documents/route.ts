/**
 * app/api/documents/route.ts — demonstrates all new utilities
 * Fix #1 #2 #6 #9 #17 #20
 */
import { NextRequest, NextResponse } from 'next/server';
import { createRoute } from '@/lib/supabase/server';
import { apiHandler, AuthError } from '@/lib/api-handler';
import {
  safeParseBody,
  documentCreateSchema,
  paginationSchema,
  sanitizeInput,
} from '@/lib/validation';
import { logger } from '@/lib/logger';

export const POST = apiHandler(async (req: NextRequest) => {
  const requestId = req.headers.get('x-request-id') ?? crypto.randomUUID();
  const log = logger.withContext({ requestId, route: 'POST /api/documents' });

  const supabase = await createRoute();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new AuthError();

  const body = await safeParseBody(req, documentCreateSchema);
  const title = sanitizeInput(body.title, 200);

  const { data: doc, error: createError } = await supabase
    .from('documents')
    .insert({
      user_id: user.id,
      title,
      type: 'generated',
      document_type: body.documentType,
      content: body.content ?? {},
      metadata: {
        ...(body.metadata ?? {}),
        sections: body.sections ?? [],
        generated_at: new Date().toISOString(),
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (createError) {
    log.error('DB error', createError);
    throw new Error('Failed to create document');
  }

  log.info('Document created', { documentId: doc.id });
  return NextResponse.json(doc, { status: 201 });
});

export const GET = apiHandler(async (req: NextRequest) => {
  const requestId = req.headers.get('x-request-id') ?? crypto.randomUUID();
  const log = logger.withContext({ requestId, route: 'GET /api/documents' });

  const supabase = await createRoute();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new AuthError();

  const { searchParams } = new URL(req.url);
  const pg = paginationSchema.parse({
    limit: searchParams.get('limit'),
    offset: searchParams.get('offset'),
  });

  const { data: docs, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .range(pg.offset, pg.offset + pg.limit - 1);

  if (error) {
    log.error('DB error', error);
    throw new Error('Failed to fetch documents');
  }

  log.info('Documents fetched', { count: docs?.length ?? 0 });
  return NextResponse.json(docs);
});
