
-- Guild tournaments table
CREATE TABLE public.guild_tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  min_guild_level INTEGER NOT NULL DEFAULT 1,
  xp_reward_first INTEGER NOT NULL DEFAULT 5000,
  xp_reward_second INTEGER NOT NULL DEFAULT 3000,
  xp_reward_third INTEGER NOT NULL DEFAULT 1500,
  coin_reward_first INTEGER NOT NULL DEFAULT 2000,
  coin_reward_second INTEGER NOT NULL DEFAULT 1000,
  coin_reward_third INTEGER NOT NULL DEFAULT 500,
  max_participants INTEGER NOT NULL DEFAULT 16,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guild_tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view tournaments" ON public.guild_tournaments FOR SELECT USING (true);
CREATE POLICY "Admins can manage tournaments" ON public.guild_tournaments FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Tournament participants/scores
CREATE TABLE public.guild_tournament_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES public.guild_tournaments(id) ON DELETE CASCADE,
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  rewards_claimed BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, guild_id)
);

ALTER TABLE public.guild_tournament_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view entries" ON public.guild_tournament_entries FOR SELECT USING (true);
CREATE POLICY "Guild leaders can join tournaments" ON public.guild_tournament_entries FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM guilds WHERE guilds.id = guild_tournament_entries.guild_id AND guilds.leader_id = auth.uid())
);
CREATE POLICY "Members can update score" ON public.guild_tournament_entries FOR UPDATE USING (
  EXISTS (SELECT 1 FROM guild_members WHERE guild_members.guild_id = guild_tournament_entries.guild_id AND guild_members.user_id = auth.uid())
);

-- World map territories
CREATE TABLE public.world_territories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  region TEXT NOT NULL DEFAULT 'central',
  x_position REAL NOT NULL DEFAULT 50,
  y_position REAL NOT NULL DEFAULT 50,
  size TEXT NOT NULL DEFAULT 'medium',
  icon TEXT NOT NULL DEFAULT '🏰',
  color TEXT NOT NULL DEFAULT '#6366f1',
  bonus_type TEXT NOT NULL DEFAULT 'xp',
  bonus_value INTEGER NOT NULL DEFAULT 100,
  owner_guild_id UUID REFERENCES public.guilds(id) ON DELETE SET NULL,
  conquest_points INTEGER NOT NULL DEFAULT 0,
  required_wins INTEGER NOT NULL DEFAULT 3,
  is_capital BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.world_territories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view territories" ON public.world_territories FOR SELECT USING (true);
CREATE POLICY "System can update territories" ON public.world_territories FOR UPDATE USING (
  EXISTS (SELECT 1 FROM guild_members WHERE guild_members.user_id = auth.uid())
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_tournament_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.world_territories;
