import { delay } from '@/lib/mock-data';
import type { Document } from '@/types/database.types';

export async function getDocuments(_choirId: string): Promise<Document[]> {
  await delay(400);
  return [];
}

export async function uploadDocument(
  _choirId: string,
  _createdBy: string,
  file: File,
  metadata: {
    title: string;
    folder: 'constitution' | 'minutes' | 'circulars' | 'reports' | 'other';
    isSensitive: boolean;
  }
): Promise<Document> {
  await delay(1000);
  console.log('[MOCK] uploadDocument:', metadata.title, file.name);
  return {
    id: 'doc_' + Date.now(),
    choir_id: 'chr_001',
    folder: metadata.folder,
    title: metadata.title,
    is_sensitive: metadata.isSensitive,
    created_by: 'usr_001',
    current_version_id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    deleted_at: null,
    deleted_by: null,
  };
}

export async function deleteDocument(documentId: string, _deletedBy: string): Promise<void> {
  await delay(500);
  console.log('[MOCK] deleteDocument:', documentId);
}
