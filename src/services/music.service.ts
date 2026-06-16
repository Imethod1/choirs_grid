import { supabase } from '@/lib/supabase';
import type { MusicFile } from '@/types/database.types';

export async function getMusicFiles(choirId: string): Promise<MusicFile[]> {
  const { data, error } = await supabase
    .from('music_files')
    .select('*')
    .eq('choir_id', choirId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as MusicFile[];
}

export async function uploadMusicFile(
  choirId: string,
  uploadedBy: string,
  file: File,
  metadata: {
    title: string;
    composer?: string;
    voiceParts?: string[];
    category?: string;
    liturgicalSeason?: string;
  }
): Promise<MusicFile> {
  // 1. Upload file to Supabase Storage
  const filePath = `choirs/${choirId}/music/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from('music')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // 2. Get public URL
  const { data: urlData } = supabase.storage.from('music').getPublicUrl(filePath);

  // 3. Insert metadata record
  const fileType = file.type === 'application/pdf' ? 'pdf' : file.type.includes('audio') ? 'mp3' : 'aac';
  const { data, error } = await supabase
    .from('music_files')
    .insert({
      choir_id: choirId,
      title: metadata.title,
      composer: metadata.composer || null,
      file_type: fileType,
      file_url: urlData.publicUrl,
      file_size_bytes: file.size,
      voice_parts: metadata.voiceParts || null,
      category: metadata.category || null,
      liturgical_season: metadata.liturgicalSeason || null,
      copyright_confirmed: false,
      uploaded_by: uploadedBy,
      uploaded_at: new Date().toISOString(),
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data as MusicFile;
}
