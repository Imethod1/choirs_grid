import { supabase } from '@/lib/supabase';
import type { Document } from '@/types/database.types';

export async function getDocuments(choirId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('choir_id', choirId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Document[];
}

export async function uploadDocument(
  choirId: string,
  createdBy: string,
  file: File,
  metadata: {
    title: string;
    folder: 'constitution' | 'minutes' | 'circulars' | 'reports' | 'other';
    isSensitive: boolean;
  }
): Promise<Document> {
  // 1. Upload file to Supabase Storage
  const filePath = `choirs/${choirId}/documents/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // 2. Insert metadata
  const { data, error } = await supabase
    .from('documents')
    .insert({
      choir_id: choirId,
      folder: metadata.folder,
      title: metadata.title,
      is_sensitive: metadata.isSensitive,
      created_by: createdBy,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data as Document;
}

export async function deleteDocument(documentId: string, deletedBy: string): Promise<void> {
  const { error } = await supabase
    .from('documents')
    .update({ deleted_at: new Date().toISOString(), deleted_by: deletedBy } as never)
    .eq('id', documentId);

  if (error) throw error;
}
