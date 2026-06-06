export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      showcase_engagement_events: {
        Row: {
          created_at: string;
          dwell_ms: number | null;
          event_type: Database["public"]["Enums"]["showcase_event_type"];
          id: string;
          ip_hash: string | null;
          post_id: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          dwell_ms?: number | null;
          event_type: Database["public"]["Enums"]["showcase_event_type"];
          id?: string;
          ip_hash?: string | null;
          post_id: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          dwell_ms?: number | null;
          event_type?: Database["public"]["Enums"]["showcase_event_type"];
          id?: string;
          ip_hash?: string | null;
          post_id?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "showcase_engagement_events_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "showcase_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "showcase_engagement_events_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "showcase_ranked_feed";
            referencedColumns: ["id"];
          },
        ];
      };
      showcase_follows: {
        Row: {
          followee_id: string;
          follower_id: string;
        };
        Insert: {
          followee_id: string;
          follower_id: string;
        };
        Update: {
          followee_id?: string;
          follower_id?: string;
        };
        Relationships: [];
      };
      showcase_post_scores: {
        Row: {
          engagement_score: number;
          final_score: number;
          freshness_score: number;
          post_id: string;
          quality_score: number;
          relevance_score: number | null;
          score_breakdown: Json;
          updated_at: string;
        };
        Insert: {
          engagement_score?: number;
          final_score?: number;
          freshness_score?: number;
          post_id: string;
          quality_score?: number;
          relevance_score?: number | null;
          score_breakdown?: Json;
          updated_at?: string;
        };
        Update: {
          engagement_score?: number;
          final_score?: number;
          freshness_score?: number;
          post_id?: string;
          quality_score?: number;
          relevance_score?: number | null;
          score_breakdown?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "showcase_post_scores_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: true;
            referencedRelation: "showcase_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "showcase_post_scores_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: true;
            referencedRelation: "showcase_ranked_feed";
            referencedColumns: ["id"];
          },
        ];
      };
      showcase_post_tags: {
        Row: {
          post_id: string;
          tag: string;
        };
        Insert: {
          post_id: string;
          tag: string;
        };
        Update: {
          post_id?: string;
          tag?: string;
        };
        Relationships: [
          {
            foreignKeyName: "showcase_post_tags_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "showcase_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "showcase_post_tags_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "showcase_ranked_feed";
            referencedColumns: ["id"];
          },
        ];
      };
      showcase_posts: {
        Row: {
          content_ref: string;
          created_at: string;
          experience_level: Database["public"]["Enums"]["showcase_exp_level"];
          id: string;
          quality_score: number;
          report_count: number;
          role: string;
          status: Database["public"]["Enums"]["showcase_post_status"];
          template_used: string | null;
          title: string;
          type: Database["public"]["Enums"]["showcase_post_type"];
          user_id: string;
          visibility: Database["public"]["Enums"]["showcase_visibility"];
        };
        Insert: {
          content_ref: string;
          created_at?: string;
          experience_level: Database["public"]["Enums"]["showcase_exp_level"];
          id?: string;
          quality_score?: number;
          report_count?: number;
          role: string;
          status?: Database["public"]["Enums"]["showcase_post_status"];
          template_used?: string | null;
          title: string;
          type: Database["public"]["Enums"]["showcase_post_type"];
          user_id: string;
          visibility?: Database["public"]["Enums"]["showcase_visibility"];
        };
        Update: {
          content_ref?: string;
          created_at?: string;
          experience_level?: Database["public"]["Enums"]["showcase_exp_level"];
          id?: string;
          quality_score?: number;
          report_count?: number;
          role?: string;
          status?: Database["public"]["Enums"]["showcase_post_status"];
          template_used?: string | null;
          title?: string;
          type?: Database["public"]["Enums"]["showcase_post_type"];
          user_id?: string;
          visibility?: Database["public"]["Enums"]["showcase_visibility"];
        };
        Relationships: [];
      };
      showcase_reports: {
        Row: {
          created_at: string;
          id: string;
          post_id: string;
          reason: string;
          reporter_id: string;
          status: Database["public"]["Enums"]["showcase_report_status"];
        };
        Insert: {
          created_at?: string;
          id?: string;
          post_id: string;
          reason: string;
          reporter_id: string;
          status?: Database["public"]["Enums"]["showcase_report_status"];
        };
        Update: {
          created_at?: string;
          id?: string;
          post_id?: string;
          reason?: string;
          reporter_id?: string;
          status?: Database["public"]["Enums"]["showcase_report_status"];
        };
        Relationships: [
          {
            foreignKeyName: "showcase_reports_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "showcase_posts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "showcase_reports_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "showcase_ranked_feed";
            referencedColumns: ["id"];
          },
        ];
      };
      user_showcase_preferences: {
        Row: {
          pref_role: string | null;
          pref_tags: string[];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          pref_role?: string | null;
          pref_tags?: string[];
          updated_at?: string;
          user_id: string;
        };
        Update: {
          pref_role?: string | null;
          pref_tags?: string[];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          owner_id: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          owner_id: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          owner_id?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: string;
          invited_by: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: string;
          invited_by?: string | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role?: string;
          invited_by?: string | null;
          joined_at?: string;
        };
        Relationships: [];
      };
      workspace_templates: {
        Row: {
          id: string;
          workspace_id: string;
          template_id: string;
          added_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          template_id: string;
          added_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          template_id?: string;
          added_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      workspace_activity: {
        Row: {
          id: string;
          workspace_id: string;
          actor_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          actor_id?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          actor_id?: string | null;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      templates: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          type: string;
          content: Json;
          is_public: boolean;
          is_default: boolean;
          workspace_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          type: string;
          content: Json;
          is_public?: boolean;
          is_default?: boolean;
          workspace_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          type?: string;
          content?: Json;
          is_public?: boolean;
          is_default?: boolean;
          workspace_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      showcase_ranked_feed: {
        Row: {
          base_score: number | null;
          breakdown: Json | null;
          content_ref: string | null;
          created_at: string | null;
          eng_score: number | null;
          experience_level:
            | Database["public"]["Enums"]["showcase_exp_level"]
            | null;
          fresh_score: number | null;
          id: string | null;
          qual_score: number | null;
          quality_score: number | null;
          report_count: number | null;
          role: string | null;
          status: Database["public"]["Enums"]["showcase_post_status"] | null;
          template_used: string | null;
          title: string | null;
          type: Database["public"]["Enums"]["showcase_post_type"] | null;
          user_id: string | null;
          visibility: Database["public"]["Enums"]["showcase_visibility"] | null;
        };
        Relationships: [];
      };
    };
    Functions: {
      increment_report_count: {
        Args: { post_id_arg: string; threshold: number };
        Returns: undefined;
      };
    };
    Enums: {
      showcase_event_type: "view" | "like" | "save" | "share" | "dwell";
      showcase_exp_level: "junior" | "mid" | "senior";
      showcase_post_status: "published" | "under_review" | "hidden";
      showcase_post_type: "resume" | "presentation";
      showcase_report_status: "pending" | "reviewed" | "dismissed";
      showcase_visibility: "public" | "unlisted" | "private";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      showcase_event_type: ["view", "like", "save", "share", "dwell"],
      showcase_exp_level: ["junior", "mid", "senior"],
      showcase_post_status: ["published", "under_review", "hidden"],
      showcase_post_type: ["resume", "presentation"],
      showcase_report_status: ["pending", "reviewed", "dismissed"],
      showcase_visibility: ["public", "unlisted", "private"],
    },
  },
} as const;
