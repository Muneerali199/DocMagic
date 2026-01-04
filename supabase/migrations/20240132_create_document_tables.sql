-- Create resumes table for history
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Resume',
    personal_info JSONB,
    content JSONB,
    template TEXT DEFAULT 'deedy-resume',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create presentations table for history
CREATE TABLE IF NOT EXISTS public.presentations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Presentation',
    slides JSONB,
    theme TEXT DEFAULT 'modern',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create letters table for history
CREATE TABLE IF NOT EXISTS public.letters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Letter',
    type TEXT DEFAULT 'formal', -- formal, cover, business
    content TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can insert their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can update their own resumes" ON public.resumes;
DROP POLICY IF EXISTS "Users can delete their own resumes" ON public.resumes;

DROP POLICY IF EXISTS "Users can view their own presentations" ON public.presentations;
DROP POLICY IF EXISTS "Users can insert their own presentations" ON public.presentations;
DROP POLICY IF EXISTS "Users can update their own presentations" ON public.presentations;
DROP POLICY IF EXISTS "Users can delete their own presentations" ON public.presentations;

DROP POLICY IF EXISTS "Users can view their own letters" ON public.letters;
DROP POLICY IF EXISTS "Users can insert their own letters" ON public.letters;
DROP POLICY IF EXISTS "Users can update their own letters" ON public.letters;
DROP POLICY IF EXISTS "Users can delete their own letters" ON public.letters;

-- Create policies for resumes
CREATE POLICY "Users can view their own resumes"
    ON public.resumes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes"
    ON public.resumes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
    ON public.resumes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
    ON public.resumes FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for presentations
CREATE POLICY "Users can view their own presentations"
    ON public.presentations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own presentations"
    ON public.presentations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presentations"
    ON public.presentations FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presentations"
    ON public.presentations FOR DELETE
    USING (auth.uid() = user_id);

-- Create policies for letters
CREATE POLICY "Users can view their own letters"
    ON public.letters FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own letters"
    ON public.letters FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own letters"
    ON public.letters FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own letters"
    ON public.letters FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS resumes_created_at_idx ON public.resumes(created_at DESC);
CREATE INDEX IF NOT EXISTS presentations_user_id_idx ON public.presentations(user_id);
CREATE INDEX IF NOT EXISTS presentations_created_at_idx ON public.presentations(created_at DESC);
CREATE INDEX IF NOT EXISTS letters_user_id_idx ON public.letters(user_id);
CREATE INDEX IF NOT EXISTS letters_created_at_idx ON public.letters(created_at DESC);
