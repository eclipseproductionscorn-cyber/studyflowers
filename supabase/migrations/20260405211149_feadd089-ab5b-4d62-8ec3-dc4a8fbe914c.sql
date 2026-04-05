
-- Guild cooperative missions
CREATE TABLE public.guild_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  mission_type TEXT NOT NULL DEFAULT 'study',
  target INTEGER NOT NULL DEFAULT 100,
  current INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER NOT NULL DEFAULT 500,
  coin_reward INTEGER NOT NULL DEFAULT 200,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guild_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view guild missions" ON public.guild_missions FOR SELECT USING (true);
CREATE POLICY "Members can update guild missions" ON public.guild_missions FOR UPDATE USING (
  EXISTS (SELECT 1 FROM guild_members WHERE guild_members.guild_id = guild_missions.guild_id AND guild_members.user_id = auth.uid())
);
CREATE POLICY "Leaders can manage guild missions" ON public.guild_missions FOR ALL USING (
  EXISTS (SELECT 1 FROM guilds WHERE guilds.id = guild_missions.guild_id AND guilds.leader_id = auth.uid())
);

-- Guild wars
CREATE TABLE public.guild_wars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_a_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  guild_b_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  guild_a_score INTEGER NOT NULL DEFAULT 0,
  guild_b_score INTEGER NOT NULL DEFAULT 0,
  winner_id UUID REFERENCES public.guilds(id),
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
  rewards_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guild_wars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view guild wars" ON public.guild_wars FOR SELECT USING (true);
CREATE POLICY "Leaders can create wars" ON public.guild_wars FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM guilds WHERE guilds.id = guild_wars.guild_a_id AND guilds.leader_id = auth.uid())
);
CREATE POLICY "System can update wars" ON public.guild_wars FOR UPDATE USING (
  EXISTS (SELECT 1 FROM guilds WHERE (guilds.id = guild_wars.guild_a_id OR guilds.id = guild_wars.guild_b_id) AND guilds.leader_id = auth.uid())
);

ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_missions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_wars;
