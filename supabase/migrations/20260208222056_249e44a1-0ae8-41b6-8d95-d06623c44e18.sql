
-- Fix profiles table: drop permissive SELECT and re-create requiring auth
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Fix ai_activities table: drop permissive SELECT and re-create requiring auth
DROP POLICY IF EXISTS "Users can view their own ai activities" ON public.ai_activities;
CREATE POLICY "Users can view their own ai activities"
  ON public.ai_activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Also secure the other tables while we're at it
DROP POLICY IF EXISTS "Users can view their own activities" ON public.daily_activities;
CREATE POLICY "Users can view their own activities"
  ON public.daily_activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own streaks" ON public.user_streaks;
CREATE POLICY "Users can view their own streaks"
  ON public.user_streaks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own sessions" ON public.study_sessions;
CREATE POLICY "Users can view their own sessions"
  ON public.study_sessions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own inventory" ON public.user_inventory;
CREATE POLICY "Users can view their own inventory"
  ON public.user_inventory
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own weekly goals" ON public.weekly_goals;
CREATE POLICY "Users can view their own weekly goals"
  ON public.weekly_goals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
