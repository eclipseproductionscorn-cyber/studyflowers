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
  school_year: string | null;
  subjects: string[];
  birth_year: number | null;
  onboarding_completed: boolean;
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
    const handleSession = async (session: { user: User } | null) => {
      if (!session?.user) {
        setLoading(false);
        const currentPath = window.location.pathname;
        // Allow public routes
        if (currentPath !== "/" && currentPath !== "/auth") {
          navigate("/auth");
        }
        return;
      }

      setUser(session.user);

      // Check if user is banned
      const { data: banData } = await supabase
        .from("user_bans")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("is_active", true)
        .maybeSingle();

      if (banData) {
        // Check if temporary ban has expired
        if (banData.expires_at && new Date(banData.expires_at) < new Date()) {
          // Ban expired, deactivate it
          await supabase.from("user_bans").update({ is_active: false }).eq("id", banData.id);
        } else {
          // Still banned
          await supabase.auth.signOut();
          const expiresMsg = banData.expires_at
            ? `Seu banimento expira em: ${new Date(banData.expires_at).toLocaleDateString("pt-BR")}`
            : "Banimento permanente.";
          alert(`Sua conta foi banida.\nMotivo: ${banData.reason}\n${expiresMsg}`);
          setLoading(false);
          navigate("/auth");
          return;
        }
      }
      
      // Fetch profile and check onboarding status
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (profileData) {
        // Auto-update rank based on XP
        const { rankId, level } = getRankFromXP(profileData.xp);
        const newRank = getRankString(rankId, level);
        
        if (newRank !== profileData.current_rank) {
          await supabase
            .from("profiles")
            .update({ current_rank: newRank })
            .eq("user_id", session.user.id);
          profileData.current_rank = newRank;
        }
        
        setProfile(profileData);

        // Check onboarding status for redirects
        const currentPath = window.location.pathname;
        if (!profileData.onboarding_completed && 
            currentPath !== "/onboarding" && 
            currentPath !== "/leveling-quiz" && 
            currentPath !== "/auth" && 
            currentPath !== "/") {
          navigate("/onboarding");
        }
      }

      // Fetch streak data
      const { data: streakData } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (streakData) {
        setStreak(streakData);
      }

      setLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      handleSession(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
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
