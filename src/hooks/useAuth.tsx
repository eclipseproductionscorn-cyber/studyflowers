import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  user_id: string;
  public_name: string;
  full_name: string;
  avatar_url: string | null;
  coins: number;
  level: number;
  xp: number;
  current_rank: string;
  streak_days: number;
}

interface UserStreak {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [streak, setStreak] = useState<UserStreak | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchProfile(session.user.id);
        fetchStreak(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
    } else if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const fetchStreak = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching streak:", error);
    } else if (data) {
      setStreak(data);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating profile:", error);
      return false;
    }

    setProfile((prev) => (prev ? { ...prev, ...updates } : null));
    return true;
  };

  const addCoins = async (amount: number) => {
    if (!profile) return false;
    return updateProfile({ coins: profile.coins + amount });
  };

  const addXP = async (amount: number) => {
    if (!profile) return false;
    const newXP = profile.xp + amount;
    const xpPerLevel = 100;
    const newLevel = Math.floor(newXP / xpPerLevel) + 1;
    return updateProfile({ xp: newXP, level: newLevel });
  };

  return {
    user,
    profile,
    streak,
    loading,
    updateProfile,
    addCoins,
    addXP,
    refetchProfile: () => user && fetchProfile(user.id),
    refetchStreak: () => user && fetchStreak(user.id),
  };
};
