import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, Calendar, Plus } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/ui.store';
import { useToast } from '@/components/ui/Toast';
import { mockMembersWithUsers } from '@/lib/mock-data';

const categories = ['monthly_dues', 'fundraiser', 'special', 'other'] as const;

export const AddContributionForm: React.FC = () => {
  const { t } = useTranslation();
  const { closeBottomSheet } = useUIStore();
  const toast = useToast();

  const [memberId, setMemberId] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('monthly_dues');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId || !amount || Number(amount) <= 0) {
      toast.error(t('errors.validation'));
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
        <h2 className="text-xl font-semibold text-[var(--text-main)]">{t('finance.add_contribution')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text-main)]">{t('members.title')}</label>
          <select value={memberId} onChange={e => setMemberId(e.target.value)} className="w-full rounded-[var(--radius-md)] border border-[var(--border-light)] bg-[var(--bg-surface)] px-4 py-2.5 text-sm text-[var(--text-main)] min-h-[var(--touch-target)]">
            <option value="">{t('common.search')}...</option>
            {mockMembersWithUsers.map(m => (
              <option key={m.id} value={m.id}>{m.user.full_name}</option>
            ))}
          </select>
        </div>

        <Input label={t('finance.amount') + ' (TZS)'} type="number" value={amount} onChange={e => setAmount(e.target.value)} icon={<DollarSign className="h-4 w-4" />} placeholder="5000" />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text-main)]">{t('events.event_type')}</label>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button key={cat} type="button" onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  category === cat ? 'bg-[var(--action-primary)] text-[var(--on-primary)]' : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'
                }`}
              >
                {t(`finance.${cat}`)}
              </button>
            ))}
          </div>
        </div>

        <Input label={t('finance.date')} type="date" value={date} onChange={e => setDate(e.target.value)} icon={<Calendar className="h-4 w-4" />} />
        <Input label={t('finance.receipt')} value={note} onChange={e => setNote(e.target.value)} placeholder="..." />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" fullWidth onClick={closeBottomSheet}>{t('common.cancel')}</Button>
          <Button type="submit" variant="primary" fullWidth loading={isLoading} icon={<Plus className="h-4 w-4" />}>{t('common.save')}</Button>
        </div>
      </form>
    </div>
  );
};
