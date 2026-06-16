import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Phone, User, Plus } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/ui.store';
import { useToast } from '@/components/ui/Toast';

const voiceParts = ['soprano', 'alto', 'tenor', 'bass'] as const;
const roles = ['member', 'music_teacher', 'secretary', 'treasurer', 'assistant_leader'] as const;

export const AddMemberForm: React.FC = () => {
  const { t } = useTranslation();
  const { closeBottomSheet } = useUIStore();
  const toast = useToast();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [voicePart, setVoicePart] = useState<string>('soprano');
  const [role, setRole] = useState<string>('member');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone) {
      toast.error(t('errors.validation'));
      return;
    }
    if (!/^\+?255\d{9}$/.test(phone.replace(/\s/g, ''))) {
      toast.error(t('auth.invalid_phone'));
      return;
    }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);
    toast.success(t('common.done'));
    closeBottomSheet();
  };

  return (
    <div className="pt-2">
      <div className="mb-6 pr-8">
        <h2 className="text-xl font-semibold text-[var(--text-main)]">{t('members.add_member')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label={t('members.title')} placeholder="e.g. Grace Kimaro" value={fullName} onChange={e => setFullName(e.target.value)} icon={<User className="h-4 w-4" />} />
        <Input label={t('auth.phone_number')} placeholder={t('auth.phone_placeholder')} value={phone} onChange={e => setPhone(e.target.value)} icon={<Phone className="h-4 w-4" />} type="tel" />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text-main)]">{t('members.voice_parts')}</label>
          <div className="flex gap-2 flex-wrap">
            {voiceParts.map(vp => (
              <button key={vp} type="button" onClick={() => setVoicePart(vp)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${voicePart === vp ? 'bg-[var(--action-primary)] text-[var(--on-primary)]' : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'}`}
              >
                {t(`voice_parts.${vp}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text-main)]">{t('roles.member')}</label>
          <select value={role} onChange={e => setRole(e.target.value)} className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm text-[var(--text-main)] min-h-[var(--touch-target)]">
            {roles.map(r => (
              <option key={r} value={r}>{t(`roles.${r}`)}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" fullWidth onClick={closeBottomSheet}>{t('common.cancel')}</Button>
          <Button type="submit" variant="primary" fullWidth loading={isLoading} icon={<Plus className="h-4 w-4" />}>{t('common.save')}</Button>
        </div>
      </form>
    </div>
  );
};
