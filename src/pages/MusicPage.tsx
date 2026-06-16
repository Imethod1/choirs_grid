import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Music, FileText, Play, Download, Upload } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { UploadMusicForm } from '@/components/forms/UploadMusicForm';
import { mockMusicFiles } from '@/lib/mock-data';

const MusicPage: React.FC = () => {
  const { t } = useTranslation();
  const { hasAnyRole } = useAuthStore();
  const { openBottomSheet } = useUIStore();
  const canUpload = hasAnyRole(['choir_leader', 'music_teacher', 'super_admin']);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'library' | 'practice'>('library');
  const [voiceFilter, setVoiceFilter] = useState<string>('all');

  const filteredMusic = mockMusicFiles.filter((file) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = file.title.toLowerCase().includes(query);
      const matchesComposer = file.composer?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesComposer) return false;
    }
    
    if (voiceFilter !== 'all' && file.voice_parts) {
      if (!file.voice_parts.includes(voiceFilter)) return false;
    }
    
    return true;
  });

  const voiceParts = ['all', 'soprano', 'alto', 'tenor', 'bass'];

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-main)]">
            {t('music.title')}
          </h1>
          <p className="text-sm text-[var(--text-muted)]">
            {filteredMusic.length} {filteredMusic.length === 1 ? 'song' : 'songs'}
          </p>
        </div>
        {canUpload && (
          <Button size="sm" icon={<Upload className="h-4 w-4" />} onClick={() => openBottomSheet(<UploadMusicForm />)}>
            {t('music.upload')}
          </Button>
        )}
      </div>

      <div className="flex gap-2 p-1 bg-[var(--bg-hover)] rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('library')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'library'
              ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-sm'
              : 'text-[var(--text-muted)]'
          }`}
        >
          {t('music.library')}
        </button>
        <button
          onClick={() => setActiveTab('practice')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'practice'
              ? 'bg-[var(--bg-surface)] text-[var(--text-main)] shadow-sm'
              : 'text-[var(--text-muted)]'
          }`}
        >
          {t('music.practice')}
        </button>
      </div>

      <div className="space-y-3">
        <Input
          placeholder={t('music.search_music')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon={<Search className="h-4 w-4" />}
        />
        
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          {voiceParts.map((part) => (
            <button
              key={part}
              onClick={() => setVoiceFilter(part)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                voiceFilter === part
                  ? 'bg-[var(--action-primary)] text-white'
                  : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'
              }`}
            >
              {part === 'all' ? 'All Parts' : t(`voice_parts.${part}`)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'library' && (
        <div className="space-y-3">
          {filteredMusic.length > 0 ? (
            filteredMusic.map((file) => (
              <Card key={file.id} hoverable padding="sm">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    file.file_type === 'pdf' 
                      ? 'bg-[var(--color-error-bg)]' 
                      : 'bg-[var(--primary-container)]'
                  }`}>
                    {file.file_type === 'pdf' ? (
                      <FileText className="h-6 w-6 text-[var(--color-error)]" />
                    ) : (
                      <Music className="h-6 w-6 text-[var(--on-primary-container)]" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[var(--text-main)] truncate">
                      {file.title}
                    </h4>
                    <p className="text-sm text-[var(--text-muted)] truncate">
                      {file.composer || 'Traditional'}
                      {file.liturgical_season && ` • ${file.liturgical_season}`}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {file.voice_parts?.slice(0, 3).map((part) => (
                        <Badge key={part} size="sm" variant="default">
                          {part.charAt(0).toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {file.file_type !== 'pdf' && (
                      <button className="p-2 rounded-lg bg-[var(--primary-container)] hover:bg-[var(--primary-container)]/80 transition-colors">
                        <Play className="h-5 w-5 text-[var(--on-primary-container)]" />
                      </button>
                    )}
                    <button className="p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
                      <Download className="h-5 w-5 text-[var(--text-muted)]" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <EmptyState
              icon="music"
              title={t('common.no_results')}
              description={searchQuery ? undefined : t('empty.music')}
              action={
                searchQuery
                  ? { label: t('common.clear'), onClick: () => setSearchQuery('') }
                  : canUpload
                  ? { label: t('music.upload'), onClick: () => openBottomSheet(<UploadMusicForm />) }
                  : undefined
              }
            />
          )}
        </div>
      )}

      {activeTab === 'practice' && (
        <Card className="text-center py-12">
          <div className="flex items-center justify-center h-16 w-16 rounded-2xl bg-[var(--cta-accent)]/20 mx-auto mb-4">
            <Music className="h-8 w-8 text-[var(--cta-accent)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-main)] mb-2">
            Practice Tool
          </h3>
          <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto mb-6">
            Select a song from the library to practice with playback speed control, pitch adjustment, and recording.
          </p>
          <Button variant="primary" onClick={() => setActiveTab('library')}>
            Browse Library
          </Button>
        </Card>
      )}
    </div>
  );
};

export default MusicPage;
