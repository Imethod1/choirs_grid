import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Music, FileText, Upload, X, Plus } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/ui.store';
import { useToast } from '@/components/ui/Toast';

const voiceParts = ['soprano', 'alto', 'tenor', 'bass'] as const;

export const UploadMusicForm: React.FC = () => {
  const { t } = useTranslation();
  const { closeBottomSheet } = useUIStore();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [composer, setComposer] = useState('');
  const [selectedParts, setSelectedParts] = useState<string[]>(['soprano', 'alto', 'tenor', 'bass']);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ['application/pdf', 'audio/mpeg', 'audio/aac', 'audio/mp4'];
    if (!allowed.includes(file.type)) {
      toast.error(t('errors.validation'));
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Max 20 MB');
      return;
    }
    setSelectedFile(file);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
  };

  const togglePart = (part: string) => {
    setSelectedParts(prev => prev.includes(part) ? prev.filter(p => p !== part) : [...prev, part]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !title) {
      toast.error(t('errors.validation'));
      return;
    }

    setIsLoading(true);
    for (let i = 0; i <= 100; i += 15) {
      await new Promise(r => setTimeout(r, 120));
      setProgress(i);
    }
    setIsLoading(false);
    toast.success(t('common.done'));
    closeBottomSheet();
  };

  const isAudio = selectedFile?.type.startsWith('audio/');

  return (
    <div className="pt-2">
      <div className="mb-6 pr-8">
        <h2 className="text-xl font-semibold text-[var(--text-main)]">{t('music.upload')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File picker */}
        <div onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${selectedFile ? 'border-[var(--action-primary)] bg-[var(--primary-container)]/20' : 'border-[var(--border-primary)] hover:border-[var(--action-primary)]'}`}
        >
          <input ref={fileInputRef} type="file" accept=".pdf,.mp3,.aac,.m4a" onChange={handleFileSelect} className="hidden" />
          {selectedFile ? (
            <div className="flex items-center gap-3 text-left">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isAudio ? 'bg-[var(--primary-container)]' : 'bg-[var(--color-error-bg)]'}`}>
                {isAudio ? <Music className="h-5 w-5 text-[var(--on-primary-container)]" /> : <FileText className="h-5 w-5 text-[var(--color-error)]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-main)] truncate">{selectedFile.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
              <button type="button" onClick={e => { e.stopPropagation(); setSelectedFile(null); }} className="p-1">
                <X className="h-4 w-4 text-[var(--text-muted)]" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-[var(--text-subtle)] mx-auto mb-2" />
              <p className="text-sm font-medium text-[var(--text-main)]">{t('music.upload')}</p>
              <p className="text-xs text-[var(--text-muted)]">PDF / MP3 / AAC • Max 20 MB</p>
            </>
          )}
        </div>

        {isLoading && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-[var(--text-muted)]">
              <span>{t('common.loading')}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--action-primary)] rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        <Input label={t('music.title')} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Bwana Yesu Asifiwe" />
        <Input label={t('music.composer')} value={composer} onChange={e => setComposer(e.target.value)} placeholder="e.g. Traditional" />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text-main)]">{t('music.voice_part')}</label>
          <div className="flex gap-2 flex-wrap">
            {voiceParts.map(vp => (
              <button key={vp} type="button" onClick={() => togglePart(vp)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedParts.includes(vp) ? 'bg-[var(--action-primary)] text-[var(--on-primary)]' : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'}`}
              >
                {t(`voice_parts.${vp}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" fullWidth onClick={closeBottomSheet}>{t('common.cancel')}</Button>
          <Button type="submit" variant="primary" fullWidth loading={isLoading} disabled={!selectedFile || !title} icon={<Plus className="h-4 w-4" />}>{t('music.upload')}</Button>
        </div>
      </form>
    </div>
  );
};
