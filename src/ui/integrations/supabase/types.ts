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
      authority_performance: {
        Row: {
          authority_id: string
          avg_resolution_hours: number | null
          complaints_assigned: number
          complaints_resolved: number
          created_at: string
          date: string
          id: string
          sla_breaches: number
        }
        Insert: {
          authority_id: string
          avg_resolution_hours?: number | null
          complaints_assigned?: number
          complaints_resolved?: number
          created_at?: string
          date: string
          id?: string
          sla_breaches?: number
        }
        Update: {
          authority_id?: string
          avg_resolution_hours?: number | null
          complaints_assigned?: number
          complaints_resolved?: number
          created_at?: string
          date?: string
          id?: string
          sla_breaches?: number
        }
        Relationships: []
      }
      authority_wards: {
        Row: {
          assigned_at: string
          id: string
          user_id: string
          ward_id: string
        }
        Insert: {
          assigned_at?: string
          id?: string
          user_id: string
          ward_id: string
        }
        Update: {
          assigned_at?: string
          id?: string
          user_id?: string
          ward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "authority_wards_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      complaint_categories: {
        Row: {
          base_weight: number
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          base_weight?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          base_weight?: number
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      complaint_updates: {
        Row: {
          complaint_id: string
          content: string | null
          created_at: string
          id: string
          is_public: boolean
          new_status: string | null
          previous_status: string | null
          update_type: string
          user_id: string
        }
        Insert: {
          complaint_id: string
          content?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          new_status?: string | null
          previous_status?: string | null
          update_type: string
          user_id: string
        }
        Update: {
          complaint_id?: string
          content?: string | null
          created_at?: string
          id?: string
          is_public?: boolean
          new_status?: string | null
          previous_status?: string | null
          update_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_updates_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaint_updates_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          address: string
          assigned_authority_id: string | null
          category_id: string
          citizen_id: string
          closed_at: string | null
          created_at: string
          description: string
          id: string
          resolution_notes: string | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["severity_level"]
          severity_score: number
          sla_breached: boolean
          sla_deadline: string | null
          status: Database["public"]["Enums"]["complaint_status"]
          title: string
          updated_at: string
          ward_id: string
        }
        Insert: {
          address: string
          assigned_authority_id?: string | null
          category_id: string
          citizen_id: string
          closed_at?: string | null
          created_at?: string
          description: string
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["severity_level"]
          severity_score?: number
          sla_breached?: boolean
          sla_deadline?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          title: string
          updated_at?: string
          ward_id: string
        }
        Update: {
          address?: string
          assigned_authority_id?: string | null
          category_id?: string
          citizen_id?: string
          closed_at?: string | null
          created_at?: string
          description?: string
          id?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["severity_level"]
          severity_score?: number
          sla_breached?: boolean
          sla_deadline?: string | null
          status?: Database["public"]["Enums"]["complaint_status"]
          title?: string
          updated_at?: string
          ward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "complaint_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_ward_stats: {
        Row: {
          avg_resolution_hours: number | null
          category_breakdown: Json | null
          created_at: string
          date: string
          id: string
          resolved_complaints: number
          severity_breakdown: Json | null
          sla_breached_count: number
          total_complaints: number
          ward_id: string
        }
        Insert: {
          avg_resolution_hours?: number | null
          category_breakdown?: Json | null
          created_at?: string
          date: string
          id?: string
          resolved_complaints?: number
          severity_breakdown?: Json | null
          sla_breached_count?: number
          total_complaints?: number
          ward_id: string
        }
        Update: {
          avg_resolution_hours?: number | null
          category_breakdown?: Json | null
          created_at?: string
          date?: string
          id?: string
          resolved_complaints?: number
          severity_breakdown?: Json | null
          sla_breached_count?: number
          total_complaints?: number
          ward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_ward_stats_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      escalation_history: {
        Row: {
          complaint_id: string
          created_at: string
          id: string
          new_score: number
          new_severity: Database["public"]["Enums"]["severity_level"]
          previous_score: number
          previous_severity: Database["public"]["Enums"]["severity_level"]
          reason: string
          related_complaint_ids: string[] | null
          triggered_by: string
        }
        Insert: {
          complaint_id: string
          created_at?: string
          id?: string
          new_score: number
          new_severity: Database["public"]["Enums"]["severity_level"]
          previous_score: number
          previous_severity: Database["public"]["Enums"]["severity_level"]
          reason: string
          related_complaint_ids?: string[] | null
          triggered_by: string
        }
        Update: {
          complaint_id?: string
          created_at?: string
          id?: string
          new_score?: number
          new_severity?: Database["public"]["Enums"]["severity_level"]
          previous_score?: number
          previous_severity?: Database["public"]["Enums"]["severity_level"]
          reason?: string
          related_complaint_ids?: string[] | null
          triggered_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "escalation_history_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_history_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          complaint_id: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          complaint_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          complaint_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
          ward_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          full_name: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
          ward_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          ward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      severity_keywords: {
        Row: {
          boost_value: number
          category_id: string | null
          created_at: string
          id: string
          is_active: boolean
          keyword: string
        }
        Insert: {
          boost_value?: number
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          keyword: string
        }
        Update: {
          boost_value?: number
          category_id?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          keyword?: string
        }
        Relationships: [
          {
            foreignKeyName: "severity_keywords_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "complaint_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      system_config: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
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
      wards: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_sensitive: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      complaints_safe: {
        Row: {
          address: string | null
          assigned_authority_id: string | null
          category_id: string | null
          citizen_id: string | null
          closed_at: string | null
          created_at: string | null
          description: string | null
          id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["severity_level"] | null
          severity_score: number | null
          sla_breached: boolean | null
          sla_deadline: string | null
          status: Database["public"]["Enums"]["complaint_status"] | null
          title: string | null
          updated_at: string | null
          ward_id: string | null
        }
        Insert: {
          address?: never
          assigned_authority_id?: string | null
          category_id?: string | null
          citizen_id?: string | null
          closed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["severity_level"] | null
          severity_score?: number | null
          sla_breached?: boolean | null
          sla_deadline?: string | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          title?: string | null
          updated_at?: string | null
          ward_id?: string | null
        }
        Update: {
          address?: never
          assigned_authority_id?: string | null
          category_id?: string | null
          citizen_id?: string | null
          closed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["severity_level"] | null
          severity_score?: number | null
          sla_breached?: boolean | null
          sla_deadline?: string | null
          status?: Database["public"]["Enums"]["complaint_status"] | null
          title?: string | null
          updated_at?: string | null
          ward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "complaints_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "complaint_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "complaints_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_authority_wards: { Args: { _user_id: string }; Returns: string[] }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_authority_for_ward: {
        Args: { _user_id: string; _ward_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "citizen" | "authority" | "admin"
      complaint_status:
        | "pending"
        | "assigned"
        | "in_progress"
        | "resolved"
        | "closed"
      severity_level: "very_low" | "low" | "medium" | "high" | "critical"
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
    Enums: {
      app_role: ["citizen", "authority", "admin"],
      complaint_status: [
        "pending",
        "assigned",
        "in_progress",
        "resolved",
        "closed",
      ],
      severity_level: ["very_low", "low", "medium", "high", "critical"],
    },
  },
} as const
