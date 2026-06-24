-- ═══════════════════════════════════════════════════════════════════════════
-- CHOIRGRID — Production-Ready Database Schema
-- Catholic Choir Management System (Tanzania-focused)
-- 
-- This DDL creates ALL tables, constraints, indexes, triggers, and functions
-- required by the application. Run this BEFORE 001_rls_policies.sql.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Extensions ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";          -- gen_random_uuid() fallback
CREATE EXTENSION IF NOT EXISTS "pgcrypto";           -- hashing utilities
CREATE EXTENSION IF NOT EXISTS "pg_trgm";            -- trigram text search

-- ═══════════════════════════════════════════════════════════════════════════
-- ENUM TYPES
-- Using CHECK constraints is acceptable, but explicit ENUMs enforce at the
-- database level and improve query plans.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TYPE member_role AS ENUM (
  'super_admin', 'choir_leader', 'assistant_leader',
  'secretary', 'treasurer', 'music_teacher', 'member'
);

CREATE TYPE member_status AS ENUM (
  'active', 'probation', 'inactive', 'alumni', 'guest'
);

CREATE TYPE voice_part AS ENUM (
  'soprano', 'alto', 'tenor', 'bass'
);

CREATE TYPE attendance_status AS ENUM (
  'present', 'absent', 'late', 'excused'
);

CREATE TYPE rsvp_response AS ENUM (
  'going', 'not_going', 'maybe'
);

CREATE TYPE event_type AS ENUM (
  'rehearsal', 'mass', 'wedding', 'funeral', 'concert', 'meeting', 'other'
);

CREATE TYPE contribution_category AS ENUM (
  'monthly_dues', 'fundraiser', 'special', 'other'
);

CREATE TYPE expense_category AS ENUM (
  'transport', 'venue', 'materials', 'equipment', 'meals', 'other'
);

CREATE TYPE message_channel AS ENUM (
  'sms', 'push', 'in_app'
);

CREATE TYPE message_target_type AS ENUM (
  'all', 'role', 'voice_part', 'individual'
);

CREATE TYPE document_folder AS ENUM (
  'constitution', 'minutes', 'circulars', 'reports', 'other'
);

CREATE TYPE music_file_type AS ENUM (
  'pdf', 'mp3', 'aac'
);

CREATE TYPE consent_type AS ENUM (
  'terms_of_service', 'privacy_policy', 'data_processing'
);

