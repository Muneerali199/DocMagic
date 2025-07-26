/*
  # Add template functionality

  1. New Tables
    - `templates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text) - name of the template
      - `description` (text) - optional description
      - `type` (text) - resume, presentation, letter, cv
      - `content` (jsonb) - template data
      - `is_public` (boolean) - whether template is publicly available
      - `is_default` (boolean) - whether this is a system default template
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `template_shares`
      - `id` (uuid, primary key)
      - `template_id` (uuid, foreign key to templates)
      - `shared_by` (uuid, foreign key to users)
      - `shared_with` (uuid, foreign key to users)
      - `can_edit` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies for CRUD operations
*/

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('resume', 'presentation', 'letter', 'cv')),
  content jsonb NOT NULL,
  is_public boolean DEFAULT false,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create template_shares table
CREATE TABLE IF NOT EXISTS template_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES templates(id) ON DELETE CASCADE NOT NULL,
  shared_by uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  shared_with uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  can_edit boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(template_id, shared_with)
);

-- Enable RLS on new tables
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_shares ENABLE ROW LEVEL SECURITY;

-- Templates policies
CREATE POLICY "Users can read own templates"
  ON templates
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR is_public = true OR is_default = true);

CREATE POLICY "Users can insert own templates"
  ON templates
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own templates"
  ON templates
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own templates"
  ON templates
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND is_default = false);

-- Template shares policies
CREATE POLICY "Users can read shared templates"
  ON template_shares
  FOR SELECT
  TO authenticated
  USING (shared_with = auth.uid() OR shared_by = auth.uid());

CREATE POLICY "Users can share templates they own"
  ON template_shares
  FOR INSERT
  TO authenticated
  WITH CHECK (
    shared_by = auth.uid() AND 
    EXISTS (SELECT 1 FROM templates WHERE id = template_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can delete their template shares"
  ON template_shares
  FOR DELETE
  TO authenticated
  USING (shared_with = auth.uid() OR shared_by = auth.uid());

-- Add index for better performance
CREATE INDEX idx_templates_user_id ON templates(user_id);
CREATE INDEX idx_templates_type ON templates(type);
CREATE INDEX idx_templates_is_public ON templates(is_public) WHERE is_public = true;
CREATE INDEX idx_template_shares_shared_with ON template_shares(shared_with);

-- Add updated_at trigger for templates
CREATE OR REPLACE FUNCTION update_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_templates_updated_at
BEFORE UPDATE ON templates
FOR EACH ROW
EXECUTE FUNCTION update_templates_updated_at();
