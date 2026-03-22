
-- Admin logs for tracking admin actions
CREATE TABLE public.admin_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  action text NOT NULL,
  target_user_id uuid,
  target_content_id text,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage logs" ON public.admin_logs FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin-user internal messaging
CREATE TABLE public.admin_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  admin_id uuid,
  message text NOT NULL,
  is_from_admin boolean NOT NULL DEFAULT false,
  is_read boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.admin_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own messages" ON public.admin_messages FOR ALL TO public
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Seasonal events
CREATE TABLE public.seasonal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  banner_url text,
  event_type text NOT NULL DEFAULT 'marathon',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  rewards jsonb DEFAULT '{}',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.seasonal_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active events" ON public.seasonal_events FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage events" ON public.seasonal_events FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- Event missions
CREATE TABLE public.event_missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.seasonal_events(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target integer NOT NULL DEFAULT 1,
  xp_reward integer NOT NULL DEFAULT 50,
  coin_reward integer NOT NULL DEFAULT 25,
  mission_type text NOT NULL DEFAULT 'study',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.event_missions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view missions" ON public.event_missions FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage missions" ON public.event_missions FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- User event progress
CREATE TABLE public.user_event_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_id uuid NOT NULL REFERENCES public.seasonal_events(id) ON DELETE CASCADE,
  mission_id uuid REFERENCES public.event_missions(id) ON DELETE CASCADE,
  current integer NOT NULL DEFAULT 0,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_id)
);
ALTER TABLE public.user_event_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own progress" ON public.user_event_progress FOR ALL TO public
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Study trails
CREATE TABLE public.study_trails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  objective text NOT NULL,
  icon text DEFAULT '🎯',
  color text DEFAULT '#6366f1',
  total_phases integer NOT NULL DEFAULT 10,
  difficulty text DEFAULT 'medium',
  subjects text[] DEFAULT '{}',
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.study_trails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view trails" ON public.study_trails FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage trails" ON public.study_trails FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- Trail phases
CREATE TABLE public.trail_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trail_id uuid NOT NULL REFERENCES public.study_trails(id) ON DELETE CASCADE,
  phase_number integer NOT NULL,
  title text NOT NULL,
  description text,
  phase_type text NOT NULL DEFAULT 'lesson',
  xp_reward integer NOT NULL DEFAULT 30,
  coin_reward integer NOT NULL DEFAULT 15,
  content jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(trail_id, phase_number)
);
ALTER TABLE public.trail_phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view phases" ON public.trail_phases FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage phases" ON public.trail_phases FOR ALL TO public USING (has_role(auth.uid(), 'admin'::app_role));

-- User trail progress
CREATE TABLE public.user_trail_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  trail_id uuid NOT NULL REFERENCES public.study_trails(id) ON DELETE CASCADE,
  current_phase integer NOT NULL DEFAULT 1,
  completed_phases integer[] DEFAULT '{}',
  is_completed boolean NOT NULL DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(user_id, trail_id)
);
ALTER TABLE public.user_trail_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own trail progress" ON public.user_trail_progress FOR ALL TO public
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add reminder fields to study_events
ALTER TABLE public.study_events ADD COLUMN IF NOT EXISTS reminder_minutes integer DEFAULT NULL;
ALTER TABLE public.study_events ADD COLUMN IF NOT EXISTS reminder_sent boolean DEFAULT false;
