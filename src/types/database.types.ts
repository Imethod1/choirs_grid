// Auto-generated types from Supabase schema
// In production: supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          phone: string;
          phone_verified_at: string | null;
          email: string | null;
          full_name: string;
          display_name: string | null;
          photo_url: string | null;
          date_of_birth: string | null;
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
          preferred_language: 'sw' | 'en';
          low_data_mode: boolean;
          biometric_enabled: boolean;
          failed_login_attempts: number;
          locked_until: string | null;
          last_login_at: string | null;
          last_login_ip: string | null;
          is_super_admin: boolean;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      choirs: {
        Row: {
          id: string;
          name: string;
          parish: string;
          diocese: string | null;
          region: string | null;
          country: string;
          logo_url: string | null;
          description: string | null;
          founded_year: number | null;
          monthly_dues_amount: number | null;
          dues_currency: string;
          settings: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['choirs']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['choirs']['Insert']>;
      };
      choir_members: {
        Row: {
          id: string;
          choir_id: string;
          user_id: string;
          role: 'super_admin' | 'choir_leader' | 'assistant_leader' | 'secretary' | 'treasurer' | 'music_teacher' | 'member';
          voice_part: 'soprano' | 'alto' | 'tenor' | 'bass' | null;
          status: 'active' | 'probation' | 'inactive' | 'alumni' | 'guest';
          joined_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['choir_members']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['choir_members']['Insert']>;
      };
      events: {
        Row: {
          id: string;
          choir_id: string;
          title: string;
          description: string | null;
          event_type: 'rehearsal' | 'mass' | 'wedding' | 'funeral' | 'concert' | 'meeting' | 'other';
          location: string | null;
          starts_at: string;
          ends_at: string | null;
          reminder_sent_24h: boolean;
          reminder_sent_2h: boolean;
          created_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['events']['Insert']>;
      };
      attendance_records: {
        Row: {
          id: string;
          event_id: string;
          member_id: string;
          status: 'present' | 'absent' | 'late' | 'excused';
          note: string | null;
          rsvp_response: 'yes' | 'no' | 'maybe' | null;
          rsvp_note: string | null;
          marked_by: string;
          marked_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['attendance_records']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['attendance_records']['Insert']>;
      };
      contributions: {
        Row: {
          id: string;
          choir_id: string;
          member_id: string;
          amount: number;
          currency: string;
          category: 'monthly_dues' | 'fundraiser' | 'special' | 'other';
          contribution_date: string;
          receipt_url: string | null;
          note: string | null;
          recorded_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['contributions']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['contributions']['Insert']>;
      };
      expenses: {
        Row: {
          id: string;
          choir_id: string;
          amount: number;
          currency: string;
          category: 'transport' | 'venue' | 'materials' | 'equipment' | 'meals' | 'other';
          expense_date: string;
          description: string;
          receipt_url: string | null;
          recorded_by: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['expenses']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['expenses']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          choir_id: string;
          sender_id: string;
          channel: 'sms' | 'push' | 'in_app';
          subject: string | null;
          body: string;
          target_type: 'all' | 'role' | 'voice_part' | 'individual';
          target_value: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      music_files: {
        Row: {
          id: string;
          choir_id: string;
          title: string;
          composer: string | null;
          file_type: 'pdf' | 'mp3' | 'aac';
          file_url: string;
          file_size_bytes: number | null;
          voice_parts: string[] | null;
          category: string | null;
          liturgical_season: string | null;
          copyright_confirmed: boolean;
          copyright_confirmed_by: string | null;
          copyright_confirmed_at: string | null;
          uploaded_by: string;
          uploaded_at: string;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['music_files']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['music_files']['Insert']>;
      };
      documents: {
        Row: {
          id: string;
          choir_id: string;
          folder: 'constitution' | 'minutes' | 'circulars' | 'reports' | 'other';
          title: string;
          is_sensitive: boolean;
          created_by: string;
          current_version_id: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          deleted_by: string | null;
        };
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['documents']['Insert']>;
      };
    };
  };
}

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

export type Role = ChoirMember['role'];
export type VoicePart = NonNullable<ChoirMember['voice_part']>;
export type MemberStatus = ChoirMember['status'];
export type EventType = Event['event_type'];
export type AttendanceStatus = AttendanceRecord['status'];
export type ContributionCategory = Contribution['category'];
export type ExpenseCategory = Expense['category'];
