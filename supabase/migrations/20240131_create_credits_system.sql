-- Create user_credits table for managing token usage
CREATE TABLE IF NOT EXISTS public.user_credits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'basic', 'pro', 'enterprise')),
    credits_total INTEGER NOT NULL DEFAULT 20, -- Total credits for the current period
    credits_used INTEGER NOT NULL DEFAULT 0,
    credits_reset_at TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + interval '30 days'),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    subscription_status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create credit_usage_log table for tracking individual credit usage
CREATE TABLE IF NOT EXISTS public.credit_usage_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credits_used INTEGER NOT NULL DEFAULT 1,
    action_type TEXT NOT NULL, -- 'resume', 'presentation', 'diagram', 'letter', 'ats_check'
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_usage_log ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users can insert their own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users can view their own credit usage" ON public.credit_usage_log;
DROP POLICY IF EXISTS "Users can insert their own credit usage" ON public.credit_usage_log;

-- Create policies for user_credits
CREATE POLICY "Users can view their own credits"
    ON public.user_credits FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
    ON public.user_credits FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
    ON public.user_credits FOR UPDATE
    USING (auth.uid() = user_id);

-- Create policies for credit_usage_log
CREATE POLICY "Users can view their own credit usage"
    ON public.credit_usage_log FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit usage"
    ON public.credit_usage_log FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_credits_user_id_idx ON public.user_credits(user_id);
CREATE INDEX IF NOT EXISTS credit_usage_log_user_id_idx ON public.credit_usage_log(user_id);
CREATE INDEX IF NOT EXISTS credit_usage_log_created_at_idx ON public.credit_usage_log(created_at DESC);

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS set_user_credits_updated_at ON public.user_credits;

-- Create trigger for updated_at
CREATE TRIGGER set_user_credits_updated_at
    BEFORE UPDATE ON public.user_credits
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to initialize credits for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_credits()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_credits (user_id, tier, credits_total, credits_used)
    VALUES (NEW.id, 'free', 20, 0)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create credits for new users
DROP TRIGGER IF EXISTS on_auth_user_created_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_credits
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user_credits();

-- Update existing free tier users to have 20 credits
UPDATE public.user_credits 
SET credits_total = 20 
WHERE tier = 'free' AND credits_total = 10;

-- Credit limits by tier
COMMENT ON TABLE public.user_credits IS '
Tier Credit Limits:
- free: 20 credits per month
- basic: 50 credits per month
- pro: 200 credits per month  
- enterprise: unlimited

Credit costs:
- Resume generation: 1 credit
- ATS check: 1 credit
- Presentation: 1 credit PER SLIDE (e.g., 5 slides = 5 credits)
- Diagram: 1 credit
- Letter: 1 credit
- Cover Letter: 1 credit
';
