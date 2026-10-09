CREATE TABLE public.flashcard_reminder_state (user_id uuid PRIMARY KEY, last_reminded_on date NOT NULL DEFAULT CURRENT_DATE);
GRANT SELECT ON public.flashcard_reminder_state TO authenticated;
GRANT ALL ON public.flashcard_reminder_state TO service_role;
ALTER TABLE public.flashcard_reminder_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students read own reminder state" ON public.flashcard_reminder_state FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS study_cards_due_reminder_idx ON public.study_cards(next_review, user_id);
CREATE OR REPLACE FUNCTION public.send_flashcard_review_reminders() RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inserted_count integer; reminder_day date := (now() AT TIME ZONE 'America/Sao_Paulo')::date;
BEGIN
  WITH due AS (
    SELECT user_id, count(*) AS cards FROM public.study_cards WHERE next_review <= now() GROUP BY user_id
  ), claimed AS (
    INSERT INTO public.flashcard_reminder_state(user_id, last_reminded_on)
    SELECT user_id, reminder_day FROM due
    ON CONFLICT (user_id) DO UPDATE SET last_reminded_on = EXCLUDED.last_reminded_on
    WHERE flashcard_reminder_state.last_reminded_on < EXCLUDED.last_reminded_on
    RETURNING user_id
  )
  INSERT INTO public.notifications(user_id, title, message, type, link)
  SELECT due.user_id, 'Hora de revisar seus flashcards',
    format('Você tem %s cartão(ões) pronto(s) para revisão. Retome seus estudos no Painel de Estudos.', due.cards),
    'study_review', '/study-dashboard' FROM due JOIN claimed USING(user_id);
  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;
REVOKE ALL ON FUNCTION public.send_flashcard_review_reminders() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.send_flashcard_review_reminders() TO service_role;