
CREATE TABLE public.story_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_chapter INTEGER NOT NULL DEFAULT 1,
  current_scene INTEGER NOT NULL DEFAULT 0,
  choices JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_chapters INTEGER[] NOT NULL DEFAULT '{}'::integer[],
  career_path TEXT,
  total_score INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.story_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own story progress" ON public.story_progress
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_story_progress_updated_at
  BEFORE UPDATE ON public.story_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
