
-- Guilds table
CREATE TABLE public.guilds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  emblem TEXT NOT NULL DEFAULT '⚔️',
  color TEXT NOT NULL DEFAULT '#6366f1',
  leader_id UUID NOT NULL,
  max_members INTEGER NOT NULL DEFAULT 20,
  total_xp BIGINT NOT NULL DEFAULT 0,
  total_wins INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Guild members table
CREATE TABLE public.guild_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  xp_contributed BIGINT NOT NULL DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(guild_id, user_id)
);

-- Guild chat messages
CREATE TABLE public.guild_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guilds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guild_messages ENABLE ROW LEVEL SECURITY;

-- Guilds policies
CREATE POLICY "Anyone can view public guilds" ON public.guilds FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create guilds" ON public.guilds FOR INSERT TO authenticated WITH CHECK (auth.uid() = leader_id);
CREATE POLICY "Leaders can update their guild" ON public.guilds FOR UPDATE TO authenticated USING (auth.uid() = leader_id);
CREATE POLICY "Leaders can delete their guild" ON public.guilds FOR DELETE TO authenticated USING (auth.uid() = leader_id);

-- Guild members policies
CREATE POLICY "Anyone can view guild members" ON public.guild_members FOR SELECT USING (true);
CREATE POLICY "Authenticated can join guilds" ON public.guild_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Members can leave or leaders can remove" ON public.guild_members FOR DELETE TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM public.guilds WHERE id = guild_id AND leader_id = auth.uid()));
CREATE POLICY "Leaders can update members" ON public.guild_members FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.guilds WHERE id = guild_id AND leader_id = auth.uid()));

-- Guild messages policies  
CREATE POLICY "Members can view guild messages" ON public.guild_messages FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.guild_members WHERE guild_id = guild_messages.guild_id AND user_id = auth.uid()));
CREATE POLICY "Members can send messages" ON public.guild_messages FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.guild_members WHERE guild_id = guild_messages.guild_id AND user_id = auth.uid()));

-- Enable realtime for guild messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_messages;
