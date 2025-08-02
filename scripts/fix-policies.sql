-- Fix database policy conflicts
-- This script safely removes and recreates policies

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view public templates and own templates" ON templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON templates;
DROP POLICY IF EXISTS "Users can update own templates" ON templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON templates;

-- Ensure RLS is enabled
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Create policies for templates
-- Policy: Users can view public templates and their own templates
CREATE POLICY "Users can view public templates and own templates" ON templates
    FOR SELECT USING (
        is_public = true OR 
        auth.uid()::text = user_id
    );

-- Policy: Users can insert their own templates
CREATE POLICY "Users can insert own templates" ON templates
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own templates
CREATE POLICY "Users can update own templates" ON templates
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Policy: Users can delete their own templates
CREATE POLICY "Users can delete own templates" ON templates
    FOR DELETE USING (auth.uid()::text = user_id);

-- Grant necessary permissions
GRANT ALL ON templates TO authenticated;
GRANT SELECT ON templates TO anon;
