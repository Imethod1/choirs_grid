import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/store/ui.store';
import { useToast } from '@/components/ui/Toast';

/**
 * Finance module guard hook.
 * 
 * Blocks access when offline — finance data must never be served from cache.
 * Shows a toast with the Swahili message from the spec:
 * "Fedha zinahitaji muunganiko wa intaneti"
 */
export function useFinanceGuard() {
  const { isOffline } = useUIStore();
  const navigate = useNavigate();
  const toast = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    if (isOffline) {
      // Swahili: "Finance requires internet connection"
      toast.error('Fedha zinahitaji muunganiko wa intaneti');
      navigate('/', { replace: true });
    }
  }, [isOffline, navigate, toast, t]);

  return { isOffline };
}
