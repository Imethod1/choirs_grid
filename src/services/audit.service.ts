import { supabase } from '@/lib/supabase';
import { getDeviceFingerprint } from '@/lib/security';

/**
 * Audit Service
 * 
 * Appends entries to the master audit_log table.
 * This table has RLS policies that block UPDATE and DELETE.
 * Only INSERT is permitted, and only by authenticated users.
 */

export interface AuditEntry {
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export async function logAudit(
  choirId: string | null,
  entry: AuditEntry
): Promise<void> {
  const { error } = await supabase.from('audit_log').insert({
    choir_id: choirId,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId || null,
    metadata: entry.metadata || null,
    device_fingerprint: getDeviceFingerprint(),
  } as any);

  if (error) {
    // Audit failures should never block the user — log to console
    console.error('[AUDIT] Failed to write audit log:', error);
  }
}
