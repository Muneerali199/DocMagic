/*
  # Add diagram support to documents table

  1. Changes
    - Update the type check constraint to include 'diagram'
    - This allows storing diagram documents alongside other document types
*/

-- Update the check constraint to include 'diagram' type
ALTER TABLE documents DROP CONSTRAINT IF EXISTS documents_type_check;
ALTER TABLE documents ADD CONSTRAINT documents_type_check 
  CHECK (type IN ('resume', 'presentation', 'letter', 'cv', 'diagram'));