-- Create daily_activities table
CREATE TABLE public.daily_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  activity_type TEXT NOT NULL DEFAULT 'study',
  xp_reward INTEGER NOT NULL DEFAULT 10,
  coin_reward INTEGER NOT NULL DEFAULT 5,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 day')
);

-- Enable RLS
ALTER TABLE public.daily_activities ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_activities
CREATE POLICY "Users can view their own activities" 
ON public.daily_activities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own activities" 
ON public.daily_activities 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" 
ON public.daily_activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create user_streaks table for detailed streak tracking
CREATE TABLE public.user_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  streak_protected_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_streaks
CREATE POLICY "Users can view their own streaks" 
ON public.user_streaks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks" 
ON public.user_streaks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks" 
ON public.user_streaks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create study_sessions table
CREATE TABLE public.study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  subject TEXT,
  notes TEXT,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  coins_earned INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for study_sessions
CREATE POLICY "Users can view their own sessions" 
ON public.study_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" 
ON public.study_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
ON public.study_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for user_streaks updated_at
CREATE TRIGGER update_user_streaks_updated_at
BEFORE UPDATE ON public.user_streaks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to initialize user streak on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_streak()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_streaks (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create streak record on new user
CREATE TRIGGER on_auth_user_created_streak
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user_streak();