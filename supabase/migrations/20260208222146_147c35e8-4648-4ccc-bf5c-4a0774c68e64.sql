
-- Add policy so authenticated users can read basic profile data for rankings
CREATE POLICY "Authenticated users can view all profiles for rankings"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Drop the duplicate restrictive policy since the new one covers it
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
