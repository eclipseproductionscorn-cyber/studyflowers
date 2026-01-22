import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";
import { getRankFromXP, getRankString } from "@/lib/ranks";

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
      // Auto-update rank based on XP
      const { rankId, level } = getRankFromXP(data.xp);
      const newRank = getRankString(rankId, level);
      
      if (newRank !== data.current_rank) {
        await supabase
          .from("profiles")
          .update({ current_rank: newRank })
          .eq("user_id", userId);
        data.current_rank = newRank;
      }
      
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

    // If XP is being updated, also update the rank
    if (updates.xp !== undefined) {
      const { rankId, level } = getRankFromXP(updates.xp);
      updates.current_rank = getRankString(rankId, level);
      
      // Calculate level from XP
      const xpPerLevel = 100;
      updates.level = Math.floor(updates.xp / xpPerLevel) + 1;
    }

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
    return updateProfile({ xp: newXP });
  };

  const updateStreak = async (updates: Partial<UserStreak>) => {
    if (!user) return false;

    const { error } = await supabase
      .from("user_streaks")
      .update(updates)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating streak:", error);
      return false;
    }

    setStreak((prev) => (prev ? { ...prev, ...updates } : null));
    return true;
  };

  return {
    user,
    profile,
    streak,
    loading,
    updateProfile,
    addCoins,
    addXP,
    updateStreak,
    refetchProfile: () => user && fetchProfile(user.id),
    refetchStreak: () => user && fetchStreak(user.id),
  };
};
