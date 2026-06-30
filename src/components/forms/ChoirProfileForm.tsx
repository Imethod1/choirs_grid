import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Building2, MapPin, Save } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/store/ui.store';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/auth.store';
import { choirService } from '@/services';
import type { Choir } from '@/types/database.types';

interface ChoirProfileFormProps {
  onUpdated?: (choir: Choir) => void;
}

export const ChoirProfileForm: React.FC<ChoirProfileFormProps> = ({ onUpdated }) => {
  const { t } = useTranslation();
  const { closeBottomSheet } = useUIStore();
  const toast = useToast();
  const { choir, setChoir } = useAuthStore();

  const [name, setName] = useState(choir?.name ?? '');
  const [parish, setParish] = useState(choir?.parish ?? '');
  const [diocese, setDiocese] = useState(choir?.diocese ?? '');
  const [region, setRegion] = useState(choir?.region ?? '');
  const [country, setCountry] = useState(choir?.country ?? 'TZ');
  const [description, setDescription] = useState(choir?.description ?? '');
  const [foundedYear, setFoundedYear] = useState(choir?.founded_year ? String(choir.founded_year) : '');
  const [monthlyDuesAmount, setMonthlyDuesAmount] = useState(
    choir?.monthly_dues_amount !== null && choir?.monthly_dues_amount !== undefined
      ? String(choir.monthly_dues_amount)
      : ''
  );
  const [duesCurrency, setDuesCurrency] = useState(choir?.dues_currency ?? 'TZS');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!choir?.id) {
      toast.error(t('errors.unauthorized'));
      return;
    }

    if (!name.trim() || !parish.trim()) {
      toast.error(t('errors.validation'));
      return;
    }

    const parsedFoundedYear = foundedYear ? Number(foundedYear) : null;
    const parsedDues = monthlyDuesAmount ? Number(monthlyDuesAmount) : null;

    if (
      (parsedFoundedYear !== null && (!Number.isInteger(parsedFoundedYear) || parsedFoundedYear < 1800 || parsedFoundedYear > 2100)) ||
      (parsedDues !== null && (Number.isNaN(parsedDues) || parsedDues < 0))
    ) {
      toast.error(t('errors.validation'));
      return;
    }

    setIsLoading(true);

    try {
      const updated = await choirService.updateChoir(choir.id, {
        name,
        parish,
        diocese,
        region,
        country,
        description,
        foundedYear: parsedFoundedYear,
        monthlyDuesAmount: parsedDues,
        duesCurrency,
      });

      setChoir(updated);
      onUpdated?.(updated);
      toast.success(t('common.done'));
      closeBottomSheet();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('errors.save_failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-2">
      <div className="mb-6 pr-8">
        <h2 className="text-xl font-semibold text-[var(--text-main)]">
          Choir Profile
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Update choir identity, parish, and dues information.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Choir name" value={name} onChange={e => setName(e.target.value)} icon={<Building2 className="h-4 w-4" />} />
        <Input label="Parish" value={parish} onChange={e => setParish(e.target.value)} icon={<Building2 className="h-4 w-4" />} />
        <Input label="Diocese" value={diocese} onChange={e => setDiocese(e.target.value)} />
        <Input label="Region" value={region} onChange={e => setRegion(e.target.value)} icon={<MapPin className="h-4 w-4" />} />
        <Input label="Country" value={country} onChange={e => setCountry(e.target.value.toUpperCase())} />
        <Input label="Description" value={description} onChange={e => setDescription(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Founded year" type="number" value={foundedYear} onChange={e => setFoundedYear(e.target.value)} />
          <Input label="Monthly dues" type="number" value={monthlyDuesAmount} onChange={e => setMonthlyDuesAmount(e.target.value)} />
        </div>
        <Input label="Currency" value={duesCurrency} onChange={e => setDuesCurrency(e.target.value.toUpperCase())} />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" fullWidth onClick={closeBottomSheet}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" variant="primary" fullWidth loading={isLoading} icon={<Save className="h-4 w-4" />}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </div>
  );
};