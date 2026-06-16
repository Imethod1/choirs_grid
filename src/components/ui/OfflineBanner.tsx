import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';
import { useUIStore } from '@/store/ui.store';

export const OfflineBanner: React.FC = () => {
  const { t } = useTranslation();
  const { isOffline, setOffline } = useUIStore();

  useEffect(() => {
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial state
    if (!navigator.onLine) setOffline(true);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOffline]);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-warning-bg)] border-b border-[var(--color-warning)] px-4 py-2 flex items-center justify-center gap-2 animate-slide-in-up">
      <WifiOff className="h-4 w-4 text-[var(--color-warning)]" />
      <span className="text-sm font-medium text-[var(--color-warning)]">
        {t('common.offline_notice')}
      </span>
    </div>
  );
};
