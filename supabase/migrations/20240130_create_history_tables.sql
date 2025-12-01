-- Create websites table
CREATE TABLE IF NOT EXISTS public.websites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    style TEXT,
    html TEXT,
    css TEXT,
    javascript TEXT,
    assets JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    platform TEXT,
    brand_dna JSONB,
    ideas JSONB,
    posts JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create diagrams table
CREATE TABLE IF NOT EXISTS public.diagrams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    type TEXT,
    mermaid_code TEXT,
    svg_data TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagrams ENABLE ROW LEVEL SECURITY;

-- Create policies for websites
CREATE POLICY "Users can view their own websites"
    ON public.websites FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own websites"
    ON public.websites FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own websites"
    ON public.websites FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own websites"
    ON public.websites FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for campaigns
CREATE POLICY "Users can view their own campaigns"
    ON public.campaigns FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own campaigns"
    ON public.campaigns FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns"
    ON public.campaigns FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns"
    ON public.campaigns FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for diagrams
CREATE POLICY "Users can view their own diagrams"
    ON public.diagrams FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own diagrams"
    ON public.diagrams FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own diagrams"
    ON public.diagrams FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diagrams"
    ON public.diagrams FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS websites_user_id_idx ON public.websites(user_id);
CREATE INDEX IF NOT EXISTS websites_created_at_idx ON public.websites(created_at DESC);
CREATE INDEX IF NOT EXISTS campaigns_user_id_idx ON public.campaigns(user_id);
CREATE INDEX IF NOT EXISTS campaigns_created_at_idx ON public.campaigns(created_at DESC);
CREATE INDEX IF NOT EXISTS diagrams_user_id_idx ON public.diagrams(user_id);
CREATE INDEX IF NOT EXISTS diagrams_created_at_idx ON public.diagrams(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_websites_updated_at
    BEFORE UPDATE ON public.websites
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_campaigns_updated_at
    BEFORE UPDATE ON public.campaigns
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_diagrams_updated_at
    BEFORE UPDATE ON public.diagrams
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
