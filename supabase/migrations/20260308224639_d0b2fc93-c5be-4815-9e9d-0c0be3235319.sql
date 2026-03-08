
-- User bans table
CREATE TABLE public.user_bans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  banned_by UUID NOT NULL,
  reason TEXT NOT NULL DEFAULT 'Violação das regras',
  ban_type TEXT NOT NULL DEFAULT 'temporary',
  banned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage bans" ON public.user_bans FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Users can view their own bans" ON public.user_bans FOR SELECT USING (auth.uid() = user_id);

-- Notes table
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  subject TEXT,
  color TEXT NOT NULL DEFAULT '#FFD700',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notes" ON public.notes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read chat" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can send messages" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Study events table
CREATE TABLE public.study_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TIME,
  subject TEXT,
  color TEXT NOT NULL DEFAULT '#6366f1',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.study_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own events" ON public.study_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
