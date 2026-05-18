CREATE TABLE public.diagram_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  diagram_id UUID NOT NULL REFERENCES public.diagrams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.diagram_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read all comments on their diagrams"
  ON public.diagram_comments;

CREATE POLICY "Users can read comments on their diagrams"
  ON public.diagram_comments FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.diagrams
      WHERE id = diagram_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own comments"
  ON public.diagram_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.diagram_comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.diagram_comments FOR DELETE
  USING (auth.uid() = user_id);
