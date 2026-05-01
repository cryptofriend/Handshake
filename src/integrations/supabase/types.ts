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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      agent_api_keys: {
        Row: {
          agent_name: string
          api_key_hash: string
          created_at: string
          id: string
          is_active: boolean
          last_used_at: string | null
          telegram_bot_token: string | null
          wallet_address: string
        }
        Insert: {
          agent_name: string
          api_key_hash: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          telegram_bot_token?: string | null
          wallet_address: string
        }
        Update: {
          agent_name?: string
          api_key_hash?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          telegram_bot_token?: string | null
          wallet_address?: string
        }
        Relationships: []
      }
      agreement_drafts: {
        Row: {
          allocations: Json | null
          created_at: string
          full_response: Json | null
          full_text: string | null
          id: string
          missing_fields: Json | null
          parties: Json
          session_id: string
          status: string
          summary: string | null
          terms: Json
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          allocations?: Json | null
          created_at?: string
          full_response?: Json | null
          full_text?: string | null
          id?: string
          missing_fields?: Json | null
          parties?: Json
          session_id: string
          status?: string
          summary?: string | null
          terms?: Json
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          allocations?: Json | null
          created_at?: string
          full_response?: Json | null
          full_text?: string | null
          id?: string
          missing_fields?: Json | null
          parties?: Json
          session_id?: string
          status?: string
          summary?: string | null
          terms?: Json
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      agreement_events: {
        Row: {
          agreement_id: string
          created_at: string
          event_type: string
          id: string
          metadata_json: Json | null
          participant_id: string | null
          telegram_user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          agreement_id: string
          created_at?: string
          event_type: string
          id?: string
          metadata_json?: Json | null
          participant_id?: string | null
          telegram_user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          agreement_id?: string
          created_at?: string
          event_type?: string
          id?: string
          metadata_json?: Json | null
          participant_id?: string | null
          telegram_user_id?: string | null
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agreement_events_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "agreement_drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreement_events_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "agreement_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      agreement_invites: {
        Row: {
          agreement_id: string
          created_at: string
          id: string
          invite_token: string
          opened_at: string | null
          opened_by_telegram_user_id: string | null
          participant_id: string | null
          status: string
        }
        Insert: {
          agreement_id: string
          created_at?: string
          id?: string
          invite_token: string
          opened_at?: string | null
          opened_by_telegram_user_id?: string | null
          participant_id?: string | null
          status?: string
        }
        Update: {
          agreement_id?: string
          created_at?: string
          id?: string
          invite_token?: string
          opened_at?: string | null
          opened_by_telegram_user_id?: string | null
          participant_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "agreement_invites_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "agreement_drafts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreement_invites_participant_id_fkey"
            columns: ["participant_id"]
            isOneToOne: false
            referencedRelation: "agreement_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      agreement_participants: {
        Row: {
          agreement_id: string
          created_at: string
          id: string
          invited_at: string | null
          name: string
          opened_at: string | null
          role: string | null
          signature_status: string
          signed_at: string | null
          telegram_user_id: string | null
          viewed_at: string | null
          wallet_address: string | null
        }
        Insert: {
          agreement_id: string
          created_at?: string
          id?: string
          invited_at?: string | null
          name: string
          opened_at?: string | null
          role?: string | null
          signature_status?: string
          signed_at?: string | null
          telegram_user_id?: string | null
          viewed_at?: string | null
          wallet_address?: string | null
        }
        Update: {
          agreement_id?: string
          created_at?: string
          id?: string
          invited_at?: string | null
          name?: string
          opened_at?: string | null
          role?: string | null
          signature_status?: string
          signed_at?: string | null
          telegram_user_id?: string | null
          viewed_at?: string | null
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agreement_participants_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "agreement_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      agreement_signatures: {
        Row: {
          agreement_id: string
          blockchain_status: string
          created_at: string
          id: string
          party_name: string | null
          signature_method: string
          signed_at: string | null
          tx_hash: string | null
          wallet_address: string
        }
        Insert: {
          agreement_id: string
          blockchain_status?: string
          created_at?: string
          id?: string
          party_name?: string | null
          signature_method?: string
          signed_at?: string | null
          tx_hash?: string | null
          wallet_address: string
        }
        Update: {
          agreement_id?: string
          blockchain_status?: string
          created_at?: string
          id?: string
          party_name?: string | null
          signature_method?: string
          signed_at?: string | null
          tx_hash?: string | null
          wallet_address?: string
        }
        Relationships: [
          {
            foreignKeyName: "agreement_signatures_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "agreement_drafts"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          agreement_id: string | null
          content: string
          created_at: string
          handshake_status: string | null
          id: string
          raw_response: Json | null
          role: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          agreement_id?: string | null
          content: string
          created_at?: string
          handshake_status?: string | null
          id?: string
          raw_response?: Json | null
          role: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          agreement_id?: string | null
          content?: string
          created_at?: string
          handshake_status?: string | null
          id?: string
          raw_response?: Json | null
          role?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_config: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string
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
