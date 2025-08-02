# Fix Database Policy Error

If you're getting the error:
```
ERROR: 42710: policy "Users can view public templates and own templates" for table "templates" already exists
```

This means the database policies already exist. Here are the solutions:

## Option 1: Quick Fix (Recommended)

Run the policy cleanup script in your Supabase SQL Editor:

```sql
-- Copy and paste this into Supabase SQL Editor:

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view public templates and own templates" ON templates;
DROP POLICY IF EXISTS "Users can insert own templates" ON templates;
DROP POLICY IF EXISTS "Users can update own templates" ON templates;
DROP POLICY IF EXISTS "Users can delete own templates" ON templates;

-- Ensure RLS is enabled
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
```

## Option 2: Complete Reset

If you want to start fresh, run the reset script:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the content from `scripts/reset-database.sql`
4. Run the script

## Option 3: Manual Fix

1. Go to Supabase Dashboard → Authentication → Policies
2. Find the "templates" table policies
3. Delete all existing policies
4. Run the setup script again

## Verification

After running the fix, verify that:

1. ✅ Templates table exists
2. ✅ RLS is enabled
3. ✅ Policies are created
4. ✅ Sample templates are inserted
5. ✅ Authentication works

## Test the Application

1. Register a new user
2. Sign in successfully
3. Browse templates
4. Create a new template
5. Access profile page

The application should work without any database errors.
