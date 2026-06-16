import type { AuditEntry } from '../audit.service';

export async function logAudit(
  choirId: string | null,
  entry: AuditEntry
): Promise<void> {
  console.log('[MOCK AUDIT]', choirId, entry.action, entry.entityType, entry.entityId);
}
