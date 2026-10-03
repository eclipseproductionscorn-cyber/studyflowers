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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: string | null
          id: string
          target_content_id: string | null
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: string | null
          id?: string
          target_content_id?: string | null
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: string | null
          id?: string
          target_content_id?: string | null
          target_user_id?: string | null
        }
        Relationships: []
      }
      admin_messages: {
        Row: {
          admin_id: string | null
          created_at: string
          id: string
          is_from_admin: boolean
          is_read: boolean
          message: string
          status: string
          user_id: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          id?: string
          is_from_admin?: boolean
          is_read?: boolean
          message: string
          status?: string
          user_id: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          id?: string
          is_from_admin?: boolean
          is_read?: boolean
          message?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
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
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          user_id?: string
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
      event_missions: {
        Row: {
          coin_reward: number
          created_at: string
          description: string | null
          event_id: string
          id: string
          mission_type: string
          target: number
          title: string
          xp_reward: number
        }
        Insert: {
          coin_reward?: number
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          mission_type?: string
          target?: number
          title: string
          xp_reward?: number
        }
        Update: {
          coin_reward?: number
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          mission_type?: string
          target?: number
          title?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_missions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "seasonal_events"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_direct_messages: {
        Row: {
          created_at: string
          guild_id: string
          id: string
          is_read: boolean
          mentions: string[] | null
          message: string
          reactions: Json | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          guild_id: string
          id?: string
          is_read?: boolean
          mentions?: string[] | null
          message: string
          reactions?: Json | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          guild_id?: string
          id?: string
          is_read?: boolean
          mentions?: string[] | null
          message?: string
          reactions?: Json | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_direct_messages_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_members: {
        Row: {
          guild_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
          xp_contributed: number
        }
        Insert: {
          guild_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
          xp_contributed?: number
        }
        Update: {
          guild_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
          xp_contributed?: number
        }
        Relationships: [
          {
            foreignKeyName: "guild_members_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_messages: {
        Row: {
          created_at: string
          guild_id: string
          id: string
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          guild_id: string
          id?: string
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          guild_id?: string
          id?: string
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_messages_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_missions: {
        Row: {
          coin_reward: number
          completed_at: string | null
          created_at: string
          current: number
          description: string | null
          expires_at: string
          guild_id: string
          id: string
          is_completed: boolean
          mission_type: string
          target: number
          title: string
          xp_reward: number
        }
        Insert: {
          coin_reward?: number
          completed_at?: string | null
          created_at?: string
          current?: number
          description?: string | null
          expires_at?: string
          guild_id: string
          id?: string
          is_completed?: boolean
          mission_type?: string
          target?: number
          title: string
          xp_reward?: number
        }
        Update: {
          coin_reward?: number
          completed_at?: string | null
          created_at?: string
          current?: number
          description?: string | null
          expires_at?: string
          guild_id?: string
          id?: string
          is_completed?: boolean
          mission_type?: string
          target?: number
          title?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "guild_missions_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_season_results: {
        Row: {
          created_at: string
          final_rank: number
          guild_id: string
          id: string
          season_id: string
          territories_held: number
          total_score: number
          trophies_earned: number
          wars_won: number
        }
        Insert: {
          created_at?: string
          final_rank?: number
          guild_id: string
          id?: string
          season_id: string
          territories_held?: number
          total_score?: number
          trophies_earned?: number
          wars_won?: number
        }
        Update: {
          created_at?: string
          final_rank?: number
          guild_id?: string
          id?: string
          season_id?: string
          territories_held?: number
          total_score?: number
          trophies_earned?: number
          wars_won?: number
        }
        Relationships: [
          {
            foreignKeyName: "guild_season_results_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_season_results_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "guild_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_seasons: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          season_number: number
          starts_at: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          ends_at?: string
          id?: string
          season_number: number
          starts_at?: string
          status?: string
          title: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          season_number?: number
          starts_at?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      guild_tournament_entries: {
        Row: {
          guild_id: string
          id: string
          joined_at: string
          rank: number | null
          rewards_claimed: boolean
          score: number
          tournament_id: string
        }
        Insert: {
          guild_id: string
          id?: string
          joined_at?: string
          rank?: number | null
          rewards_claimed?: boolean
          score?: number
          tournament_id: string
        }
        Update: {
          guild_id?: string
          id?: string
          joined_at?: string
          rank?: number | null
          rewards_claimed?: boolean
          score?: number
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guild_tournament_entries_guild_id_fkey"
            columns: ["guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_tournament_entries_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "guild_tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      guild_tournaments: {
        Row: {
          coin_reward_first: number
          coin_reward_second: number
          coin_reward_third: number
          created_at: string
          description: string | null
          ends_at: string
          id: string
          max_participants: number
          min_guild_level: number
          starts_at: string
          status: string
          title: string
          xp_reward_first: number
          xp_reward_second: number
          xp_reward_third: number
        }
        Insert: {
          coin_reward_first?: number
          coin_reward_second?: number
          coin_reward_third?: number
          created_at?: string
          description?: string | null
          ends_at?: string
          id?: string
          max_participants?: number
          min_guild_level?: number
          starts_at?: string
          status?: string
          title: string
          xp_reward_first?: number
          xp_reward_second?: number
          xp_reward_third?: number
        }
        Update: {
          coin_reward_first?: number
          coin_reward_second?: number
          coin_reward_third?: number
          created_at?: string
          description?: string | null
          ends_at?: string
          id?: string
          max_participants?: number
          min_guild_level?: number
          starts_at?: string
          status?: string
          title?: string
          xp_reward_first?: number
          xp_reward_second?: number
          xp_reward_third?: number
        }
        Relationships: []
      }
      guild_wars: {
        Row: {
          created_at: string
          ends_at: string
          guild_a_id: string
          guild_a_score: number
          guild_b_id: string
          guild_b_score: number
          id: string
          rewards_claimed: boolean
          started_at: string
          status: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          ends_at?: string
          guild_a_id: string
          guild_a_score?: number
          guild_b_id: string
          guild_b_score?: number
          id?: string
          rewards_claimed?: boolean
          started_at?: string
          status?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          ends_at?: string
          guild_a_id?: string
          guild_a_score?: number
          guild_b_id?: string
          guild_b_score?: number
          id?: string
          rewards_claimed?: boolean
          started_at?: string
          status?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guild_wars_guild_a_id_fkey"
            columns: ["guild_a_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_wars_guild_b_id_fkey"
            columns: ["guild_b_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guild_wars_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
      guilds: {
        Row: {
          color: string
          created_at: string
          description: string | null
          emblem: string
          id: string
          is_public: boolean
          leader_id: string
          level: number
          max_members: number
          name: string
          total_wins: number
          total_xp: number
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          emblem?: string
          id?: string
          is_public?: boolean
          leader_id: string
          level?: number
          max_members?: number
          name: string
          total_wins?: number
          total_xp?: number
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          emblem?: string
          id?: string
          is_public?: boolean
          leader_id?: string
          level?: number
          max_members?: number
          name?: string
          total_wins?: number
          total_xp?: number
        }
        Relationships: []
      }
      notes: {
        Row: {
          color: string
          content: string
          created_at: string
          id: string
          is_pinned: boolean
          subject: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          subject?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          subject?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
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
      quiz_attempts: {
        Row: {
          correct: number
          created_at: string
          id: string
          phase_id: string | null
          topic: string
          total: number
          trail_id: string | null
          user_id: string
        }
        Insert: {
          correct?: number
          created_at?: string
          id?: string
          phase_id?: string | null
          topic: string
          total?: number
          trail_id?: string | null
          user_id: string
        }
        Update: {
          correct?: number
          created_at?: string
          id?: string
          phase_id?: string | null
          topic?: string
          total?: number
          trail_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      seasonal_events: {
        Row: {
          banner_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string
          event_key: string | null
          event_type: string
          id: string
          is_active: boolean
          rewards: Json | null
          starts_at: string
          title: string
        }
        Insert: {
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at: string
          event_key?: string | null
          event_type?: string
          id?: string
          is_active?: boolean
          rewards?: Json | null
          starts_at: string
          title: string
        }
        Update: {
          banner_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string
          event_key?: string | null
          event_type?: string
          id?: string
          is_active?: boolean
          rewards?: Json | null
          starts_at?: string
          title?: string
        }
        Relationships: []
      }
      story_progress: {
        Row: {
          career_path: string | null
          choices: Json
          completed_chapters: number[]
          current_chapter: number
          current_scene: number
          id: string
          is_completed: boolean
          started_at: string
          total_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          career_path?: string | null
          choices?: Json
          completed_chapters?: number[]
          current_chapter?: number
          current_scene?: number
          id?: string
          is_completed?: boolean
          started_at?: string
          total_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          career_path?: string | null
          choices?: Json
          completed_chapters?: number[]
          current_chapter?: number
          current_scene?: number
          id?: string
          is_completed?: boolean
          started_at?: string
          total_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_cards: {
        Row: {
          back: string
          card_type: string
          created_at: string
          deck_id: string
          deck_name: string
          front: string
          hint: string | null
          id: string
          is_correct: boolean | null
          last_reviewed: string | null
          next_review: string
          review_level: number
          subject: string | null
          times_reviewed: number
          trail_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          back: string
          card_type?: string
          created_at?: string
          deck_id: string
          deck_name: string
          front: string
          hint?: string | null
          id?: string
          is_correct?: boolean | null
          last_reviewed?: string | null
          next_review?: string
          review_level?: number
          subject?: string | null
          times_reviewed?: number
          trail_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          back?: string
          card_type?: string
          created_at?: string
          deck_id?: string
          deck_name?: string
          front?: string
          hint?: string | null
          id?: string
          is_correct?: boolean | null
          last_reviewed?: string | null
          next_review?: string
          review_level?: number
          subject?: string | null
          times_reviewed?: number
          trail_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      study_events: {
        Row: {
          color: string
          created_at: string
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          is_completed: boolean
          reminder_minutes: number | null
          reminder_sent: boolean | null
          subject: string | null
          title: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          is_completed?: boolean
          reminder_minutes?: number | null
          reminder_sent?: boolean | null
          subject?: string | null
          title: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          is_completed?: boolean
          reminder_minutes?: number | null
          reminder_sent?: boolean | null
          subject?: string | null
          title?: string
          user_id?: string
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
      study_trails: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          difficulty: string | null
          icon: string | null
          id: string
          is_published: boolean
          objective: string
          subjects: string[] | null
          title: string
          total_phases: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          objective: string
          subjects?: string[] | null
          title: string
          total_phases?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          difficulty?: string | null
          icon?: string | null
          id?: string
          is_published?: boolean
          objective?: string
          subjects?: string[] | null
          title?: string
          total_phases?: number
        }
        Relationships: []
      }
      trail_phases: {
        Row: {
          coin_reward: number
          content: Json | null
          created_at: string
          description: string | null
          id: string
          phase_number: number
          phase_type: string
          title: string
          trail_id: string
          xp_reward: number
        }
        Insert: {
          coin_reward?: number
          content?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          phase_number: number
          phase_type?: string
          title: string
          trail_id: string
          xp_reward?: number
        }
        Update: {
          coin_reward?: number
          content?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          phase_number?: number
          phase_type?: string
          title?: string
          trail_id?: string
          xp_reward?: number
        }
        Relationships: [
          {
            foreignKeyName: "trail_phases_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "study_trails"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bans: {
        Row: {
          ban_type: string
          banned_at: string
          banned_by: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          reason: string
          user_id: string
        }
        Insert: {
          ban_type?: string
          banned_at?: string
          banned_by: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reason?: string
          user_id: string
        }
        Update: {
          ban_type?: string
          banned_at?: string
          banned_by?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          reason?: string
          user_id?: string
        }
        Relationships: []
      }
      user_event_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          current: number
          event_id: string
          id: string
          is_completed: boolean
          mission_id: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current?: number
          event_id: string
          id?: string
          is_completed?: boolean
          mission_id?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current?: number
          event_id?: string
          id?: string
          is_completed?: boolean
          mission_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_event_progress_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "seasonal_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_event_progress_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "event_missions"
            referencedColumns: ["id"]
          },
        ]
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
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
      user_trail_progress: {
        Row: {
          completed_at: string | null
          completed_phases: number[] | null
          current_phase: number
          id: string
          is_completed: boolean
          started_at: string
          trail_id: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_phases?: number[] | null
          current_phase?: number
          id?: string
          is_completed?: boolean
          started_at?: string
          trail_id: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_phases?: number[] | null
          current_phase?: number
          id?: string
          is_completed?: boolean
          started_at?: string
          trail_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_trail_progress_trail_id_fkey"
            columns: ["trail_id"]
            isOneToOne: false
            referencedRelation: "study_trails"
            referencedColumns: ["id"]
          },
        ]
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
      world_territories: {
        Row: {
          bonus_type: string
          bonus_value: number
          color: string
          conquest_points: number
          created_at: string
          description: string | null
          icon: string
          id: string
          is_capital: boolean
          name: string
          owner_guild_id: string | null
          region: string
          required_wins: number
          size: string
          x_position: number
          y_position: number
        }
        Insert: {
          bonus_type?: string
          bonus_value?: number
          color?: string
          conquest_points?: number
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_capital?: boolean
          name: string
          owner_guild_id?: string | null
          region?: string
          required_wins?: number
          size?: string
          x_position?: number
          y_position?: number
        }
        Update: {
          bonus_type?: string
          bonus_value?: number
          color?: string
          conquest_points?: number
          created_at?: string
          description?: string | null
          icon?: string
          id?: string
          is_capital?: boolean
          name?: string
          owner_guild_id?: string | null
          region?: string
          required_wins?: number
          size?: string
          x_position?: number
          y_position?: number
        }
        Relationships: [
          {
            foreignKeyName: "world_territories_owner_guild_id_fkey"
            columns: ["owner_guild_id"]
            isOneToOne: false
            referencedRelation: "guilds"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
