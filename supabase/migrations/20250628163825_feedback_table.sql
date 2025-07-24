/*
  # Create feedback table for storing user feedback

  1. New Tables
    - `feedback`
      - `id` (uuid, primary key)
      - `rating` (integer) - 1-5 star rating
      - `category` (text) - content, formatting, accuracy, usability, features, other
      - `message` (text) - user feedback message
      - `email` (text, optional) - user email for follow-up
      - `name` (text, optional) - user name
      - `document_type` (text) - resume, letter, presentation
      - `document_id` (uuid, optional) - reference to specific document
      - `created_at` (timestamp)
      - `user_agent` (text, optional) - browser info
      - `ip_address` (text, optional) - user IP for analytics

  2. Security
    - Enable RLS on `feedback` table
    - Allow anonymous feedback submissions
    - Add policies for read/write operations
*/

CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category text CHECK (category IN ('content', 'formatting', 'accuracy', 'usability', 'features', 'other')),
  message text NOT NULL,
  email text,
  name text,
  document_type text NOT NULL CHECK (document_type IN ('resume', 'letter', 'presentation', 'cv')),
  document_id uuid,
  created_at timestamptz DEFAULT now(),
  user_agent text,
  ip_address text
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit feedback (anonymous feedback)
CREATE POLICY "Anyone can submit feedback"
  ON feedback
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow authenticated users to read their own feedback (if we add user_id later)
-- For now, allow public read access for analytics
CREATE POLICY "Public read access for feedback"
  ON feedback
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS feedback_document_type_idx ON feedback(document_type);
CREATE INDEX IF NOT EXISTS feedback_rating_idx ON feedback(rating);
CREATE INDEX IF NOT EXISTS feedback_category_idx ON feedback(category);
CREATE INDEX IF NOT EXISTS feedback_created_at_idx ON feedback(created_at DESC);

-- Add comment for documentation
COMMENT ON TABLE feedback IS 'Stores user feedback about generated documents';
COMMENT ON COLUMN feedback.rating IS '1-5 star rating from user';
COMMENT ON COLUMN feedback.category IS 'Category of feedback (content, formatting, etc.)';
COMMENT ON COLUMN feedback.document_type IS 'Type of document the feedback is about';
COMMENT ON COLUMN feedback.document_id IS 'Optional reference to specific document'; 