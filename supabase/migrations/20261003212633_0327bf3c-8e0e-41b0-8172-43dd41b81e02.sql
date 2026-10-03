CREATE TABLE public.study_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  deck_id text NOT NULL,
  deck_name text NOT NULL,
  trail_id uuid,
  subject text,
  front text NOT NULL,
  back text NOT NULL,
  card_type text NOT NULL DEFAULT 'qa',
  hint text,
  review_level integer NOT NULL DEFAULT -1,
  next_review timestamptz NOT NULL DEFAULT now(),
  times_reviewed integer NOT NULL DEFAULT 0,
  last_reviewed timestamptz,
  is_correct boolean,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.study_cards TO authenticated;
GRANT ALL ON public.study_cards TO service_role;
ALTER TABLE public.study_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own cards" ON public.study_cards FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX study_cards_user_next ON public.study_cards(user_id, next_review);
CREATE TRIGGER update_study_cards_updated_at BEFORE UPDATE ON public.study_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  trail_id uuid,
  phase_id uuid,
  topic text NOT NULL,
  correct integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.quiz_attempts TO authenticated;
GRANT ALL ON public.quiz_attempts TO service_role;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own attempts read" ON public.quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Own attempts insert" ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.seasonal_events ADD COLUMN IF NOT EXISTS event_key text UNIQUE;