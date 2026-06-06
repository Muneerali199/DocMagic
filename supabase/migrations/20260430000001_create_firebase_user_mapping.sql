-- Create Firebase user mapping table to link Firebase UIDs to Supabase users
CREATE TABLE IF NOT EXISTS public.firebase_user_mapping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  firebase_uid VARCHAR NOT NULL UNIQUE,
  supabase_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.firebase_user_mapping ENABLE ROW LEVEL SECURITY;

-- Create policies for firebase_user_mapping
CREATE POLICY "Users can view own firebase mapping"
  ON public.firebase_user_mapping
  FOR SELECT
  USING (auth.uid() = supabase_user_id);

CREATE POLICY "Users can insert own firebase mapping"
  ON public.firebase_user_mapping
  FOR INSERT
  WITH CHECK (auth.uid() = supabase_user_id);

CREATE POLICY "Users can update own firebase mapping"
  ON public.firebase_user_mapping
  FOR UPDATE
  USING (auth.uid() = supabase_user_id);

CREATE POLICY "Users can delete own firebase mapping"
  ON public.firebase_user_mapping
  FOR DELETE
  USING (auth.uid() = supabase_user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS firebase_user_mapping_firebase_uid_idx ON public.firebase_user_mapping(firebase_uid);
CREATE INDEX IF NOT EXISTS firebase_user_mapping_supabase_user_id_idx ON public.firebase_user_mapping(supabase_user_id);

-- Create updated_at trigger function if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_updated_at') THEN
        CREATE OR REPLACE FUNCTION public.handle_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = timezone('utc'::text, now());
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    END IF;
END $$;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS set_firebase_user_mapping_updated_at ON public.firebase_user_mapping;
CREATE TRIGGER set_firebase_user_mapping_updated_at
    BEFORE UPDATE ON public.firebase_user_mapping
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();