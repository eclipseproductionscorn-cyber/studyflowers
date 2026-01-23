export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_activities: {
        Row: {
          coin_reward: number
          completed_at: string | null
          content_text: string
          correct_answer: string
          created_at: string
          day_of_week: number
          difficulty: string
          explanation: string
          id: string
          is_completed: boolean | null
          is_correct: boolean | null
          options: Json | null
          question: string
          question_type: string
          subject: string
          title: string
          user_answer: string | null
          user_id: string
          week_number: number
          xp_reward: number
        }
        Insert: {
          coin_reward?: number
          completed_at?: string | null
          content_text: string
          correct_answer: string
          created_at?: string
          day_of_week: number
          difficulty?: string
          explanation: string
          id?: string
          is_completed?: boolean | null
          is_correct?: boolean | null
          options?: Json | null
          question: string
          question_type?: string
          subject: string
          title: string
          user_answer?: string | null
          user_id: string
          week_number: number
          xp_reward?: number
        }
        Update: {
          coin_reward?: number
          completed_at?: string | null
          content_text?: string
          correct_answer?: string
          created_at?: string
          day_of_week?: number
          difficulty?: string
          explanation?: string
          id?: string
          is_completed?: boolean | null
          is_correct?: boolean | null
          options?: Json | null
          question?: string
          question_type?: string
          subject?: string
          title?: string
          user_answer?: string | null
          user_id?: string
          week_number?: number
          xp_reward?: number
        }
        Relationships: []
      }
      daily_activities: {
        Row: {
          activity_type: string
          coin_reward: number
          completed_at: string | null
          created_at: string
          description: string | null
          expires_at: string
          id: string
          is_completed: boolean
          title: string
          user_id: string
          xp_reward: number
        }
        Insert: {
          activity_type?: string
          coin_reward?: number
          completed_at?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string
          id?: string
          is_completed?: boolean
          title: string
          user_id: string
          xp_reward?: number
        }
        Update: {
          activity_type?: string
          coin_reward?: number
          completed_at?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string
          id?: string
          is_completed?: boolean
          title?: string
          user_id?: string
          xp_reward?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birth_year: number | null
          coins: number
          created_at: string
          current_rank: string
          full_name: string
          id: string
          level: number
          onboarding_completed: boolean | null
          public_name: string
          school_year: string | null
          streak_days: number
          subjects: string[] | null
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          avatar_url?: string | null
          birth_year?: number | null
          coins?: number
          created_at?: string
          current_rank?: string
          full_name: string
          id?: string
          level?: number
          onboarding_completed?: boolean | null
          public_name: string
          school_year?: string | null
          streak_days?: number
          subjects?: string[] | null
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          avatar_url?: string | null
          birth_year?: number | null
          coins?: number
          created_at?: string
          current_rank?: string
          full_name?: string
          id?: string
          level?: number
          onboarding_completed?: boolean | null
          public_name?: string
          school_year?: string | null
          streak_days?: number
          subjects?: string[] | null
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          coins_earned: number
          created_at: string
          duration_minutes: number
          ended_at: string | null
          id: string
          notes: string | null
          started_at: string
          subject: string | null
          user_id: string
          xp_earned: number
        }
        Insert: {
          coins_earned?: number
          created_at?: string
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string
          subject?: string | null
          user_id: string
          xp_earned?: number
        }
        Update: {
          coins_earned?: number
          created_at?: string
          duration_minutes?: number
          ended_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string
          subject?: string | null
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      user_inventory: {
        Row: {
          acquired_at: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          item_id: string
          item_type: string
          quantity: number
          user_id: string
        }
        Insert: {
          acquired_at?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          item_id: string
          item_type: string
          quantity?: number
          user_id: string
        }
        Update: {
          acquired_at?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          item_id?: string
          item_type?: string
          quantity?: number
          user_id?: string
        }
        Relationships: []
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          streak_protected_until: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_protected_until?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_protected_until?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_goals: {
        Row: {
          coin_reward: number
          created_at: string
          current: number
          description: string
          goal_type: string
          id: string
          is_claimed: boolean | null
          is_completed: boolean | null
          target: number
          title: string
          user_id: string
          week_start: string
          xp_reward: number
        }
        Insert: {
          coin_reward?: number
          created_at?: string
          current?: number
          description: string
          goal_type: string
          id?: string
          is_claimed?: boolean | null
          is_completed?: boolean | null
          target: number
          title: string
          user_id: string
          week_start: string
          xp_reward?: number
        }
        Update: {
          coin_reward?: number
          created_at?: string
          current?: number
          description?: string
          goal_type?: string
          id?: string
          is_claimed?: boolean | null
          is_completed?: boolean | null
          target?: number
          title?: string
          user_id?: string
          week_start?: string
          xp_reward?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
