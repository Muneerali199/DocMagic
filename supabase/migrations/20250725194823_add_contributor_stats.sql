-- Add columns to the users table
ALTER TABLE users ADD COLUMN total_documents_generated INT DEFAULT 0;
ALTER TABLE users ADD COLUMN total_features_suggested INT DEFAULT 0;
ALTER TABLE users ADD COLUMN badges_earned JSONB DEFAULT '[]'::jsonb;
ALTER TABLE users ADD COLUMN is_new_contributor BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN last_activity_at TIMESTAMPTZ DEFAULT NOW();

-- Create a function to update is_new_contributor status
CREATE OR REPLACE FUNCTION update_contributor_status_on_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.total_documents_generated > 0 AND OLD.total_documents_generated = 0 THEN
    NEW.is_new_contributor = FALSE;
  END IF;
  NEW.last_activity_at = NOW(); -- Always update last activity on any update
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before updating a user
CREATE TRIGGER trg_update_contributor_status
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_contributor_status_on_activity();

-- You might also want to add indexes for performance if your user base grows large
-- CREATE INDEX idx_users_total_documents_generated ON users (total_documents_generated DESC);
-- CREATE INDEX idx_users_is_new_contributor ON users (is_new_contributor);