-- Reset database to clean state
-- Run this if you encounter policy conflicts

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view public templates and own templates" ON templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON templates;
DROP POLICY IF EXISTS "Users can update own templates" ON templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON templates;

-- Drop and recreate the templates table
DROP TABLE IF EXISTS templates CASCADE;

-- Recreate templates table
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('resume', 'cv', 'letter', 'presentation', 'diagram')),
  content JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Enhanced metadata columns
  tags TEXT[] DEFAULT '{}',
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  usage_count INTEGER DEFAULT 0,
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  preview_image TEXT,
  color_scheme TEXT,
  industry TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_templates_type ON templates(type);
CREATE INDEX IF NOT EXISTS idx_templates_is_public ON templates(is_public);
CREATE INDEX IF NOT EXISTS idx_templates_is_default ON templates(is_default);
CREATE INDEX IF NOT EXISTS idx_templates_created_at ON templates(created_at);
CREATE INDEX IF NOT EXISTS idx_templates_tags ON templates USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_templates_difficulty_level ON templates(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_templates_rating ON templates(rating);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_templates_updated_at ON templates;
CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Create policies for templates
CREATE POLICY "Users can view public templates and own templates" ON templates
    FOR SELECT USING (
        is_public = true OR 
        auth.uid()::text = user_id
    );

CREATE POLICY "Users can insert own templates" ON templates
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own templates" ON templates
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own templates" ON templates
    FOR DELETE USING (auth.uid()::text = user_id);

-- Grant necessary permissions
GRANT ALL ON templates TO authenticated;
GRANT SELECT ON templates TO anon;

-- Insert sample templates
INSERT INTO templates (id, user_id, title, description, type, content, is_public, is_default, created_at, updated_at, tags, difficulty_level, usage_count, rating, preview_image, color_scheme, industry) VALUES
('1', 'system', 'Professional Resume Template', 'A clean and modern resume template perfect for professionals', 'resume', '{"personalInfo":{"name":"","email":"","phone":"","location":"","summary":""},"sections":[{"id":"experience","title":"Work Experience","items":[]},{"id":"education","title":"Education","items":[]},{"id":"skills","title":"Skills","items":[]}]}', true, true, NOW(), NOW(), ARRAY['professional', 'modern', 'tech'], 'beginner', 0, 4.8, '/api/templates/1/preview', 'blue', 'technology'),

('2', 'system', 'Creative Resume Template', 'A colorful and creative resume template for designers', 'resume', '{"personalInfo":{"name":"","email":"","phone":"","location":"","summary":""},"sections":[{"id":"experience","title":"Work Experience","items":[]},{"id":"education","title":"Education","items":[]},{"id":"skills","title":"Skills","items":[]},{"id":"portfolio","title":"Portfolio","items":[]}]}', true, true, NOW(), NOW(), ARRAY['creative', 'colorful', 'design'], 'intermediate', 0, 4.6, '/api/templates/2/preview', 'purple', 'design'),

('3', 'system', 'Business Presentation Template', 'Professional presentation template for business meetings', 'presentation', '{"title":"Business Presentation","slides":[{"id":"1","type":"title","content":{"title":"Business Presentation","subtitle":"Professional Template"}},{"id":"2","type":"content","content":{"title":"Agenda","bullets":["Introduction","Analysis","Strategy","Conclusion"]}}]}', true, true, NOW(), NOW(), ARRAY['business', 'professional', 'corporate'], 'beginner', 0, 4.7, '/api/templates/3/preview', 'blue', 'business'),

('4', 'system', 'Cover Letter Template', 'Professional cover letter template for job applications', 'letter', '{"recipient":{"name":"Hiring Manager","company":"Company Name","address":""},"content":{"greeting":"Dear Hiring Manager,","body":"I am writing to express my interest in the position...","closing":"Sincerely,","signature":"Your Name"}}', true, true, NOW(), NOW(), ARRAY['cover-letter', 'job-application', 'professional'], 'beginner', 0, 4.5, '/api/templates/4/preview', 'green', 'general'),

('5', 'system', 'Academic CV Template', 'Comprehensive CV template for academic professionals', 'cv', '{"personalInfo":{"name":"","email":"","phone":"","location":"","summary":""},"sections":[{"id":"education","title":"Education","items":[]},{"id":"research","title":"Research Experience","items":[]},{"id":"publications","title":"Publications","items":[]},{"id":"grants","title":"Grants & Awards","items":[]}]}', true, true, NOW(), NOW(), ARRAY['academic', 'research', 'university'], 'advanced', 0, 4.9, '/api/templates/5/preview', 'navy', 'academia')

ON CONFLICT (id) DO NOTHING;
