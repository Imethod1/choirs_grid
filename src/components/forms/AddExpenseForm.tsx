import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, Calendar, Plus } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/ui.store';
import { useToast } from '@/components/ui/Toast';

const categories = ['transport', 'venue', 'materials', 'equipment', 'meals', 'other'] as const;

export const AddExpenseForm: React.FC = () => {
  const { t } = useTranslation();
  const { closeBottomSheet } = useUIStore();
  const toast = useToast();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>('transport');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || Number(amount) <= 0) {
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
        <h2 className="text-xl font-semibold text-[var(--text-main)]">{t('finance.add_expense')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label={t('finance.expenses')} value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Bus fare for wedding" />
        <Input label={t('finance.amount') + ' (TZS)'} type="number" value={amount} onChange={e => setAmount(e.target.value)} icon={<DollarSign className="h-4 w-4" />} placeholder="15000" />

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

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" fullWidth onClick={closeBottomSheet}>{t('common.cancel')}</Button>
          <Button type="submit" variant="primary" fullWidth loading={isLoading} icon={<Plus className="h-4 w-4" />}>{t('common.save')}</Button>
        </div>
      </form>
    </div>
  );
};
