/*
  # Add Analytics Tables for Document Analytics Dashboard

  1. New Tables
    - document_analytics: Track document usage and engagement metrics
    - user_sessions: Track user session data for analytics
    - document_views: Track individual document views and interactions

  2. Changes
    - Add analytics tracking capabilities
    - Enable comprehensive document usage statistics
    - Support engagement metrics and user behavior analysis
*/

-- Document Analytics Table
CREATE TABLE document_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'created', 'viewed', 'edited', 'shared', 'downloaded', 'exported'
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Sessions Table  
CREATE TABLE user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  page_views INTEGER DEFAULT 0,
  documents_created INTEGER DEFAULT 0,
  documents_edited INTEGER DEFAULT 0,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Views Table (for detailed view tracking)
CREATE TABLE document_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for anonymous views
  view_duration INTEGER DEFAULT 0, -- in seconds
  is_owner BOOLEAN DEFAULT FALSE,
  is_anonymous BOOLEAN DEFAULT FALSE,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Metrics Table
CREATE TABLE performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  generation_time INTEGER, -- AI generation time in milliseconds
  export_time INTEGER, -- Export/download time in milliseconds
  template_used TEXT,
  content_length INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_document_analytics_document_id ON document_analytics(document_id);
CREATE INDEX idx_document_analytics_user_id ON document_analytics(user_id);
CREATE INDEX idx_document_analytics_event_type ON document_analytics(event_type);
CREATE INDEX idx_document_analytics_created_at ON document_analytics(created_at);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_created_at ON user_sessions(created_at);

CREATE INDEX idx_document_views_document_id ON document_views(document_id);
CREATE INDEX idx_document_views_viewer_id ON document_views(viewer_id);
CREATE INDEX idx_document_views_created_at ON document_views(created_at);

CREATE INDEX idx_performance_metrics_document_id ON performance_metrics(document_id);
CREATE INDEX idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX idx_performance_metrics_created_at ON performance_metrics(created_at);

-- RLS Policies
ALTER TABLE document_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Users can only see their own analytics data
CREATE POLICY "Users can view their own analytics" ON document_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics" ON document_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own sessions" ON user_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Document views - owners can see all views, others can only insert
CREATE POLICY "Document owners can view all views" ON document_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM documents 
      WHERE documents.id = document_views.document_id 
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can record document views" ON document_views
  FOR INSERT WITH CHECK (true);

-- Performance metrics
CREATE POLICY "Users can view their own performance metrics" ON performance_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own performance metrics" ON performance_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);
