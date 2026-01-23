-- Add academic profile fields to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS school_year text,
ADD COLUMN IF NOT EXISTS subjects text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS birth_year integer,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Create user_inventory table for items and powers
CREATE TABLE public.user_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id text NOT NULL,
  item_type text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  acquired_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active boolean DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_inventory
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_inventory
CREATE POLICY "Users can view their own inventory"
ON public.user_inventory
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory items"
ON public.user_inventory
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own inventory"
ON public.user_inventory
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inventory items"
ON public.user_inventory
FOR DELETE
USING (auth.uid() = user_id);

-- Create ai_activities table for AI-generated activities
CREATE TABLE public.ai_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title text NOT NULL,
  subject text NOT NULL,
  difficulty text NOT NULL DEFAULT 'normal',
  content_text text NOT NULL,
  question text NOT NULL,
  question_type text NOT NULL DEFAULT 'multiple_choice',
  options jsonb,
  correct_answer text NOT NULL,
  explanation text NOT NULL,
  xp_reward integer NOT NULL DEFAULT 20,
  coin_reward integer NOT NULL DEFAULT 10,
  is_completed boolean DEFAULT false,
  user_answer text,
  is_correct boolean,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  week_number integer NOT NULL,
  day_of_week integer NOT NULL
);

-- Enable RLS on ai_activities
ALTER TABLE public.ai_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ai_activities
CREATE POLICY "Users can view their own ai activities"
ON public.ai_activities
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ai activities"
ON public.ai_activities
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ai activities"
ON public.ai_activities
FOR UPDATE
USING (auth.uid() = user_id);

-- Create weekly_goals table to persist weekly goals
CREATE TABLE public.weekly_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  week_start date NOT NULL,
  goal_type text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  target integer NOT NULL,
  current integer NOT NULL DEFAULT 0,
  xp_reward integer NOT NULL DEFAULT 100,
  coin_reward integer NOT NULL DEFAULT 50,
  is_completed boolean DEFAULT false,
  is_claimed boolean DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start, goal_type)
);

-- Enable RLS on weekly_goals
ALTER TABLE public.weekly_goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for weekly_goals
CREATE POLICY "Users can view their own weekly goals"
ON public.weekly_goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly goals"
ON public.weekly_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly goals"
ON public.weekly_goals
FOR UPDATE
USING (auth.uid() = user_id);