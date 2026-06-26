-- ═══════════════════════════════════════════════════════
-- RLS Policies — Choir App
-- Run after 000_schema.sql (which creates ENUM types)
--
-- IMPORTANT: The schema uses PostgreSQL ENUMs (member_role,
-- member_status, etc.). RLS helper functions accept TEXT/TEXT[]
-- parameters for compatibility with Supabase client libraries.
-- We cast enum columns to TEXT where they are compared against
-- text literals or text arrays.
-- ═══════════════════════════════════════════════════════

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE choirs ENABLE ROW LEVEL SECURITY;
ALTER TABLE choir_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- ── Helper: Check active membership in a choir ─────────
-- Cast status::TEXT so the enum compares against text literals.
CREATE OR REPLACE FUNCTION is_active_member(p_choir_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM choir_members
    WHERE choir_id = p_choir_id
      AND user_id = auth.uid()
      AND status::TEXT IN ('active', 'probation')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Helper: Check role in a choir ──────────────────────
-- Cast role::TEXT and status::TEXT so they compare against text values.
CREATE OR REPLACE FUNCTION has_choir_role(p_choir_id UUID, p_roles TEXT[])
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM choir_members
    WHERE choir_id = p_choir_id
      AND user_id = auth.uid()
      AND status::TEXT IN ('active', 'probation')
      AND role::TEXT = ANY(p_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ═══════════════════════════════════════════════════════
-- users: Self-only access
-- ═══════════════════════════════════════════════════════
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE USING (auth.uid() = id);

-- ═══════════════════════════════════════════════════════
-- choir_members: Active members can read; leaders can write
-- ═══════════════════════════════════════════════════════
CREATE POLICY "Members can view choir roster"
  ON choir_members FOR SELECT
  USING (is_active_member(choir_id));

CREATE POLICY "Leaders can manage members"
  ON choir_members FOR ALL
  USING (has_choir_role(choir_id, ARRAY['choir_leader', 'assistant_leader', 'super_admin']));

-- ═══════════════════════════════════════════════════════
-- events: Active members can read; leaders can write
-- ═══════════════════════════════════════════════════════
CREATE POLICY "Members can view events"
  ON events FOR SELECT
  USING (is_active_member(choir_id));

CREATE POLICY "Leaders can manage events"
  ON events FOR ALL
  USING (has_choir_role(choir_id, ARRAY['choir_leader', 'assistant_leader', 'super_admin']));

-- ═══════════════════════════════════════════════════════
-- attendance_records: Leaders see all; members see own only
-- ═══════════════════════════════════════════════════════
CREATE POLICY "Leaders can view all attendance"
  ON attendance_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_id
        AND has_choir_role(e.choir_id, ARRAY['choir_leader', 'assistant_leader', 'super_admin'])
    )
  );

CREATE POLICY "Members can view own attendance"
  ON attendance_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM choir_members cm
      WHERE cm.id = member_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Leaders can mark attendance"
  ON attendance_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_id
        AND has_choir_role(e.choir_id, ARRAY['choir_leader', 'assistant_leader', 'super_admin'])
    )
  );

CREATE POLICY "Leaders can update attendance"
  ON attendance_records FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM events e
      WHERE e.id = event_id
        AND has_choir_role(e.choir_id, ARRAY['choir_leader', 'assistant_leader', 'super_admin'])
    )
  );

-- ═══════════════════════════════════════════════════════
-- contributions: Treasurer/Leader see all; members see own
-- ═══════════════════════════════════════════════════════
CREATE POLICY "Finance roles can view all contributions"
  ON contributions FOR SELECT
  USING (has_choir_role(choir_id, ARRAY['choir_leader', 'treasurer', 'super_admin']));

CREATE POLICY "Members can view own contributions"
  ON contributions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM choir_members cm
      WHERE cm.id = member_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Finance roles can manage contributions"
  ON contributions FOR ALL
  USING (has_choir_role(choir_id, ARRAY['choir_leader', 'treasurer', 'super_admin']));

-- ═══════════════════════════════════════════════════════
-- expenses: Treasurer/Leader only
-- ═══════════════════════════════════════════════════════
CREATE POLICY "Finance roles can manage expenses"
  ON expenses FOR ALL
  USING (has_choir_role(choir_id, ARRAY['choir_leader', 'treasurer', 'super_admin']));

-- ═══════════════════════════════════════════════════════
-- finance_audit_log: Append-only; finance roles can read
-- ═══════════════════════════════════════════════════════
CREATE POLICY "Finance roles can view audit log"
  ON finance_audit_log FOR SELECT
  USING (has_choir_role(choir_id, ARRAY['choir_leader', 'treasurer', 'super_admin']));

-- Block UPDATE/DELETE on finance_audit_log
CREATE OR REPLACE FUNCTION prevent_audit_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit log records cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER block_audit_update
  BEFORE UPDATE OR DELETE ON finance_audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

CREATE TRIGGER block_master_audit_update
  BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();

-- ═══════════════════════════════════════════════════════
-- documents: Members see non-sensitive; leaders see all
-- ═══════════════════════════════════════════════════════
CREATE POLICY "Members can view non-sensitive documents"
  ON documents FOR SELECT
  USING (is_active_member(choir_id) AND is_sensitive = false);

CREATE POLICY "Leaders can view all documents"
  ON documents FOR SELECT
  USING (has_choir_role(choir_id, ARRAY['choir_leader', 'assistant_leader', 'secretary', 'super_admin']));

CREATE POLICY "Leaders can manage documents"
  ON documents FOR ALL
  USING (has_choir_role(choir_id, ARRAY['choir_leader', 'assistant_leader', 'secretary', 'super_admin']));

-- ═══════════════════════════════════════════════════════
-- music_files: All active members can read; music teacher can write
-- ═══════════════════════════════════════════════════════
CREATE POLICY "Members can view music files"
  ON music_files FOR SELECT
  USING (is_active_member(choir_id));

CREATE POLICY "Music roles can manage files"
  ON music_files FOR ALL
  USING (has_choir_role(choir_id, ARRAY['choir_leader', 'music_teacher', 'super_admin']));

-- ═══════════════════════════════════════════════════════
-- practice_recordings: Self-only
-- ═══════════════════════════════════════════════════════
CREATE POLICY "Members can manage own recordings"
  ON practice_recordings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM choir_members cm
      WHERE cm.id = member_id
        AND cm.user_id = auth.uid()
    )
  );

-- ═══════════════════════════════════════════════════════
-- messages: Active members can read; authorized roles can send
-- ═══════════════════════════════════════════════════════
CREATE POLICY "Members can view messages"
  ON messages FOR SELECT
  USING (is_active_member(choir_id));

CREATE POLICY "Authorized roles can send messages"
  ON messages FOR INSERT
  WITH CHECK (has_choir_role(choir_id, ARRAY['choir_leader', 'assistant_leader', 'secretary', 'super_admin']));

-- ═══════════════════════════════════════════════════════
-- audit_log: Super admin only (with fresh auth)
-- ═══════════════════════════════════════════════════════
CREATE POLICY "Super admin can view audit log"
  ON audit_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND is_super_admin = true
    )
  );

CREATE POLICY "System can insert audit log"
  ON audit_log FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
