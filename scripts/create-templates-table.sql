-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('resume', 'presentation', 'letter', 'cv')),
  content JSONB NOT NULL,
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

-- Create RPC function for the setup script
CREATE OR REPLACE FUNCTION create_templates_table()
RETURNS void AS $$
BEGIN
  -- This function is just a placeholder for the setup script
  -- The actual table creation is handled above
  RETURN;
END;
$$ LANGUAGE plpgsql;
