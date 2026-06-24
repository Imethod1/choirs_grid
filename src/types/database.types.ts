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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      attendance_audit_log: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          device_fingerprint: string | null
          id: string
          ip_address: unknown
          new_value: Json
          previous_value: Json | null
          reason: string
          record_id: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown
          new_value: Json
          previous_value?: Json | null
          reason: string
          record_id: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown
          new_value?: Json
          previous_value?: Json | null
          reason?: string
          record_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_audit_log_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "attendance_records"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          created_at: string
          event_id: string
          id: string
          marked_at: string
          marked_by: string
          member_id: string
          note: string | null
          rsvp_note: string | null
          rsvp_response: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          marked_at?: string
          marked_by: string
          member_id: string
          note?: string | null
          rsvp_note?: string | null
          rsvp_response?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          marked_at?: string
          marked_by?: string
          member_id?: string
          note?: string | null
          rsvp_note?: string | null
          rsvp_response?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "choir_members"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          choir_id: string | null
          created_at: string
          device_fingerprint: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          choir_id?: string | null
          created_at?: string
          device_fingerprint?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          choir_id?: string | null
          created_at?: string
          device_fingerprint?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_choir_id_fkey"
            columns: ["choir_id"]
            isOneToOne: false
            referencedRelation: "choirs"
            referencedColumns: ["id"]
          },
        ]
      }
      choir_members: {
        Row: {
          choir_id: string
          created_at: string
          id: string
          joined_at: string | null
          notes: string | null
          role: string
          status: string
          updated_at: string
          user_id: string
          voice_part: string | null
        }
        Insert: {
          choir_id: string
          created_at?: string
          id?: string
          joined_at?: string | null
          notes?: string | null
          role: string
          status?: string
          updated_at?: string
          user_id: string
          voice_part?: string | null
        }
        Update: {
          choir_id?: string
          created_at?: string
          id?: string
          joined_at?: string | null
          notes?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
          voice_part?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "choir_members_choir_id_fkey"
            columns: ["choir_id"]
            isOneToOne: false
            referencedRelation: "choirs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "choir_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      choirs: {
        Row: {
          country: string
          created_at: string
          deleted_at: string | null
          description: string | null
          diocese: string | null
          dues_currency: string
          founded_year: number | null
          id: string
          logo_url: string | null
          monthly_dues_amount: number | null
          name: string
          parish: string
          region: string | null
          settings: Json
          updated_at: string
        }
        Insert: {
          country?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          diocese?: string | null
          dues_currency?: string
          founded_year?: number | null
          id?: string
          logo_url?: string | null
          monthly_dues_amount?: number | null
          name: string
          parish: string
          region?: string | null
          settings?: Json
          updated_at?: string
        }
        Update: {
          country?: string
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          diocese?: string | null
          dues_currency?: string
          founded_year?: number | null
          id?: string
          logo_url?: string | null
          monthly_dues_amount?: number | null
          name?: string
          parish?: string
          region?: string | null
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      contributions: {
        Row: {
          amount: number
          category: string
          choir_id: string
          contribution_date: string
          created_at: string
          currency: string
          deleted_at: string | null
          deleted_by: string | null
          id: string
          member_id: string
          note: string | null
          receipt_url: string | null
          recorded_by: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          choir_id: string
          contribution_date: string
          created_at?: string
          currency?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          member_id: string
          note?: string | null
          receipt_url?: string | null
          recorded_by: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          choir_id?: string
          contribution_date?: string
          created_at?: string
          currency?: string
          deleted_at?: string | null
          deleted_by?: string | null
          id?: string
          member_id?: string
          note?: string | null
          receipt_url?: string | null
          recorded_by?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "contributions_choir_id_fkey"
            columns: ["choir_id"]
            isOneToOne: false
            referencedRelation: "choirs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "choir_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contributions_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          content: string
          created_at: string
          document_id: string
          id: string
          saved_by: string
          version_number: number
        }
        Insert: {
          content: string
          created_at?: string
          document_id: string
          id?: string
          saved_by: string
          version_number: number
        }
        Update: {
          content?: string
          created_at?: string
          document_id?: string
          id?: string
          saved_by?: string
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_saved_by_fkey"
            columns: ["saved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          choir_id: string
          created_at: string
          created_by: string
          current_version_id: string | null
          deleted_at: string | null
          deleted_by: string | null
          folder: string
          id: string
          is_sensitive: boolean
          title: string
          updated_at: string
        }
        Insert: {
          choir_id: string
          created_at?: string
          created_by: string
          current_version_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          folder: string
          id?: string
          is_sensitive?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          choir_id?: string
          created_at?: string
          created_by?: string
          current_version_id?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          folder?: string
          id?: string
          is_sensitive?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_choir_id_fkey"
            columns: ["choir_id"]
            isOneToOne: false
            referencedRelation: "choirs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          choir_id: string
          created_at: string
          created_by: string
          deleted_at: string | null
          description: string | null
          ends_at: string | null
          event_type: string
          id: string
          location: string | null
          reminder_sent_24h: boolean
          reminder_sent_2h: boolean
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          choir_id: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          description?: string | null
          ends_at?: string | null
          event_type: string
          id?: string
          location?: string | null
          reminder_sent_24h?: boolean
          reminder_sent_2h?: boolean
          starts_at: string
          title: string
          updated_at?: string
        }
        Update: {
          choir_id?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          description?: string | null
          ends_at?: string | null
          event_type?: string
          id?: string
          location?: string | null
          reminder_sent_24h?: boolean
          reminder_sent_2h?: boolean
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_choir_id_fkey"
            columns: ["choir_id"]
            isOneToOne: false
            referencedRelation: "choirs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          choir_id: string
          created_at: string
          currency: string
          deleted_at: string | null
          deleted_by: string | null
          description: string
          expense_date: string
          id: string
          receipt_url: string | null
          recorded_by: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          choir_id: string
          created_at?: string
          currency?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description: string
          expense_date: string
          id?: string
          receipt_url?: string | null
          recorded_by: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          choir_id?: string
          created_at?: string
          currency?: string
          deleted_at?: string | null
          deleted_by?: string | null
          description?: string
          expense_date?: string
          id?: string
          receipt_url?: string | null
          recorded_by?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_choir_id_fkey"
            columns: ["choir_id"]
            isOneToOne: false
            referencedRelation: "choirs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_audit_log: {
        Row: {
          action: string
          actor_id: string
          after_value: Json
          before_value: Json | null
          choir_id: string
          created_at: string
          device_fingerprint: string | null
          id: string
          ip_address: unknown
          reason: string
          record_id: string
          table_name: string
        }
        Insert: {
          action: string
          actor_id: string
          after_value: Json
          before_value?: Json | null
          choir_id: string
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown
          reason: string
          record_id: string
          table_name: string
        }
        Update: {
          action?: string
          actor_id?: string
          after_value?: Json
          before_value?: Json | null
          choir_id?: string
          created_at?: string
          device_fingerprint?: string | null
          id?: string
          ip_address?: unknown
          reason?: string
          record_id?: string
          table_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_audit_log_choir_id_fkey"
            columns: ["choir_id"]
            isOneToOne: false
            referencedRelation: "choirs"
            referencedColumns: ["id"]
          },
        ]
      }
      message_recipients: {
        Row: {
          created_at: string
          delivered: boolean
          delivered_at: string | null
          id: string
          member_id: string
          message_id: string
          read_at: string | null
        }
        Insert: {
          created_at?: string
          delivered?: boolean
          delivered_at?: string | null
          id?: string
          member_id: string
          message_id: string
          read_at?: string | null
        }
        Update: {
          created_at?: string
          delivered?: boolean
          delivered_at?: string | null
          id?: string
          member_id?: string
          message_id?: string
          read_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "message_recipients_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "choir_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_recipients_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          channel: string
          choir_id: string
          created_at: string
          id: string
          sender_id: string
          sent_at: string | null
          subject: string | null
          target_type: string
          target_value: string | null
        }
        Insert: {
          body: string
          channel: string
          choir_id: string
          created_at?: string
          id?: string
          sender_id: string
          sent_at?: string | null
          subject?: string | null
          target_type: string
          target_value?: string | null
        }
        Update: {
          body?: string
          channel?: string
          choir_id?: string
          created_at?: string
          id?: string
          sender_id?: string
          sent_at?: string | null
          subject?: string | null
          target_type?: string
          target_value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_choir_id_fkey"
            columns: ["choir_id"]
            isOneToOne: false
            referencedRelation: "choirs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      music_files: {
        Row: {
          category: string | null
          choir_id: string
          composer: string | null
          copyright_confirmed: boolean
          copyright_confirmed_at: string | null
          copyright_confirmed_by: string | null
          created_at: string
          deleted_at: string | null
          file_size_bytes: number | null
          file_type: string
          file_url: string
          id: string
          liturgical_season: string | null
          title: string
          uploaded_at: string
          uploaded_by: string
          voice_parts: string[] | null
        }
        Insert: {
          category?: string | null
          choir_id: string
          composer?: string | null
          copyright_confirmed?: boolean
          copyright_confirmed_at?: string | null
          copyright_confirmed_by?: string | null
          created_at?: string
          deleted_at?: string | null
          file_size_bytes?: number | null
          file_type: string
          file_url: string
          id?: string
          liturgical_season?: string | null
          title: string
          uploaded_at?: string
          uploaded_by: string
          voice_parts?: string[] | null
        }
        Update: {
          category?: string | null
          choir_id?: string
          composer?: string | null
          copyright_confirmed?: boolean
          copyright_confirmed_at?: string | null
          copyright_confirmed_by?: string | null
          created_at?: string
          deleted_at?: string | null
          file_size_bytes?: number | null
          file_type?: string
          file_url?: string
          id?: string
          liturgical_season?: string | null
          title?: string
          uploaded_at?: string
          uploaded_by?: string
          voice_parts?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "music_files_choir_id_fkey"
            columns: ["choir_id"]
            isOneToOne: false
            referencedRelation: "choirs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_files_copyright_confirmed_by_fkey"
            columns: ["copyright_confirmed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "music_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          fcm_token: string
          id: string
          last_active_at: string
          member_id: string
          platform: string | null
        }
        Insert: {
          created_at?: string
          fcm_token: string
          id?: string
          last_active_at?: string
          member_id: string
          platform?: string | null
        }
        Update: {
          created_at?: string
          fcm_token?: string
          id?: string
          last_active_at?: string
          member_id?: string
          platform?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "choir_members"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_responses: {
        Row: {
          created_at: string
          id: string
          option_id: string
          poll_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          poll_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          poll_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_responses_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          choir_id: string
          closes_at: string | null
          created_at: string
          created_by: string
          id: string
          is_active: boolean
          options: Json
          question: string
          updated_at: string
        }
        Insert: {
          choir_id: string
          closes_at?: string | null
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean
          options: Json
          question: string
          updated_at?: string
        }
        Update: {
          choir_id?: string
          closes_at?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean
          options?: Json
          question?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_choir_id_fkey"
            columns: ["choir_id"]
            isOneToOne: false
            referencedRelation: "choirs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polls_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_recordings: {
        Row: {
          created_at: string
          deleted_at: string | null
          duration_seconds: number | null
          encrypted_storage_path: string
          id: string
          member_id: string
          music_file_id: string | null
          title: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          duration_seconds?: number | null
          encrypted_storage_path: string
          id?: string
          member_id: string
          music_file_id?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          duration_seconds?: number | null
          encrypted_storage_path?: string
          id?: string
          member_id?: string
          music_file_id?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_recordings_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "choir_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_recordings_music_file_id_fkey"
            columns: ["music_file_id"]
            isOneToOne: false
            referencedRelation: "music_files"
            referencedColumns: ["id"]
          },
        ]
      }
      report_exports: {
        Row: {
          choir_id: string | null
          created_at: string
          downloaded_at: string | null
          expires_at: string
          file_url: string
          id: string
          mfa_verified: boolean
          report_type: string
          requested_by: string
        }
        Insert: {
          choir_id?: string | null
          created_at?: string
          downloaded_at?: string | null
          expires_at: string
          file_url: string
          id?: string
          mfa_verified?: boolean
          report_type: string
          requested_by: string
        }
        Update: {
          choir_id?: string | null
          created_at?: string
          downloaded_at?: string | null
          expires_at?: string
          file_url?: string
          id?: string
          mfa_verified?: boolean
          report_type?: string
          requested_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_exports_choir_id_fkey"
            columns: ["choir_id"]
            isOneToOne: false
            referencedRelation: "choirs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_exports_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_consents: {
        Row: {
          consent_type: string
          created_at: string
          device_fingerprint: string
          granted: boolean
          granted_at: string
          id: string
          ip_address: unknown
          policy_version: string
          user_id: string
          withdrawn_at: string | null
        }
        Insert: {
          consent_type: string
          created_at?: string
          device_fingerprint: string
          granted: boolean
          granted_at?: string
          id?: string
          ip_address: unknown
          policy_version: string
          user_id: string
          withdrawn_at?: string | null
        }
        Update: {
          consent_type?: string
          created_at?: string
          device_fingerprint?: string
          granted?: boolean
          granted_at?: string
          id?: string
          ip_address?: unknown
          policy_version?: string
          user_id?: string
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_consents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_devices: {
        Row: {
          created_at: string
          device_fingerprint: string
          device_name: string | null
          id: string
          last_seen_at: string
          last_seen_ip: unknown
          trusted: boolean
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_fingerprint: string
          device_name?: string | null
          id?: string
          last_seen_at?: string
          last_seen_ip?: unknown
          trusted?: boolean
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_fingerprint?: string
          device_name?: string | null
          id?: string
          last_seen_at?: string
          last_seen_ip?: unknown
          trusted?: boolean
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_devices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string
          device_id: string | null
          expires_at: string
          id: string
          refresh_token_hash: string
          terminated_at: string | null
          terminated_reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          expires_at: string
          id?: string
          refresh_token_hash: string
          terminated_at?: string | null
          terminated_reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_id?: string | null
          expires_at?: string
          id?: string
          refresh_token_hash?: string
          terminated_at?: string | null
          terminated_reason?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "user_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          biometric_enabled: boolean
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          deleted_by: string | null
          display_name: string | null
          email: string | null
          failed_login_attempts: number
          full_name: string
          gender: string | null
          id: string
          is_super_admin: boolean
          last_login_at: string | null
          last_login_ip: unknown
          locked_until: string | null
          low_data_mode: boolean
          phone: string
          phone_verified_at: string | null
          photo_url: string | null
          preferred_language: string
          updated_at: string
        }
        Insert: {
          biometric_enabled?: boolean
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_name?: string | null
          email?: string | null
          failed_login_attempts?: number
          full_name: string
          gender?: string | null
          id?: string
          is_super_admin?: boolean
          last_login_at?: string | null
          last_login_ip?: unknown
          locked_until?: string | null
          low_data_mode?: boolean
          phone: string
          phone_verified_at?: string | null
          photo_url?: string | null
          preferred_language?: string
          updated_at?: string
        }
        Update: {
          biometric_enabled?: boolean
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          deleted_by?: string | null
          display_name?: string | null
          email?: string | null
          failed_login_attempts?: number
          full_name?: string
          gender?: string | null
          id?: string
          is_super_admin?: boolean
          last_login_at?: string | null
          last_login_ip?: unknown
          locked_until?: string | null
          low_data_mode?: boolean
          phone?: string
          phone_verified_at?: string | null
          photo_url?: string | null
          preferred_language?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_deleted_by_fkey"
            columns: ["deleted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_choir_role: {
        Args: { p_choir_id: string; p_roles: string[] }
        Returns: boolean
      }
      is_active_member: { Args: { p_choir_id: string }; Returns: boolean }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

// Convenience type aliases
export type User = Database['public']['Tables']['users']['Row'];
export type Choir = Database['public']['Tables']['choirs']['Row'];
export type ChoirMember = Database['public']['Tables']['choir_members']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type AttendanceRecord = Database['public']['Tables']['attendance_records']['Row'];
export type Contribution = Database['public']['Tables']['contributions']['Row'];
export type Expense = Database['public']['Tables']['expenses']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type MusicFile = Database['public']['Tables']['music_files']['Row'];
export type Document = Database['public']['Tables']['documents']['Row'];
export type Poll = Database['public']['Tables']['polls']['Row'];
export type PollResponse = Database['public']['Tables']['poll_responses']['Row'];
export type FinanceAuditLog = Database['public']['Tables']['finance_audit_log']['Row'];

// Application-level enum types (mirrors database enums)
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type RsvpResponse = 'going' | 'not_going' | 'maybe';
export type MemberRole = 'super_admin' | 'choir_leader' | 'assistant_leader' | 'secretary' | 'treasurer' | 'music_teacher' | 'member';
export type MemberStatus = 'active' | 'probation' | 'inactive' | 'alumni' | 'guest';
export type VoicePart = 'soprano' | 'alto' | 'tenor' | 'bass';
export type EventType = 'rehearsal' | 'mass' | 'wedding' | 'funeral' | 'concert' | 'meeting' | 'other';
export type ContributionCategory = 'monthly_dues' | 'fundraiser' | 'special' | 'other';
export type ExpenseCategory = 'transport' | 'venue' | 'materials' | 'equipment' | 'meals' | 'other';
export type MessageChannel = 'sms' | 'push' | 'in_app';
export type MessageTargetType = 'all' | 'role' | 'voice_part' | 'individual';
export type DocumentFolder = 'constitution' | 'minutes' | 'circulars' | 'reports' | 'other';
