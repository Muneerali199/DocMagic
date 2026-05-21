-- Phase 1: Database Schema (Supabase Migration)
-- File: supabase/migrations/20260515000000_add_document_analytics.sql

-- 1.1 document_views Table
CREATE TABLE IF NOT EXISTS document_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  viewer_ip_hash TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  duration_seconds INTEGER DEFAULT 0,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 document_engagement Table
CREATE TABLE IF NOT EXISTS document_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('download', 'share', 'copy', 'print', 'feedback', 'edit')),
  event_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 Indexes
CREATE INDEX IF NOT EXISTS idx_document_views_document_id ON document_views(document_id);
CREATE INDEX IF NOT EXISTS idx_document_views_viewer_id ON document_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_document_views_viewed_at ON document_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_document_engagement_document_id ON document_engagement(document_id);
CREATE INDEX IF NOT EXISTS idx_document_engagement_event_type ON document_engagement(event_type);

-- 1.4 RLS
ALTER TABLE document_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_engagement ENABLE ROW LEVEL SECURITY;

-- Policies for document_views
DROP POLICY IF EXISTS "Owners can view analytics for their documents" ON document_views;
CREATE POLICY "Owners can view analytics for their documents"
  ON document_views
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE id = document_views.document_id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can insert view events" ON document_views;
CREATE POLICY "Anyone can insert view events"
  ON document_views
  FOR INSERT
  WITH CHECK (true);

-- Policies for document_engagement
DROP POLICY IF EXISTS "Owners can view engagement for their documents" ON document_engagement;
CREATE POLICY "Owners can view engagement for their documents"
  ON document_engagement
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE id = document_engagement.document_id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anyone can insert engagement events" ON document_engagement;
CREATE POLICY "Anyone can insert engagement events"
  ON document_engagement
  FOR INSERT
  WITH CHECK (true);

-- Summary Function
CREATE OR REPLACE FUNCTION get_document_analytics_summary(doc_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  owner_id UUID;
BEGIN
  -- Authorization check: Ensure the caller owns the document
  SELECT user_id INTO owner_id FROM documents WHERE id = doc_id;
  IF owner_id IS NULL OR owner_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to access analytics for this document';
  END IF;

  SELECT jsonb_build_object(
    'total_views', (SELECT count(*) FROM document_views WHERE document_id = doc_id),
    'unique_views', (SELECT count(DISTINCT viewer_ip_hash) FROM document_views WHERE document_id = doc_id),
    'total_edits', (SELECT count(*) FROM document_versions WHERE document_id = doc_id),
    'total_downloads', (SELECT count(*) FROM document_engagement WHERE document_id = doc_id AND event_type = 'download'),
    'total_shares', (SELECT count(*) FROM document_engagement WHERE document_id = doc_id AND event_type = 'share'),
    'avg_view_duration', COALESCE((SELECT avg(duration_seconds) FROM document_views WHERE document_id = doc_id), 0)
  ) INTO result;
  
  RETURN result;
END;
$$;
