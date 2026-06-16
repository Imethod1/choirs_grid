import { mockMusicFiles, delay } from '@/lib/mock-data';
import type { MusicFile } from '@/types/database.types';

export async function getMusicFiles(_choirId: string): Promise<MusicFile[]> {
  await delay(400);
  return mockMusicFiles;
}

export async function uploadMusicFile(
  _choirId: string,
  _uploadedBy: string,
  file: File,
  metadata: {
    title: string;
    composer?: string;
    voiceParts?: string[];
    category?: string;
    liturgicalSeason?: string;
  }
): Promise<MusicFile> {
  await delay(1200);
  console.log('[MOCK] uploadMusicFile:', metadata.title, file.name);
  return {
    id: 'mus_' + Date.now(),
    choir_id: 'chr_001',
    title: metadata.title,
    composer: metadata.composer || null,
    file_type: 'pdf',
    file_url: '/mock/' + file.name,
    file_size_bytes: file.size,
    voice_parts: metadata.voiceParts || null,
    category: metadata.category || null,
    liturgical_season: metadata.liturgicalSeason || null,
    copyright_confirmed: false,
    copyright_confirmed_by: null,
    copyright_confirmed_at: null,
    uploaded_by: 'usr_001',
    uploaded_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    deleted_at: null,
  };
}
