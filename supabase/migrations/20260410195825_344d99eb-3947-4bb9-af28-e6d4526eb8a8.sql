-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can delete own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

-- Guild direct messages table
CREATE TABLE public.guild_direct_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  guild_id UUID NOT NULL REFERENCES public.guilds(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  reactions JSONB DEFAULT '{}',
  mentions UUID[] DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.guild_direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their DMs"
ON public.guild_direct_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Guild members can send DMs"
ON public.guild_direct_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id
  AND EXISTS (
    SELECT 1 FROM guild_members WHERE guild_id = guild_direct_messages.guild_id AND user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM guild_members WHERE guild_id = guild_direct_messages.guild_id AND user_id = guild_direct_messages.receiver_id
  )
);

CREATE POLICY "Participants can update DMs"
ON public.guild_direct_messages FOR UPDATE
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE INDEX idx_dm_participants ON public.guild_direct_messages(sender_id, receiver_id, created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.guild_direct_messages;