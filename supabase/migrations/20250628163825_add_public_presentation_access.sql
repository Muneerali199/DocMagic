/*
  # Add public access policy for presentations

  1. Changes
    - Add policy to allow public read access to public presentations
    - This enables sharing functionality for presentations marked as public
*/

-- Allow public read access to public presentations
CREATE POLICY "Public can read public presentations"
  ON documents
  FOR SELECT
  TO anon, authenticated
  USING (
    type = 'presentation' 
    AND content->>'isPublic' = 'true'
  );