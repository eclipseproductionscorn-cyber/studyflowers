
CREATE TABLE public.guild_seasons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(season_number)
);

ALTER TABLE public.guild_seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view seasons" ON public.guild_seasons FOR SELECT USING (true);
CREATE POLICY "Admins can manage seasons" ON public.guild_seasons FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.guild_season_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  season_id UUID NOT NULL REFERENCES public.guild_seasons(id) ON DELETE CASCADE,
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  final_rank INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  territories_held INTEGER NOT NULL DEFAULT 0,
  wars_won INTEGER NOT NULL DEFAULT 0,
  trophies_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(season_id, guild_id)
);

ALTER TABLE public.guild_season_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view season results" ON public.guild_season_results FOR SELECT USING (true);
CREATE POLICY "Admins can manage results" ON public.guild_season_results FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_seasons;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_season_results;
