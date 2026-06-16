import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/ui.store';
import { useToast } from '@/components/ui/Toast';

const eventTypes = ['rehearsal', 'mass', 'wedding', 'funeral', 'concert', 'meeting', 'other'] as const;

export const CreateEventForm: React.FC = () => {
  const { t } = useTranslation();
  const { closeBottomSheet } = useUIStore();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<string>('rehearsal');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) {
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
        <h2 className="text-xl font-semibold text-[var(--text-main)]">{t('events.create_event')}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label={t('events.title')} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Mazoezi ya Jumapili" />

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text-main)]">{t('events.event_type')}</label>
          <div className="flex gap-2 flex-wrap">
            {eventTypes.map(type => (
              <button key={type} type="button" onClick={() => setEventType(type)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                  eventType === type ? 'bg-[var(--action-primary)] text-[var(--on-primary)]' : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'
                }`}
              >
                {t(`events.${type}`)}
              </button>
            ))}
          </div>
        </div>

        <Input label={t('events.location')} value={location} onChange={e => setLocation(e.target.value)} icon={<MapPin className="h-4 w-4" />} placeholder="St. Joseph's Parish Hall" />
        <div className="grid grid-cols-2 gap-3">
          <Input label={t('finance.date')} type="date" value={date} onChange={e => setDate(e.target.value)} icon={<Calendar className="h-4 w-4" />} />
          <Input label={t('events.starts_at')} type="time" value={time} onChange={e => setTime(e.target.value)} icon={<Clock className="h-4 w-4" />} />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" fullWidth onClick={closeBottomSheet}>{t('common.cancel')}</Button>
          <Button type="submit" variant="primary" fullWidth loading={isLoading} icon={<Plus className="h-4 w-4" />}>{t('common.save')}</Button>
        </div>
      </form>
    </div>
  );
};