CREATE TYPE audit_action AS ENUM (
  'create', 'update', 'delete', 'soft_delete', 'restore',
  'login', 'logout', 'failed_login', 'export'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- 1. USERS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE users (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone                TEXT NOT NULL UNIQUE,
  email                TEXT UNIQUE,
  full_name            TEXT NOT NULL,
  display_name         TEXT,
  gender               TEXT CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth        DATE,
  photo_url            TEXT,
  preferred_language   TEXT NOT NULL DEFAULT 'sw' CHECK (preferred_language IN ('en', 'sw')),
  biometric_enabled    BOOLEAN NOT NULL DEFAULT FALSE,
  low_data_mode        BOOLEAN NOT NULL DEFAULT FALSE,
  is_super_admin       BOOLEAN NOT NULL DEFAULT FALSE,
  failed_login_attempts INT NOT NULL DEFAULT 0,
  locked_until         TIMESTAMPTZ,
  last_login_at        TIMESTAMPTZ,
  last_login_ip        INET,
  phone_verified_at    TIMESTAMPTZ,
  deleted_at           TIMESTAMPTZ,
  deleted_by           UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT phone_e164 CHECK (phone ~ '^\+[1-9]\d{7,14}$')
);

CREATE INDEX idx_users_phone ON users (phone);
CREATE INDEX idx_users_email ON users (email) WHERE email IS NOT NULL;
CREATE INDEX idx_users_full_name_trgm ON users USING gin (full_name gin_trgm_ops);
CREATE INDEX idx_users_deleted_at ON users (deleted_at) WHERE deleted_at IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- 2. CHOIRS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE choirs (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,
  parish               TEXT NOT NULL,
  diocese              TEXT,
  region               TEXT,
  country              TEXT NOT NULL DEFAULT 'TZ',
  description          TEXT,
  logo_url             TEXT,
  founded_year         SMALLINT CHECK (founded_year >= 1800 AND founded_year <= 2100),
  monthly_dues_amount  NUMERIC(12,2) CHECK (monthly_dues_amount >= 0),
  dues_currency        TEXT NOT NULL DEFAULT 'TZS' CHECK (dues_currency ~ '^[A-Z]{3}$'),
  settings             JSONB NOT NULL DEFAULT '{}',
  deleted_at           TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_choirs_name ON choirs (name);
CREATE INDEX idx_choirs_parish ON choirs (parish);
CREATE INDEX idx_choirs_deleted_at ON choirs (deleted_at) WHERE deleted_at IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- 3. CHOIR_MEMBERS (join table: user ↔ choir)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE choir_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  choir_id    UUID NOT NULL REFERENCES choirs(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role        member_role NOT NULL DEFAULT 'member',
  voice_part  voice_part,
  status      member_status NOT NULL DEFAULT 'probation',
  joined_at   DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_choir_member UNIQUE (choir_id, user_id)
);

CREATE INDEX idx_choir_members_choir_id ON choir_members (choir_id);
CREATE INDEX idx_choir_members_user_id ON choir_members (user_id);
CREATE INDEX idx_choir_members_status ON choir_members (status);
CREATE INDEX idx_choir_members_role ON choir_members (role);
CREATE INDEX idx_choir_members_voice_part ON choir_members (voice_part) WHERE voice_part IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. EVENTS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  choir_id          UUID NOT NULL REFERENCES choirs(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  event_type        event_type NOT NULL DEFAULT 'rehearsal',
  description       TEXT,
  location          TEXT,
  starts_at         TIMESTAMPTZ NOT NULL,
  ends_at           TIMESTAMPTZ,
  reminder_sent_24h BOOLEAN NOT NULL DEFAULT FALSE,
  reminder_sent_2h  BOOLEAN NOT NULL DEFAULT FALSE,
  created_by        UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT events_end_after_start CHECK (ends_at IS NULL OR ends_at > starts_at)
);

CREATE INDEX idx_events_choir_id ON events (choir_id);
CREATE INDEX idx_events_starts_at ON events (starts_at);
CREATE INDEX idx_events_choir_upcoming ON events (choir_id, starts_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_events_reminders ON events (starts_at)
  WHERE deleted_at IS NULL AND (reminder_sent_24h = FALSE OR reminder_sent_2h = FALSE);

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. ATTENDANCE_RECORDS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE attendance_records (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  member_id     UUID NOT NULL REFERENCES choir_members(id) ON DELETE CASCADE,
  status        attendance_status NOT NULL DEFAULT 'absent',
  marked_by     UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  marked_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note          TEXT,
  rsvp_response rsvp_response,
  rsvp_note     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_attendance UNIQUE (event_id, member_id)
);

CREATE INDEX idx_attendance_event_id ON attendance_records (event_id);
CREATE INDEX idx_attendance_member_id ON attendance_records (member_id);
CREATE INDEX idx_attendance_status ON attendance_records (status);

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. ATTENDANCE_AUDIT_LOG
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE attendance_audit_log (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id          UUID NOT NULL REFERENCES attendance_records(id) ON DELETE CASCADE,
  actor_id           UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  action             TEXT NOT NULL,
  previous_value     JSONB,
  new_value          JSONB NOT NULL,
  reason             TEXT NOT NULL,
  ip_address         INET,
  device_fingerprint TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_att_audit_record ON attendance_audit_log (record_id);
CREATE INDEX idx_att_audit_actor ON attendance_audit_log (actor_id);
CREATE INDEX idx_att_audit_created ON attendance_audit_log (created_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. CONTRIBUTIONS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE contributions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  choir_id          UUID NOT NULL REFERENCES choirs(id) ON DELETE CASCADE,
  member_id         UUID NOT NULL REFERENCES choir_members(id) ON DELETE RESTRICT,
  amount            NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency          TEXT NOT NULL DEFAULT 'TZS' CHECK (currency ~ '^[A-Z]{3}$'),
  category          contribution_category NOT NULL DEFAULT 'monthly_dues',
  contribution_date DATE NOT NULL,
  note              TEXT,
  receipt_url       TEXT,
  recorded_by       UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  deleted_at        TIMESTAMPTZ,
  deleted_by        UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contributions_choir ON contributions (choir_id);
CREATE INDEX idx_contributions_member ON contributions (member_id);
CREATE INDEX idx_contributions_date ON contributions (contribution_date);
CREATE INDEX idx_contributions_category ON contributions (category);
CREATE INDEX idx_contributions_active ON contributions (choir_id, contribution_date)
  WHERE deleted_at IS NULL;
-- Duplicate detection index
CREATE INDEX idx_contributions_duplicate ON contributions (choir_id, member_id, amount, contribution_date)
  WHERE deleted_at IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- 8. EXPENSES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE expenses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  choir_id      UUID NOT NULL REFERENCES choirs(id) ON DELETE CASCADE,
  description   TEXT NOT NULL,
  amount        NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency      TEXT NOT NULL DEFAULT 'TZS' CHECK (currency ~ '^[A-Z]{3}$'),
  category      expense_category NOT NULL DEFAULT 'other',
  expense_date  DATE NOT NULL,
  receipt_url   TEXT,
  recorded_by   UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  deleted_at    TIMESTAMPTZ,
  deleted_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_expenses_choir ON expenses (choir_id);
CREATE INDEX idx_expenses_date ON expenses (expense_date);
CREATE INDEX idx_expenses_active ON expenses (choir_id, expense_date) WHERE deleted_at IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- 9. FINANCE_AUDIT_LOG (immutable)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE finance_audit_log (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  choir_id           UUID NOT NULL REFERENCES choirs(id) ON DELETE CASCADE,
  table_name         TEXT NOT NULL CHECK (table_name IN ('contributions', 'expenses')),
  record_id          UUID NOT NULL,
  action             TEXT NOT NULL,
  actor_id           UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  before_value       JSONB,
  after_value        JSONB NOT NULL,
  reason             TEXT NOT NULL,
  ip_address         INET,
  device_fingerprint TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_finance_audit_choir ON finance_audit_log (choir_id);
CREATE INDEX idx_finance_audit_record ON finance_audit_log (record_id);
CREATE INDEX idx_finance_audit_created ON finance_audit_log (created_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- 10. MESSAGES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  choir_id      UUID NOT NULL REFERENCES choirs(id) ON DELETE CASCADE,
  sender_id     UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  channel       message_channel NOT NULL DEFAULT 'in_app',
  subject       TEXT,
  body          TEXT NOT NULL,
  target_type   message_target_type NOT NULL DEFAULT 'all',
  target_value  TEXT,
  sent_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_choir ON messages (choir_id);
CREATE INDEX idx_messages_sender ON messages (sender_id);
CREATE INDEX idx_messages_created ON messages (created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- 11. MESSAGE_RECIPIENTS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE message_recipients (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id   UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  member_id    UUID NOT NULL REFERENCES choir_members(id) ON DELETE CASCADE,
  delivered    BOOLEAN NOT NULL DEFAULT FALSE,
  delivered_at TIMESTAMPTZ,
  read_at      TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_message_recipient UNIQUE (message_id, member_id)
);

CREATE INDEX idx_msg_recipients_message ON message_recipients (message_id);
CREATE INDEX idx_msg_recipients_member ON message_recipients (member_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 12. DOCUMENTS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE documents (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  choir_id           UUID NOT NULL REFERENCES choirs(id) ON DELETE CASCADE,
  folder             document_folder NOT NULL DEFAULT 'other',
  title              TEXT NOT NULL,
  is_sensitive       BOOLEAN NOT NULL DEFAULT FALSE,
  current_version_id UUID,  -- FK added after document_versions is created
  created_by         UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  deleted_at         TIMESTAMPTZ,
  deleted_by         UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documents_choir ON documents (choir_id);
CREATE INDEX idx_documents_folder ON documents (folder);
CREATE INDEX idx_documents_active ON documents (choir_id, folder) WHERE deleted_at IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- 13. DOCUMENT_VERSIONS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE document_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id     UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_number  INT NOT NULL,
  content         TEXT NOT NULL,
  saved_by        UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_doc_version UNIQUE (document_id, version_number)
);

CREATE INDEX idx_doc_versions_document ON document_versions (document_id);

-- Add the deferred FK from documents to document_versions
ALTER TABLE documents
  ADD CONSTRAINT documents_current_version_fk
  FOREIGN KEY (current_version_id) REFERENCES document_versions(id)
  ON DELETE SET NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- 14. MUSIC_FILES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE music_files (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  choir_id               UUID NOT NULL REFERENCES choirs(id) ON DELETE CASCADE,
  title                  TEXT NOT NULL,
  composer               TEXT,
  file_type              music_file_type NOT NULL,
  file_url               TEXT NOT NULL,
  file_size_bytes        INT CHECK (file_size_bytes >= 0),
  voice_parts            voice_part[],
  category               TEXT,
  liturgical_season       TEXT,
  copyright_confirmed    BOOLEAN NOT NULL DEFAULT FALSE,
  copyright_confirmed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  copyright_confirmed_at TIMESTAMPTZ,
  uploaded_by            UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  uploaded_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at             TIMESTAMPTZ,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_music_choir ON music_files (choir_id);
CREATE INDEX idx_music_title_trgm ON music_files USING gin (title gin_trgm_ops);
CREATE INDEX idx_music_active ON music_files (choir_id) WHERE deleted_at IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- 15. PRACTICE_RECORDINGS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE practice_recordings (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id               UUID NOT NULL REFERENCES choir_members(id) ON DELETE CASCADE,
  music_file_id           UUID REFERENCES music_files(id) ON DELETE SET NULL,
  title                   TEXT,
  encrypted_storage_path  TEXT NOT NULL,
  duration_seconds        INT CHECK (duration_seconds >= 0),
  deleted_at              TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_practice_member ON practice_recordings (member_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 16. POLLS & POLL_RESPONSES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE polls (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  choir_id    UUID NOT NULL REFERENCES choirs(id) ON DELETE CASCADE,
  question    TEXT NOT NULL,
  options     JSONB NOT NULL DEFAULT '[]',
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  closes_at   TIMESTAMPTZ,
  created_by  UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_polls_choir ON polls (choir_id);
CREATE INDEX idx_polls_active ON polls (choir_id) WHERE is_active = TRUE;

CREATE TABLE poll_responses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id     UUID NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
  option_id   TEXT NOT NULL,
  -- member_id intentionally omitted: anonymous voting per spec
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_poll_responses_poll ON poll_responses (poll_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 17. NOTIFICATIONS (FCM tokens)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE notifications (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id      UUID NOT NULL REFERENCES choir_members(id) ON DELETE CASCADE,
  fcm_token      TEXT NOT NULL,
  platform       TEXT CHECK (platform IN ('android', 'ios', 'web')),
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_member ON notifications (member_id);
CREATE UNIQUE INDEX idx_notifications_token ON notifications (fcm_token);

-- ═══════════════════════════════════════════════════════════════════════════
-- 18. OTP_CODES (used by send-otp / verify-otp edge functions)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE otp_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone       TEXT NOT NULL,
  otp_hash    TEXT NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used        BOOLEAN NOT NULL DEFAULT FALSE,
  attempts    INT NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT otp_phone_e164 CHECK (phone ~ '^\+[1-9]\d{7,14}$')
);

CREATE INDEX idx_otp_phone ON otp_codes (phone);
CREATE INDEX idx_otp_phone_recent ON otp_codes (phone, created_at DESC);
-- Auto-cleanup: old OTP records (optional pg_cron job)

-- ═══════════════════════════════════════════════════════════════════════════
-- 19. USER_CONSENTS (GDPR / data protection)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE user_consents (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  consent_type       consent_type NOT NULL,
  policy_version     TEXT NOT NULL,
  granted            BOOLEAN NOT NULL,
  granted_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  withdrawn_at       TIMESTAMPTZ,
  ip_address         INET,
  device_fingerprint TEXT NOT NULL,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consents_user ON user_consents (user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 20. USER_DEVICES
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE user_devices (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name        TEXT,
  user_agent         TEXT,
  trusted            BOOLEAN NOT NULL DEFAULT FALSE,
  last_seen_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_ip       INET,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_user_device UNIQUE (user_id, device_fingerprint)
);

CREATE INDEX idx_devices_user ON user_devices (user_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 21. USER_SESSIONS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE user_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id           UUID REFERENCES user_devices(id) ON DELETE SET NULL,
  refresh_token_hash  TEXT NOT NULL,
  expires_at          TIMESTAMPTZ NOT NULL,
  terminated_at       TIMESTAMPTZ,
  terminated_reason   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON user_sessions (user_id);
CREATE INDEX idx_sessions_active ON user_sessions (user_id) WHERE terminated_at IS NULL;

-- ═══════════════════════════════════════════════════════════════════════════
-- 22. REPORT_EXPORTS
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE report_exports (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  choir_id       UUID REFERENCES choirs(id) ON DELETE SET NULL,
  report_type    TEXT NOT NULL,
  file_url       TEXT NOT NULL,
  requested_by   UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  mfa_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  expires_at     TIMESTAMPTZ NOT NULL,
  downloaded_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reports_choir ON report_exports (choir_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- 23. AUDIT_LOG (master — immutable)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE audit_log (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  choir_id           UUID REFERENCES choirs(id) ON DELETE SET NULL,
  actor_id           UUID REFERENCES users(id) ON DELETE SET NULL,
  action             TEXT NOT NULL,
  entity_type        TEXT NOT NULL,
  entity_id          TEXT,
  metadata           JSONB,
  ip_address         INET,
  device_fingerprint TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_choir ON audit_log (choir_id);
CREATE INDEX idx_audit_actor ON audit_log (actor_id);
CREATE INDEX idx_audit_entity ON audit_log (entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_log (created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- AUTO updated_at TRIGGER
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name FROM information_schema.columns
    WHERE column_name = 'updated_at'
      AND table_schema = 'public'
      AND table_name NOT IN ('audit_log', 'finance_audit_log', 'attendance_audit_log')
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at()',
      tbl, tbl
    );
  END LOOP;
END
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- CRON CLEANUP: expired OTP codes (run daily via pg_cron)
-- Uncomment after enabling pg_cron extension:
--
-- SELECT cron.schedule(
--   'cleanup-expired-otps',
--   '0 3 * * *',  -- 3 AM daily
--   $$DELETE FROM otp_codes WHERE expires_at < NOW() - INTERVAL '24 hours'$$
-- );
-- ═══════════════════════════════════════════════════════════════════════════
