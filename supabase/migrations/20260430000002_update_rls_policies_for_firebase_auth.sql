-- Update RLS policies to work with Firebase authentication via user mapping
-- This migration shows the pattern for updating existing policies

-- Helper function to get supabase user id from firebase uid
CREATE OR REPLACE FUNCTION public.get_supabase_user_id_from_firebase_uid()
RETURNS uuid AS $$
DECLARE
    mapping_record RECORD;
BEGIN
    SELECT supabase_user_id INTO mapping_record
    FROM firebase_user_mapping
    WHERE firebase_uid = auth.uid()::text
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    RETURN mapping_record.supabase_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update documents table policies
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own documents" ON public.documents;
CREATE POLICY "Users can view own documents"
  ON public.documents
  FOR SELECT
  USING (public.get_supabase_user_id_from_firebase_uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own documents" ON public.documents;
CREATE POLICY "Users can insert own documents"
  ON public.documents
  FOR INSERT
  WITH CHECK (public.get_supabase_user_id_from_firebase_uid() = user_id);

DROP POLICY IF EXISTS "Users can update own documents" ON public.documents;
CREATE POLICY "Users can update own documents"
  ON public.documents
  FOR UPDATE
  USING (public.get_supabase_user_id_from_firebase_uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own documents" ON public.documents;
CREATE POLICY "Users can delete own documents"
  ON public.documents
  FOR DELETE
  USING (public.get_supabase_user_id_from_firebase_uid() = user_id);

-- Update user_credits table policies
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_credits;
CREATE POLICY "Users can view their own credits"
  ON public.user_credits
  FOR SELECT
  USING (public.get_supabase_user_id_from_firebase_uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own credits" ON public.user_credits;
CREATE POLICY "Users can insert their own credits"
  ON public.user_credits
  FOR INSERT
  WITH CHECK (public.get_supabase_user_id_from_firebase_uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;
CREATE POLICY "Users can update their own credits"
  ON public.user_credits
  FOR UPDATE
  USING (public.get_supabase_user_id_from_firebase_uid() = user_id);

-- Update credit_usage_log table policies
ALTER TABLE public.credit_usage_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own credit usage" ON public.credit_usage_log;
CREATE POLICY "Users can view their own credit usage"
  ON public.credit_usage_log
  FOR SELECT
  USING (public.get_supabase_user_id_from_firebase_uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own credit usage" ON public.credit_usage_log;
CREATE POLICY "Users can insert their own credit usage"
  ON public.credit_usage_log
  FOR INSERT
  WITH CHECK (public.get_supabase_user_id_from_firebase_uid() = user_id);

-- Update diagrams table policies
ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own diagrams" ON public.diagrams;
CREATE POLICY "Users can view their own diagrams"
  ON public.diagrams
  FOR SELECT
  USING (public.get_supabase_user_id_from_firebase_uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own diagrams" ON public.diagrams;
CREATE POLICY "Users can insert their own diagrams"
  ON public.diagrams
  FOR INSERT
  WITH CHECK (public.get_supabase_user_id_from_firebase_uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own diagrams" ON public.diagrams;
CREATE POLICY "Users can update their own diagrams"
  ON public.diagrams
  FOR UPDATE
  USING (public.get_supabase_user_id_from_firebase_uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own diagrams" ON public.diagrams;
CREATE POLICY "Users can delete their own diagrams"
  ON public.diagrams
  FOR DELETE
  USING (public.get_supabase_user_id_from_firebase_uid() = user_id);

-- Update websites table policies
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own websites" ON public.websites;
CREATE POLICY "Users can view their own websites"
  ON public.websites
  FOR SELECT
  USING (public.get_supabase_user_id_from_firebase_uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own websites" ON public.websites;
CREATE POLICY "Users can insert their own websites"
  ON public.websites
  FOR INSERT
  WITH CHECK (public.get_supabase_user_id_from_firebase_uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own websites" ON public.websites;
CREATE POLICY "Users can update their own websites"
  ON public.websites
  FOR UPDATE
  USING (public.get_supabase_user_id_from_firebase_uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own websites" ON public.websites;
CREATE POLICY "Users can delete their own websites"
  ON public.websites
  FOR DELETE
  USING (public.get_supabase_user_id_from_firebase_uid() = user_id);

-- Update campaigns table policies
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaigns;
CREATE POLICY "Users can view their own campaigns"
  ON public.campaigns
  FOR SELECT
  USING (public.get_supabase_user_id_from_firebase_uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own campaigns" ON public.campaigns;
CREATE POLICY "Users can insert their own campaigns"
  ON public.campaigns
  FOR INSERT
  WITH CHECK (public.get_supabase_user_id_from_firebase_uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.campaigns;
CREATE POLICY "Users can update their own campaigns"
  ON public.campaigns
  FOR UPDATE
  USING (public.get_supabase_user_id_from_firebase_uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.campaigns;
CREATE POLICY "Users can delete their own campaigns"
  ON public.campaigns
  FOR DELETE
  USING (public.get_supabase_user_id_from_firebase_uid() = user_id);

-- Update presentations table policies
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own presentations" ON public.presentations;
CREATE POLICY "Users can view their own presentations"
  ON public.presentations
  FOR SELECT
  USING (public.get_supabase_user_id_from_firebase_uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own presentations" ON public.presentations;
CREATE POLICY "Users can insert their own presentations"
  ON public.presentations
  FOR INSERT
  WITH CHECK (public.get_supabase_user_id_from_firebase_uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own presentations" ON public.presentations;
CREATE POLICY "Users can update their own presentations"
  ON public.presentations
  FOR UPDATE
  USING (public.get_supabase_user_id_from_firebase_uid() = user_id);

-- Update templates table policies
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own templates" ON public.templates;
CREATE POLICY "Users can view their own templates"
  ON public.templates
  FOR SELECT
  USING (public.get_supabase_user_id_from_firebase_uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own templates" ON public.templates;
CREATE POLICY "Users can insert their own templates"
  ON public.templates
  FOR INSERT
  WITH CHECK (public.get_supabase_user_id_from_firebase_uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own templates" ON public.templates;
CREATE POLICY "Users can update their own templates"
  ON public.templates
  FOR UPDATE
  USING (public.get_supabase_user_id_from_firebase_uid() = user_id);

-- Update referrals table policies (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'referrals') THEN
        ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Users can view own referrals" ON public.referrals;
        CREATE POLICY "Users can view own referrals"
          ON public.referrals
          FOR SELECT
          USING (public.get_supabase_user_id_from_firebase_uid() = user_id);
          
        DROP POLICY IF EXISTS "Users can insert own referrals" ON public.referrals;
        CREATE POLICY "Users can insert own referrals"
          ON public.referrals
          FOR INSERT
          WITH CHECK (public.get_supabase_user_id_from_firebase_uid() = user_id);
          
        DROP POLICY IF EXISTS "Users can update own referrals" ON public.referrals;
        CREATE POLICY "Users can update own referrals"
          ON public.referrals
          FOR UPDATE
          USING (public.get_supabase_user_id_from_firebase_uid() = user_id);
          
        DROP POLICY IF EXISTS "Users can delete own referrals" ON public.referrals;
        CREATE POLICY "Users can delete own referrals"
          ON public.referrals
          FOR DELETE
          USING (public.get_supabase_user_id_from_firebase_uid() = user_id);
    END IF;
END $$;

-- Update user_credits trigger to work with Firebase users
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_credits();