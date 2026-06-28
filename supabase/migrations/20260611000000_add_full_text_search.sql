-- Enable the pg_trgm extension for typo-tolerant matching and trigram indices
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Add fts columns to searchable tables
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS fts TSVECTOR 
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content::text, ''))) STORED;

ALTER TABLE templates 
  ADD COLUMN IF NOT EXISTS fts TSVECTOR 
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(content::text, ''))) STORED;

ALTER TABLE resumes 
  ADD COLUMN IF NOT EXISTS fts TSVECTOR 
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(personal_info::text, '') || ' ' || coalesce(content::text, ''))) STORED;

-- 2. Create GIN indices on the fts columns for full-text search
CREATE INDEX IF NOT EXISTS documents_fts_idx ON documents USING GIN (fts);
CREATE INDEX IF NOT EXISTS templates_fts_idx ON templates USING GIN (fts);
CREATE INDEX IF NOT EXISTS resumes_fts_idx ON resumes USING GIN (fts);

-- 3. Create trigram indices on titles for typo-tolerant LIKE/ILIKE searches
CREATE INDEX IF NOT EXISTS documents_title_trgm_idx ON documents USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS templates_title_trgm_idx ON templates USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS resumes_title_trgm_idx ON resumes USING GIN (title gin_trgm_ops);

-- 4. Create an RPC function to perform unified searching with pagination
CREATE OR REPLACE FUNCTION search_user_content(
  p_user_id UUID,
  p_query TEXT,
  p_category TEXT DEFAULT NULL,
  p_limit INT DEFAULT 10,
  p_offset INT DEFAULT 0
) RETURNS TABLE (
  id UUID,
  title TEXT,
  content TEXT,
  category TEXT,
  quality_score REAL,
  rank REAL,
  created_at TIMESTAMPTZ,
  total_count BIGINT
) LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN QUERY
  WITH combined AS (
    SELECT 
      d.id, 
      d.title, 
      d.content::text as content_text, 
      CASE WHEN d.type IN ('resume', 'cv') THEN 'resume'
           WHEN d.type = 'presentation' THEN 'presentation'
           WHEN d.type = 'letter' THEN 'letter'
           ELSE 'resume' END as category,
      COALESCE((d.content->>'atsScore')::real, 80.0) as quality_score,
      d.created_at,
      ts_rank(d.fts, plainto_tsquery('english', p_query)) as rank
    FROM documents d
    WHERE d.user_id = p_user_id
      AND (p_category IS NULL OR p_category != 'template')
      AND (p_category IS NULL OR 
           (p_category = 'resume' AND d.type IN ('resume', 'cv')) OR 
           (p_category != 'resume' AND d.type = p_category))
      AND (p_query = '' OR d.fts @@ plainto_tsquery('english', p_query) OR d.title ILIKE '%' || p_query || '%')
    
    UNION ALL
    
    SELECT 
      t.id, 
      t.title, 
      coalesce(t.description, '') || ' ' || t.content::text as content_text, 
      'template' as category,
      85.0 as quality_score,
      t.created_at,
      ts_rank(t.fts, plainto_tsquery('english', p_query)) as rank
    FROM templates t
    WHERE t.user_id = p_user_id
      AND (p_category IS NULL OR p_category = 'template')
      AND (p_query = '' OR t.fts @@ plainto_tsquery('english', p_query) OR t.title ILIKE '%' || p_query || '%')

    UNION ALL

    SELECT
      r.id, 
      r.title, 
      coalesce(r.personal_info::text, '') || ' ' || r.content::text as content_text,
      'resume' as category,
      80.0 as quality_score,
      r.created_at,
      ts_rank(r.fts, plainto_tsquery('english', p_query)) as rank
    FROM resumes r
    WHERE r.user_id = p_user_id
      AND (p_category IS NULL OR p_category = 'resume' OR p_category != 'template')
      AND (p_query = '' OR r.fts @@ plainto_tsquery('english', p_query) OR r.title ILIKE '%' || p_query || '%')
  )
  SELECT 
    c.id, c.title, c.content_text, c.category, c.quality_score, c.rank, c.created_at,
    count(*) OVER() as total_count
  FROM combined c
  ORDER BY 
    CASE WHEN p_query = '' THEN 1 ELSE c.rank END DESC,
    c.title ASC
  LIMIT p_limit OFFSET p_offset;
END;
$$;
